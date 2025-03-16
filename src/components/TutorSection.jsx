import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Star, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TutorSection = ({ courseType }) => {
  const [user, setUser] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState({});
  
  useEffect(() => {
    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load tutors
    loadTutors();
  }, []);

  const loadTutors = async () => {
    const { data: tutors, error } = await supabase
      .from('tutors')
      .select('*');

    if (error) {
      console.error('Error loading tutors:', error);
      return;
    }

    // Load feedback for each tutor
    const tutorsWithFeedback = await Promise.all(
      tutors.map(async (tutor) => {
        const feedback = await loadFeedback(tutor.id);
        return { ...tutor, feedback };
      })
    );

    setTutors(tutorsWithFeedback);
  };

  const loadFeedback = async (tutorId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('rating, comment')
      .eq('tutor_id', tutorId);

    if (error) return { avgRating: 0, count: 0 };

    if (data.length === 0) return { avgRating: 0, count: 0 };

    const avgRating = data.reduce((sum, item) => sum + item.rating, 0) / data.length;
    return { avgRating, count: data.length };
  };

  const toggleFeedbackForm = (tutorId) => {
    setFeedbackForms(prev => ({
      ...prev,
      [tutorId]: !prev[tutorId]
    }));
  };

  const handleFeedbackClick = async (tutorId) => {
    if (!user) {
      // Redirect to login if user is not logged in
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        console.error('Error signing in:', error.message);
      }
    } else {
      toggleFeedbackForm(tutorId);
    }
  };

  const submitFeedback = async (tutorId, rating, comment) => {
    if (!user) {
      alert('אנא התחבר כדי להשאיר ביקורת');
      return;
    }

    const { error } = await supabase
      .from('feedback')
      .insert([{ 
        tutor_id: tutorId, 
        user_id: user.id, 
        rating: parseInt(rating), 
        comment 
      }]);

    if (error) {
      alert('שגיאה בשליחת הביקורת');
      return;
    }

    toggleFeedbackForm(tutorId);
    loadTutors();
  };

  return (
    <Card className={`mb-8 bg-white ${courseType === 'cs' ? 'border-blue-200' : 'border-purple-200'}`}>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className={`text-3xl ${courseType === 'cs' ? 'text-blue-950' : 'text-purple-950'}`}>
          מורים פרטיים מומלצים
        </CardTitle>
        {!user && (
          <Button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className={`${courseType === 'cs' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}
          >
            <LogIn className="mr-2 h-4 w-4" />
            התחבר עם Google
          </Button>
        )}
      </CardHeader>

      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {tutors.map((tutor) => (
          <Card key={tutor.id} className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xl font-semibold">{tutor.name}</h3>
                <p className="text-gray-600 text-sm whitespace-nowrap">
                  {tutor.feedback.count > 0 ? (
                    <>
                      <Star className="inline-block h-4 w-4 text-yellow-400 mb-0.5" />
                      {tutor.feedback.avgRating.toFixed(1)} ({tutor.feedback.count} ביקורות)
                    </>
                  ) : (
                    'אין ביקורות עדיין'
                  )}
                </p>
              </div>
              <p className="text-gray-600">{tutor.subjects}</p>
            </div>
            
            <Button
              onClick={() => handleFeedbackClick(tutor.id)}
              className="mt-4"
              variant="outline"
            >
              הוסף ביקורת
            </Button>

            {feedbackForms[tutor.id] && (
              <div className="mt-4">
                <select
                  className="w-full mb-2 p-2 border rounded"
                  id={`rating-${tutor.id}`}
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{'★'.repeat(num)}</option>
                  ))}
                </select>
                <textarea
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="הערות (אופציונלי)"
                  id={`comment-${tutor.id}`}
                />
                <Button
                  onClick={() => submitFeedback(
                    tutor.id,
                    document.getElementById(`rating-${tutor.id}`).value,
                    document.getElementById(`comment-${tutor.id}`).value
                  )}
                  className={`${courseType === 'cs' ? 'bg-blue-600' : 'bg-purple-600'} text-white`}
                >
                  שלח ביקורת
                </Button>
              </div>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
 
export default TutorSection;