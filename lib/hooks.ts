import { auth, firestore } from '../lib/firebase'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, onSnapshot } from 'firebase/firestore'

export function useUserData() {
    const [user] = useAuthState(auth)
    const [username, setUsername] = useState<string | null>(null)

    useEffect(() => {
        // turn off realtime subscriptions
        let unsubscribe
        if (user) {
            const ref = doc(firestore, 'users', user.uid)
            unsubscribe = onSnapshot(ref, (d) => {
                const name = d.data()?.username
                if (name) setUsername(name)
            })
        } else {
            setUsername(null)
        }

        return unsubscribe
    }, [user])

    return { user, username }
}