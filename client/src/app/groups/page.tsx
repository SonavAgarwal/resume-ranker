'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { RankingGroup } from '@/lib/types.alias'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { BsUpload } from 'react-icons/bs'
import useSWR from 'swr'

interface Props {}

const Page = (props: Props) => {
    const { token, tokenLoading } = useAuthToken()

    const {
        data: comparison,
        isLoading,
        error
    } = useSWR<{
        rankingGroups: RankingGroup[]
    }>(
        ['http://localhost:3001/groups', token, tokenLoading],
        async ([url, token, tokenLoading]: [
            string,
            string | null,
            boolean
        ]) => {
            if (tokenLoading) return { rankingGroups: [] }

            if (!token) {
                toast.error('Please login to view ranking groups.')
                return { rankingGroups: [] }
            }

            return fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(
                (res) =>
                    res.json() as Promise<{ rankingGroups: RankingGroup[] }>
            )
        },
        {}
    )

    if (isLoading) return <div>Loading...</div>
    if (error || !comparison) return <div>Error loading groups</div>

    return (
        <div className="flex h-screen w-full flex-col gap-4 p-4">
            <h1 className="text-2xl font-semibold">Resume Groups</h1>

            <div className="grid h-auto w-full grid-cols-2 gap-4 md:grid-cols-4">
                {comparison.rankingGroups.map((group: RankingGroup) => (
                    <Link
                        href={`/compare/${group.name}`}
                        key={group.name}
                        className="flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4"
                    >
                        <h1 className="text-xl font-bold">{group.name}</h1>
                        <p>{group.numProfiles} profiles</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Page
