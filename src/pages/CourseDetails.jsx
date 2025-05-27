import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { showNotification } from "../components/ui/notification";
import PaymentButton from "../components/PaymentButton";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import CourseVideoPlayer from "../components/CourseVideoPlayer";
import StarRating from "../components/StarRating";
import Loader from "../components/Loader";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('he-IL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(date);
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [course, setCourse] = useState({
    titles: [],
    episodes_watched: [],
    feedback: [],
    has_access: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [isMobileEpisodesListExpanded, setIsMobileEpisodesListExpanded] = useState(false);

  const answerVariants = {
    expanded: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] } }
  };

  const questions = [
    {
      id: 1,
      question: "האם אני צריך ניסיון קודם כדי להשתתף בקורס?",
      answer: "לא, אין צורך בניסיון קודם. הקורס בנוי בצורה הדרגתית ומתחיל מהבסיס, כך שגם מי שמתחיל מאפס יוכל לעקוב ולהבין."
    },
    {
      id: 2,
      question: "מה קורה אם אני מפספס שיעור או לא עומד בקצב?",
      answer: "אין בעיה! הקורס זמין אונליין ואתה יכול לצפות בתכנים בזמן שנוח לך. המטרה היא ללמוד בקצב שלך."
    },
    {
      id: 3,
      question: "האם הקורס בחינם?",
      answer: "רוב הקורסים זמינים לצפייה חינמית, אבל ייתכן שחלק מהתכנים המתקדמים או תעודת הסיום ידרשו תשלום."
    },
    {
      id: 4,
      question: "איך נראית ההערכה בקורס?",
      answer: "ברוב הקורסים יש תרגולים, מבחנים קצרים (quiz), ומטלות הגשה. כל אלה נועדו לעזור לך להבין אם החומר יושב לך טוב בראש."
    },
  ]

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-course-details', {
          body: { video_id: parseInt(courseId) }
        });

        if (error) {
          throw new Error(error.message || 'Failed to fetch course details');
        }

        if (!data || !data.id) {
          throw new Error('Course not found');
        }

        // Calculate total episodes and watched episodes
        const allEpisodes = data.titles?.flatMap(title => title.episodes) || [];
        const totalEpisodes = allEpisodes.length;
        const watchedCount = data.episodes_watched?.length || 0;
        
        // Calculate progress
        const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;
        setCourseProgress(progress);

        // Mark episodes as watched
        const titlesWithWatchedStatus = (data.titles || []).map(title => ({
          ...title,
          episodes: (title.episodes || []).map(episode => ({
            ...episode,
            completed: (data.episodes_watched || []).includes(episode.id)
          }))
        }));

        setCourse({
          ...data,
          titles: titlesWithWatchedStatus || [],
          feedback: data.feedback || [],
          episodes_watched: data.episodes_watched || []
        });

        // Auto-expand first topic AND set first episode if user has access
        if (data.has_access && titlesWithWatchedStatus.length > 0) {
          setExpandedTopics([titlesWithWatchedStatus[0].id]);
          const firstEpisode = titlesWithWatchedStatus[0]?.episodes?.[0] || null;
          if (firstEpisode) {
            setActiveEpisode(firstEpisode);
          }
        }

      } catch (err) {
        console.error("Error loading course:", err);
        setError(err.message || "אירעה שגיאה לא צפויה");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">טוען פרטי הקורס...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">הקורס לא נמצא</h2>
            <p className="text-gray-600 mb-6">לצערנו, הקורס שביקשת אינו קיים במערכת.</p>
            <div className="space-y-3">
              <Link
                to="/courses"
                className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                חזרה לקורסים
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                חזרה לדף הקודם
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleEpisodeClick = (episode) => {
    if (!episode) return;
    setActiveEpisode(episode);
  };

  const getAllEpisodes = () => {
    return course?.titles?.flatMap(title => title.episodes || []) || [];
  };

  const getFirstEpisode = () => {
    return course?.titles?.[0]?.episodes?.[0] || null;
  };

  const handleCheckboxClick = async (e, episodeId) => {
    e.stopPropagation();
    try {
      const { data: episodesWatched, error } = await supabase.functions.invoke('save-course-progress', {
        body: {
          p_video_course_id: parseInt(courseId),
          p_episode_id: episodeId
        }
      });

      if (error) {
        console.error('Failed to toggle episode watched status:', error);
        showNotification('שגיאה בעדכון התקדמות', 'error');
        return;
      }

      // Update the episodes list with watched status from the response
      const updatedTitles = (course.titles || []).map(title => ({
        ...title,
        episodes: (title.episodes || []).map(episode => ({
          ...episode,
          completed: episodesWatched?.episodes_watched?.includes(episode.id) || false
        }))
      }));

      setCourse(prev => ({
        ...prev,
        titles: updatedTitles,
        episodes_watched: episodesWatched?.episodes_watched || []
      }));

      // Calculate new progress
      const totalEpisodes = updatedTitles.reduce((sum, title) => sum + (title.episodes?.length || 0), 0);
      const watchedCount = episodesWatched?.episodes_watched?.length || 0;
      const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;
      setCourseProgress(progress);

    } catch (err) {
      console.error('Error updating episode progress:', err);
      showNotification('שגיאה בעדכון התקדמות', 'error');
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((prevExpanded) => {
      // If the clicked topic is already the one expanded, collapse it.
      if (prevExpanded.length === 1 && prevExpanded[0] === topicId) {
        return [];
      } else {
        // Otherwise, expand the clicked topic (and implicitly collapse any other).
        return [topicId];
      }
    });
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prevExpanded) => {
      // If the clicked topic is already the one expanded, collapse it.
      if (prevExpanded.length === 1 && prevExpanded[0] === questionId) {
        return [];
      } else {
        // Otherwise, expand the clicked topic (and implicitly collapse any other).
        return [questionId];
      }
    });
  };

  // Calculate average rating
  const averageRating = course?.feedback?.length > 0
    ? (course.feedback.reduce((acc, f) => acc + f.rating, 0) / course.feedback.length).toFixed(1)
    : 0;

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.comment.trim()) {
      showNotification('נא להזין משוב', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-feedback', {
        body: {
          video_id: parseInt(courseId),
          rating: feedbackForm.rating,
          comment: feedbackForm.comment.trim()
        }
      });

      if (error) {
        console.error("Feedback error:", error.message);
        throw error;
      }

      setCourse(prev => ({
        ...prev,
        feedback: [...prev.feedback, data],
        has_user_feedback: true
      }));

      setFeedbackForm({ rating: 5, comment: '' });
      setShowFeedbackForm(false);
      showNotification('המשוב נשלח בהצלחה', 'success');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      showNotification('שגיאה בשליחת המשוב', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDeleteFeedback = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('update-feedback', {
        body: {
          video_id: parseInt(courseId),
          mode: "delete"
        }
      });

      if (error) {
        console.error("Delete error:", error.message);
        throw error;
      }

      setCourse(prev => ({
        ...prev,
        feedback: prev.feedback.filter(f => !f.is_user_feedback),
        has_user_feedback: false
      }));

      showNotification('המשוב נמחק בהצלחה', 'success');
    } catch (err) {
      console.error('Error deleting feedback:', err);
      showNotification('שגיאה במחיקת המשוב', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pb-8 pt-24">
        {/* Back Button */}
        <button
          onClick={() => navigate("/courses")}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 ml-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          חזרה לקורסים
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {course.has_access ? (
                <div>
                  <div className="relative bg-black">
                    {activeEpisode ? (
                      <CourseVideoPlayer
                        courseId={activeEpisode.video_uid}
                        activeEpisode={activeEpisode}
                        onEpisodeComplete={(episodesWatched) => {
                          setCourse(prev => ({
                            ...prev,
                            episodes_watched: episodesWatched || []
                          }));
                          
                          const totalEpisodes = getAllEpisodes().length;
                          const progress = totalEpisodes > 0 ? ((episodesWatched?.length || 0) / totalEpisodes) * 100 : 0;
                          setCourseProgress(progress);
                        }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                        onClick={() => handleEpisodeClick(getFirstEpisode())}
                      >
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-800"></div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        <div className="relative z-10 w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-all">
                          <svg className="w-8 h-8 text-gray-800 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative bg-gray-800" style={{ paddingTop: "56.25%" }}>
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-lg">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">תוכן הקורס נעול</h3>
                      <p className="text-gray-300">רכוש את הקורס כדי לצפות בשיעורים</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Episodes List - Mobile - Signed In */}
            {course.has_access && (
              <div className="lg:hidden lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md sticky top-24 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-3 bg-indigo-700" onClick={() => setIsMobileEpisodesListExpanded(!isMobileEpisodesListExpanded)}>
                  <h2 className="text-lg font-semibold text-white min-w-0 flex-1 break-words">
                    תוכן הקורס
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white whitespace-nowrap">{getAllEpisodes().length} שיעורים</h2>
                    <svg 
                      className={`text-white p-1 w-6 h-6 flex-shrink-0 transform transition-transform ${
                        isMobileEpisodesListExpanded ? '-rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {isMobileEpisodesListExpanded && (
                  <div className="flex-1 min-h-0 max-h-96 overflow-y-auto overflow-x-hidden">
                    {course?.titles?.map((title) => {
                      const isExpanded = expandedTopics.includes(title.id);
                      const completedEpisodes = title.episodes?.filter(ep => ep.completed)?.length || 0;
                      const totalEpisodes = title.episodes?.length || 0;

                          return (
                            <div key={title.id}>
                              {/* Title Header */}
                              <div
                                className={`p-4 border-t cursor-pointer ${
                                  isExpanded ? 'bg-white' : ''
                                }`}
                                onClick={() => toggleTopic(title.id)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center min-w-0 flex-1">
                                    <svg
                                      className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transform transition-transform scale-x-[-1] ${
                                        isExpanded ? '-rotate-90' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="min-w-0 flex-1">
                                      <h3 className="font-medium text-gray-900 break-words">{title.title}</h3>
                                      <p className="text-sm text-gray-500 break-words">
                                        {totalEpisodes} שיעורים
                                        {completedEpisodes > 0 && ` • ${completedEpisodes} הושלמו`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Episodes */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="episodes"
                                    variants={answerVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div className="bg-gray-50">
                                      {(title.episodes || []).map((episode) => {
                                    const isActive = activeEpisode?.id === episode.id;
                                    const durationStr = episode.episode_len 
                                      ? `${Math.floor(episode.episode_len / 60)}:${String(episode.episode_len % 60).padStart(2, "0")}`
                                      : "";

                                return (
                                  <div
                                    key={episode.id}
                                    className={`p-4 border-t border-gray-200 cursor-pointer hover:bg-gray-100 ${
                                      isActive ? 'bg-gray-100 shadow-[inset_-4px_0_0_0_#6366f1]' : ''
                                    } ${!course?.has_access ? 'opacity-60' : ''}`}
                                    onClick={() => course?.has_access ? handleEpisodeClick(episode) : null}
                                  >
                                    <div className="flex items-center justify-between w-full min-w-0">
                                      <div className="flex items-center min-w-0 flex-1">
                                        {course?.has_access ? (
                                          <button
                                            onClick={(e) => handleCheckboxClick(e, episode.id)}
                                            className="ml-3 focus:outline-none flex-shrink-0"
                                          >
                                            {episode.completed ? (
                                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                              </div>
                                            ) : (
                                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                            )}
                                          </button>
                                        ) : (
                                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <h4 className={`font-medium break-words ${isActive ? 'text-indigo-700' : 'text-gray-900'}`}>
                                            {episode.episode_index + 1}. {episode.title}
                                          </h4>
                                          {episode.description && (
                                            <p className="text-sm text-gray-500 line-clamp-1">{episode.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      {durationStr && (
                                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded flex-shrink-0 ml-2">
                                          {durationStr}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
              )}

                {!course?.has_access && (
                  <div className="p-4 border-t bg-gray-50">
                    <button className="w-full bg-gradient-to-b from-amber-300 to-amber-400 text-amber-700 font-bold px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors" 
                    onClick={() => {
                      const paymentButton = document.getElementById('payment-button');
                      if (paymentButton) {
                        paymentButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                      רכוש גישה לקורס
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <div className="flex-1">
                  <div className="flex justify-start items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                    {/* Course Stats */}
                    {averageRating > 0 && (
                      <div className="flex gap-1 justify-center items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-yellow-600">{averageRating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-start items-center gap-3 mb-3">
                    <p className="text-lg text-gray-600">{course.course_name}</p>
                    {!course.has_access && (
                      <div className="py-1 px-3 rounded-md font-medium text-sm text-white bg-indigo-700 text-nowrap">
                        {getAllEpisodes().length} שיעורים
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 mb-4">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    מרצה: {course.tutor_name}
                  </div>
                  {course.description && (
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {course.has_access && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">התקדמות בקורס</span>
                    <span className="text-sm text-gray-500">{Math.round(courseProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${courseProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Access Status */}
              {!course.has_access && (
                <div className="flex items-center justify-between flex-col lg:flex-row bg-gradient-to-t from-indigo-50 to-whiet border-4 border-indigo-600 p-4 rounded-xl">
                  <div>
                    <div className="flex flex-col p-8">
                      <span className="text-6xl font-bold text-indigo-600">₪{course.sale_price === null ? course.price : course.sale_price}</span>
                      {course.sale_price && (
                        <span className="text-gray-400 text-xl line-through">₪{course.price}</span>
                      )}
                    </div>
                  </div>
                  <div id="payment-button">
                    <PaymentButton videoId={courseId} courseName={course.title} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Episodes List - Mobile - Signed Out */}
            {!course.has_access && (
              <div className="lg:hidden lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md sticky top-24 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-3 bg-indigo-700" onClick={() => setIsMobileEpisodesListExpanded(!isMobileEpisodesListExpanded)}>
                  <h2 className="text-lg font-semibold text-white min-w-0 flex-1 break-words">
                    תוכן הקורס
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white whitespace-nowrap">{getAllEpisodes().length} שיעורים</h2>
                    <svg 
                      className={`text-white p-1 w-6 h-6 flex-shrink-0 transform transition-transform ${
                        isMobileEpisodesListExpanded ? '-rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {isMobileEpisodesListExpanded && (
                  <div className="flex-1 min-h-0 max-h-96 overflow-y-auto overflow-x-hidden">
                    {course?.titles?.map((title) => {
                      const isExpanded = expandedTopics.includes(title.id);
                      const completedEpisodes = title.episodes?.filter(ep => ep.completed)?.length || 0;
                      const totalEpisodes = title.episodes?.length || 0;

                          return (
                            <div key={title.id}>
                              {/* Title Header */}
                              <div
                                className={`p-4 border-t cursor-pointer ${
                                  isExpanded ? 'bg-white' : ''
                                }`}
                                onClick={() => toggleTopic(title.id)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center min-w-0 flex-1">
                                    <svg
                                      className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transform transition-transform scale-x-[-1] ${
                                        isExpanded ? '-rotate-90' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="min-w-0 flex-1">
                                      <h3 className="font-medium text-gray-900 break-words">{title.title}</h3>
                                      <p className="text-sm text-gray-500 break-words">
                                        {totalEpisodes} שיעורים
                                        {completedEpisodes > 0 && ` • ${completedEpisodes} הושלמו`}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Episodes */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="episodes"
                                    variants={answerVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div className="bg-gray-50">
                                      {(title.episodes || []).map((episode) => {
                                        const isActive = activeEpisode?.id === episode.id;
                                        const durationStr = episode.episode_len 
                                          ? `${Math.floor(episode.episode_len / 60)}:${String(episode.episode_len % 60).padStart(2, "0")}`
                                          : "";

                                    return (
                                      <div
                                        key={episode.id}
                                        className={`p-4 border-t border-gray-200 cursor-pointer hover:bg-gray-100 ${
                                          isActive ? 'bg-gray-100 shadow-[inset_-4px_0_0_0_#6366f1]' : ''
                                        } ${!course?.has_access ? 'opacity-60' : ''}`}
                                        onClick={() => course?.has_access ? handleEpisodeClick(episode) : null}
                                      >
                                        <div className="flex items-center justify-between w-full min-w-0">
                                          <div className="flex items-center min-w-0 flex-1">
                                            {course?.has_access ? (
                                              <button
                                                onClick={(e) => handleCheckboxClick(e, episode.id)}
                                                className="ml-3 focus:outline-none flex-shrink-0"
                                              >
                                                {episode.completed ? (
                                                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                  </div>
                                                ) : (
                                                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                                )}
                                              </button>
                                            ) : (
                                              <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                              </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <h4 className={`font-medium break-words ${isActive ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                {episode.episode_index + 1}. {episode.title}
                                              </h4>
                                              {episode.description && (
                                                <p className="text-sm text-gray-500 line-clamp-1">{episode.description}</p>
                                              )}
                                            </div>
                                          </div>
                                          {durationStr && (
                                            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded flex-shrink-0 ml-2">
                                              {durationStr}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
              )}

                {!course?.has_access && (
                  <div className="p-4 border-t bg-gray-50">
                    <button className="w-full bg-gradient-to-b from-amber-300 to-amber-400 text-amber-700 font-bold px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors" 
                    onClick={() => {
                      const paymentButton = document.getElementById('payment-button');
                      if (paymentButton) {
                        paymentButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                      רכוש גישה לקורס
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Feedback Section */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">משובים</h2>
              </div>
              
              <div className="divide-y max-h-96 overflow-y-auto">
                {showFeedbackForm && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">דירוג</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                              className={`p-1 ${
                                feedbackForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">משוב</label>
                        <textarea
                          value={feedbackForm.comment}
                          onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          rows="3"
                          placeholder="שתף את חווייתך מהקורס..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleFeedbackSubmit}
                          disabled={submittingFeedback}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {submittingFeedback ? 'שולח...' : 'שלח משוב'}
                        </button>
                        <button
                          onClick={() => setShowFeedbackForm(false)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!showFeedbackForm && (
                  course?.feedback?.filter(f => f.comment)?.length > 0 ? (
                    course.feedback
                      .filter(f => f.comment)
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                      .map((feedback) => (
                        <div key={feedback.id} className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(feedback.rating)].map((_, i) => (
                                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                          </div>
                          <p className="text-gray-700">{feedback.comment}</p>
                        </div>
                      ))
                  ) : (
                    <div className="p-12 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500">אין עדיין משובים לקורס זה</p>
                    </div>
                  )
                )}
              </div>

              {!course?.has_user_feedback && course?.has_access && !showFeedbackForm && (
                <div className="p-6 border-t">
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    הוסף משוב
                  </button>
                </div>
              )}
            </div>

            {/* Q&A - Signed Out */}
            {!course.has_access && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md sticky top-24 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-3 bg-indigo-700">
                    <h2 className="text-lg font-semibold text-white">
                      שאלות ותשובות
                    </h2>
                  </div>
                  
                  <div className="flex-1 min-h-0 max-h-96 overflow-y-auto overflow-x-hidden">
                    {questions.map((question) => {
                      const isExpanded = expandedQuestions.includes(question.id);
                          return (
                            <div key={question.id}>
                              {/* Title Header */}
                              <div
                                className={`p-4 border-t cursor-pointer ${
                                  isExpanded ? 'bg-white' : ''
                                }`}
                                onClick={() => toggleQuestion(question.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg
                                      className={`w-4 h-4 text-gray-400 ml-2 transform transition-transform scale-x-[-1] ${
                                        isExpanded ? '-rotate-90' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div>
                                      <h3 className="font-medium text-gray-900">{question.question}</h3>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Answers */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="answer"
                                    variants={answerVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div className="bg-gray-50">
                                      <div className="p-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center flex-1">
                                            <div className="flex-1">
                                              <p className="text-sm text-gray-500">{question.answer}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar - Episodes List - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-24 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-3 bg-indigo-700">
                <h2 className="text-lg font-semibold text-white min-w-0 flex-1 break-words">
                  תוכן הקורס
                </h2>
                <h2 className="text-lg font-semibold text-white whitespace-nowrap flex-shrink-0">{getAllEpisodes().length} שיעורים</h2>
              </div>
              
              <div className="flex-1 max-h-96 overflow-y-auto overflow-x-hidden">
                {course?.titles?.map((title) => {
                  const isExpanded = expandedTopics.includes(title.id);
                  const completedEpisodes = title.episodes?.filter(ep => ep.completed)?.length || 0;
                  const totalEpisodes = title.episodes?.length || 0;

                  return (
                    <div key={title.id}>
                      {/* Title Header */}
                      <div
                        className={`p-4 border-t cursor-pointer ${
                          isExpanded ? 'bg-white' : ''
                        }`}
                        onClick={() => toggleTopic(title.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center min-w-0 flex-1">
                            <svg
                              className={`w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transform transition-transform scale-x-[-1] ${
                                isExpanded ? '-rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-gray-900 break-words">{title.title}</h3>
                              <p className="text-sm text-gray-500 break-words">
                                {totalEpisodes} שיעורים
                                {completedEpisodes > 0 && ` • ${completedEpisodes} הושלמו`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Episodes */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="episodes"
                            variants={answerVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="bg-gray-50">
                              {(title.episodes || []).map((episode) => {
                                const isActive = activeEpisode?.id === episode.id;
                                const durationStr = episode.episode_len 
                                  ? `${Math.floor(episode.episode_len / 60)}:${String(episode.episode_len % 60).padStart(2, "0")}`
                                  : "";

                                return (
                                  <div
                                    key={episode.id}
                                    className={`p-4 border-t border-gray-200 cursor-pointer hover:bg-gray-100 ${
                                      isActive ? 'bg-gray-100 shadow-[inset_-4px_0_0_0_#6366f1]' : ''
                                    } ${!course?.has_access ? 'opacity-60' : ''}`}
                                    onClick={() => course?.has_access ? handleEpisodeClick(episode) : null}
                                  >
                                    <div className="flex items-center justify-between w-full min-w-0">
                                      <div className="flex items-center min-w-0 flex-1">
                                        {course?.has_access ? (
                                          <button
                                            onClick={(e) => handleCheckboxClick(e, episode.id)}
                                            className="ml-3 focus:outline-none flex-shrink-0"
                                          >
                                            {episode.completed ? (
                                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                              </div>
                                            ) : (
                                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                            )}
                                          </button>
                                        ) : (
                                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <h4 className={`font-medium break-words ${isActive ? 'text-indigo-700' : 'text-gray-900'}`}>
                                            {episode.episode_index + 1}. {episode.title}
                                          </h4>
                                          {episode.description && (
                                            <p className="text-sm text-gray-500 line-clamp-1">{episode.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      {durationStr && (
                                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded flex-shrink-0 ml-2">
                                          {durationStr}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {!course?.has_access && (
                <div className="p-4 border-t bg-gray-50">
                  <button className="w-full bg-gradient-to-b from-amber-300 to-amber-400 text-amber-700 font-bold px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors" 
                    onClick={() => {
                      const paymentButton = document.getElementById('payment-button');
                      if (paymentButton) {
                        paymentButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    רכוש גישה לקורס
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetails;