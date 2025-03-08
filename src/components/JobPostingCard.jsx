import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Briefcase, RefreshCw, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

const JobPostingsCard = ({ courseType = 'cs' }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const controls = useAnimation();
  const isMounted = useRef(false);

  // Theme variables based on course type
  const textColor = courseType === 'cs' ? 'text-blue-950' : 'text-purple-950';
  const buttonBg = courseType === 'cs' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-purple-800 hover:bg-purple-900';
  const cardBorder = courseType === 'cs' ? 'border-blue-200' : 'border-purple-200';
  const jobItemBg = courseType === 'cs' ? 'bg-blue-50' : 'bg-purple-50';
  const dateBg = courseType === 'cs' ? 'bg-blue-100' : 'bg-purple-100';
  const dateText = courseType === 'cs' ? 'text-blue-800' : 'text-purple-800';
  const iconColor = courseType === 'cs' ? 'text-blue-600' : 'text-purple-600';

  // Form submit function for subscribe modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('נא להזין כתובת אימייל תקינה.');
      return;
    }
    setEmailError('');

    const formData = new FormData();
    formData.append('form-name', 'subscribe');
    formData.append('email', email);

    try {
      const response = await fetch('/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSubscribeSuccess(true);
        setTimeout(() => {
          setShowSubscribeModal(false);
          setSubscribeSuccess(false);
          setEmail('');
        }, 2000);
      } else {
        console.error('Form submission failed:', response.status);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Helper function to format the date
  function formatDate(dateStr) {
    const [month, day, year] = dateStr.split("/");
    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    isMounted.current = true;
  
    const sequence = async () => {
      await controls.start({
        y: [-20, 0],
        transition: { duration: 0.5, ease: "easeOut" }
      });
      // Only start the next animation if the component is still mounted
      if (isMounted.current) {
        controls.start({
          rotate: [0, 15, -10, 5, -5, 0],
          transition: { duration: 1.5, ease: "easeInOut", repeat: Infinity }
        });
      }
    };
  
    sequence();
  
    return () => {
      isMounted.current = false;
    };
  }, [controls]);
  
  
  // Fetch jobs from the API
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://my-public-jobs-json.s3.us-east-1.amazonaws.com/jobs.json");
      const data = await response.json();
      const jobsData = courseType === 'cs' ? data["secretjuniordevelopers"] : data["-1002263628689"];
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    fetchJobs();
  }, [courseType]);

  return (
    <Card className={`mb-4 bg-white relative ${cardBorder}`}>
      {/* Bell bubble */}
      <motion.div
        initial={{ rotate: 0, y: 0 }}
        animate={controls}
        className={`absolute -top-4 -right-4 ${buttonBg} rounded-full p-2 shadow-md border border-gray-200 cursor-pointer`}
        onClick={() => setShowSubscribeModal(true)}
      >
        <Bell className="h-5 w-5 text-white" />
      </motion.div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-160">
            <h2 className="text-xl font-bold mb-2 text-center">הרשמה לקבלת משרות</h2>
            <p className="mb-1 text-center">
              אם מעניין אתכם שליחה אוטומטית של קו״ח, עדכונים בלייב על משרות ושיפור שלהם עם בינה מלאכותית
            </p>
            <p className="mb-4 text-center">
              הזינו את המייל שלכם ואעדכן בפרטים בהמשך
            </p>
            
            {subscribeSuccess ? (
              <p className="text-green-600 text-center text-lg">הרשמה בוצעה בהצלחה!</p>
            ) : (
              <form
                name="subscribe"
                method="POST"
                data-netlify="true"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="form-name" value="subscribe" />
                <input
                  type="email"
                  name="email"
                  className={`w-full p-2 border rounded mb-2 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="האימייל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {emailError && <p className="text-red-500 text-sm mb-2 text-center">{emailError}</p>}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSubscribeModal(false)}>
                    ביטול
                  </Button>
                  <Button variant="inline" type="submit" className={`${buttonBg} text-white`}>
                    אישור
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Card Header with Dropdown Toggle */}
      <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-center w-full">
          <CardTitle className={`text-2xl flex items-center gap-2 ${textColor}`}>
            <Briefcase className={`h-6 w-6 ${iconColor}`} />
            {courseType === 'cs' ? "משרות למדמ״ח" : "משרות לחשמל"}
          </CardTitle>
          {/* Toggle icon changes based on dropdown state */}
          {isOpen ? (
            <ChevronUp className={`h-6 w-6 ${iconColor}`} />
          ) : (
            <ChevronDown className={`h-6 w-6 ${iconColor}`} />
          )}
         
        </div>
      </CardHeader>

      {/* Dropdown Content: Only show when open */}
      {isOpen && (
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${courseType === 'cs' ? 'border-blue-600' : 'border-purple-600'}`}></div>
            </div>
          ) : (
            <div className="h-80 overflow-y-auto pr-1 space-y-3">
              {jobs.map(job => (
                <div 
                  key={job.id || `job-${job.title}-${job.date}`}
                  className={`rounded-lg ${jobItemBg} p-4 flex items-center justify-between gap-4`}
                >
                  {/* Job Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${textColor} break-words`}>
                      {job.title}
                    </h3>
                  </div>
                  {/* Date and Action Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${dateBg} ${dateText}`}>
                      {formatDate(job.date)}
                    </span>
                    <Button
                      className={`text-white ${buttonBg} text-sm`}
                      onClick={() => window.open(job.url, '_blank')}
                    >
                      להגשה
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default JobPostingsCard;
