import {Mail, Laptop, FileText, GraduationCap, Linkedin, ChevronDown, Copy, Check} from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './components/ui/card'
import CourseList from './components/CoursesList'
import HelpfulLinksSection from './components/HelpfulLinks'
import { useState, useEffect } from 'react'
import JobPostingsCard from './components/JobPostingCard'
import { supabase } from './lib/supabase'
import AuthButton from './components/AuthButton'
import TutorCard from './components/TutorCard'
import AdminPanel from './components/AdminPanel'

const csTutors = [
  {name: "דוד עזרן ", subjects: ["תכנות מונחה עצמים", "סדנה מתקדמת בתכנות", "מבני נתונים", "מבוא למדעי המחשב"] , contact: "0508121999"},
  {name: "עידן מרמור" , subjects: ["אלגוריתמים 1", "מבני נתונים", "מבוא למדעי המחשב", "אלגוריתמים 2" ] , contact:"0537204416"},
  {name: "אליעד גבריאל" , subjects: ["מבוא למדמח, סדנה מתקדמת, מונחה עצמים"], contact: "0542542199"},
  {name: "טל זכריה" , subjects: ["מבוא למדעי המחשב","סדנה מתקדמת בתכנות", "אוטומטים ושפות פורמליות", "חישוביות וסיבוכיות"], contact: "0542075966"},
  {name: "עמית אוחנה" , subjects: ["מבוא למדעי המחשב", "סדנה מתקדמת בתכנות","מבני נתונים","אלגו 1 + 2"], contact: "0537005288"},
  {name: "עדי (הדקדוקטטור) צלניקר" , subjects: ["1+2 אינפי ","ליניארית 1+2"], contact: "0507304007"}
];
const eeTutors = [
  { name: "עומר יצחקי", subjects: ["מכינה בפיזיקה", "פיזיקה 1"], contact: "0542488426" },
  { name: "איזבל קריכלי", subjects: ["מבוא לחשמל"], contact: "0545736399" },
  { name: "מיכאל קלנדריוב", subjects: ["פיזיקה 1", "פיזיקה 2", "פיזיקה 3", "אינפי 2", "הסתברות", "יסודות מלמ", "מעגלים אלקטרונים ליניאריים"], contact: "0526330911" },
  { name: "עידן לוי", subjects: ["טורים והתמרות","פיזיקה 1"], contact: "0544413827" }
];

