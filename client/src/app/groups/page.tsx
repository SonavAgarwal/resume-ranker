'use client'

import { RankingGroup } from '@/lib/types.alias'
import Link from 'next/link'
import { useState } from 'react'
import { BsUpload } from 'react-icons/bs'
import useSWR from 'swr'

interface Props {}

const Page = (props: Props) => {
    const {
        data: comparison,
        isLoading,
        error
    } = useSWR<{
        rankingGroups: RankingGroup[]
    }>('http://localhost:3001/groups', (url: string) =>
        fetch(url).then((res) => res.json())
    )

    if (isLoading) return <div>Loading...</div>
    if (error || !comparison) return <div>Error loading groups</div>

    return (
        // grid of boxes, 4 columns on desktop, 2 on mobile
        <div className="grid h-auto w-full grid-cols-2 gap-4 p-4 md:grid-cols-4">
            {/* {new Array(20).fill(0).map(() => (
                <> */}
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
            {/* </>
            ))} */}
        </div>
    )
}

export default Page
