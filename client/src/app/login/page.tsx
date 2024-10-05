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

    const [user, loading, error] = useAuthState(auth)

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider()
        try {
            signInWithPopup(auth, provider)
        } catch (error) {
            console.error('Google sign in error:', error)
        }
    }

    useEffect(() => {
        if (user) {
            router.push('/groups')
        }
    }, [user])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="flex h-screen w-full items-center justify-center gap-4 p-4">
            <div className="flex w-64 flex-col items-center justify-center gap-4 rounded-md bg-gray-200 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Login</h1>
                </div>
                <div>
                    <button
                        onClick={() => {
                            signInWithGoogle()
                        }}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Page
