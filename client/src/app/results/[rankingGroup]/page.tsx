'use client'

import { Candidate, Comparison } from '@/lib/types.alias'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import useSWR from 'swr'
import Profile from './Profile'
import { useEffect, useState } from 'react'
import { useAuthToken } from '@/hooks/useAuthToken'
import toast from 'react-hot-toast'
import ky from 'ky'

interface Props {}

const Page = (props: Props) => {
    const { rankingGroup } = useParams()
    const { token, tokenLoading } = useAuthToken()
    const { data, isLoading, error, mutate } = useSWR<{
        profiles: Candidate[]
    }>(
        [
            `http://localhost:3001/results/?rankingGroup=${rankingGroup}`,
            token,
            tokenLoading
        ],
        async ([url, token, tokenLoading]: [
            string,
            string | null,
            boolean
        ]) => {
            if (!token) {
                toast.error('Please login to view results.')
                return
            }

            return fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res) => res.json())
        },
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
