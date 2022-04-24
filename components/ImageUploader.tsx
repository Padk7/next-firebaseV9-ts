import { LOADIPHLPAPI } from "dns";
import { stringify } from "querystring";
import { ChangeEvent, useState } from "react";
import { uploadImage, getDownloadURL } from '../lib/firebase'
import Loader from "./Loader";

export default function ImageUploader() {

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('0')
  const [downloadURL, setDownloadURL] = useState('')

  const uploadFile = async(e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files){
      const file = [...e.target.files][0]
      const extension = file.type.split('/')[1]

      const {ref, task } = uploadImage(file, extension)
      setUploading(true)


      // Listen to updates to upload task
      task.on('state_changed', (snapshot) => {
        const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
        setProgress(pct);

        // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
        task
          .then(() => getDownloadURL(ref))
          .then((url) => {
            setDownloadURL(url as string);
            setUploading(false);
          });
    });

    }
  }

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}
      {!uploading && (
        <>
          <label className="btn">
            📸 Upload Img
            <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
          </label>
        </>
      )}
      {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
    </div>

  )
}