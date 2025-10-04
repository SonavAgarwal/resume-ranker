'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'

import { auth } from '@/lib/firebase'

const godEmail = (process.env.NEXT_PUBLIC_GOD_EMAIL || '').toLowerCase()

export default function Home() {
    const router = useRouter()
    const [user, loading, error] = useAuthState(auth)

    if (loading)
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                Loading...
            </div>
        )

    if (error)
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                Failed to load auth state
            </div>
        )

    if (!user)
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl">App Grading!</h1>
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

    const isGod = (user.email || '').toLowerCase() === godEmail

    const links = [{ href: '/groups', label: 'See Groups to Grade' }]

    if (isGod) {
        links.push(
            { href: '/upload', label: 'Upload Profiles' },
            { href: '/delete', label: 'Delete Ranking Group' },
            { href: '/make-admin', label: 'Make Admin' }
        )
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-6">
            <h1 className="text-2xl">
                Hey{user.displayName ? `, ${user.displayName}` : ''}!
            </h1>
            <ul className="flex flex-col items-center gap-3">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-blue-500 hover:underline"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
