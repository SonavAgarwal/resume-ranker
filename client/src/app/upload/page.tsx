'use client'

import { useAuthToken } from '@/hooks/useAuthToken'
import { rrConfig } from '@/lib/rrConfig.alias'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Page = () => {
    const [file, setFile] = useState<File | null>(null)

    const [rankingGroup, setRankingGroup] = useState<string>('')
    const { token } = useAuthToken()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!token) {
            toast.error('Please log in.')
            return
        }

        if (!file) {
            toast.error('Please select a file.')
            return
        }

        if (!rankingGroup) {
            toast.error('Please select a ranking group.')
            return
        }

        // rankingGroup can't have spaces
        if (rankingGroup.includes(' ')) {
            toast.error('Ranking group cannot have spaces.')
            return
        }

        const formData = new FormData()
        formData.append('csv', file) // Append the file
        formData.append('rankingGroup', rankingGroup) // Append the ranking group

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    method: 'POST',
                    body: formData
                }
            )

            if (response.ok) {
                toast.success('File and category uploaded successfully.')
            } else {
                toast.error('Upload failed.')
            }
        } catch (error) {
            toast.error('Error uploading file and category.')
            console.error('Upload error:', error)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            <div className="w-94 flex flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4">
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
                {/* <BsUpload className="text-6xl text-gray-400" /> */}
                {/* <span className="text-2xl font-bold">Upload</span> */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full rounded bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-300"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    Upload File
                </button>
            </div>
        </div>
    )
}

export default Page
