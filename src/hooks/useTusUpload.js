import { useState, useRef } from 'react';
import * as tus from 'tus-js-client';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';

// Helper function to get video duration
const getVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      window.URL.revokeObjectURL(video.src);
      resolve(duration);
    };
    
    video.onerror = (e) => {
      console.error('Error getting video duration:', e);
      resolve(0);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

export function useTusUpload(auth) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const uploadRef = useRef(null);
  const currentVideoUidRef = useRef(null);

  const abort = () => {
    return new Promise((resolve) => {
      if (uploadRef.current) {
        // Get the videoUid before aborting
        const videoUid = currentVideoUidRef.current;
        
        // Abort the upload
        uploadRef.current.abort();
        console.log('Upload aborted, returning videoUid:', videoUid);
        
        // Reset states
        setIsUploading(false);
        setUploadProgress(0);
        uploadRef.current = null;
        currentVideoUidRef.current = null;
        
        // Resolve with the videoUid
        resolve(videoUid);
      } else {
        resolve(null);
      }
    });
  };

  const upload = async (file, metadata = {}, onComplete) => {
    // Remove file size validation (no limit)
    // const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    // if (file.size > MAX_FILE_SIZE) {
    //   const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    //   const error = new Error(`הקובץ גדול מדי (${fileSizeMB}MB). הגודל המקסימלי המותר הוא 2GB`);
    //   setError(error);
    //   showNotification(`הקובץ גדול מדי (${fileSizeMB}MB). הגודל המקסימלי המותר הוא 2GB`, 'error');
    //   throw error;
    // }

    // Add file type validation - only allow video files
    const allowedVideoTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo', // .avi
      'video/x-ms-wmv',  // .wmv
      'video/webm',
      'video/ogg',
      'video/3gpp',
      'video/x-flv'
    ];
    
    if (!allowedVideoTypes.includes(file.type)) {
      const error = new Error(`סוג קובץ לא נתמך. אנא העלה קובץ וידאו (MP4, AVI, MOV, וכו')`);
      setError(error);
      showNotification(`סוג קובץ לא נתמך. אנא העלה קובץ וידאו (MP4, AVI, MOV, וכו')`, 'error');
      throw error;
    }

    if (!auth || !auth.session) {
      const error = new Error('לא ניתן להעלות וידאו כעת, אנא התחבר');
      setError(error);
      throw error;
    }

    console.log('Starting upload process for file:', file.name);
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    currentVideoUidRef.current = null;

    try {
      if (!auth || !auth.session || !auth.session.access_token) {
        throw new Error('No active session or access token');
      }

      // Get video duration before starting upload
      console.log('Starting duration detection');
      const duration = await getVideoDuration(file);
      console.log('Adding duration to metadata:', duration);
      metadata.duration = duration;

      // Log the complete metadata object
      console.log('Complete upload metadata:', metadata);

      // 1. Get signed URL from quick-worker endpoint
      const supabaseUrl = supabase.supabaseUrl;
      const quickWorkerEndpoint = `${supabaseUrl}/functions/v1/quick-worker`;
      
      // Ensure allowedOrigins has a default value
      const allowedOrigins = ['cs24.co.il', 'localhost:3000'];
      
      const createResponse = await fetch(quickWorkerEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.session.access_token}`,
          'Upload-Length': file.size.toString(),
          'Tus-Resumable': '1.0.0',
          'Upload-Metadata': `name ${btoa(file.name)},type ${btoa(file.type)},requiresignedurls, allowedorigins ${btoa(allowedOrigins.join(','))}`,
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

      
      // Store the videoUid immediately after getting it from the headers
      currentVideoUidRef.current = videoUid;

      // 2. Upload using tus
      return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: uploadUrl,
          retryDelays: [0, 1000, 3000, 5000],
          chunkSize: 5 * 1024 * 1024, // 5MB chunks - safe for Cloudflare Stream Free/Pro
          metadata: {
            filename: file.name,
            filetype: file.type,
            ...metadata
          },
          headers: {},
          onError: function(err) {
            console.error('Tus upload error:', err);
            
            // Provide more specific error messages based on error type
            let errorMessage = 'שגיאה בהעלאת הקובץ';
            let userMessage = 'שגיאה בהעלאת הקובץ';
            
            if (err.message.includes('CORS') || err.message.includes('cross-origin')) {
              errorMessage = 'CORS error - upload blocked by browser security policy';
              userMessage = 'שגיאה בהעלאה: הגישה נחסמה על ידי הדפדפן. אנא פנה לתמיכה טכנית.';
            } else if (err.message.includes('413') || err.message.includes('too large') || err.message.includes('Content Too Large')) {
              errorMessage = 'Chunk size too large - exceeds Cloudflare Stream limit';
              userMessage = 'שגיאה בהעלאה: גודל הקטע גדול מדי. הבעיה תתוקן אוטומטית - נסה שוב.';
            } else if (err.message.includes('Network') || err.message.includes('fetch')) {
              errorMessage = 'Network error during upload';
              userMessage = 'שגיאת רשת בהעלאה. אנא בדוק את החיבור לאינטרנט ונסה שוב.';
            } else if (err.message.includes('timeout')) {
              errorMessage = 'Upload timeout';
              userMessage = 'זמן ההעלאה פג. אנא נסה שוב.';
            }
            
            const error = new Error(errorMessage);
            error.videoUid = currentVideoUidRef.current;
            setError(error);
            setIsUploading(false);
            showNotification(userMessage, 'error');
            uploadRef.current = null;
            currentVideoUidRef.current = null;
            reject(error);
          },
          onProgress: function(bytesUploaded, bytesTotal) {
            const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
            setUploadProgress(percentage);
          },
          onSuccess: function() {
            console.log('Upload success, passing metadata to callback:', metadata);
            setIsUploading(false);
            setUploadProgress(100);
            uploadRef.current = null;
            const videoUid = currentVideoUidRef.current;
            currentVideoUidRef.current = null;
            onComplete?.(videoUid, metadata);
            resolve(videoUid);
          }
        });

        uploadRef.current = upload;
        upload.start();
      });
    } catch (err) {
      
      // If we have a videoUid when the error occurs, attach it to the error
      if (currentVideoUidRef.current) {
        err.videoUid = currentVideoUidRef.current;
      }
      setError(err);
      setIsUploading(false);
      uploadRef.current = null;
      currentVideoUidRef.current = null;
      showNotification(`שגיאה בהעלאה: ${err.message}`, 'error');
      throw err;
    }
  };

  return {
    upload,
    uploadProgress,
    isUploading,
    error,
    abort
  };
} 