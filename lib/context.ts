import { createContext } from "react";
import { User } from 'firebase/auth';

interface UserContextInterface {
    user: User | null | undefined,
    username: string | null
}

export const UserContext = createContext<UserContextInterface>({ user: null, username: null })