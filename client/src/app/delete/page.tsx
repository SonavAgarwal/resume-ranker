'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { rrConfig } from '@/lib/rrConfig.alias'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {}

const Page = (props: Props) => {
    const [rankingGroup, setRankingGroup] = useState<string>('')
    const { token, tokenLoading } = useAuthToken()

    const handleClick = async () => {
        if (!rankingGroup) {
            toast.error('Please select a ranking group.')
            return
        }

        if (tokenLoading) {
            toast.error('Try again in a few seconds.')
            return
        }

        if (!token) {
            toast.error('Please login to upload.')
            return
        }

        try {
            const response = await fetch(
                `http://localhost:3001/group?rankingGroup=${rankingGroup}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.ok) {
                toast.success('Group deleted successfully.')
            } else {
                toast.error('Delete failed.')
            }
        } catch (error) {
            toast.error('An error occurred.')
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            <div className="flex w-64 flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4">
                <select
                    value={rankingGroup}
                    onChange={(e) => setRankingGroup(e.target.value)}
                    className="w-full rounded bg-gray-100 px-4 py-2 text-gray-800 outline-none"
                >
                    {Object.keys(rrConfig.settings).map((rg) => (
                        <option key={rg} value={rg}>
                            {rg}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleClick}
                    className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

export default Page
