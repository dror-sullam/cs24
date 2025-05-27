import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Lock, LockOpen, Tv } from "lucide-react";
import { motion } from 'framer-motion';
import { supabase } from "../../lib/supabase";

const CoursesCard = ({ styles, tutorData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [userAccess, setUserAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  const courses = tutorData.my_courses || [];
  const isTouchDevice = typeof window !== "undefined" && (navigator.maxTouchPoints > 0 || "ontouchstart" in window);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserAccess = async () => {
      try {
        // Get current user ID if logged in
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (!userId) {
          setUserAccess([]);
          setLoading(false);
          return;
        }

        // Call the same endpoint as courses.jsx
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-all-courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ user_id: userId })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user access');
        }

        const { user_access } = await response.json();
        setUserAccess(user_access || []);
      } catch (error) {
        console.error('Error fetching user access:', error);
        setUserAccess([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAccess();
  }, []);

  // Don't render if no courses
  if (!courses || courses.length === 0) return null;

  const getTransformValue = () => {
    return currentSlide * (isMobile ? -85 : -33.333);
  };

  const scrollByCard = (dir) => {
    const c = carouselRef.current;
    if (!c) return;
    const card = c.querySelector(".course-card");
    if (!card) return;
    const gap = 16; // matches gap-4
    c.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  };

  const nextSlide = () => {
    if (!isTouchDevice) {
      const maxSlides = isMobile ? courses.length : Math.max(1, courses.length - 2);
      setCurrentSlide((prev) => (prev + 1) % maxSlides);
    }
  };

  const prevSlide = () => {
    if (!isTouchDevice) {
      const maxSlides = isMobile ? courses.length : Math.max(1, courses.length - 2);
      setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
    }
  };

  const goToSlide = (index) => {
    const maxSlides = isMobile ? courses.length : Math.max(1, courses.length - 2);
    setCurrentSlide(Math.min(index, maxSlides - 1));
  };

  // Minimum swipe distance for triggering slide change (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const CourseCard = ({ course }) => {
    const hasAccess = userAccess.includes(course.id); // Check if user has access to this course

    const handleButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(`/courses/${course.id}`, '_blank');
    };

    return (
      <div className={`course-card snap-start bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 scale-95 ${isMobile ? '' : 'hover:scale-90'} border border-gray-200`}>
        <div className={`relative h-40 flex items-center justify-center ${
          course.custom_thumbnail_url 
            ? '' 
            : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}>
          {course.custom_thumbnail_url && (
            <img
              src={course.custom_thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide image on error and show fallback
                e.target.style.display = 'none';
              }}
            />
          )}
          
          <div className={`absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-20 flex items-center justify-center`}>
            <div className="text-center">
              <div 
                className={`w-16 h-16 rounded-full ${
                  hasAccess ? `${styles.buttonPrimary}` : 'bg-gray-500 hover:bg-gray-600'
                } flex items-center justify-center mb-2 mx-auto transition-all duration-300 cursor-pointer hover:opacity-90`}
                onClick={handleButtonClick}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                role="button"
                aria-label={hasAccess ? "צפה בקורס" : "רכוש עכשיו"}
              >
                {hasAccess ? (
 
                    <div className="group relative">
                      <Play className="w-8 h-8 text-white group-hover:opacity-0 transition-opacity absolute inset-0" />
                      <Tv className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                ) : (
  
                    <div className="group relative">
                      <Lock className="w-8 h-8 text-white group-hover:opacity-0 transition-opacity absolute inset-0" />
                      <LockOpen className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )
                }
              </div>
              <h4 className={`text-sm font-medium text-white`}>
                {hasAccess ? 'צפה בקורס' : 'רכוש עכשיו'}
              </h4>
            </div>
          </div>
          

        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 text-right" title={course.title}>
            {course.title}
          </h3>
          
          <p className="text-gray-600 mb-3 text-sm text-right" title={course.course_name}>
            {course.course_name}
          </p>
          
          <div className="flex justify-end items-center mb-3">
            <span className={` text-sm ${styles.iconColor} font-bold`}>
              {course.price} ₪
            </span>
          </div>
          
          <button
            className={`w-full py-2 px-4 rounded-md transition-colors duration-300 text-sm font-medium text-white hover:opacity-90 hidden ${
              hasAccess ? styles.buttonPrimary : 'bg-gray-600 hover:bg-gray-700'
            }`}
            onClick={handleButtonClick}
          >
            {hasAccess ? 'צפה בקורס' : 'רכוש עכשיו'}
          </button>
        </div>
      </div>
    );
  };

  // Show loading state while fetching access data
  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.005 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`bg-white -mb-12 md:max-w-[65rem] max-w-3xl mx-auto py-8 text-center`}
      >
        <div className="flex items-center gap-3 border-b pb-4 mb-6 justify-center">
          <h2 className={`text-2xl font-bold ${styles.textColor}`}>קורסים</h2>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.005 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={`bg-white -mb-12 md:max-w-[65rem] max-w-3xl mx-auto py-8 text-center`}
    >
      <div className="flex items-center gap-3 border-b pb-4 mb-6 justify-center">
        <h2 className={`text-2xl font-bold ${styles.textColor}`}>קורסים</h2>
        <span className={`text-sm px-2 py-1 rounded-full ${styles.buttonSecondary} text-gray-600`}>
          {courses.length} קורסים
        </span>
      </div>

      <div className="relative w-full max-w-5xl mx-auto md:px-12" dir="ltr">
        {/* Carousel container */}
        <div className="overflow-hidden">
          <div 
            ref={carouselRef}
            className={`flex transition-transform duration-300 ease-in-out ${
              isTouchDevice ? "overflow-x-auto scroll-smooth snap-x snap-mandatory" : ""
            }`}
            style={{ transform: `translateX(${getTransformValue()}%)` }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {courses.map((course, index) => (
              <div
                key={course.id || index}
                className="w-[85%] md:w-1/3 flex-shrink-0 px-2"
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons - hidden on mobile, only show if more than 3 courses */}
        {courses.length > 3 && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md ${styles.arrowColor} items-center justify-center hidden md:flex`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md ${styles.arrowColor} items-center justify-center hidden md:flex`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots navigation - only show if more than 1 slide needed */}
        {!isMobile && (isMobile ? courses.length > 1 : courses.length > 3) && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ 
              length: isMobile ? courses.length : Math.max(1, courses.length - 2)
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full border transition-colors ${
                  currentSlide === index
                  ? `${styles.buttonPrimary} border-transparent` 
                  : 'bg-transparent border-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default CoursesCard;