export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  return response.json();
};
