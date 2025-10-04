'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'

import { useAuthToken } from '@/hooks/useAuthToken'
import { Candidate, RankingGroup, RoundStatus } from '@/lib/types'

const formatStatus = (status?: RoundStatus) => {
    if (!status) return 'Unknown'
    if (status === 'IN_PROGRESS') return '🧑‍💻'
    if (status === 'COMPLETED') return '✅'
    if (status === 'NOT_STARTED') return '⏳'
    if (status === 'GENERATING') return '⚙️'
    return status
    // return status
    //     .toLowerCase()
    //     .split('_')
    //     .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    //     .join(' ')
}

const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return '—'
    return `${Math.round(value * 100)}%`
}

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '—'
    return `${value}`
}

const Page = () => {
    const { rankingGroup } = useParams<{ rankingGroup: string }>()
    const { token, tokenLoading } = useAuthToken()

    const {
        data: resultsData,
        isLoading: resultsLoading,
        error: resultsError
    } = useSWR<{
        profiles: Candidate[]
    }>(
        [
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/?rankingGroup=${rankingGroup}`,
            token,
            tokenLoading
        ],
        async ([url, token, tokenLoading]: [
            string,
            string | null,
            boolean
        ]) => {
            if (tokenLoading) return { profiles: [] }

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

    const { data: groupsData, isLoading: groupsLoading } = useSWR<{
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
                return { rankingGroups: [] }
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

    if (resultsLoading || groupsLoading || tokenLoading)
        return (
            <div className="flex h-screen w-full items-center justify-center">
                Loading...
            </div>
        )

    if (resultsError || !resultsData?.profiles)
        return <div>Error loading profiles</div>

    const { profiles } = resultsData

    const rankingGroupMeta = groupsData?.rankingGroups?.find(
        (group) => group.name === rankingGroup
    )

    const activeRound =
        rankingGroupMeta &&
        rankingGroupMeta.currentRound < rankingGroupMeta.rounds.length
            ? rankingGroupMeta.rounds[rankingGroupMeta.currentRound]
            : undefined

    return (
        <div className="flex h-screen w-full flex-col gap-4 overflow-y-auto p-4">
            <h1 className="text-base">Results for {rankingGroup}</h1>

            {rankingGroupMeta ? (
                <div className="flex flex-col gap-1 bg-gray-100 p-4">
                    <p>
                        <strong>Round Status:</strong>{' '}
                        {activeRound
                            ? `Round ${activeRound.number}: ${formatStatus(activeRound.status)}`
                            : 'All rounds completed'}
                    </p>
                    <p>
                        <strong>Total Profiles:</strong>{' '}
                        {formatNumber(rankingGroupMeta.numProfiles)}
                    </p>
                    <p>
                        <strong>Keep Percentage:</strong>{' '}
                        {activeRound
                            ? formatPercentage(activeRound.keepPercentage)
                            : '—'}
                    </p>
                    <p>
                        <strong>Pivot Count:</strong>{' '}
                        {activeRound
                            ? formatNumber(activeRound.numPivots)
                            : '—'}
                    </p>
                    <div>
                        <strong>Rounds Overview:</strong>
                        <div className="mt-1 flex flex-wrap gap-3">
                            {rankingGroupMeta.rounds.map((round) => (
                                <span key={round.number}>
                                    Round {round.number}:{' '}
                                    {formatStatus(round.status)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="">
                    No metadata available for this ranking group.
                </p>
            )}

            <div className="flex flex-row items-center justify-between gap-4 border-2 border-l-0 border-r-0 border-t-0 border-b-gray-100 pb-2 font-medium">
                <p className="w-1/4">ID</p>
                <p className="flex flex-1 items-center gap-3">
                    Name
                    <button
                        className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
                        onClick={() => {
                            const names = profiles.map((p) => p.name).join('\n')
                            navigator.clipboard.writeText(names)
                            toast.success('Names copied to clipboard!')
                        }}
                    >
                        Copy Names
                    </button>
                </p>
                <p className="text-right">Overall Rating</p>
            </div>

            <div className="flex flex-col gap-2">
                {profiles.map((profile: Candidate) => (
                    <div
                        key={profile.id}
                        className="flex w-full flex-row items-center justify-between gap-4"
                    >
                        <p className="w-1/4 overflow-scroll text-nowrap">
                            {profile.id}
                        </p>
                        <Link
                            href={`/results/${rankingGroup}/${profile.id}`}
                            className="flex-1 text-blue-500 hover:underline"
                        >
                            {profile.name}
                        </Link>
                        <p className="text-right">
                            {profile.overallRating.toFixed(4)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Page
