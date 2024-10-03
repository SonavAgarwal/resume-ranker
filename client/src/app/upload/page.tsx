'use client'

import { useState } from 'react'
import { BsUpload } from 'react-icons/bs'

interface Props {}

const Page = (props: Props) => {
    const [file, setFile] = useState<File | null>(null)
    const [uploadStatus, setUploadStatus] = useState<string | null>(null)
    const [rankingGroup, setRankingGroup] = useState<string>('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus('Please select a file.')
            return
        }

        if (!rankingGroup) {
            setUploadStatus('Please select a ranking group.')
            return
        }

        // rankingGroup can't have spaces
        if (rankingGroup.includes(' ')) {
            setUploadStatus('Ranking group cannot have spaces.')
            return
        }

        const formData = new FormData()
        formData.append('csv', file) // Append the file
        formData.append('rankingGroup', rankingGroup) // Append the ranking group

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                setUploadStatus('File and category uploaded successfully.')
            } else {
                setUploadStatus('Upload failed.')
            }
        } catch (error) {
            setUploadStatus('Error uploading file and category.')
            console.error('Upload error:', error)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            <div className="flex w-64 flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4">
                <input
                    type="text"
                    placeholder="Ranking Group"
                    value={rankingGroup}
                    onChange={(e) => setRankingGroup(e.target.value)}
                    className="w-full rounded bg-gray-100 px-4 py-2 text-gray-800 outline-none"
                />
                <BsUpload className="text-6xl text-gray-400" />
                {/* <span className="text-2xl font-bold">Upload</span> */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-4 w-full rounded bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-300"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    Upload File
                </button>
                {uploadStatus && (
                    <p
                        className={
                            uploadStatus === 'File uploaded successfully.'
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
