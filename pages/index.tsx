import { getRecentPosts, loadMorePosts, Post } from '../lib/firebase'
import Loader from '../components/Loader'
import PostFeed from '../components/PostFeed'
import { useState } from 'react'
import { GetServerSideProps } from 'next'

const LIMIT = 1

type Props = {
  posts: Post[]
}

export const getServerSideProps: GetServerSideProps = async(context) => {
  const posts = await getRecentPosts(LIMIT)

  return {
    props: { posts }
  }
}

export default function Home(props: Props) {

  const [posts, setPosts] = useState(props.posts)
  const [loading, setLoading] = useState(false)
  const [postsEnd, setPostsEnd] = useState(false)

  const getMorePosts = async () => {
    setLoading(true)
    const newPosts = await loadMorePosts(posts, LIMIT)
    setPosts(posts.concat(newPosts))
    setLoading(false)

    if(newPosts.length < LIMIT) {
      setPostsEnd(true)
    }
  }

  return (
    <main>
      <PostFeed posts={posts} admin={false} />

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  )
}