const App = () => {
  const [courseType, setCourseType] = useState('cs'); // 'cs' for Computer Science, 'ee' for Electrical Engineering
  const [selectedTag, setSelectedTag] = useState('אין');
  const [isVisible, setIsVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [tutorsWithFeedback, setTutorsWithFeedback] = useState([]);
  
  const theme = courseType === 'cs' ? 'blue' : 'dark-purple';
  const bgGradient = courseType === 'cs' ? 'from-blue-50 to-white' : 'from-purple-50 to-white';
  const textColor = courseType === 'cs' ? 'text-blue-950' : 'text-purple-950';
  const buttonBg = courseType === 'cs' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-purple-800 hover:bg-purple-900';
  const buttonBorder = courseType === 'cs' ? 'border-blue-700' : 'border-purple-800';
  
  const handleCourseSwitch = (type) => {
    setCourseType(type);
    if (type === 'cs') {
      setSelectedTag(null); // Reset selected tag when switching to CS
    }
    else {
      setSelectedTag('אין'); // Reset selected tag when switching to EE
    }
  };

  // Supabase authentication
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Load tutors with feedback
    loadTutorsWithFeedback();

    return () => subscription.unsubscribe();
  }, []);

  // Intersection Observer for missing tests section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1
      }
    );

    const missingSection = document.getElementById('missing-tests-section');
    if (missingSection) {
      observer.observe(missingSection);
    }

    return () => {
      if (missingSection) {
        observer.unobserve(missingSection);
      }
    };
  }, []);

  // Tutor data loading
  const loadTutorsWithFeedback = async () => {
    try {
      // Fetch tutors data from Supabase, filtered by degree
      const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('degree', courseType);

      if (error) {
        console.error('Error fetching tutors:', error);
        // Fallback to local data if there's an error
        const fallbackTutors = courseType === 'cs' ? csTutors : eeTutors;
        setTutorsWithFeedback(fallbackTutors.map(tutor => ({...tutor, feedback: []})));
        return;
      }
      
      if (tutors && tutors.length > 0) {
        // If we got tutors from Supabase
        const tutorsWithFeedback = await Promise.all(
          tutors.map(async (tutor) => {
            const { data: feedback } = await supabase
              .from('feedback')
              .select('*')
              .eq('tutor_id', tutor.id);
              
            return { ...tutor, feedback: feedback || [] };
          })
        );
        setTutorsWithFeedback(tutorsWithFeedback);
      } else {
        // Fallback to local data if no tutors in Supabase
        const fallbackTutors = courseType === 'cs' ? csTutors : eeTutors;
        setTutorsWithFeedback(fallbackTutors.map(tutor => ({...tutor, feedback: []})));
      }
    } catch (error) {
      console.error('Error in loadTutorsWithFeedback:', error);
      // Fallback to local data on any error
      const fallbackTutors = courseType === 'cs' ? csTutors : eeTutors;
      setTutorsWithFeedback(fallbackTutors.map(tutor => ({...tutor, feedback: []})));
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (tutorId, rating, comment) => {
    if (!user) return;

    try {
      // First, check if user already has feedback for this tutor
      const { data: existingFeedback } = await supabase
        .from('feedback')
        .select('id')
        .eq('tutor_id', tutorId)
        .eq('user_id', user.id)
        .single();

      let error;
      
      if (existingFeedback) {
        // Update existing feedback
        ({ error } = await supabase
          .from('feedback')
          .update({ rating, comment })
          .eq('id', existingFeedback.id));
      } else {
        // Insert new feedback
        ({ error } = await supabase
          .from('feedback')
          .insert([{
            tutor_id: tutorId,
            user_id: user.id,
            rating,
            comment
          }]));
      }

      if (error) {
        console.error('Error submitting feedback:', error);
        alert('שגיאה בשליחת הביקורת');
        return;
      }
      
      // Reload tutors with feedback
      loadTutorsWithFeedback();
      
    } catch (error) {
      console.error('Error in handleSubmitFeedback:', error);
      alert('שגיאה בשליחת הביקורת');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('cs24.hit@gmail.com');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = 'cs24.hit@gmail.com';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    // Reload tutors when courseType changes
    loadTutorsWithFeedback();
  }, [courseType]);
          
  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient}`}>
      <main className="container mx-auto px-4 py-8">
        <AdminPanel user={user} />
        <div className="flex flex-col items-center mb-4">
          <h1 className={`text-5xl font-bold mb-4 text-center ${textColor}`}>CS24</h1>
          <p className={`text-xl ${textColor} text-center`}>
          ברוכים הבאים למאגר המידע המקיף ביותר שהיה במכון הטכנולוגי חולון
          </p>
          <div className="flex items-center gap-3 group cursor-pointer">
            <a 
              href="https://www.linkedin.com/in/daniel-ziv/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center transition-transform duration-300 hover:scale-110"
              title="בואו נתחבר"
            >
            <h2 className={`text-xl ${textColor}`}> פותח ע״י דניאל זיו  </h2>
              <p> - </p>
              <Linkedin strokeWidth={1} className="h-6 w-6" color="#0077B5"  />
            </a>
          </div>
        </div>

        {/* Course Type Selection Buttons */}
        <div className="flex flex-row gap-3 mt-4 justify-center mb-5">
          <Button 
            className={`px-6 py-2 text-lg font-medium rounded-md shadow-md transition-colors ${
              courseType === 'cs' 
                ? `${buttonBg} text-white`
                : `bg-white hover:bg-${theme}-50 text-${theme}-700 ${buttonBorder}`
            }`}
            onClick={() => handleCourseSwitch('cs')}
          >
            מדעי המחשב
          </Button>
          <Button 
            className={`px-6 py-2 text-lg font-medium rounded-md shadow-md transition-colors ${
              courseType === 'ee' 
                ? `${buttonBg} text-white`
                : `bg-white hover:bg-${theme}-50 text-${theme}-700 ${buttonBorder}`
            }`}
            onClick={() => handleCourseSwitch('ee')}
          >
            הנדסת חשמל
          </Button>
        </div>
      
        {/* Top Mobile Section - Jobs and Laptop */}
        <div className="block lg:hidden mb-4">
          {/* Job Postings Card */}
          <div className="mb-4">
            <JobPostingsCard courseType={courseType} />
          </div>
          
          {/* Laptop Section */}
          <Card className={`bg-gradient-to-r ${courseType === 'cs' ? 'from-blue-700 via-blue-800 to-blue-700' : 'from-purple-800 via-purple-950 to-purple-800'} shadow-xl hover:shadow-2xl transition-all border-2 ${buttonBorder}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full sm:block">
                  <Laptop className="h-7 w-7 text-white animate-pulse" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                    לא יודעים איזה מחשב נייד לקנות?
                </h3>
              </div>
              <Button
                className={`w-full sm:w-auto bg-white hover:bg-blue-50 text-lg font-bold ${textColor} px-8 py-3 shadow-lg hover:scale-105 transition-transform`}
                onClick={() => window.open('https://toplaptop.net', '_blank')}
              >
                לחצו כאן!
              </Button>
            </div>
          </Card>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 mb-2">
          {/* Job Postings Card - Left Column (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <JobPostingsCard courseType={courseType} />
          </div>
          
          {/* Right Column Content (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            {/* Laptop Section */}
            <Card className={`bg-gradient-to-r ${courseType === 'cs' ? 'from-blue-700 via-blue-800 to-blue-700' : 'from-purple-800 via-purple-950 to-purple-800'} shadow-xl hover:shadow-2xl transition-all border-2 ${buttonBorder} mb-4`}> 
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full hidden sm:block">
                    <Laptop className="h-7 w-7 text-white animate-pulse" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                      לא יודעים איזה מחשב נייד לקנות?
                  </h3>
                </div>
                <Button
                  className={`w-full sm:w-auto bg-white hover:bg-blue-50 text-lg font-bold ${textColor} px-8 py-3 shadow-lg hover:scale-105 transition-transform`}
                  onClick={() => window.open('https://toplaptop.net', '_blank')}
                >
                  לחצו כאן!
                </Button>
              </div>
            </Card>

            {/* Links Section - Desktop */}
            <HelpfulLinksSection courseType={courseType} />
          </div>
        </div>

        {/* Choose EE Specialty if chose EE */}
        {courseType === 'ee' && (
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-xl font-bold text-purple-950 mb-2">התמחות</h2>
            <div className="relative inline-block text-left">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="appearance-none bg-white border border-purple-700 text-purple-700 px-4 py-2 pr-10 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="אין">עדיין אין</option>
                <option value="בקרה">בקרה</option>
                <option value="אלקטרואופטיקה ומיקרואלקטרוניקה">אלקטרואופטיקה ומיקרואלקטרוניקה</option>
                <option value="ביו הנדסה">ביו הנדסה</option>
                <option value="אנרגיה ומערכות הספק(זרם חזק)">אנרגיה ומערכות הספק(זרם חזק)</option>
                <option value="אנרגיות חלופיות ומערכות הספק משולב">אנרגיות חלופיות ומערכות הספק משולב</option>
                <option value="מערכות משובצות מחשב">מערכות משובצות מחשב</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-700">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Course List */}
        {courseType === 'cs' ? (
          <CourseList />
        ) : (
          <CourseList electricalEngineering={true} selectedTag={selectedTag} /> 
        )}

        {/* Links Section - Mobile (appears after course list) */}
        <div className="block lg:hidden mt-4">
          <HelpfulLinksSection courseType={courseType} />
        </div>

        {/* New Tutors Section with Supabase Integration */}
        <Card className={`mb-8 bg-white ${courseType === 'cs' ? 'border-sky-200' : 'border-purple-200'}`}>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <CardTitle className={`text-3xl flex items-center gap-2 ${courseType === 'cs' ? 'text-sky-950' : 'text-purple-950'}`}>
                <GraduationCap className={`h-8 w-8 ${courseType === 'cs' ? 'text-sky-600' : 'text-purple-600'}`} />
                מורים פרטיים
              </CardTitle>
              <AuthButton user={user} courseType={courseType} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {tutorsWithFeedback.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  courseType={courseType}
                  user={user}
                  onSubmitFeedback={handleSubmitFeedback}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missing Tests Banner */}
        <Card 
          id="missing-tests-section"
          className={`mb-8 bg-${courseType === 'cs' ? 'blue-50' : 'purple-50'} border-${courseType === 'cs' ? 'blue-200' : 'purple-200'} ${
            isVisible ? 'animate-bounce-gentle shadow-glow' : ''
          }`}
        >
          <CardHeader>
            <CardTitle className={`text-3xl flex items-center gap-2 justify-center ${courseType === 'cs' ? 'text-blue-950' : 'text-purple-950'}`}>
              <FileText className={`h-8 w-8 ${courseType === 'cs' ? 'text-blue-600' : 'text-purple-600'}`} aria-hidden="true" />
              <span>חוסרים</span>
            </CardTitle>
            <CardDescription className={`text-center text-lg ${courseType === 'cs' ? 'text-blue-800' : 'text-purple-800'}`}>
              יש לך מבחנים שאינם נמצאים במאגר? נשמח שתשלח לנו אותם
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2 px-4 sm:px-6">
            <div className={`relative flex items-center gap-2 px-6 py-3 rounded-lg ${courseType === 'cs' ? 'bg-blue-800' : 'bg-purple-800'}`}>
              <span className="text-base sm:text-lg text-white select-all">cs24.hit@gmail.com</span>
              <button
                onClick={copyToClipboard}
                className={`p-1.5 rounded-md transition-colors ${
                  courseType === 'cs' 
                    ? 'hover:bg-blue-700 active:bg-blue-600' 
                    : 'hover:bg-purple-700 active:bg-purple-600'
                }`}
                aria-label="העתק לזכרון"
              >
                {copySuccess ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <Copy className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
            <div 
              className={`flex items-center justify-center ${
                copySuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
              } transition-all duration-200`}
            >
              <span className={`text-sm ${courseType === 'cs' ? 'text-blue-800' : 'text-purple-800'}`}>
                הכתובת הועתקה בהצלחה!
              </span>
            </div>
          </CardContent>
        </Card>

        <style jsx global>{`
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          
          .animate-bounce-gentle {
            animation: bounce-gentle 2s infinite;
          }
          
          .shadow-glow {
            box-shadow: 0 0 15px ${courseType === 'cs' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(147, 51, 234, 0.3)'};
            transition: box-shadow 0.3s ease-in-out;
          }
          
          .shadow-glow:hover {
            box-shadow: 0 0 25px ${courseType === 'cs' ? 'rgba(37, 99, 235, 0.5)' : 'rgba(147, 51, 234, 0.5)'};
          }
        `}</style>
      </main>
    </div>
  );
};

export default App;