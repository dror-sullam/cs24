import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../App';
import AuthCallback from '../components/AuthCallback';
import ScrollToTop from '../components/ScrollToTop'; 
import CenteredLoader from '../components/CenteredLoader';

// Lazy load components that aren't needed immediately
const GpaCalc = React.lazy(() => import(/* webpackChunkName: "gpa-calc" */ '../pages/GpaCalc'));
const Courses = React.lazy(() => import(/* webpackChunkName: "courses" */ '../pages/Courses'));
const ProfilePage = React.lazy(() => import(/* webpackChunkName: "profile" */ '../pages/ProfilePage'));
const NotFoundPage = React.lazy(() => import(/* webpackChunkName: "not-found" */ '../components/NotFoundPage'));
const CourseDetails = React.lazy(() => import(/* webpackChunkName: "course-details" */ '../pages/CourseDetails'));
const NoAccessPage = React.lazy(() => import(/* webpackChunkName: "no-access" */ '../pages/NoAccessPage'));
const CourseCreationPage = React.lazy(() => import(/* webpackChunkName: "course-creation" */ '../pages/CourseCreationPage'));
const CourseEditorPage = React.lazy(() => import(/* webpackChunkName: "course-editor" */ '../pages/CourseEditorPage'));
const UploadSuccess = React.lazy(() => import(/* webpackChunkName: "upload-success" */ '../pages/UploadSuccess'));
const UserDashboard = React.lazy(() => import(/* webpackChunkName: "user-dashboard" */ '../pages/userDashboard'));
const About = React.lazy(() => import(/* webpackChunkName: "about" */ '../pages/About'));
const Privacy = React.lazy(() => import(/* webpackChunkName: "privacy" */ '../pages/Privacy'));
const Terms = React.lazy(() => import(/* webpackChunkName: "terms" */ '../pages/Terms'));
const ThankYou = React.lazy(() => import(/* webpackChunkName: "thank-you" */ '../pages/ThankYou'));
const TutorPresentation = React.lazy(() => import(/* webpackChunkName: "tutor-presentation" */ '../pages/TutorPresentation'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<CenteredLoader />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/gpa" element={<GpaCalc />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/tutors/:courseType/:id" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/create-course" element={<CourseCreationPage />} />
          <Route path="/course-editor/:courseId" element={<CourseEditorPage />} />
          <Route path="/no-access" element={<NoAccessPage />} />
          <Route path="/upload-success" element={<UploadSuccess />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/teach" element={<TutorPresentation />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes; 

