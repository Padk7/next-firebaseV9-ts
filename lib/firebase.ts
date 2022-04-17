import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
    collection,
    collectionGroup,
    DocumentData,
    getDocs,
    getFirestore,
    Firestore,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    Timestamp,
    where,
    DocumentReference
} from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyCztJbdr8wscumsFzX1MsnObd87HvFk_xQ",
    authDomain: "fireship-b072f.firebaseapp.com",
    projectId: "fireship-b072f",
    storageBucket: "fireship-b072f.appspot.com",
    messagingSenderId: "516798945249",
    appId: "1:516798945249:web:03d54f4fb3badf1d3fa4a0",
    measurementId: "G-TGRFWKL4EJ"
};

let app: FirebaseApp
try {
    app = getApp()
} catch {
    app = initializeApp(firebaseConfig)
}
export const firebase = app

export const auth: Auth = getAuth()
export const googleAuthProvider: GoogleAuthProvider = new GoogleAuthProvider()
export const firestore: Firestore = getFirestore()
export const storage: FirebaseStorage = getStorage()

export type User = {
    uid: string,
    displayName: string,
    photoURL: string,
    username: string
}

export type Post = {
    content: string,
    createdAt: Timestamp | number,
    heartCount: number,
    published: boolean,
    slug: string,
    title: string,
    uid: string,
    updatedAt: Timestamp | number,
    username: string
}

const collectionRefs = {
    users: collection(firestore, 'users'),
    posts: collectionGroup(firestore, 'posts') 
}

/// Helper functions

/**
 * Gets a users/{uid} document with username
 * @param {string} username
*/
async function getUserDocFromUsername(username: string): Promise< QueryDocumentSnapshot<DocumentData> | null > {
    let user: User
    const usersQuery = query(collectionRefs.users,
        where('username', '==', username),
        limit(1))
    const userDoc = (await getDocs(usersQuery)).docs[0]
    if (userDoc?.exists()) {
        //user = {...userDoc.data(), ref: userDoc.ref} as User
        return userDoc
    } else {
        return null
    }
}

/**
 * Gets a users/{uid} user object with username
 * @param {string} username
*/
export async function getUserFromUsername(username: string): Promise< User | null > {
    let user: User
    const userDoc = await getUserDocFromUsername(username)
    if (userDoc?.exists()) {
        user = userDoc.data() as User
        return user
    } else {
        return null
    }
}

/**
 * Gets all users/{uid}/posts documents from username
 * @param {string} username
*/
export async function getUserPostsFromUsername(username: string) {
    let user: User | null = null
    let posts: Post[] = []

    const userDoc = await getUserDocFromUsername(username)
    if (userDoc) {
        user = userDoc.data() as User
        const postsRef = collection(userDoc.ref, 'posts')
        const postsQuery = query(postsRef,
            where('published', '==', true),
            limit(5),
            orderBy('createdAt', 'desc'))
        posts = (await getDocs(postsQuery)).docs.map(postToJSON)
    }
    return {user, posts}
}

/**
 * Converts a firestore document to JSON
 */
export function postToJSON(doc: QueryDocumentSnapshot<DocumentData>): Post {
    const data = doc.data();
    return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
    } as Post
}

/**
 * Gets most recent posts from all users
 * @param {number} numberOfPosts
 */
export async function getRecentPosts(numberOfPosts: number): Promise<Post[]> {
    const postsQuery = query(collectionRefs.posts,
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(numberOfPosts))
    const posts = (await getDocs(postsQuery)).docs.map(postToJSON)
    return posts
}

/**
 * Gets most recent posts from all users
 * @param {any} posts
 * @param {number} numberOfPosts
 */
export async function loadMorePosts(posts: Post[], numberOfPosts: number): Promise<Post[]> {

    const last = posts[posts.length - 1]

    const cursor = typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : last.createdAt
    const postsQuery = query(collectionRefs.posts,
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(cursor),
        limit(numberOfPosts))
    const newPosts = (await getDocs(postsQuery)).docs.map(postToJSON)
    return newPosts
}