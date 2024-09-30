'use client'

import React from 'react'
import Profile from './Profile'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'
import useSWR from 'swr'
import { Comparison } from '@/lib/types.alias'

interface Props {}

const Page = (props: Props) => {
    const { register, handleSubmit, watch } = useForm()

    const {
        data: comparison,
        isLoading,
        error
    } = useSWR<Comparison>('http://localhost:3001/comparison', (url: string) =>
        fetch(url).then((res) => res.json())
    )

    if (isLoading) return <div>Loading...</div>
    if (error || !comparison) return <div>Error loading comparison</div>

    const c1Id = Object.keys(comparison.candidates)[0]
    const c2Id = Object.keys(comparison.candidates)[1]

    return (
        <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
            <Profile profile={comparison.candidates[c1Id]} />
            <Profile profile={comparison.candidates[c2Id]} />
            <div className="flex h-full w-72 flex-col bg-gray-100">
                <div className="border-b-2 border-b-gray-200 bg-gray-100 p-4 font-bold">
                    <h1 className="text-2xl font-bold">Comparison</h1>
                </div>
                <div className="flex flex-col gap-4 p-4">
                    {Object.entries(comparison.vectors).map(([key, vector]) => (
                        <div key={key} className="flex flex-col gap-4">
                            <h2 className="text-base font-bold">
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
                                        {...register(`${key}-winner`)}
                                    />
                                    {comparison.candidates[c1Id].name}
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
                                        {...register(`${key}-winner`)}
                                    />
                                    {comparison.candidates[c2Id].name}
                                </label>
                            </div>
                        </div>
                    ))}
                    <button
                        className="rounded-md bg-blue-500 p-4 text-white"
                        onClick={handleSubmit((data) => {
                            console.log(data)
                        })}
                    >
                        Finish
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Page
