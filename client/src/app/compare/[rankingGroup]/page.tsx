'use client'

import { Comparison } from '@/lib/types.alias'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import Profile from './Profile'
import { useEffect, useState } from 'react'

interface Props {}

const Page = (props: Props) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm()
    const { rankingGroup } = useParams()

    const [currentPivot, setCurrentPivot] = useState<string | undefined>(
        undefined
    )

    const [fetchingNext, setFetchingNext] = useState(false)

    const {
        data: comparison,
        isLoading,
        error,
        mutate
    } = useSWR<Comparison>(
        `http://localhost:3001/comparison/?rankingGroup=${rankingGroup}${currentPivot ? `&lastPivot=${currentPivot}` : ''}`,
        (url: string) => fetch(url).then((res) => res.json()),
        {}
    )

    useEffect(() => {
        if (comparison) {
            setCurrentPivot(comparison?.pivot)
        }
    }, [comparison])

    if (isLoading || fetchingNext)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                Loading...
            </div>
        )
    if (error || !comparison) return <div>Error loading comparison</div>

    // @ts-ignore
    if (comparison.error) return <div>{comparison.error}</div>

    const c1Id = comparison.pivot
    const c2Id = comparison?.candidates
        ? Object.keys(comparison?.candidates).find(
              (id) => id !== comparison.pivot
          ) || ''
        : ''

    return (
        <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
            <Profile profile={comparison.candidates[c1Id]} prefix="A" />
            <Profile profile={comparison.candidates[c2Id]} prefix="B" />
            <div className="flex h-full w-72 flex-col bg-gray-100">
                <div className="border-b-2 border-b-gray-200 bg-gray-100 p-4 font-bold">
                    <h1 className="text-2xl font-bold">Comparison</h1>
                </div>
                <form
                    className="flex flex-col gap-4 p-4"
                    onSubmit={handleSubmit(async (data) => {
                        // send request to server
                        // /rank?comparisonId=comparison.id&winnerId=winnerId

                        console.log(data)

                        const winners: {
                            [key: string]: string
                        } = {}

                        Object.entries(comparison.vectors).forEach(
                            ([key, vector]) =>
                                (winners[key] = data[`${key}-winner`])
                        )

                        const response = await fetch(
                            'http://localhost:3001/rank',
                            {
                                method: 'POST',
                                body: JSON.stringify({
                                    comparisonId: comparison.id,
                                    winners: winners,
                                    rankingGroup: rankingGroup
                                }),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        )

                        if (response.ok) {
                            console.log('Comparison saved')
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
                        Finish
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Page
