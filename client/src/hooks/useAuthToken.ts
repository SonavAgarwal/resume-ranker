import { auth } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

export const useAuthToken = () => {
    const [token, setToken] = useState<string | null>(null)

    const [user, userLoading, error] = useAuthState(auth)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            user.getIdToken().then(
                (token) => {
                    setToken(token)
                    setLoading(false)
                },
                (error) => {
                    console.error('Error getting token:', error)
                }
            )
        }
    }, [user])

    return {
        token,
        tokenLoading: loading || userLoading,
        error
    }
}
