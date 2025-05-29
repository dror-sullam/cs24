import React, { useState, useEffect, Suspense } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { courseStyles } from "../config/courseStyles"
import mockData from "../config/mockData.json"
import { backgroundPath } from "../config/backgroundPath"
import NotFoundPage from "../components/NotFoundPage"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer";
import { courseTypeOptions } from "../config/courseStyles";
import { motion, AnimatePresence } from 'framer-motion';
import ScrollUpButton from "../components/ScrollUpButton";
import useAuth from "../hooks/useAuth";
import {
  csYearOneCourses, csYearTwoCourses, csYearThreeCourses,
  eeYearOneCourses, eeYearTwoCourses, eeYearThreeCourses, eeYearFourCourses,
  ieYearOneCourses, ieYearTwoCourses, ieYearThreeCourses, ieYearFourCourses
} from "../config/CoursesLinks";
import Loader from "../components/Loader";

// Lazy load components
const ReviewSection = React.lazy(() => import("../components/profile/ReviewsCard"));
const ProfileCard = React.lazy(() => import("../components/profile/ProfileCard"));
const SimilarTutors = React.lazy(() => import("../components/profile/SimilarTutors"));
const EducationCard = React.lazy(() => import("../components/profile/EducationCard"));
const ContactCard = React.lazy(() => import("../components/profile/ContactCard"));
const UpcomingEvents = React.lazy(() => import("../components/profile/EventsCard"));
const CoursesCard = React.lazy(() => import("../components/profile/CoursesCard"));


const ComponentLoader = () => (
  <div className="w-full p-4 animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const ProfilePage = () => {
  const { id, courseType } = useParams()
  const { user } = useAuth();
  const DEGREE_NAMES = Object.fromEntries(
    courseTypeOptions.map(option => [option.type, option.label])
  );
  
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)
  const [tutorsWithFeedback, setTutorsWithFeedback] = useState([]);
  const [openSections, setOpenSections] = useState({});

  const styles = courseStyles[courseType]
  const isDevMode = process.env.REACT_APP_DEV?.toLowerCase() === 'true';

  const getCoursesByType = (type) => {
    const courseMap = {
      cs: {
        yearOne: csYearOneCourses,
        yearTwo: csYearTwoCourses,
        yearThree: csYearThreeCourses,
        yearFour: []
      },
      ee: {
        yearOne: eeYearOneCourses,
        yearTwo: eeYearTwoCourses,
        yearThree: eeYearThreeCourses,
        yearFour: eeYearFourCourses
      },
      ie: {
        yearOne: ieYearOneCourses,
        yearTwo: ieYearTwoCourses,
        yearThree: ieYearThreeCourses,
        yearFour: ieYearFourCourses
      }
    };

    return courseMap[type] || courseMap.cs; // Default to CS if type is invalid
  };

  const similarTutors = tutorData && tutorsWithFeedback.length > 0
    ? (() => {
        // Sort all tutors by wilson_score (or average_rating as fallback)
        const sortedTutors = [...tutorsWithFeedback]
          .filter(tutor => tutor.id !== tutorData.id) // Filter out current tutor by ID instead of name
          .sort((a, b) => {
            const scoreA = a.wilson_score ?? a.average_rating ?? 0;
            const scoreB = b.wilson_score ?? b.average_rating ?? 0;
            return scoreB - scoreA;
          });

        // Tutors with at least one matching subject
        const matchingTutors = sortedTutors.filter(tutor =>
          tutorData.subjects.some(mySub => 
            tutor.subjects?.some(tutorSub => tutorSub.course_name === mySub.course_name)
          )
        );

        // Take up to 6 matching tutors
        const selected = matchingTutors.slice(0, 6);

        // If not enough, fill with the next highest scoring tutors (excluding already selected)
        if (selected.length < 6) {
          const selectedIds = new Set(selected.map(t => t.id)); // Use IDs instead of names
          const fillers = sortedTutors
            .filter(tutor => !selectedIds.has(tutor.id))
            .slice(0, 6 - selected.length);
          return [...selected, ...fillers];
        }
        return selected;
      })()
    : [];

  const calculateWilsonScore = (avg, count, maxRating = 5, z = 1.96) => {
    if (count === 0) return 0;
    const phat = avg; // already normalized!
    const n = count;
    // Prevent math errors on exact 0 or 1
    const safePhat = Math.min(Math.max(phat, 0.0001), 0.9999);
    const numerator =
      safePhat +
      (z ** 2) / (2 * n) -
      (z * Math.sqrt((safePhat * (1 - safePhat) + (z ** 2) / (4 * n)) / n));
    const denominator = 1 + (z ** 2) / n;
    return numerator / denominator;
  };

  const scoreAndSortTutors = (tutors) => {
    const tutorsWithStats = tutors.map((tutor) => {
      const validRatings = tutor.feedback?.filter((f) => f.rating) || [];
      const count = validRatings.length;
      const sum = validRatings.reduce((acc, f) => acc + f.rating, 0);
      const average_rating = count > 0 ? sum / count : null;
      const wilson_score = count > 0
        ? calculateWilsonScore(average_rating / 5, count)
        : 0;

      return {
        ...tutor,
        average_rating,
        feedback_count: count,
        wilson_score,
      };
    });

    // Sort by Wilson score descending
    const sorted = tutorsWithStats.sort((a, b) => b.wilson_score - a.wilson_score);
    return sorted;
  };
