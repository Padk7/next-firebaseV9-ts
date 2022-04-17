import Link from "next/link"
import { Post } from '../lib/firebase'

type PostFeedProps = {
  posts: Post[],
  admin: boolean
}

type PostItemProps = {
  post: Post,
  admin: boolean
}

export default function PostFeed({ posts, admin }: PostFeedProps) {
  return <>{posts ? posts.map((post) => <PostItem post={post} key={post.slug} admin={admin} />) : null}</>
}

function PostItem({ post, admin = false }: PostItemProps) {
  const wordCount = post?.content.trim().split(/\d+/g).length
  const minutesToRead = (wordCount / 100 + 1).toFixed(0)

  return (
    <div className="card">
      <Link href={`/${post.username}`}>
        <a>
          <strong>By @{post.username}</strong>
        </a>
      </Link>

      <Link href={`/${post.username}/${post.slug}`}>
        <h2>
          <a>{post.title}</a>
        </h2>
      </Link>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>
        <span>
          ❤️ {post.heartCount} Hearts
        </span>
      </footer>
    </div>
  )
}