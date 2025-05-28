import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Layout from "../components/Layout";
import CourseFilters from "../components/CourseFilters";
import { courseStyles } from "../config/courseStyles";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Loader from "../components/Loader";
import CourseCard from "../components/LMS/CourseCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const YearSection = ({ year, courses, courseType }) => (
  <div className="mb-12">
    <h2 className="text-3xl font-bold text-gray-800 mb-6">{year}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course}
          courseType={courseType}
        />
      ))}
    </div>
  </div>
);

const Courses = () => {
  const [selectedDegrees, setSelectedDegrees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseType, setCourseType] = useState('cs');
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState('rating');
  const styles = courseStyles[courseType] || courseStyles.cs;
  const navigate = useNavigate();
  const [userAccess, setUserAccess] = useState([]);
  
  // Refs and state for Keep Watching scroll
  const scrollContainerRef = useRef(null);



  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Helper function to convert degree name to key
  const degreeToKey = (degreeName) => degreeName?.replace(/\s+/g, '_') || 'אחר';
  
  // Helper function to convert degree key back to display name
  const keyToDegree = (degreeKey) => degreeKey?.replace(/_/g, ' ') || 'אחר';

  useEffect(() => {
    // Get courseType from localStorage
    const storedCourseType = localStorage.getItem('courseType') || 'cs';
    setCourseType(storedCourseType);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Get current user ID if logged in
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        // Call the new endpoint
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/get-all-courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ user_id: userId })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const { courses, user_access } = await response.json();
        
        // Store user access information
        setUserAccess(user_access || []);
        
        // Group courses by degree
        const groupedCourses = courses.reduce((acc, course) => {
          const degree = course.degree_name || 'אחר'; // Default to 'אחר' if no degree specified
          const degreeKey = degreeToKey(degree); // Convert to key format
          if (!acc[degreeKey]) {
            acc[degreeKey] = [];
          }
          
          // Add has_access property to each course
          const courseWithAccess = {
            ...course,
            has_access: user_access?.includes(course.id)
          };
          
          acc[degreeKey].push(courseWithAccess);
          return acc;
        }, {});

        setCoursesData(groupedCourses);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Get all courses as a flat array for filtering
  const allCourses = Object.values(coursesData).flat();

  // Get unique degrees from coursesData for buttons
  const availableDegrees = Object.keys(coursesData);

  // Apply filters and sorting
  const getFilteredAndSortedCourses = (courses) => {
    let filtered = courses;

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
      course.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tutor_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterId, values]) => {
      if (values.length === 0) return;

      filtered = filtered.filter(course => {
        switch (filterId) {
          case 'course_name':
            return values.includes(course.course_name);
          case 'degree_name':
            return values.includes(course.degree_name);
          case 'course_year':
            return values.includes(course.course_year?.toString());
          case 'tutor_name':
            return values.includes(course.tutor_name);
          case 'price_range':
            const price = course.sale_price || course.price || 0;
            return values.some(range => {
              switch (range) {
                case 'free': return price === 0;
                case 'low': return price > 0 && price <= 100;
                case 'medium': return price > 100 && price <= 500;
                case 'high': return price > 500;
                default: return false;
              }
            });
          case 'rating':
            const avgRating = course.ratings 
              ? course.ratings.reduce((a, b) => a + b, 0) / course.ratings.length
              : 0;
            return values.some(rating => {
              switch (rating) {
                case '5': return avgRating >= 4.5;
                case '4': return avgRating >= 4;
                case '3': return avgRating >= 3;
                default: return false;
              }
            });
          case 'access':
            return values.some(access => {
              switch (access) {
                case 'owned': return course.has_access;
                case 'available': return !course.has_access;
                default: return false;
              }
            });
          default:
            return true;
        }
      });
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (activeSort) {
        case 'rating':
          const avgA = a.ratings ? a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length : 0;
          const avgB = b.ratings ? b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length : 0;
          return avgB - avgA; // Higher rating first
        case 'price-low':
          const priceA = a.sale_price || a.price || 0;
          const priceB = b.sale_price || b.price || 0;
          return priceA - priceB; // Lower price first
        case 'price-high':
          const priceA2 = a.sale_price || a.price || 0;
          const priceB2 = b.sale_price || b.price || 0;
          return priceB2 - priceA2; // Higher price first
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredCourses = {};
  availableDegrees.forEach(degreeKey => {
    filteredCourses[degreeKey] = getFilteredAndSortedCourses(coursesData[degreeKey] || []);
  });

  if (loading) {
    return (
      <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-8 text-gray-600">טוען קורסים...</p>
        </div>
      </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>שגיאה בטעינת הקורסים</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
      </Layout>
    );
  }

  const renderCourses = () => {
    // Get all purchased courses across all degrees
    const purchasedCourses = Object.values(filteredCourses)
      .flat()
      .filter(course => course.has_access);

    return (
      <>
        {/* Keep Watching Section */}
        {purchasedCourses.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">המשך צפייה</h2>
            <div className="relative mr-4">
              {/* Scroll Buttons */}
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute -left-8 top-0 h-full w-8 bg-white hover:bg-gray-100 transition-colors duration-200 z-10 items-center justify-center"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute -right-8 top-0 h-full w-8 bg-white hover:bg-gray-100 transition-colors duration-200 z-10 items-center justify-center"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Scrollable container */}
              <div className="group">
                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto pb-4 scroll-smooth scrollbar-hide -mr-4"
                >
                  {purchasedCourses.map((course) => (
                    <div key={course.id} className="flex-none w-[80%] sm:w-1/2 lg:w-[31%] mr-3 sm:mr-6 sm:ml-2">
                      <CourseCard 
                        course={course}
                        courseType={courseType}
                        hidePriceInfo={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Course Sections */}
        {selectedDegrees.length === 0 ? (
          <>
            {availableDegrees.map(degreeKey => (
              filteredCourses[degreeKey]?.length > 0 && (
                <YearSection 
                  key={degreeKey}
                  year={keyToDegree(degreeKey)}
                  courses={filteredCourses[degreeKey]}
                  courseType={courseType}
                />
              )
            ))}
          </>
        ) : (
          <>
            {selectedDegrees.map(degreeKey => (
              filteredCourses[degreeKey]?.length > 0 && (
                <YearSection
                  key={degreeKey}
                  year={keyToDegree(degreeKey)}
                  courses={filteredCourses[degreeKey]}
                  courseType={courseType}
                />
              )
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <Layout>
      <div className={`bg-gradient-to-b ${styles.bgGradient}`} dir="rtl">
        <Navbar courseType={courseType} />
        
        <CourseFilters
          courses={selectedDegrees.length === 0 ? allCourses : allCourses.filter(course => selectedDegrees.includes(degreeToKey(course.degree_name)))}
          onFilterChange={setActiveFilters}
          onSortChange={setActiveSort}
          activeFilters={activeFilters}
          activeSort={activeSort}
        >
          {/* Degree Filter Buttons */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
                  {availableDegrees.map(degreeKey => (
              <button
                      key={degreeKey}
                      onClick={() => {
                        if (selectedDegrees.includes(degreeKey)) {
                          setSelectedDegrees(selectedDegrees.filter(d => d !== degreeKey));
                        } else {
                          setSelectedDegrees([...selectedDegrees, degreeKey]);
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-300 ${
                        selectedDegrees.includes(degreeKey)
                    ? styles.buttonPrimary
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                      {keyToDegree(degreeKey)}
              </button>
                  ))}
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="חיפוש קורסים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{renderCourses()}</div>
      </div>
        </CourseFilters>
    </div>
    </Layout>
  );
};

export default Courses;