const groupSubjectsByDegree = (subjects) => {
  const allCourses = {
    cs: [...csYearOneCourses, ...csYearTwoCourses, ...csYearThreeCourses],
    ee: [...eeYearOneCourses, ...eeYearTwoCourses, ...eeYearThreeCourses, ...eeYearFourCourses],
    ie: [...ieYearOneCourses, ...ieYearTwoCourses, ...ieYearThreeCourses, ...ieYearFourCourses],
  };

  const grouped = { cs: [], ee: [], ie: [] };

  subjects.forEach(subject => {
    const matchedType = Object.keys(allCourses).find(type =>
      allCourses[type].some(course => course.name === subject.course_name)
    );
    if (matchedType) {
      grouped[matchedType].push(subject);
    }
  });

  return grouped;
};

  const loadTutorsWithFeedback = async () => {
    setLoading(true);

    const sectionKey = courseType + "Tutors";
    const sectionTutors = mockData[sectionKey] || [];

    // Helper for fallback tutors (mock data)
    const fallback = () => {
      setTutorsWithFeedback(scoreAndSortTutors(sectionTutors));
      // Find the specific tutor in mock data
      const specificTutor = sectionTutors.find(tutor => String(tutor.id) === String(id));
      if (specificTutor) {
        setTutorData(specificTutor);
      } else {
        setError("המורה המבוקש לא נמצא.");
      }
    };

    try {
      // Get specific tutor profile
      const { data: tutorProfile, error: tutorError } = await supabase.functions.invoke('get-tutor-page', {
        body: { tutor_id: id }
      });

      if (tutorError) {
        console.error('Error fetching tutor profile:', tutorError);
        fallback();
        return;
      }
      const { data: newDegreeId, error: degreeError } = await supabase.rpc(
        'get_degree_id_by_details',
        {
          p_degree_name: DEGREE_NAMES[courseType],
          p_academy_id: 1
        }
      );

      const { data: tutors, error } = await supabase
        .rpc('new_get_tutors_with_feedback', {
          p_degree_id: newDegreeId
        });
      if (error || !tutors) {
        fallback();
        return;
      }
      setTutorsWithFeedback(scoreAndSortTutors(tutors));
      // Set tutor data from the Edge Function response
      if (tutorProfile) {
        const tutorData = {
          ...tutorProfile.tutor_profile,
          feedback: tutorProfile.feedback || [],
          has_user_feedback: tutorProfile.has_user_feedback,
          user_feedback_id: tutorProfile.user_feedback_id,
          is_owner: tutorProfile.is_owner,
          reviews_count: tutorProfile.reviews_count,
          subjects: tutorProfile.tutor_profile.selections || [] // Map selections to subjects for compatibility
        };
        setTutorData(tutorData);
      } else {
        setError("המורה המבוקש לא נמצא.");
      }
    } catch {
      fallback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      loadTutorsWithFeedback();
  },  [id, courseType]);

  const renderCoursesByYear = (yearCourses, yearTitle) => {
    if (!tutorData.subjects?.filter(subject => 
      yearCourses.some(course => course.name === subject.course_name)
    ).length > 0) return null;

    return (
      <div className="mb-6 text-center">
        <h3 className={`text-lg font-semibold mb-3 ${styles.textColor}`}>{yearTitle}</h3>
        <div className="flex justify-center flex-wrap gap-4">
          {tutorData.subjects?.filter(subject => 
            yearCourses.some(course => course.name === subject.course_name)
          ).map((subject, i) => (
            <span
              key={i}
              className={`md:text-md md:px-4 md:py-2 text-sm px-3 py-1 rounded-xl ${styles.subjectBg} ${styles.textSecondary}`}
            >
              {subject.course_name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">טוען מורה...</p>
        </div>
      </div>
    )

  if (error || !tutorData) {
    return <NotFoundPage />
  }

  return (
    <div className={`min-h-screen relative`}>
      <svg
        className={`fixed inset-0 w-full h-full z-0 ${styles.bgLight}`}
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill={styles.background} fillOpacity="0.49" d={backgroundPath} />
      </svg>
      <Navbar courseType={courseType} /> 

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-24"
      >
        <Suspense fallback={<ComponentLoader />}>
          <ProfileCard styles={styles} tutorData={tutorData} />
        </Suspense>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`relative z-10 p-4 mx-auto w-full max-w-screen-xl `}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className={`bg-white rounded-xl border mb-6 w-full ${styles.cardBorder} max-w-[73rem] mx-auto space-y-8 mt-4 px-4 pb-12`}
        >
          {/* Subjects Section */}
          {tutorData.subjects?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.005 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`bg-white -mb-12 md:max-w-[65rem] max-w-3xl mx-auto py-8 text-center`}
            >
              <div className="flex items-center gap-3 border-b pb-4 mb-4 justify-center">
                <h2 className={`text-2xl font-bold ${styles.textColor}`}>תחומי לימוד</h2>
              </div>

              {(() => {
                const groupedSubjects = groupSubjectsByDegree(tutorData.subjects || []);
                const activeTypes = Object.entries(groupedSubjects).filter(([_, subjects]) => subjects.length > 0);

                // If only one degree has subjects, show without accordion
                if (activeTypes.length === 1) {
                  const [type, subjects] = activeTypes[0];
                  const { yearOne, yearTwo, yearThree, yearFour } = getCoursesByType(type);
                  
                  return (
                    <div className="mt-4">
                      {renderCoursesByYear(yearOne, "שנה א׳")}
                      {renderCoursesByYear(yearTwo, "שנה ב׳")}
                      {yearThree.length > 0 && renderCoursesByYear(yearThree, "שנה ג׳")}
                      {yearFour.length > 0 && renderCoursesByYear(yearFour, "שנה ד׳")}
                    </div>
                  );
                }

                // Multiple degrees - show accordion style
                return activeTypes.map(([type, subjects]) => {
                  const { yearOne, yearTwo, yearThree, yearFour } = getCoursesByType(type);
                  const degreeLabel = DEGREE_NAMES[type] || "תחום אחר";

                  return (
                    <div key={type} className="mb-2 text-center">
                      <div 
                        onClick={() => setOpenSections(prev => ({ ...prev, [type]: !prev[type] }))}
                        className={`cursor-pointer text-xl font-bold mb-4 flex items-center justify-center relative rounded-lg p-4 ${styles.buttonPrimary}`}
                      >
                        <span>{degreeLabel}</span>
                        <motion.svg 
                          animate={{ rotate: openSections[type] ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 mr-2" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>
                      <AnimatePresence>
                        {openSections[type] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            {renderCoursesByYear(yearOne, "שנה א׳")}
                            {renderCoursesByYear(yearTwo, "שנה ב׳")}
                            {yearThree.length > 0 && renderCoursesByYear(yearThree, "שנה ג׳")}
                            {yearFour.length > 0 && renderCoursesByYear(yearFour, "שנה ד׳")}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                });
              })()}
            </motion.section>
          )}

          {/* Courses Card */}
          <Suspense fallback={<ComponentLoader />}>
            <CoursesCard styles={styles} tutorData={tutorData} />
          </Suspense>

          {/* Education & Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.005 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-8 md:max-w-[65rem] max-w-3xl mx-auto"
          >
            {tutorData.events?.length > 0 && (
              <div className="w-full md:w-1/2">
                <Suspense fallback={<ComponentLoader />}>
                  <UpcomingEvents styles={styles} events={tutorData.events} />
                </Suspense>
              </div>
            )}

            <div className={`w-full ${tutorData.events?.length > 0 ? "md:w-1/2 -mt-16 md:mt-0" : ""}`}>
              <Suspense fallback={<ComponentLoader />}>
                <EducationCard styles={styles} tutor={tutorData} />
              </Suspense>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className={`bg-white rounded-xl border mb-6 w-full ${styles.cardBorder} max-w-[73rem] mx-auto space-y-8 mt-4 px-4 pb-12`}
        >
          {/* Reviews Section */}
          {tutorData.feedback?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.005 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Suspense fallback={<ComponentLoader />}>
                <ReviewSection 
                  reviews={tutorData.feedback || []} 
                  styles={styles} 
                  tutor={tutorData}
                  user={user}
                  loadTutorsWithFeedback={loadTutorsWithFeedback}
                  courseType={courseType}
                />
              </Suspense>
            </motion.div>
          )}

          {/* Similar Tutors Section */}
          {similarTutors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.005 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Suspense fallback={<ComponentLoader />}>
                <SimilarTutors tutors={similarTutors} styles={styles} courseType={courseType} />
              </Suspense>
            </motion.div>
          )}

          {/* Contact Section */}

        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className={`bg-white rounded-xl border mb-6 w-full ${styles.cardBorder} max-w-[73rem] mx-auto space-y-8 mt-4 px-4 pb-12`}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.005 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Suspense fallback={<ComponentLoader />}>
              <ContactCard tutor={tutorData} styles={styles} />
            </Suspense>
          </motion.div>
        </motion.div>
        <div className="mt-12">
        { isDevMode && <Footer /> }
        </div>
      </motion.div>
      <ScrollUpButton styles={styles} />
    </div>
  )
}

export default ProfilePage