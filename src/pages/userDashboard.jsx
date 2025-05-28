import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Book, ChevronRight, BarChart2, Settings, Edit, Save, Loader, Tag, Trash2, Plus, Zap, DollarSign, Users, Calendar, Database, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { showNotification } from '../components/ui/notification';
import UserAnalytics from '../components/dashboard/UserAnalytics';
import UserCouponsManagement from '../components/dashboard/UserCouponsManagement';
import  CourseManagement  from '../components/dashboard/CourseManagement';
import  TutorProfile  from '../components/dashboard/TutorProfile';
import LoaderComponent from '../components/Loader';

const UserDashboard = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('main');
  const [dashboardData, setDashboardData] = useState({
    my_courses: [],
    tutor_profile: null,
    is_tutor: false,
    tutor_id: null,
    coupons: [],
    access: [],
    total_revenue: 0,
    total_spent: 0,
    total_students: 0,
    total_watch_time: 0,
    recent_activity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTutor, setIsTutor] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Function to handle tab changes with URL parameters
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Initialize active tab from URL parameters
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Only fetch data if we haven't loaded it yet
    if (!hasLoadedData) {
      const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("get-dashboard");
          
          if (error) {
            console.error('Error fetching dashboard data:', error);
            showNotification('שגיאה בטעינת נתוני לוח בקרה', 'error');
            return;
          }
          
          console.log('Dashboard data:', data);
          
          // Calculate total revenue from paid purchases
          const totalRevenue = data.my_courses?.reduce((total, course) => {
            const paidPurchases = course.purchasers?.filter(p => p.paid) || [];
            return total + paidPurchases.reduce((sum, p) => sum + p.amount, 0);
          }, 0) || 0;

          // Calculate total students (unique purchasers)
          const uniqueStudents = new Set();
          data.my_courses?.forEach(course => {
            course.purchasers?.forEach(p => {
              if (p.customer_email) uniqueStudents.add(p.customer_email);
            });
          });

          // Calculate total spent for students (from access data)
          const totalSpent = data.access?.reduce((total, course) => {
            return total + 0;
          }, 0) || 0;

          // Calculate total watch time from analytics (only for tutors)
          const totalWatchTime = data.is_tutor ? data.my_courses?.reduce((total, course) => {
            const courseWatchTime = course.analytics?.reduce((sum, session) => sum + (session.minutes || 0), 0) || 0;
            return total + courseWatchTime;
          }, 0) || 0 : 0;

          // Set dashboard data with calculated fields
          setDashboardData({
            ...data,
            total_revenue: totalRevenue,
            total_students: uniqueStudents.size,
            total_spent: totalSpent,
            total_watch_time: totalWatchTime
          });
          
          // Set tutor state
          setIsTutor(data.is_tutor);
          setHasLoadedData(true);
        } catch (error) {
          console.error('Error in dashboard data fetching:', error);
          showNotification('שגיאה בטעינת נתוני לוח בקרה', 'error');
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, loading, isAuthenticated, navigate, hasLoadedData]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-white shadow-lg border border-blue-100 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <LoaderComponent />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              טוען נתוני לוח בקרה...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-col md:flex-row gap-6">
          {/* tabs */}
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h2 className="font-bold text-xl mb-4 text-center">{user?.email}</h2>
                  <Button 
                    className={`w-full flex items-center justify-start gap-2 ${
                      activeTab === 'main' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg' 
                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 hover:border-purple-200'
                    }`}
                    onClick={() => handleTabChange('main')}
                  >
                    <BarChart2 size={18} />
                    <span>{isTutor ? 'סקירה כללית' : 'הדשבורד שלי'}</span>
                  </Button>

                  {isTutor && (
                    <Button 
                      className={`w-full flex items-center justify-start gap-2 ${
                        activeTab === 'courses' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg' 
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200'
                      }`}
                      onClick={() => handleTabChange('courses')}
                    >
                      <Book size={18} />
                      <span>הקורסים שלי</span>
                    </Button>
                  )}
                  {isTutor && (
                    <>
                      <Button 
                        className={`w-full flex items-center justify-start gap-2 ${
                          activeTab === 'tutorProfile' 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200'
                        }`}
                        onClick={() => handleTabChange('tutorProfile')}
                      >
                        <User size={18} />
                        <span>פרופיל מרצה</span>
                      </Button>
                      <Button 
                        className={`w-full flex items-center justify-start gap-2 ${
                          activeTab === 'analytics' 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 hover:border-amber-200'
                        }`}
                        onClick={() => handleTabChange('analytics')}
                      >
                        <BarChart2 size={18} />
                        <span>אנליטיקה</span>
                      </Button>
                      <Button 
                        className={`w-full flex items-center justify-start gap-2 ${
                          activeTab === 'tutorCourses' 
                            ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-700 border border-gray-200 hover:border-rose-200'
                        }`}
                        onClick={() => handleTabChange('tutorCourses')}
                      >
                        <Settings size={18} />
                        <span>ניהול קורסים</span>
                      </Button>
                      <Button 
                        className={`w-full flex items-center justify-start gap-2 ${
                          activeTab === 'coupons' 
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg' 
                            : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200'
                        }`}
                        onClick={() => handleTabChange('coupons')}
                      >
                        <Tag size={18} />
                        <span>קופונים</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'courses' && (
              <Card>
                <CardHeader>
                  <CardTitle>הקורסים שלי</CardTitle>
                  <CardDescription>רשימת הקורסים שרכשת</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.access && dashboardData.access.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.access.map((course, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-bold text-lg">{course.title}</h3>
                              <p className="text-sm text-gray-600">מרצה: {course.tutor_name}</p>
                              <div className="mt-2 flex flex-col space-y-1">
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  נרכש בתאריך: {new Date(course.granted_at).toLocaleDateString('he-IL')}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center">
                                  <Tag className="h-3 w-3 mr-1" />
                                  תוקף עד: {new Date(course.expires_at).toLocaleDateString('he-IL')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button
                                onClick={() => navigate(`/courses/${course.video_course_id}`)}
                                className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                              >
                                <span>צפייה בקורס</span>
                                <ChevronRight size={16} className="ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">לא נמצאו קורסים שרכשת</p>
                      <Button
                        onClick={() => navigate('/courses')}
                        className="bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        עבור לחנות הקורסים
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && isTutor && <UserAnalytics activeTab={activeTab} isTutor={isTutor} dashboardData={dashboardData} />}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && isTutor && (
              <UserCouponsManagement
                dashboardData={dashboardData}
                tutorCourses={dashboardData.my_courses}
                isParentLoading={loading || isLoading}
              />
            )}

            {/* Tutor Courses Tab */}
            {activeTab === 'tutorCourses' && isTutor && (
              <CourseManagement
                tutorCourses={dashboardData.my_courses}
                dashboardData={dashboardData}
              />
            )}

            {/* Tutor Profile Tab */}
            {activeTab === 'tutorProfile' && isTutor && dashboardData.tutor_profile && (
              <TutorProfile
                dashboardData={dashboardData}
              />
            )}

            {/* Main Dashboard */}
            {activeTab === 'main' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">ברוך הבא {user?.user_metadata?.name || user?.email || 'לדשבורד'}</CardTitle>
                    <CardDescription>
                      הנה סיכום הפעילות שלך באתר
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Course Count */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg flex items-center border">
                        <div className="rounded-full bg-blue-100 p-3 mr-4">
                          <Book size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">קורסים</h3>
                          <p className="text-2xl font-bold">
                            {isTutor ? 
                              (dashboardData.my_courses?.length || 0) : 
                              (dashboardData.access?.length || 0)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {isTutor ? 'קורסים שאתה מלמד' : 'קורסים שרכשת'}
                          </p>
                        </div>
                      </div>

                      {/* Users/Revenue */}
                      {isTutor ? (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg flex items-center border">
                          <div className="rounded-full bg-green-100 p-3 mr-4">
                            <DollarSign size={24} className="text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">הכנסות</h3>
                            <p className="text-2xl font-bold">₪{dashboardData.total_revenue ? dashboardData.total_revenue.toLocaleString() : 0}</p>
                            <p className="text-sm text-gray-600 mt-1">מכל המכירות</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg flex items-center border">
                          <div className="rounded-full bg-purple-100 p-3 mr-4">
                            <Calendar size={24} className="text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">פעילות</h3>
                            <p className="text-2xl font-bold">{dashboardData.access?.length || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">קורסים פעילים</p>
                          </div>
                        </div>
                      )}

                      {/* Students/Time */}
                      {isTutor && (
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg flex items-center border">
                          <div className="rounded-full bg-amber-100 p-3 mr-4">
                            <Users size={24} className="text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">סטודנטים</h3>
                            <p className="text-2xl font-bold">{dashboardData.total_students || 0}</p>
                            <p className="text-sm text-gray-600 mt-1">סטודנטים פעילים</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity & Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{isTutor ? 'רכישות אחרונות' : 'פעילות אחרונה'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isTutor ? (
                        // Show recent purchases for tutors
                        (() => {
                          const recentPurchases = [];
                          dashboardData.my_courses?.forEach(course => {
                            course.purchasers?.forEach(purchase => {
                              recentPurchases.push({
                                ...purchase,
                                course_title: course.title,
                                course_id: course.video_course_id
                              });
                            });
                          });
                          
                          const sortedPurchases = recentPurchases
                            .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
                            .slice(0, 5);

                          return sortedPurchases.length > 0 ? (
                            <div className="space-y-4">
                              {sortedPurchases.map((purchase, idx) => (
                                <div key={idx} className="flex items-start border-b pb-4 last:border-0">
                                  <div className={`p-2 rounded-full mr-3 ${
                                    purchase.paid ? 'bg-green-100' : 'bg-yellow-100'
                                  }`}>
                                    <DollarSign size={16} className={purchase.paid ? 'text-green-600' : 'text-yellow-600'} />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {purchase.paid ? 'רכישה מאושרת' : 'רכישה ממתינה'} - {purchase.course_title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {purchase.customer_full_name || purchase.customer_email || 'לקוח אנונימי'} • ₪{purchase.amount}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(purchase.purchase_date).toLocaleDateString('he-IL')} {new Date(purchase.purchase_date).toLocaleTimeString('he-IL')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center py-4 text-gray-500">אין רכישות אחרונות</p>
                          );
                        })()
                      ) : (
                        // Show recent course access for students
                        dashboardData.access && dashboardData.access.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.access
                              .sort((a, b) => new Date(b.granted_at) - new Date(a.granted_at))
                              .slice(0, 5)
                              .map((course, idx) => (
                                <div key={idx} className="flex items-start border-b pb-4 last:border-0">
                                  <div className="p-2 rounded-full mr-3 bg-blue-100">
                                    <Book size={16} className="text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">גישה לקורס - {course.title}</p>
                                    <p className="text-sm text-gray-500">
                                      מרצה: {course.tutor_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(course.granted_at).toLocaleDateString('he-IL')} {new Date(course.granted_at).toLocaleTimeString('he-IL')}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-gray-500">אין פעילות אחרונה</p>
                        )
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent/Top Courses */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{isTutor ? 'הקורסים המובילים' : 'קורסים שנרכשו לאחרונה'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isTutor ? (
                        // Top Courses for Tutors
                        dashboardData.my_courses && dashboardData.my_courses.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.my_courses
                              .sort((a, b) => (b.purchasers?.length || 0) - (a.purchasers?.length || 0))
                              .slice(0, 5)
                              .map((course) => (
                                <div key={course.video_course_id} className="flex justify-between items-center border-b pb-3 last:border-0">
                                  <div>
                                    <p className="font-medium">{course.title}</p>
                                    <p className="text-sm text-gray-500">{course.purchasers?.length || 0} רכישות</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleTabChange('tutorCourses');
                                      // Scroll to course after tab change
                                      setTimeout(() => {
                                        const courseElem = document.getElementById(`course-${course.video_course_id}`);
                                        if (courseElem) courseElem.scrollIntoView({ behavior: 'smooth' });
                                      }, 100);
                                    }}
                                  >
                                    פרטים <ChevronRight size={16} />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-gray-500">אין קורסים להצגה</p>
                        )
                      ) : (
                        // Recently Purchased Courses for Students
                        dashboardData.access && dashboardData.access.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.access
                              .sort((a, b) => new Date(b.granted_at) - new Date(a.granted_at))
                              .slice(0, 5)
                              .map((course) => (
                              <div key={course.video_course_id} className="flex justify-between items-center border-b pb-3 last:border-0">
                                <div>
                                  <p className="font-medium">{course.title}</p>
                                  <p className="text-sm text-gray-500">נרכש בתאריך: {new Date(course.granted_at).toLocaleDateString('he-IL')}</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/courses/${course.video_course_id}`)}
                                >
                                  צפייה בקורס <ChevronRight size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-gray-500">עדיין לא רכשת קורסים</p>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Coupons for Tutors */}
                {isTutor && dashboardData.coupons && dashboardData.coupons.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>קופונים פעילים</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                קוד קופון
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                הנחה
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                קורס
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                תוקף
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                שימושים
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dashboardData.coupons.slice(0, 5).map((coupon) => (
                              <tr key={coupon.code}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                                    {coupon.code}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {coupon.discount_percent}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {coupon.video_course_ids?.length > 0 ? 
                                    `${coupon.video_course_ids.length} קורסים` : 
                                    'כל הקורסים'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(coupon.expires_at).toLocaleDateString('he-IL')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {coupon.usage_count || 0} פעמים
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {dashboardData.coupons.length > 5 && (
                          <div className="text-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTabChange('coupons')}
                              className="text-blue-600"
                            >
                              הצג את כל הקופונים ({dashboardData.coupons.length})
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* My Courses Section for Students */}
                {!isTutor && (
                  <Card>
                    <CardHeader>
                      <CardTitle>הקורסים שלי</CardTitle>
                      <CardDescription>רשימת הקורסים שרכשת</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.access && dashboardData.access.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.access.map((course, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-bold text-lg">{course.title}</h3>
                                  <p className="text-sm text-gray-600">מרצה: {course.tutor_name}</p>
                                  <div className="mt-2 flex flex-col space-y-1">
                                    <p className="text-xs text-gray-500 flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      נרכש בתאריך: {new Date(course.granted_at).toLocaleDateString('he-IL')}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center">
                                      <Tag className="h-3 w-3 mr-1" />
                                      תוקף עד: {new Date(course.expires_at).toLocaleDateString('he-IL')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <Button
                                    onClick={() => navigate(`/courses/${course.video_course_id}`)}
                                    className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                                  >
                                    <span>צפייה בקורס</span>
                                    <ChevronRight size={16} className="ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">לא נמצאו קורסים שרכשת</p>
                          <Button
                            onClick={() => navigate('/courses')}
                            className="bg-blue-600 hover:bg-blue-700 transition-colors"
                          >
                            עבור לחנות הקורסים
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
