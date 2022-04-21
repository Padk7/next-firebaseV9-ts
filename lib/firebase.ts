import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  collection,
  collectionGroup,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  Firestore,
  limit,
  orderBy,
  query,
  Query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  where,
  QueryConstraint,
  QuerySnapshot
} from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import kebabCase from 'lodash.kebabcase';
import { useContext } from 'react';
import { UserContext } from './context';

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

export const servTimestamp = serverTimestamp

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
 * Converts a firestore document to JSON
 */
 export function postToJSON(data: DocumentData): Post {
  return {
    ...data,
    createdAt: data?.createdAt ? data.createdAt.toMillis() : null,
    updatedAt: data?.updatedAt ? data.updatedAt.toMillis() : null
  } as Post
}

/**
 * Gets a users/{uid} document with username
 * @param {string} username
*/
async function getUserDocFromUsername(username: string): Promise<QueryDocumentSnapshot<DocumentData> | null> {
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
export async function getUserFromUsername(username: string): Promise<User | null> {
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
 * Gets posts query for current user
 * @param {number} numPosts The number of posts to retrieve
 * @param {boolean} published Are the posts published?
*/
export function getCurrentUserPostsQuery(numPosts=0, published=false) : Query<DocumentData> | null {
  if (auth?.currentUser) {
    const postsRef = collection(firestore,'users', auth?.currentUser?.uid,'posts')
    if (postsRef) {
      const queryConstraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]
      if (numPosts > 0) queryConstraints.unshift(limit(numPosts))
      if (published) queryConstraints.unshift(where('published', '==', true))
  
      return query(postsRef, ...queryConstraints)
    }
  }
  return null
}

/**
 * Gets all users/{uid}/posts documents from username
 * @param {string} username
 * @param {number} numPosts The number of posts to retrieve
 * @param {boolean} published Are the posts published?
*/
export async function getUserPostsFromUsername(username: string, numPosts=0, published=false) {
  let user: User | null = null
  let posts: Post[] = []

  const userDoc = await getUserDocFromUsername(username)
  if (userDoc) {
    user = userDoc.data() as User
    const postsRef = collection(userDoc.ref, 'posts')

    const queryConstraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]
    if (numPosts > 0) queryConstraints.unshift(limit(numPosts))
    if (published) queryConstraints.unshift(where('published', '==', true))

    const postsQuery = query(postsRef, ...queryConstraints)
    posts = (await getDocs(postsQuery)).docs.map((doc) => { return postToJSON(doc.data()) })
  }
  return { user, posts }
}

/**
 * Gets all users/{uid}/posts post from username
 * @param {string} username
 * @param {string} slug
*/
export async function getPostFromUsernameAndSlug(username: string, slug: string) {
  let post: Post | null = null
  let path = ''
  const userDoc = await getUserDocFromUsername(username)
  if (userDoc) {
    const postRef = doc(userDoc.ref, 'posts', slug)
    const postDoc = await getDoc(postRef)
    path = postRef.path
    if (postDoc.exists()) post = postToJSON(postDoc.data())
  }
  return { post, path }
}

/**
 * Gets most recent posts from all users
 * @param {number} numberOfPosts
 */
export async function getRecentPosts(numberOfPosts: number): Promise<Post[]> {
  let posts: Post[] = []
  const postsQuery = query(collectionRefs.posts,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(numberOfPosts))
  posts = (await getDocs(postsQuery)).docs.map((doc) => { return postToJSON(doc.data()) })
  return posts
}

/**
 * Gets most recent posts from all users
 * @param {any} posts
 * @param {number} numberOfPosts
 */
export async function loadMorePosts(posts: Post[], numberOfPosts: number): Promise<Post[]> {
  let newPosts: Post[] = []
  const last = posts[posts.length - 1]
  const cursor = typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : last.createdAt
  const postsQuery = query(collectionRefs.posts,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    startAfter(cursor),
    limit(numberOfPosts))
  newPosts = (await getDocs(postsQuery)).docs.map((doc) => { return postToJSON(doc.data()) })
  return newPosts
}

export async function getAllPostPaths() {
  // Improve by using Admin SDK to select empty docs
  const snapshot = await getDocs(collectionGroup(firestore, 'posts'))

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });
  return paths
}

export function getPostRefFromPath(path: string) {
  return doc(firestore, path)
}

export type PostFormData = {
  title: string,
  username: string,
  slug: string
}

// Create a new post in firestore
export const createPostDoc = async ( formData: PostFormData ) => {
  const uid = auth?.currentUser?.uid;
  if (uid) {
    const ref = doc(firestore, 'users', uid, 'posts', formData.slug);
    const data = {
      title: formData.title,
      slug: formData.slug,
      uid: uid,
      username: formData.username,
      published: false,
      content: '# hello world!',
      heartCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    await setDoc(ref, data);
    return true
  }
  return false
}