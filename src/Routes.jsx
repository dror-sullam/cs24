import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AuthCallback from './components/AuthCallback';
import ProfilePage from './components/ProfilePage';
import ScrollToTop from './components/ScrollToTop'; 
import NotFoundPage from './components/NotFoundPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import GpaCalc from './pages/GpaCalc';
import About from './pages/About';
const isDev = process.env.REACT_APP_DEV === "true";
const Router = isDev ? HashRouter : BrowserRouter;
const AppRoutes = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/tutors/:courseType/:id/:tutorName" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/gpa" element={<GpaCalc />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes; 