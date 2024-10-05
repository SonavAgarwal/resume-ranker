'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Page = () => {
    const [email, setEmail] = useState<string>('')
    const { token, tokenLoading } = useAuthToken()

    const handleClick = async () => {
        if (tokenLoading) {
            return
        }

        if (!token) {
            toast.error('You are not logged in!')
            return
        }

        if (!email) {
            toast.error('Please enter an email.')
            return
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_BACKEND_URL}/makeAdmin?uid=${email}`,
                {
                    method: 'POST',
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.ok) {
                toast.success('User successfully made admin.')
            } else {
                toast.error('Operation failed.')
            }
        } catch (error) {
            console.error('Error making user admin:', error)
            toast.error('An error occurred.')
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            <div className="flex w-64 flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4">
                <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded bg-gray-100 px-4 py-2 text-gray-800 outline-none"
                />
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
