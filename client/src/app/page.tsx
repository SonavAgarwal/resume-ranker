'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl">App Grading!</h1>
            {/* button to login */}
            <button
                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                onClick={() => {
                    router.push('/login')
                }}
            >
                Log In
            </button>
        </div>
    )
}
