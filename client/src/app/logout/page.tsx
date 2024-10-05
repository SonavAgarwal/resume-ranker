'use client'

import { auth } from '@/lib/firebase'
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect
} from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

interface Props {}

const Page = (props: Props) => {
    const router = useRouter()

    useEffect(() => {
        auth.signOut().then(() => {
            router.push('/')
        })
    }, [])

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            Logging out...
        </div>
    )
}

export default Page
