'use client'

import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Page = () => {
    const router = useRouter()

    useEffect(() => {
        auth.signOut().then(() => {
            router.push('/')
        })
    }, [router])

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            Logging out...
        </div>
    )
}

export default Page
