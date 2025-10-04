'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { RankingGroupNames } from '@/lib/rrConfig.alias'
import { Candidate } from '@/lib/types'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import Profile from '../../../compare/[rankingGroup]/Profile'

const Page = () => {
    const {
        rankingGroup,
        candidateId
    }: {
        rankingGroup: RankingGroupNames
        candidateId: string
    } = useParams()
    const { token, tokenLoading } = useAuthToken()

    const { data, isLoading, error } = useSWR<{
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

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error fetching candidate')
            }

            return response.json()
        },
        {}
    )

    if (isLoading || tokenLoading)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                Loading...
            </div>
        )

    if (error || !data?.profiles?.length)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                {error ? error.message : 'Candidate not found'}
            </div>
        )

    const candidate = data.profiles.find((profile) => profile.id === candidateId)

    if (!candidate)
        return (
            <div className="flex h-screen w-full flex-row items-center justify-center gap-4 p-4">
                Candidate not found
            </div>
        )

    return (
        <div className="flex h-screen w-full">
            <Profile
                profile={candidate}
                prefix="Candidate"
                rankingGroup={rankingGroup}
            />
        </div>
    )
}

export default Page
