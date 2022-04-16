import UserProfile from '../../components/UserProfile'
import PostFeed from '../../components/PostFeed'
import { getUserWithUsername, getPostsFromUser, postToJSON } from '../../lib/firebase';

export async function getServerSideProps({ query }){
  
  const { username } = query;

  let user = null
  let posts = null

  const userDoc = await getUserWithUsername(username)
  if (userDoc) {
    user = userDoc.data()
    const postsDocs = await getPostsFromUser(userDoc)
    if (postsDocs) {
      posts = postsDocs.map(postToJSON)
    }
  }

  return {
    props: { user, posts }
  }
}

export default function UserProfilePage({ user, posts }) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  )
}