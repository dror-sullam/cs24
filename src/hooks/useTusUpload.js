import { useState } from 'react';
import * as tus from 'tus-js-client';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';

export function useTusUpload(auth) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (file, metadata = {}, onComplete) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      if (!auth || !auth.session || !auth.session.access_token) {
        throw new Error('No active session or access token');
      }

      // 1. Get signed URL from quick-worker endpoint
      const supabaseUrl = supabase.supabaseUrl;
      const quickWorkerEndpoint = `${supabaseUrl}/functions/v1/quick-worker`;
      
      const createResponse = await fetch(quickWorkerEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.session.access_token}`,
          'Upload-Length': file.size.toString(),
          'Tus-Resumable': '1.0.0',
          'Upload-Metadata': `name ${btoa(file.name)},type ${btoa(file.type)},requiresignedurls`,
          'Upload-Creator': metadata.tutorId?.toString() || '0',
        }
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({ message: createResponse.statusText }));
        throw new Error(`Failed to get upload URL: ${errorData.message || createResponse.statusText}`);
      }

      const uploadUrl = createResponse.headers.get('Location');
      if (!uploadUrl) {
        throw new Error('No upload URL received');
      }

      // Get video UID from stream-media-id header
      const videoUid = createResponse.headers.get('stream-media-id');
      if (!videoUid) {
        throw new Error('No video UID received in stream-media-id header');
      }

      // 2. Upload using tus
      return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: uploadUrl,
          retryDelays: [0, 1000, 3000, 5000],
          metadata: {
            filename: file.name,
            filetype: file.type,
            ...metadata
          },
          headers: {
            // TUS client might not automatically send Authorization header for PATCH requests to Cloudflare
            // Depending on Cloudflare TUS setup, this might or might not be needed.
            // If uploads fail with 401 on PATCH, uncomment the line below.
            // 'Authorization': `Bearer ${auth.session.access_token}`,
          },
          onError: function(err) {
            setError(err.message);
            setIsUploading(false);
            showNotification('שגיאה בהעלאת הקובץ', 'error');
            reject(err);
          },
          onProgress: function(bytesUploaded, bytesTotal) {
            const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
            setUploadProgress(percentage);
          },
          onSuccess: function() {
            setIsUploading(false);
            setUploadProgress(100);
            onComplete?.(videoUid);
            resolve(videoUid);
          }
        });

        upload.start();
      });
    } catch (err) {
      setError(err.message);
      setIsUploading(false);
      showNotification(`שגיאה בהעלאה: ${err.message}`, 'error');
      throw err;
    }
  };

  return {
    upload,
    uploadProgress,
    isUploading,
    error,
  };
} 