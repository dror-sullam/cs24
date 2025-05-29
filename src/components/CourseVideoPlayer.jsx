import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Stream } from "@cloudflare/stream-react";
import { getDevicePayload } from "../utils/deviceFingerprint";

async function getPlaybackToken(videoUID) {
  const devicePayload = getDevicePayload();
  
  const { data, error } = await supabase.functions.invoke('signed-token', {
    body: { 
      videoUID,
      ...devicePayload
    }
  });

  if (error) {
    console.error("Token error:", error);
    
    // Handle FunctionsHttpError by extracting the actual error message
    let errorMessage = "Unknown error";
    
    if (error.context && error.context.json) {
      try {
        const errorData = await error.context.json();
        console.log("Error data from context:", errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error context:", e);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { token: null, error: errorMessage };
  }

  // Check if error is in the data object
  if (data && data.error) {
    console.error("Token error in data:", data.error);
    return { token: null, error: data.error };
  }

  if (!data || !data.token) {
    console.error("No token in response:", data);
    return { token: null, error: "No token received" };
  }

  return { token: data.token, error: null };
}

function CourseVideoPlayer({ courseId, activeEpisode, onEpisodeComplete }) {
  const [streamToken, setStreamToken] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const streamRef = useRef();
  const [currentTime, setCurrentTime] = useState(0);
  const lastEpisodeIdRef = useRef(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getVideoDetails = async () => {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setTokenError(null);

      try {
        const { token, error } = await getPlaybackToken(courseId);
        if (token) {
          setVideoId(courseId);
          setStreamToken(token);
          setTokenError(null);
        } else if (error) {
          setTokenError(error);
        }
      } catch (error) {
        console.error("Error getting video details:", error);
        setTokenError("שגיאה בטעינת הווידאו");
      } finally {
        setIsLoading(false);
      }
    };

    getVideoDetails();
  }, [courseId]);

  useEffect(() => {
    if (!isPlayerReady || !activeEpisode || !streamRef.current) return;

    if (lastEpisodeIdRef.current !== activeEpisode.id) {
      try {
        streamRef.current.pause();
        streamRef.current.currentTime = activeEpisode.start_time;
        lastEpisodeIdRef.current = activeEpisode.id;
      } catch (err) {
        // Error handling preserved without console.log
      }
    }
  }, [activeEpisode, isPlayerReady]);

  useEffect(() => {
    if (activeEpisode && currentTime >= activeEpisode.end_time && streamRef.current && !isUpdatingProgress) {
      try {
        streamRef.current.pause();
        setIsUpdatingProgress(true);
        
        const updateProgress = async () => {
          const { data: episodesWatched, error } = await supabase
            .rpc('update_episodes_watched', {
              p_video_course_id: courseId,
              p_episode_index: activeEpisode.index
            });

          if (!error && onEpisodeComplete) {
            onEpisodeComplete(episodesWatched);
          }
          setIsUpdatingProgress(false);
        };

        updateProgress();
      } catch (error) {
        setIsUpdatingProgress(false);
      }
    }
  }, [currentTime, activeEpisode, courseId, onEpisodeComplete, isUpdatingProgress]);

  const handlePlay = () => {
    if (activeEpisode && streamRef.current) {
      if (currentTime < activeEpisode.start_time || currentTime >= activeEpisode.end_time) {
        try {
          streamRef.current.currentTime = activeEpisode.start_time;
        } catch (error) {
          // Error handling preserved without console.log
        }
      }
    }
  };

  const handleLoadedData = () => {
    setIsPlayerReady(true);

    const thumbnailImg = document.getElementById("thumbnail-img");
    if (thumbnailImg) thumbnailImg.style.display = "none";
    const videoPlayer = document.getElementById("video-player");
    if (videoPlayer) videoPlayer.style.display = "block";

    if (activeEpisode && streamRef.current) {
      try {
        streamRef.current.pause();
        streamRef.current.currentTime = activeEpisode.start_time;
        lastEpisodeIdRef.current = activeEpisode.id;
      } catch (err) {
        // Error handling preserved without console.log
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>טוען וידאו...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    const isDeviceLimitError = tokenError.includes("Device limit reached");
    
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isDeviceLimitError ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isDeviceLimitError ? "מגבלת מכשירים הושגה" : "שגיאה בטעינת הווידאו"}
          </h3>
          <p className="text-gray-300 mb-4">
            {isDeviceLimitError 
              ? "הגעת למגבלת המכשירים עבור קורס זה (מקסימום 3 מכשירים). אנא צור קשר עם התמיכה."
              : "אירעה שגיאה בטעינת הווידאו. אנא נסה לרענן את העמוד."
            }
          </p>
          {isDeviceLimitError && (
            <a
              href="mailto:cs24.hit@gmail.com"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              צור קשר עם התמיכה
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!streamToken || !videoId) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p>הווידאו אינו זמין</p>
        </div>
      </div>
    );
  }

  return (
  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
    <Stream
      controls
      src={streamToken}
      streamRef={streamRef}
      loading={
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>טוען וידאו...</p>
          </div>
        </div>
      }
      onLoadedData={handleLoadedData}
      onTimeUpdate={(e) => {
        if (streamRef.current) {
          setCurrentTime(streamRef.current.currentTime);
        }
      }}
      onPlay={handlePlay}
      onError={(error) => (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">שגיאה בטעינת הווידאו</h3>
            <p className="text-gray-300">אנא נסה לרענן את העמוד</p>
          </div>
        </div>
      )}
      autoplay={false}
    />
  </div>
);
}

export default CourseVideoPlayer;
