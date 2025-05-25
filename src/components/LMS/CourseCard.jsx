import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, Clock } from "lucide-react";
import { courseStyles } from "../../config/courseStyles";

const CourseCard = ({ course, courseType = 'cs' }) => {
  const navigate = useNavigate();
  const styles = courseStyles[courseType] || courseStyles.cs;
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate average rating if available
  const averageRating = course.ratings 
    ? (course.ratings.reduce((a, b) => a + b, 0) / course.ratings.length).toFixed(1)
    : null;

  // Calculate days left for sale
  const getDaysLeft = (expirationDate) => {
    if (!expirationDate) return null;
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Check if course is on sale
  const isOnSale = course.sale_price && course.sale_price < course.price;
  const daysLeft = getDaysLeft(course.on_sale_expiration);

  // Format price display
  const formatPrice = (price) => {
    if (!price || price === 0) return 'חינם';
    return `₪${price}`;
  };

  // Get display price and original price
  const getDisplayPrice = () => {
    if (!course.price && !course.sale_price) return 'חינם';
    
    if (isOnSale) {
      return {
        current: formatPrice(course.sale_price),
        original: formatPrice(course.price),
        isOnSale: true
      };
    }
    
    return {
      current: formatPrice(course.price),
      original: null,
      isOnSale: false
    };
  };

  const priceInfo = getDisplayPrice();
  const displayUrl = course.thumbnail_url;

  // Placeholder SVG for missing images
  const PlaceholderImage = () => (
    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
      <svg 
        className="w-16 h-16 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );

  const handleHeartClick = (e) => {
    e.stopPropagation(); // Prevent card navigation
    setIsAnimating(true);
    setIsLiked(!isLiked);
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative">
        <div 
          className="block cursor-pointer"
          onClick={() => navigate(`/course/${course.id}`)}
        >
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt={course.video_title} 
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div style={{ display: displayUrl ? 'none' : 'block' }}>
            <PlaceholderImage />
          </div>
        </div>
        
        {/* Sale badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            מבצע!
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles.subjectBg} ${styles.textColor} max-w-[70%]`}>
            <span className="truncate">{course.course_name || 'קורס כללי'}</span>
          </span>
          <button 
            onClick={handleHeartClick}
            className={`p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200 ${
              isAnimating ? 'scale-125' : 'scale-100'
            }`}
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-300 ${
                isLiked 
                  ? `fill-red-500 text-red-500 ${isAnimating ? 'scale-110' : ''}` 
                  : 'text-gray-600 hover:text-red-500'
              }`} 
            />
          </button>
        </div>

        <h4 className="mb-2 text-lg font-semibold line-clamp-2 flex-1">
          <a 
            href="#" 
            className="text-gray-900 hover:text-gray-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/course/${course.id}`);
            }}
          >
            {course.video_title}
          </a>
        </h4>

        <small className="text-gray-600 mb-3">מרצה: {course.tutor_name}</small>

        <div className="mt-auto">
          {averageRating && (
            <div className="mb-3 flex items-baseline">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-yellow-500 mx-1 font-medium">{averageRating}</span>
              <span className="text-gray-600">({course.ratings?.length || 0})</span>
            </div>
          )}

          {/* Sale countdown */}
          {isOnSale && daysLeft !== null && daysLeft > 0 && (
            <div className="flex items-center text-red-600 text-sm">
              <Clock className="w-4 h-4 ml-1" />
              <span>נותרו {daysLeft} ימים למבצע</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h5 className="text-xl font-semibold text-gray-900 mb-0 ml-2">
              {priceInfo.current}
            </h5>
            {priceInfo.isOnSale && priceInfo.original && (
              <span className="text-sm text-gray-500 line-through">
                {priceInfo.original}
              </span>
            )}
          </div>
          <div>
            <button
              onClick={() => navigate(`/course/${course.id}`)}
              className={`inline-flex items-center transition-colors font-medium ${
                course.has_access 
                  ? 'text-green-600 hover:text-green-700' 
                  : `${styles.textSecondary} hover:${styles.textColor}`
              }`}
            >
              <ShoppingCart className="w-4 h-4 ml-2" />
              {course.has_access ? 'צפה עכשיו' : 'הירשם לקורס'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard; 