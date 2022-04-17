import UserProfile from '../../components/UserProfile'
import PostFeed from '../../components/PostFeed'
import { getUserPostsFromUsername, User, Post } from '../../lib/firebase';
import { GetServerSideProps } from 'next'

type UserProfileProp = {
  user: User,
  posts: Post[]
}

export const getServerSideProps: GetServerSideProps = async({ query }) => {
  let user: User | null = null
  let posts: Post[] = []

  const { username } = query;

  if (typeof username === 'string') {
    ;({ user, posts } = await getUserPostsFromUsername(username))
  }
  return {
    props: { user, posts }
  }
}

export default function UserProfilePage({ user, posts }: UserProfileProp) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} admin={false}/>
    </main>
  )
}