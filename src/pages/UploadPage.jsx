/* UploadPage.jsx */
import { useState, useRef, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Info, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { courseStyles, courseTypeOptions } from '../config/courseStyles';
import useAuth from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* 1. constants                                                        */
/* ------------------------------------------------------------------ */

// Hardcoded upload config endpoint
const UPLOAD_CONFIG_ENDPOINT = '/functions/v1/get-upload-page';

/* ------------------------------------------------------------------ */
/* 2. component                                                        */
/* ------------------------------------------------------------------ */

// Helper function to convert time format (HH:MM:SS or MM:SS) to seconds
const timeToSeconds = (timeString) => {
  if (!timeString) return 0;
  
  const parts = timeString.split(':');
  
  if (parts.length === 2) {
    // MM:SS format
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  
  return 0;
};

// Helper function to convert seconds to time format (MM:SS)
const secondsToTime = (seconds) => {
  if (seconds === undefined || seconds === null) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState('cs');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailTime, setThumbnailTime] = useState(20); // Default to 20 seconds
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [uploadConfig, setUploadConfig] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // New state for courses and degrees
  const [courses, setCourses] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  
  // New state for episodes (video parts)
  const [episodes, setEpisodes] = useState([
    { 
      id: Date.now(), 
      title: 'מבוא לקורס', 
      duration: '15:00', 
      description: 'סקירה כללית של הקורס ומה נלמד', 
      start_time: 0,
      start_time_format: '00:00',
      end_time: 900,
      end_time_format: '15:00'
    }
  ]);

  const courseTypeRef = useRef(localStorage.getItem('courseType') || 'cs');
  const auth = useAuth();
  const styles = courseStyles[courseTypeRef.current] || courseStyles.cs;
  
  const navigate = useNavigate();

  /* Use the endpoint to check authorization status */
  useEffect(() => {
    const checkAuthorizationStatus = async () => {
      setIsCheckingAuth(true);
      
      if (!auth.session) {
        console.log('No auth session, setting isAuthorized to false');
        setIsAuthorized(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Get the Supabase URL from the client
        const supabaseUrl = supabase.supabaseUrl;
        const fullUploadConfigUrl = `${supabaseUrl}${UPLOAD_CONFIG_ENDPOINT}`;
        
        // Call the endpoint to check authorization and get config
        const response = await fetch(fullUploadConfigUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${auth.session.access_token}`,
            apikey: process.env.REACT_APP_SUPABASE_ANON_KEY
          }
        });

        if (!response.ok) {
          console.log('User not authorized to upload videos');
          setIsAuthorized(false);
          setIsCheckingAuth(false);
          
          // Redirect to no access page
          navigate('/no-access');
          return;
        }

        // If response is ok, parse the config
        const config = await response.json();
        console.log('Upload config received:', config);
        
        // Set config
        setUploadConfig(config);
        setIsAuthorized(true);
        
      } catch (err) {
        console.error('Exception checking authorization status:', err);
        setIsAuthorized(false);
        
        // Redirect to no access page on error
        navigate('/no-access');
      } finally {
        setIsCheckingAuth(false);
        setLoading(false);
      }
    };

    checkAuthorizationStatus();
  }, [auth.session, navigate]);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.rpc("get_courses_with_degree");
        if (error) {
          console.error('Error fetching courses:', error);
          showNotification('שגיאה בטעינת הקורסים', 'error');
        } else {
          console.log('Courses data:', data);
          setCourses(data);
        }
      } catch (err) {
        console.error('Exception fetching courses:', err);
        showNotification('שגיאה בטעינת הקורסים', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Get unique degrees from courses
  const degrees = [...new Set(courses.map(course => course.degree_name))];
  
  // Get filtered courses for selected degree
  const filteredCourses = courses.filter(
    course => course.degree_name === selectedDegree
  );

  const handleDegreeChange = (e) => {
    const newDegree = e.target.value;
    setSelectedDegree(newDegree);
    setSelectedCourse(''); // Reset course selection when degree changes
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview); // Clean up the preview URL
    }
    setThumbnailPreview(null);
    setThumbnailUrl(null);
  };

  // Simple upload handler that will use the configuration received from the server
  const handleUpload = () => {
    showNotification('החיבור לשרת ההעלאה יתבצע בקרוב', 'info');
    
    // Here you would implement the actual upload using the uploadConfig
    // which contains createUploadEndpoint, confirmUploadEndpoint, etc.
    console.log('Upload configuration:', uploadConfig);
    
    // For now, just show a message that we'd use the config
    if (uploadConfig) {
      showNotification(`התחברות לשרת: ${uploadConfig.createUploadEndpoint}`, 'info');
    }
  };

  // Handle adding a new episode
  const handleAddEpisode = () => {
    // Calculate default start_time based on the last episode's end_time
    const lastEpisode = episodes[episodes.length - 1];
    const defaultStartTime = lastEpisode?.end_time || 0;
    
    setEpisodes([...episodes, { 
      id: Date.now(), 
      title: '', 
      duration: '',
      description: '',
      start_time: defaultStartTime,
      start_time_format: secondsToTime(defaultStartTime),
      end_time: defaultStartTime,
      end_time_format: secondsToTime(defaultStartTime)
    }]);
  };
  
  // Handle removing an episode
  const handleRemoveEpisode = (id) => {
    if (episodes.length > 1) {
      setEpisodes(episodes.filter(episode => episode.id !== id));
    } else {
      showNotification('חייב להיות לפחות חלק אחד בסרטון', 'warning');
    }
  };
  
  // Handle episode field changes
  const handleEpisodeChange = (id, field, value) => {
    setEpisodes(episodes.map(episode => {
      if (episode.id === id) {
        const updatedEpisode = { ...episode, [field]: value };
        
        // If start_time or end_time time format changed, update the seconds values
        if (field === 'start_time_format') {
          updatedEpisode.start_time = timeToSeconds(value);
          
          // Recalculate duration if both start and end times are set
          if (updatedEpisode.end_time !== undefined && updatedEpisode.end_time !== null) {
            const durationSeconds = updatedEpisode.end_time - updatedEpisode.start_time;
            if (durationSeconds > 0) {
              updatedEpisode.duration = secondsToTime(durationSeconds);
            }
          }
        } 
        else if (field === 'end_time_format') {
          updatedEpisode.end_time = timeToSeconds(value);
          
          // Recalculate duration if both start and end times are set
          if (updatedEpisode.start_time !== undefined && updatedEpisode.start_time !== null) {
            const durationSeconds = updatedEpisode.end_time - updatedEpisode.start_time;
            if (durationSeconds > 0) {
              updatedEpisode.duration = secondsToTime(durationSeconds);
            }
          }
        }
        // If duration changed, update the end_time
        else if (field === 'duration') {
          const durationSeconds = timeToSeconds(value);
          if (durationSeconds > 0 && updatedEpisode.start_time !== undefined) {
            updatedEpisode.end_time = updatedEpisode.start_time + durationSeconds;
            updatedEpisode.end_time_format = secondsToTime(updatedEpisode.end_time);
          }
        }
        
        return updatedEpisode;
      }
      return episode;
    }));
  };

  // Update button enabled state
  useEffect(() => {
    // Check if either custom thumbnail or thumbnail time is set
    const hasThumbnailOption = !!thumbnail || (!thumbnail && thumbnailTime > 0);
    
    // Check if episodes have titles
    const hasValidEpisodes = episodes.every(episode => episode.title.trim() !== '');

    const enabled = !loading && 
      !!auth.session && 
      !isCheckingAuth &&
      isAuthorized &&
      !!title.trim() && 
      !!description.trim() &&  
      hasThumbnailOption &&    
      !!price &&
      !!selectedDegree &&
      !!selectedCourse &&
      hasValidEpisodes;       

    setIsButtonEnabled(enabled);

    console.log('Button enabled state:', enabled, {
      loading,
      hasSession: !!auth.session,
      isCheckingAuth,
      isAuthorized,
      hasTitle: !!title.trim(),
      hasDescription: !!description.trim(),
      hasThumbnailOption,
      hasCustomThumbnail: !!thumbnail,
      thumbnailTime,
      hasPrice: !!price,
      selectedDegree,
      selectedCourse,
      hasValidEpisodes
    });
  }, [loading, auth.session, isCheckingAuth, isAuthorized, title, description, thumbnail, thumbnailTime, price, selectedDegree, selectedCourse, episodes]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      <Navbar courseType={courseTypeRef.current} />

      <div className="container mx-auto pt-24 pb-10 px-4">
        <h1 className={`text-4xl font-bold mb-8 text-center ${styles.textColor}`}>
          העלאת סרטוני לימוד
        </h1>

        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border">
            <CardHeader className={`bg-gradient-to-r ${styles.cardBg} text-white rounded-t-lg`}>
              <CardTitle className="text-xl md:text-2xl">העלה סרטון חדש</CardTitle>
              <CardDescription className="text-white/90">
                העלה סרטוני לימוד לשיתוף עם הקהילה
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {!auth.session && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <Info className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-red-800 font-semibold">עליך להתחבר כדי להעלות סרטונים</p>
                    <p className="text-red-700 text-sm mt-1">לחץ על כפתור ההתחברות בתפריט העליון</p>
                  </div>
                </div>
              )}

              {/* Degree Selection */}
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                  תואר *
                </label>
                <select
                  id="degree"
                  value={selectedDegree}
                  onChange={handleDegreeChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!auth.session || loading}
                >
                  <option value="">בחר תואר</option>
                  {degrees.map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selection */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  קורס *
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!auth.session || loading || !selectedDegree}
                >
                  <option value="">בחר קורס</option>
                  {filteredCourses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <LabeledInput
                id="videoTitle"
                label="כותרת הסרטון *"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="הזן כותרת לסרטון"
                disabled={!auth.session}
              />

              {/* Description Textarea */}
              <LabeledTextarea
                id="videoDescription"
                label="תיאור הסרטון"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="תאר במה עוסק הסרטון (לא חובה)"
                disabled={!auth.session}
              />

              {/* Episodes Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">חלקי הסרטון</h3>
                  <Button
                    type="button"
                    onClick={handleAddEpisode}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-3 py-1 rounded-md flex items-center gap-2"
                    disabled={!auth.session}
                  >
                    <Plus className="h-4 w-4" />
                    הוסף חלק
                  </Button>
                </div>

                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  {episodes.map((episode, index) => (
                    <div key={episode.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-800">חלק {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveEpisode(episode.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          disabled={episodes.length <= 1 || !auth.session}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <LabeledInput
                          id={`episode-title-${episode.id}`}
                          label="כותרת החלק *"
                          value={episode.title}
                          onChange={(e) => handleEpisodeChange(episode.id, 'title', e.target.value)}
                          placeholder="הזן כותרת לחלק זה"
                          disabled={!auth.session}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <LabeledInput
                            id={`episode-start-${episode.id}`}
                            label="זמן התחלה (דקות:שניות)"
                            value={episode.start_time_format || '00:00'}
                            onChange={(e) => handleEpisodeChange(episode.id, 'start_time_format', e.target.value)}
                            placeholder="לדוגמה: 05:30"
                            disabled={!auth.session}
                          />
                          
                          <LabeledInput
                            id={`episode-end-${episode.id}`}
                            label="זמן סיום (דקות:שניות)"
                            value={episode.end_time_format || '00:00'}
                            onChange={(e) => handleEpisodeChange(episode.id, 'end_time_format', e.target.value)}
                            placeholder="לדוגמה: 10:45"
                            disabled={!auth.session}
                          />
                        </div>
                        
                        <LabeledInput
                          id={`episode-duration-${episode.id}`}
                          label="משך (דקות:שניות)"
                          value={episode.duration}
                          onChange={(e) => handleEpisodeChange(episode.id, 'duration', e.target.value)}
                          placeholder="לדוגמה: 15:30"
                          disabled={!auth.session}
                        />
                        
                        <LabeledTextarea
                          id={`episode-description-${episode.id}`}
                          label="תיאור החלק"
                          value={episode.description}
                          onChange={(e) => handleEpisodeChange(episode.id, 'description', e.target.value)}
                          placeholder="תאר במה עוסק חלק זה (לא חובה)"
                          disabled={!auth.session}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
                  תמונה ממוזערת *
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!auth.session || isUploadingThumbnail}
                  />
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                      disabled={isUploadingThumbnail}
                    >
                      הסר תמונה
                    </button>
                  )}
                </div>
                {thumbnailPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">תצוגה מקדימה:</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {isUploadingThumbnail && (
                  <div className="mt-2 text-sm text-blue-600">
                    מעלה תמונה ממוזערת...
                  </div>
                )}
              </div>

              {/* Thumbnail Time Selection - Only show if no custom thumbnail is selected */}
              {!thumbnail && (
                <div>
                  <label htmlFor="thumbnailTime" className="block text-sm font-medium text-gray-700 mb-1">
                    זמן תמונה ממוזערת (שניות) *
                  </label>
                  <input
                    type="number"
                    id="thumbnailTime"
                    value={thumbnailTime}
                    onChange={(e) => setThumbnailTime(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="הזן זמן בשניות"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    הזן את הזמן בשניות שבו תרצה שהתמונה הממוזערת תילקח מהסרטון
                  </p>
                </div>
              )}

              {/* Price Input */}
              <LabeledInput
                id="price"
                label="מחיר (₪) *"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="הזן מחיר"
                disabled={!auth.session}
              />

              {/* Sale Price Input */}
              <LabeledInput
                id="salePrice"
                label="מחיר מבצע (₪)"
                type="number"
                min="0"
                step="0.01"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                placeholder="הזן מחיר מבצע (לא חובה)"
                disabled={!auth.session}
              />

                <Button
                  className={styles.buttonPrimary}
                  onClick={handleUpload}
                  disabled={!isButtonEnabled}
                >
                  {loading ? 'מעלה...' : 
                   !auth.session ? 'יש להתחבר תחילה' : 
                   isCheckingAuth ? 'בודק הרשאות...' :
                   !isAuthorized ? 'אין הרשאות' : 
                   'העלה סרטון'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
}

function LabeledInput({ id, label, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...rest}
      />
    </div>
  );
}

function LabeledTextarea({ id, label, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...rest}
      />
    </div>
  );
}
