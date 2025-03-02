import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Briefcase, RefreshCw, Bell } from 'lucide-react';

const JobPostingsCard = ({ courseType = 'cs' }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("")
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);


  // Theme variables based on course type
  const textColor = courseType === 'cs' ? 'text-blue-950' : 'text-purple-950';
  const buttonBg = courseType === 'cs' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-purple-800 hover:bg-purple-900';
  const cardBorder = courseType === 'cs' ? 'border-blue-200' : 'border-purple-200';
  const jobItemBg = courseType === 'cs' ? 'bg-blue-50' : 'bg-purple-50';
  const dateBg = courseType === 'cs' ? 'bg-blue-100' : 'bg-purple-100';
  const dateText = courseType === 'cs' ? 'text-blue-800' : 'text-purple-800';
  
  

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
  
    if (!emailRegex.test(email)) {
      setEmailError("נא להזין כתובת אימייל תקינה.");
      return;
    }
    setEmailError(""); // Clear errors if valid
    console.log("Subscribed with email:", email); // Replace with actual API request
    
    // Set success state to show confirmation message
    setSubscribeSuccess(true);
    
    // After 2 seconds, reset states and close the modal
    setTimeout(() => {
      setShowSubscribeModal(false);
      setSubscribeSuccess(false);
      setEmail("");
    }, 2000);
  };
  
// Helper function to format the date
function formatDate(dateStr) {
  // Split by "/" => ["3", "1", "25"]
  const [month, day, year] = dateStr.split("/");
  // Return it in day/month/year format => "1/3/25"
  return `${day}/${month}/${year}`;
}



  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://my-public-jobs-json.s3.us-east-1.amazonaws.com/jobs.json");
      const data = await response.json();
      console.log("Fetched jobs:");

      console.log(data);
      // Select the correct key based on course type.
      // Adjust these keys if needed.
      const jobsData = courseType === 'cs' ? data["secretjuniordevelopers"] : data["-1002263628689"];
      setJobs(jobsData || []);  // Fallback to empty array if key not found
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
    
    <Card className={`mb-1 bg-white relative ${cardBorder}`}>
      {/* Bell bubble (instead of "Junior" + Send) */}
    <div
      className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-md border border-gray-200 cursor-pointer"
      onClick={() => setShowSubscribeModal(true)}
    >
      <Bell className={`h-5 w-5 ${courseType === 'cs' ? 'text-blue-600' : 'text-purple-600'}`} />
    </div>


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
          onSubmit={(e) => {
            e.preventDefault();
            handleSubscribe(); // Your email validation logic here
          }}
        >
          {/* Hidden input for Netlify */}
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
            <Button type="submit">
              אישור
            </Button>
          </div>
        </form>
      )}
    </div>
  </div>
)}



      <CardHeader>
        <div className="flex justify-between items-center">
        <CardTitle className={`text-2xl flex items-center gap-2 ${textColor}`}>
        <Briefcase className={`h-6 w-6 ${courseType === 'cs' ? 'text-blue-600' : 'text-purple-600'}`} />
        {courseType === 'cs' ? "משרות למדמ״ח" : "משרות לחשמל"}
        </CardTitle>

          <Button 
            variant="outline"
            size="sm"
            className={`${courseType === 'cs' ? 'text-blue-600 border-blue-300 hover:bg-blue-50' : 'text-purple-600 border-purple-300 hover:bg-purple-50'}`}
            onClick={fetchJobs}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            רענון
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center p-8">
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${courseType === 'cs' ? 'border-blue-600' : 'border-purple-600'}`}></div>
            </div>
            ) : (
            <div className="h-80 overflow-y-auto pr-1 space-y-3">
            {jobs.map(job => (
            <div 
                key={job.id} 
                className={`rounded-lg ${jobItemBg} p-4 flex items-center justify-between gap-4`}
            >
            {/* Text Container */}
                <div className="flex-1 min-w-0">
            {/* Force wrapping */}
                <h3 className={`font-medium ${textColor} break-words`}>
                    {job.title}
                </h3>
            </div>

            {/* Date + Button Container */}
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
    </Card>

    
  );
};

export default JobPostingsCard;