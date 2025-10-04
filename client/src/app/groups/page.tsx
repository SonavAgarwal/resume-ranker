'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { RankingGroup } from '@/lib/types'
import Link from 'next/link'
import toast from 'react-hot-toast'
import useSWR from 'swr'

const Page = () => {
    const { token, tokenLoading } = useAuthToken()

    const {
        data: comparison,
        isLoading,
        error
    } = useSWR<{
        rankingGroups: RankingGroup[]
    }>(
        [`${process.env.NEXT_PUBLIC_BACKEND_URL}/groups`, token, tokenLoading],
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

    if (isLoading)
        return (
            <div className="flex h-screen w-full items-center justify-center">
                Loading...
            </div>
        )
    if (error || !comparison) return <div>Error loading groups</div>

    return (
        <div className="flex h-screen w-full flex-col gap-4 p-4">
            <h1 className="text-md">Comparison Groups</h1>

            <div className="grid h-auto w-full grid-cols-2 gap-4 md:grid-cols-4">
                {comparison.rankingGroups.map((group: RankingGroup) => (
                    <div
                        key={group.name}
                        className="flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4"
                    >
                        <h1 className="text-xl font-bold">{group.name}</h1>
                        <p>{group.numProfiles} profiles</p>
                        <div className="mt-2 flex flex-row gap-4">
                            <Link
                                href={`/compare/${group.name}`}
                                className="text-blue-500 hover:underline"
                            >
                                Grade
                            </Link>
                            <Link
                                href={`/results/${group.name}`}
                                className="text-blue-500 hover:underline"
                            >
                                View Results
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Page
