'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { Candidate } from '@/lib/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'

const Page = () => {
    const { rankingGroup } = useParams()
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
                    <Link
                        href={`/results/${rankingGroup}/${profile.id}`}
                        className="text-blue-500 hover:underline"
                    >
                        {profile.id}
                    </Link>
                    <p>{profile.name}</p>
                    <p>{profile.overallRating}</p>
                </div>
            ))}

            {/* list of names on new lines, for easy copy paste */}
            <div className="flex flex-col gap-2">
                {profiles.map((profile: Candidate) => (
                    <p key={profile.id}>{profile.name}</p>
                ))}
            </div>
        </div>
    )
}

export default Page
