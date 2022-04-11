import Link from 'next/link'
import toast from 'react-hot-toast'

import Loader from '../components/Loader'

export default function Home() {
  return (
    <div>
      <button onClick={() => toast.success('HYAAAAAAH!')}>
        Can I get a hyah?
      </button>
    </div>
  )
}