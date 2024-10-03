'use client'

import { Candidate, Comparison } from '@/lib/types.alias'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import Profile from './Profile'
import { useEffect, useState } from 'react'

interface Props {}

const Page = (props: Props) => {
    const { rankingGroup } = useParams()
    const { data, isLoading, error, mutate } = useSWR<{
        profiles: Candidate[]
    }>(
        `http://localhost:3001/results/?rankingGroup=${rankingGroup}`,
        (url: string) => fetch(url).then((res) => res.json()),
        {}
    )

    if (isLoading)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                Loading...
            </div>
        )
    if (error || !data?.profiles) return <div>Error loading profiles</div>

    const { profiles } = data
    console.log(profiles)

    return (
        <div className="flex h-screen w-full flex-col items-center gap-4 p-4">
            {profiles.map((profile: Candidate) => (
                <div
                    key={profile.id}
                    className="flex w-1/2 flex-row items-center justify-between gap-4"
                >
                    <p>{profile.id}</p>
                    <p>{profile.name}</p>
                    <p>{profile.overallRating}</p>
                </div>
            ))}
        </div>
    )
}

export default Page
