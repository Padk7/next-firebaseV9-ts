import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
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
