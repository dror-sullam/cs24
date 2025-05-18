/* CourseCreationPage.jsx */
import { useState, useRef, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from '../components/ui/card';
import { CardFooter } from '../components/ui/card-footer';
import { Button } from '../components/ui/button';
import { Info, ChevronRight, BookOpen, DollarSign, ImagePlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { courseStyles } from '../config/courseStyles';
import useAuth from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';
import { useNavigate } from 'react-router-dom';

// Hardcoded upload config endpoint
const UPLOAD_CONFIG_ENDPOINT = '/functions/v1/get-upload-page';

// Function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract the base64 data without the prefix (e.g., "data:image/jpeg;base64,")
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function CourseCreationPage() {
  // Course metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  
  // Authentication and loading state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [uploadConfig, setUploadConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Course selection
  const [courses, setCourses] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Form validation
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Tracks the step in the course creation process

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
        // We'll show login requirement message instead of redirecting
        setLoading(false);
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

        // Parse the response body first
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok || responseData.error) {
          console.log('User not authorized to upload videos:', responseData.error || 'Unknown error');
          setIsAuthorized(false);
          setIsCheckingAuth(false);
          setLoading(false);
          
          // Redirect to no access page
          navigate('/no-access');
          return;
        }

        // Since we already parsed the config above
        console.log('Upload config received:', responseData);
        
        // Set config
        setUploadConfig(responseData);
        setIsAuthorized(true);
        
      } catch (err) {
        console.error('Exception checking authorization status:', err);
        setIsAuthorized(false);
        setLoading(false);
        
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
    if (!file) return;
    
    try {
      // Set the file
      setThumbnail(file);
      
      // Create and set preview URL
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview); // Clean up previous preview
      }
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      console.log('New thumbnail selected:', file.name);
    } catch (err) {
      console.error('Error handling thumbnail selection:', err);
      showNotification('שגיאה בבחירת התמונה', 'error');
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview); // Clean up the preview URL
    }
    setThumbnailPreview(null);
  };

  // Handle course creation
  const handleCreateCourse = async () => {
    // Validate form
    if (!title.trim()) {
      showNotification('נא להזין כותרת לקורס', 'warning');
      return;
    }
    
    if (!description.trim()) {
      showNotification('נא להזין תיאור לקורס', 'warning');
      return;
    }
    
    if (!selectedDegree) {
      showNotification('נא לבחור תואר', 'warning');
      return;
    }
    
    if (!selectedCourse) {
      showNotification('נא לבחור קורס', 'warning');
      return;
    }
    
    if (!price) {
      showNotification('נא להזין מחיר', 'warning');
      return;
    }

    if (!thumbnail) {
      showNotification('נא להעלות תמונה לקורס', 'warning');
      return;
    }

    setLoading(true);
    setIsUploadingThumbnail(true);

    try {
      // Convert thumbnail to base64
      const fileBase64 = await fileToBase64(thumbnail);
      
      // Prepare request payload with base64 image data
      const courseData = {
        p_course_id: selectedCourse,
        p_title: title.trim(),
        p_price: parseFloat(price),
        p_sale_price: salePrice ? parseFloat(salePrice) : null,
        p_description: description.trim(),
        fileBase64: fileBase64,
        fileName: thumbnail.name,
        fileType: thumbnail.type
      };

      console.log('Creating course with data:', {
        ...courseData,
        fileBase64: `${fileBase64.substring(0, 20)}... (truncated)` // Log truncated version
      });

      // Get the Supabase URL from the client
      const supabaseUrl = supabase.supabaseUrl;
      const createCourseEndpoint = `${supabaseUrl}/functions/v1/create-course`;
      
      // Call the endpoint to create the course
      const response = await fetch(createCourseEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      // Parse the response
      const responseData = await response.json();
      console.log('Create course response:', responseData);

      if (!response.ok || responseData.error) {
        // Handle error
        console.error('Error creating course:', responseData.error || 'Unknown error');
        showNotification(`שגיאה ביצירת הקורס: ${responseData.error || 'שגיאה לא ידועה'}`, 'error');
        return;
      }

      // On success
      console.log('Course created successfully with video_id:', responseData.video_id);
      showNotification('הקורס נוצר בהצלחה', 'success');
      
      // Navigate to the course content editor with the video_id
      navigate(`/course-editor/${responseData.video_id}`);
    } catch (err) {
      console.error('Exception creating course:', err);
      showNotification('שגיאה ביצירת הקורס', 'error');
    } finally {
      setLoading(false);
      setIsUploadingThumbnail(false);
    }
  };

  // Update button enabled state
  useEffect(() => {
    // Check if thumbnail is set
    const hasThumbnail = !!thumbnail;
    
    const enabled = !loading && 
      !!auth.session && 
      !isCheckingAuth &&
      isAuthorized &&
      !!title.trim() && 
      !!description.trim() &&  
      hasThumbnail &&    
      !!price &&
      !!selectedDegree &&
      !!selectedCourse;       

    setIsButtonEnabled(enabled);
  }, [loading, auth.session, isCheckingAuth, isAuthorized, title, description, thumbnail, price, selectedDegree, selectedCourse]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      <Navbar courseType={courseTypeRef.current} />

      <div className="container mx-auto pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className={`text-4xl font-bold mb-4 ${styles.textColor}`}>
              יצירת קורס חדש
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              בדף זה תוכל ליצור קורס חדש, להגדיר את פרטיו ולאחר מכן להוסיף לו תוכן.
              ציין את פרטי הקורס הבסיסיים ולאחר מכן עבור לשלב הבא.
            </p>
          </div>

          {/* Progress steps */}
          <div className="mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.bgColor} text-white font-bold`}>
                  1
                </div>
                <div className="mr-3 text-lg font-medium">פרטי הקורס</div>
              </div>
              <div className="w-16 h-1 mx-4 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
                  2
                </div>
                <div className="mr-3 text-lg font-medium text-gray-500">תוכן הקורס</div>
              </div>
            </div>
          </div>

          {!auth.session && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3 max-w-2xl mx-auto">
              <Info className="text-red-500 shrink-0" />
              <div>
                <p className="text-red-800 font-semibold">עליך להתחבר כדי ליצור קורס</p>
                <p className="text-red-700 text-sm mt-1">לחץ על כפתור ההתחברות בתפריט העליון</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main form */}
            <div className="md:col-span-2">
              <Card className="shadow-md border">
                <CardHeader className={`bg-gradient-to-r ${styles.cardBg} text-white rounded-t-lg`}>
                  <CardTitle className="text-xl">פרטי הקורס</CardTitle>
                  <CardDescription className="text-white/90">
                    מידע בסיסי על הקורס שלך
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Course Title */}
                  <div>
                    <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      שם הקורס *
                    </label>
                    <input
                      id="courseTitle"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="הזן שם לקורס שלך"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!auth.session}
                    />
                  </div>

                  {/* Course Description */}
                  <div>
                    <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      תיאור הקורס *
                    </label>
                    <textarea
                      id="courseDescription"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="תאר את הקורס שלך ומה התלמידים ילמדו בו"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!auth.session}
                    />
                  </div>

                  {/* Degree Selection */}
                  <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                      תואר *
                    </label>
                    <select
                      id="degree"
                      value={selectedDegree}
                      onChange={handleDegreeChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  {/* Price and Sale Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        מחיר (₪) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={e => setPrice(e.target.value)}
                          placeholder="הזן מחיר"
                          className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!auth.session}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                        מחיר מבצע (₪)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="salePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={salePrice}
                          onChange={e => setSalePrice(e.target.value)}
                          placeholder="הזן מחיר מבצע (לא חובה)"
                          className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!auth.session}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                  <Button
                    className={`${styles.buttonPrimary} flex items-center gap-2 py-3 px-6`}
                    onClick={handleCreateCourse}
                    disabled={!isButtonEnabled || loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                        יוצר קורס...
                      </>
                    ) : (
                      <>
                        {!auth.session ? 'יש להתחבר תחילה' : 
                         isCheckingAuth ? 'בודק הרשאות...' :
                         !isAuthorized ? 'אין הרשאות' : 
                         'יצירת קורס'}
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <Card className="shadow-md border">
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">תמונת קורס *</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img 
                          src={thumbnailPreview} 
                          alt="Course thumbnail" 
                          className="w-full aspect-video object-cover rounded-md"
                        />
                        <button
                          onClick={handleRemoveThumbnail}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-8 bg-gray-50">
                        <ImagePlus className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500 text-center mb-4">העלה תמונה לקורס שלך</p>
                        <input
                          type="file"
                          id="thumbnail"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                          disabled={!auth.session || isUploadingThumbnail}
                        />
                        <label
                          htmlFor="thumbnail"
                          className={`px-4 py-2 rounded-md text-white cursor-pointer ${isUploadingThumbnail ? 'bg-gray-400' : styles.buttonPrimary}`}
                        >
                          {isUploadingThumbnail ? (
                            <span className="flex items-center">
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                              מעלה...
                            </span>
                          ) : 'בחר תמונה'}
                        </label>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-3">מומלץ: תמונה ביחס 16:9. גודל מומלץ: 1280x720</p>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="shadow-md border">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      טיפים ליצירת קורס
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="text-sm text-gray-600 space-y-3">
                      <li className="flex gap-2">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <div>בחר שם ברור וממוקד לקורס שיעזור לתלמידים להבין במה הוא עוסק.</div>
                      </li>
                      <li className="flex gap-2">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <div>כתוב תיאור מפורט שיכלול את מה שילמדו בקורס והידע הקודם הנדרש.</div>
                      </li>
                      <li className="flex gap-2">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <div>בחר תמונה איכותית ומקצועית שמייצגת את נושא הקורס.</div>
                      </li>
                      <li className="flex gap-2">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <div>תכנן את מבנה הקורס לפני שתעלה תוכן - חשוב על פרקים וסדר הגיוני.</div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 