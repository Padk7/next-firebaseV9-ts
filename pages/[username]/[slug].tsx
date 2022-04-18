import styles from '../../styles/PostSlug.module.css'
import { GetStaticProps, GetStaticPaths } from "next"
import { ParsedUrlQuery } from "querystring"
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getPostFromUsernameAndSlug, getAllPostPaths, getPostRefFromPath, Post } from '../../lib/firebase'
import PostContent from '../../components/PostContent'

interface IParams extends ParsedUrlQuery {
  username: string,
  slug: string
}

type PostProps = {
  post: Post,
  path: string
}

export const getStaticProps: GetStaticProps = async({params}) => {
  const { username, slug } = params as IParams

  const {post, path} = await getPostFromUsernameAndSlug(username, slug)

  // If no post, short circuit to 404 page
  if (!post) {
    return {
      notFound: true
    }
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
} 

export const getStaticPaths: GetStaticPaths = async() => {

  const paths = await getAllPostPaths()

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: 'blocking',
  };
}

export default function PostSlug(props: PostProps) {

  const postRef = getPostRefFromPath(props.path)
  const [realtimePost] = useDocumentData(postRef)

  const post = realtimePost as Post || props.post
  
  return (
    <main className={styles.container}>

      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post?.heartCount || 0} 🤍</strong>
        </p>

      </aside>
    </main>
  )
}