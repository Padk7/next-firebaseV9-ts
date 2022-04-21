import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck'
import { useCollection } from 'react-firebase-hooks/firestore';
import { getCurrentUserPostsQuery, postToJSON, createPostDoc, PostFormData } from '../../lib/firebase'
import PostFeed from '../../components/PostFeed';
import { useRouter } from 'next/router';
import { FormEvent, FormEventHandler, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import kebabCase from 'lodash.kebabcase';
import { UserContext } from '../../lib/context';

export default function AdminPostsPage({ }) {
  return (
    <main>
      <AuthCheck>
        <>
          <PostList />
          <CreateNewPost />
        </>
      </AuthCheck>
    </main>
  )
}

function PostList() {
  const query = getCurrentUserPostsQuery()
  const [querySnapshot] = useCollection(query);

  const posts = querySnapshot ?
    querySnapshot.docs.map((doc) => { return postToJSON(doc.data()) })
    :
    []

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  )
}

function CreateNewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const { username } = useContext(UserContext) 
  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form: PostFormData = {
      title: title,
      slug: slug,
      username: username as string
    }
    const docCreated = await createPostDoc(form)
    if (docCreated) {
      router.push(`/admin/${slug}`)
    } else {
      toast.success('Post failed!')
    }
  }
  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}