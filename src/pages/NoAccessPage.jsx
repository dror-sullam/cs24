import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { courseStyles } from '../config/courseStyles';

export default function NoAccessPage() {
  const courseTypeRef = useRef(localStorage.getItem('courseType') || 'cs');
  const styles = courseStyles[courseTypeRef.current] || courseStyles.cs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      <Navbar courseType={courseTypeRef.current} />

      <div className="container mx-auto pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="mx-auto h-20 w-20 text-amber-500 mb-6" />
          
          <h1 className={`text-4xl font-bold mb-6 ${styles.textColor}`}>
            אין גישה
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <p className="text-gray-700 text-lg mb-6">
              אין לך הרשאות להעלות סרטונים. רק מורים מורשים יכולים להעלות תוכן למערכת.
            </p>
            
            <p className="text-gray-600 mb-8">
              אם אתה מאמין שזו טעות או שברצונך לקבל הרשאות העלאה, אנא צור קשר עם מנהל המערכת.
            </p>
            
            <Link 
              to="/" 
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium ${styles.buttonPrimary} transition-all hover:opacity-90`}
            >
              חזרה לדף הבית
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            לשאלות ובירורים, אנא צור קשר עם תמיכת CS24
          </p>
        </div>
      </div>
    </div>
  );
} 