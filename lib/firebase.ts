import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore,Firestore, collection, query,
    where, limit,getDocs, QueryDocumentSnapshot, DocumentData, orderBy } from 'firebase/firestore'
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

let app : FirebaseApp
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

/// Helper functions

/**
 * Gets a users/{uid} document with username
 * @param {string} username
*/
export async function getUserWithUsername(username: string) {
    const usersRef = collection(firestore, 'users')
    const usersQuery = query(usersRef,
                        where('username', '==', username),
                        limit(1))
    const userDoc = (await getDocs(usersQuery)).docs[0]
    return userDoc
}

/**
 * Gets all users/{uid}/posts documents from user
 * @param {QueryDocumentSnapshot<DocumentData>} userDoc
*/
export async function getPostsFromUser(userDoc : QueryDocumentSnapshot<DocumentData>) {
    const postsRef = collection(userDoc.ref, 'posts')
    const postsQuery = query(postsRef,
                        where('published', '==', true),
                        limit(5),
                        orderBy('createdAt','desc'))
    const posts = (await getDocs(postsQuery)).docs
    return posts
}

/**
 * Converts a firestore document to JSON
 */
export function postToJSON(doc){
    const data = doc.data();
    return {
        ...data,
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
    }
}