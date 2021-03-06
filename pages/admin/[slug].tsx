import styles from '../../styles/Admin.module.css'
import AuthCheck from '../../components/AuthCheck'
import { UpdatePostProp, getCurrentUserPostRef, updatePostDoc } from '../../lib/firebase'
import ImageUploader from '../../components/ImageUploader'
import { useState } from 'react'
import { useRouter } from 'next/router'

import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { DocumentData, DocumentReference } from '@firebase/firestore'

export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  )
}

function PostManager() {
  const [preview, setPreview] = useState(false)

  const router = useRouter()
  const { slug } = router.query

  const postRef = getCurrentUserPostRef(slug as string)
  const [post] = useDocumentData(postRef)

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef!} defaultValues={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  )

}

type PostFormProp = {
  defaultValues: DocumentData,
  postRef: DocumentReference<DocumentData>,
  preview: boolean
}

interface FormInputs {
  singleErrorInput: string
}

function PostForm({ defaultValues, postRef, preview }: PostFormProp) {
  const { register, handleSubmit, reset, watch, formState } = useForm({ defaultValues, mode: 'onChange' });

  const { errors, isValid, isDirty } = formState
  
  const onSubmit = handleSubmit( async( {content, published} ) => {
    await updatePostDoc(postRef, {content, published} as UpdatePostProp)
    toast.success('Post updated successfully!')
    reset({ content, published })
  })

  return (
    <form onSubmit={onSubmit}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>

        <ImageUploader />

        <textarea {...register("content",{
          minLength: { value: 10, message:"content is too short"},
          maxLength: { value: 20000, message:"content is too long"},
          required: true})}></textarea>

        {errors.content && <p className='text-danger'>{errors.content.message}</p>}

        <fieldset>
          <input className={styles.checkbox} type="checkbox" {...register("published")} />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
        </button>
      </div>
    </form>
  );
}