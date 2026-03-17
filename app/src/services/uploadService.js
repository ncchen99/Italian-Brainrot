import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { isFirebaseStorageEnabled, storage } from '../lib/firebase';

function sanitizeFileName(name) {
  return (name || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadImageToFirebaseStorage({ file, teamId, levelId }) {
  if (!file) {
    throw new Error('缺少要上傳的圖片檔案');
  }

  if (!isFirebaseStorageEnabled || !storage) {
    throw new Error('尚未設定 Firebase Storage（請確認 VITE_FIREBASE_STORAGE_BUCKET）');
  }

  const safeTeamId = (teamId || 'unknown-team').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeLevelId = (levelId || 'unknown-level').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = sanitizeFileName(file.name);
  const objectKey = `uploads/${safeTeamId}/${safeLevelId}/${Date.now()}-${safeName}`;
  const fileRef = ref(storage, objectKey);

  await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      teamId: safeTeamId,
      levelId: safeLevelId
    }
  });

  const publicUrl = await getDownloadURL(fileRef);

  return {
    publicUrl,
    objectKey
  };
}

// Backward-compatible export name to avoid breaking existing imports.
export const uploadImageToR2 = uploadImageToFirebaseStorage;
