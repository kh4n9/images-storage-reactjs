import React, { useState } from 'react';
import { uploadImage } from '../services/api';

function ImageUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadImage(file);
      setMessage('Upload successful');
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ImageUploader;
