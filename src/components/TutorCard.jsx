import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Star, MessageCircle, Edit2, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const TutorCard = ({ tutor, courseType, user, onSubmitFeedback }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Calculate average rating if feedback exists
  const averageRating = tutor.feedback && tutor.feedback.length > 0
    ? (tutor.feedback.reduce((acc, curr) => acc + curr.rating, 0) / tutor.feedback.length).toFixed(1)
    : 0;

  const starColor = courseType === 'cs' ? 'text-blue-400' : 'text-purple-400';
  const hoverStarColor = courseType === 'cs' ? 'hover:text-blue-500' : 'hover:text-purple-500';
  const accentColor = courseType === 'cs' ? 'blue' : 'purple';

  const handleFeedbackClick = async () => {
    if (!user) {
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
      setShowFeedbackForm(true);
    }
  };

  // Filter reviews to only show ones with comments
  const reviewsWithComments = tutor.feedback?.filter(fb => fb.comment?.trim()) || [];
  
  // Get the reviews to display based on showAllReviews state
  const displayedReviews = showAllReviews 
    ? reviewsWithComments 
    : reviewsWithComments.slice(0, 1);

  return (
    <Card className={`flex flex-col justify-between hover:shadow-md transition-shadow ${
      courseType === 'cs'
        ? 'bg-sky-50 border-sky-100'
        : 'bg-purple-50 border-purple-100'
    }`}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-xl ${courseType === 'cs' ? 'text-sky-900' : 'text-purple-900'}`}>
            {tutor.name}
          </CardTitle>
          {/* Rating Summary */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className={`h-5 w-5 ${starColor} fill-current`} />
              <span className="text-lg font-semibold">
                {averageRating}
              </span>
            </div>
            <span className="text-gray-600 text-sm">
              ({tutor.feedback?.length || 0} ביקורות)
            </span>
          </div>
        </div>
        <div className={`text-base ${courseType === 'cs' ? 'text-sky-700' : 'text-purple-700'}`} dir="rtl">
          {Array.isArray(tutor.subjects) ? tutor.subjects.join(", ") : tutor.subjects}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Feedback List */}
        {reviewsWithComments.length > 0 ? (
          <div className="space-y-2">
            {displayedReviews.map((fb, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < fb.rating ? `${starColor} fill-current` : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  {fb.created_at && (
                    <span className="text-xs text-gray-500">
                      {format(new Date(fb.created_at), 'dd/MM/yyyy')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{fb.comment}</p>
              </div>
            ))}
            
            {/* Show more/less button if there are more reviews with comments */}
            {reviewsWithComments.length > 1 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className={`w-full text-sm flex items-center justify-center gap-1 py-1 mt-1 ${
                  courseType === 'cs' ? 'text-sky-600 hover:text-sky-700' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                {showAllReviews ? (
                  <>
                    הצג פחות <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    הצג עוד {reviewsWithComments.length - 1} ביקורות <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        ) : tutor.feedback?.length > 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">אין ביקורות עם הערות</p>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">אין ביקורות עדיין</p>
        )}

        {/* Feedback Button - Always show, but with different text based on auth state */}
        {!showFeedbackForm && (
          <Button
            variant="outline"
            className={`w-full gap-2 mt-3 ${
              courseType === 'cs'
                ? 'border-sky-300 text-sky-700 hover:bg-sky-100'
                : 'border-purple-300 text-purple-700 hover:bg-purple-100'
            }`}
            onClick={handleFeedbackClick}
          >
            <Edit2 className="h-4 w-4" />
            {user ? 'הוסף ביקורת' : 'התחבר כדי להוסיף ביקורת'}
          </Button>
        )}

        {showFeedbackForm && (
          <div className="space-y-3 bg-white p-3 rounded-lg shadow-sm mt-3">
            <div className="flex justify-center gap-2">
              {[5, 4, 3, 2, 1].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`transition-all ${hoverStarColor}`}
                >
                  <Star
                    className={`h-7 w-7 ${
                      value <= rating ? `${starColor} fill-current` : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="הערות (אופציונלי)"
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-${accentColor}-500 focus:border-transparent transition-all resize-none text-sm`}
              rows={2}
              dir="rtl"
            />
            <div className="flex gap-2">
              <Button
                className={`flex-1 gap-2 ${
                  courseType === 'cs' 
                    ? 'bg-sky-600 hover:bg-sky-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
                onClick={() => {
                  onSubmitFeedback(tutor.id, rating, comment);
                  setShowFeedbackForm(false);
                  setComment('');
                  setRating(5);
                }}
              >
                <ThumbsUp className="h-4 w-4" />
                שלח
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowFeedbackForm(false)}
              >
                ביטול
              </Button>
            </div>
          </div>
        )}

        {/* WhatsApp Button */}
        <Button
          variant="outline"
          className={`w-full mt-3 text-lg ${
            courseType === 'cs'
              ? 'border-sky-300 text-sky-700 hover:bg-sky-100'
              : 'border-purple-300 text-purple-700 hover:bg-purple-100'
          }`}
          onClick={() => {
            const formattedNumber = `972${tutor.phone.slice(1)}`;
            window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, "_blank");
          }}
        >
          {tutor.phone}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TutorCard; 