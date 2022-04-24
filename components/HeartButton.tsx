import { getHeartRef, addOrRemoveHeart, HeartButtonProp } from '../lib/firebase';
import { useDocument } from 'react-firebase-hooks/firestore';

// Allows user to heart or like a post
export default function Heart({ postRef }: HeartButtonProp) {
  // Listen to heart document for currently logged in user
  const heartRef = getHeartRef(postRef)
  const [heartDoc] = useDocument(heartRef)

  const addHeart = async() => {
   await addOrRemoveHeart(postRef, heartRef, false)
  }

  const removeHeart = async() => {
    await addOrRemoveHeart(postRef, heartRef, true)
   }

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>💗 Heart</button>
  );
}