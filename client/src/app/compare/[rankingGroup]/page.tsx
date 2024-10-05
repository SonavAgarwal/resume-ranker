'use client'

import { Comparison } from '@/lib/types'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import Profile from './Profile'
import { useEffect, useState } from 'react'
import { useAuthToken } from '@/hooks/useAuthToken'
import toast from 'react-hot-toast'
import { RankingGroupNames } from '@/lib/rrConfig.alias'

const Page = () => {
    const { token, tokenLoading } = useAuthToken()

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm()

    const {
        rankingGroup
    }: {
        rankingGroup: RankingGroupNames
    } = useParams()

    const [currentPivot, setCurrentPivot] = useState<string | undefined>(
        undefined
    )

    const [submitting, setSubmitting] = useState(false)
    const [fetchingNext, setFetchingNext] = useState(false)

    const {
        data: comparison,
        isLoading,
        error,
        mutate
    } = useSWR<Comparison>(
        [
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/comparison/?rankingGroup=${rankingGroup}${currentPivot ? `&lastPivot=${currentPivot}` : ''}`,
            token,
            tokenLoading
        ],
        async ([url, token, tokenLoading]: [
            string,
            string | null,
            boolean
        ]) => {
            if (tokenLoading) return

            if (!token) {
                toast.error('You are not logged in!')
                return
            }

            const response = await fetch(url, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })

            // Check if the response is OK (status in the range 200-299)
            if (!response.ok) {
                const error = await response.json()
                const errorMessage = error.error || 'Something went wrong'
                // toast.error(errorMessage) // Optionally show an error toast
                throw new Error(errorMessage) // Throwing the error to pass it to SWR's error object
            }

            // if is 202, retry in 10 seconds
            if (response.status === 202) {
                setTimeout(() => {
                    mutate()
                }, 10000)
                return await response.json()
            }

            return response.json()
        },
        {}
    )

    useEffect(() => {
        if (comparison) {
            setCurrentPivot(comparison?.pivot)
        }
    }, [comparison])

    if (isLoading || fetchingNext || tokenLoading)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                Loading...
            </div>
        )
    if (error || !comparison)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                {error ? error.message : 'Error loading comparison'}
            </div>
        )

    // @ts-expect-error - too lazy to fix this
    if (comparison.error)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                {/* @ts-expect-error - too lazy to fix this */}
                {comparison.error}
            </div>
        )

    const c1Id = comparison.pivot
    const c2Id = comparison?.candidates
        ? Object.keys(comparison?.candidates).find(
              (id) => id !== comparison.pivot
          ) || ''
        : ''

    return (
        <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
            <Profile
                profile={comparison.candidates[c1Id]}
                prefix="A"
                rankingGroup={rankingGroup}
            />
            <Profile
                profile={comparison.candidates[c2Id]}
                prefix="B"
                rankingGroup={rankingGroup}
            />
            <div className="flex h-full w-72 flex-col bg-gray-100">
                <div className="border-b-2 border-b-gray-200 bg-gray-100 p-4 font-bold">
                    <h1 className="text-2xl font-bold">Comparison</h1>
                </div>
                <form
                    className="flex flex-col gap-4 p-4"
                    onSubmit={handleSubmit(async (data) => {
                        if (tokenLoading) return
                        if (!token) {
                            toast.error('You are not logged in!')
                            return
                        }

                        setSubmitting(true)

                        try {
                            const winners: {
                                [key: string]: string
                            } = {}

                            Object.entries(comparison.vectors).forEach(
                                ([key]) =>
                                    (winners[key] = data[`${key}-winner`])
                            )

                            const response = await fetch(
                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/rank`,
                                {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        comparisonId: comparison.id,
                                        winners: winners,
                                        rankingGroup: rankingGroup
                                    }),
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            )

                            setSubmitting(false)

                            // clear the form
                            reset()

                            if (response.ok) {
                                setFetchingNext(true)
                                try {
                                    await mutate()
                                } catch (error) {
                                    console.error(
                                        'Error fetching next comparison',
                                        error
                                    )
                                }
                                setFetchingNext(false)
                            }
                        } catch (error) {
                            setSubmitting(false)
                            setFetchingNext(false)

                            console.error('Error saving comparison', error)
                            toast.error('Error saving comparison')
                            return
                        }
                    })}
                >
                    {Object.entries(comparison.vectors).map(([key, vector]) => (
                        <div key={key} className="flex flex-col gap-4">
                            <h2
                                className={clsx('text-base font-bold', {
                                    'text-red-500': errors[`${key}-winner`]
                                })}
                            >
                                {vector.question}
                            </h2>
                            <div className="flex flex-row gap-4">
                                <label
                                    className={clsx(
                                        'flex flex-1 cursor-pointer items-center justify-center rounded-md p-4',
                                        watch(`${key}-winner`) === c1Id
                                            ? 'bg-green-400'
                                            : 'bg-gray-200'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="hidden"
                                        value={c1Id}
                                        {...register(`${key}-winner`, {
                                            required: true
                                        })}
                                    />
                                    {/* {comparison.candidates[c1Id].name} */}A
                                </label>
                                {/* same */}
                                <label
                                    className={clsx(
                                        'flex flex-1 cursor-pointer items-center justify-center rounded-md p-4',
                                        watch(`${key}-winner`) === 'same'
                                            ? 'bg-green-400'
                                            : 'bg-gray-200'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="hidden"
                                        value="same"
                                        {...register(`${key}-winner`, {
                                            required: true
                                        })}
                                    />
                                    Same
                                </label>
                                <label
                                    className={clsx(
                                        'flex flex-1 cursor-pointer items-center justify-center rounded-md p-4',
                                        watch(`${key}-winner`) === c2Id
                                            ? 'bg-green-400'
                                            : 'bg-gray-200'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        className="hidden"
                                        value={c2Id}
                                        {...register(`${key}-winner`, {
                                            required: true
                                        })}
                                    />
                                    {/* {comparison.candidates[c2Id].name} */}B
                                </label>
                            </div>
                        </div>
                    ))}
                    <button
                        className="rounded-md bg-blue-500 p-4 text-white"
                        type="submit"
                    >
                        {submitting ? 'Loading...' : 'Finish'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Page
