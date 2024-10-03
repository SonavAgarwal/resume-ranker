'use client'

import { useState } from 'react'

interface Props {}

const Page = (props: Props) => {
    const [uid, setUid] = useState<string>('')
    const [uploadStatus, setUploadStatus] = useState<string | null>(null)

    const handleClick = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/makeAdmin?uid=${uid}`,
                {
                    method: 'POST'
                }
            )

            if (response.ok) {
                setUploadStatus('User successfully made admin.')
            } else {
                setUploadStatus('Operation failed.')
            }
        } catch (error) {
            setUploadStatus('An error occurred.')
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            <div className="flex w-64 flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4">
                <input
                    type="text"
                    placeholder="User ID"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    className="w-full rounded bg-gray-100 px-4 py-2 text-gray-800 outline-none"
                />
                <button
                    onClick={handleClick}
                    className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Submit
                </button>
                {uploadStatus && (
                    <p
                        className={
                            uploadStatus === 'User successfully made admin.'
                                ? 'text-green-600'
                                : 'text-red-600'
                        }
                    >
                        {uploadStatus}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Page
