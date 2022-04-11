import Link from 'next/link'
import { useContext } from 'react'
import { UserContext } from '../lib/context'

// Top navbar
export default function Navbar() {

    const {user, username } = useContext(UserContext)

    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link href="/">
                        <button className="btn-blue">FEED</button>
                    </Link>
                </li>

                {/* user is signed AND has username */}
                {username && (
                    <>
                        <li className="push-left">
                            <Link href="/admin">
                                <button className="btn-blue">Write Posts</button>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${username}`}>
                                <img src={user?.photoURL} />
                            </Link>
                        </li>
                    </>
                )}
                {/* user is not signed OR has not created username */}
                {!username && (
                    <>
                        <Link href="/enter">
                            <button className="btn-blue">Log in</button>
                        </Link>
                    </>
                )}

            </ul>

        </nav>
    )
}