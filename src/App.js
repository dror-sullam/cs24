import {Mail, Laptop, FileText,  GraduationCap, Linkedin, ChevronDown} from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './components/ui/card'
import CourseList from './components/CoursesList'
import HelpfulLinksSection from './components/HelpfulLinks'
import { useState } from 'react'
import JobPostingsCard from './components/JobPostingCard'





const csTutors = [
  
    {name: "דוד עזרן ", subjects: ["תכנות מונחה עצמים", "סדנה מתקדמת בתכנות", "מבני נתונים", "מבוא למדעי המחשב"] , contact: "0508121999"},
    {name: "עידן מרמור" , subjects: ["אלגוריתמים 1", "מבני נתונים", "מבוא למדעי המחשב", "אלגוריתמים 2" ] , contact:"0537204416"},
    {name: "אליעד גבריאל" , subjects: ["מבוא למדמח, סדנה מתקדמת, מונחה עצמים"], contact: "0542542199"},
    {name: "טל זכריה" , subjects: ["מבוא למדעי המחשב","סדנה מתקדמת בתכנות", "אוטומטים ושפות פורמליות", "חישוביות וסיבוכיות"], contact: "0542075966"},
    {name: "עמית אוחנה" , subjects: ["מבוא למדעי המחשב", "סדנה מתקדמת בתכנות","מבני נתונים","אלגו 1 + 2"], contact: "0537005288"},
    {name: "עדי (הדקדוקטטור) צלניקר" , subjects: ["1+2 אינפי ","ליניארית 1+2"], contact: "0507304007"}

]
const eeTutors = [
  { name: "עומר יצחקי", subjects: ["מכינה בפיזיקה", "פיזיקה 1"], contact: "0542488426" },
  { name: "איזבל קריכלי", subjects: ["מבוא לחשמל"], contact: "0542488426" },
  { name: "מיכאל קלנדריוב", subjects: ["פיזיקה 1", "פיזיקה 2", "פיזיקה 3", "אינפי 2", "הסתברות", "יסודות מלמ", "מעגלים אלקטרונים ליניאריים"], contact: "0526330911" },
  { name: "עידן לוי", subjects: ["טורים והתמרות","פיזיקה 1"], contact: "0544413827" }

];






const App = () => {
  
          const [courseType, setCourseType] = useState('cs'); // 'cs' for Computer Science, 'ee' for Electrical Engineering
          const [selectedTag, setSelectedTag] = useState('אין');
          const theme = courseType === 'cs' ? 'blue' : 'dark-purple';
          const bgGradient = courseType === 'cs' ? 'from-blue-50 to-white' : 'from-purple-50 to-white';
          const textColor = courseType === 'cs' ? 'text-blue-950' : 'text-purple-950';
          const buttonBg = courseType === 'cs' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-purple-800 hover:bg-purple-900';
          const buttonBorder = courseType === 'cs' ? 'border-blue-700' : 'border-purple-800';
          const tutorsToShow = courseType === 'cs' ? csTutors : eeTutors;
          const handleCourseSwitch = (type) => {
            setCourseType(type);
            if (type === 'cs') {
              setSelectedTag(null); // Reset selected tag when switching to CS
            }
            else {
              setSelectedTag('אין'); // Reset selected tag when switching to EE
            }
          };


          
          return (
            
            <div className={`min-h-screen bg-gradient-to-b ${bgGradient}`}>
              <main className="container mx-auto px-4 py-8">
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
              


          
                {/* Responsive Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
                  {/* Job Postings Card - Left Column (1/3 width on desktop) */}
                  <div className="lg:col-span-1">
                    <JobPostingsCard courseType={courseType} />
                  </div>
                  
                  {/* Right Column Content (2/3 width on desktop) */}
                  <div className="lg:col-span-2">
                    {/* Laptop Section */}
                    <Card className={`bg-gradient-to-r ${courseType === 'cs' ? 'from-blue-700 via-blue-800 to-blue-700' : 'from-purple-800 via-purple-950 to-purple-800'} shadow-xl hover:shadow-2xl transition-all border-2 ${buttonBorder} mb-2.5`}>          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-full hidden sm:block">
                            <Laptop className="h-7 w-7 text-white animate-pulse" />
                          </div>
                          <h3 className="text-2xl font-bold text-white drop-shadow-md">לא יודעים איזה מחשב נייד לקנות?</h3>
                        </div>
                        <Button
                          className={`w-full sm:w-auto bg-white hover:bg-blue-50 text-lg font-bold ${textColor} px-8 py-3 shadow-lg hover:scale-105 transition-transform`}
                          onClick={() => window.open('https://toplaptop.net', '_blank')}
                        >
                          לחצו כאן!
                        </Button>
                      </div>
                    </Card>

                    {/* Links Section */}
                    <HelpfulLinksSection courseType={courseType} />
                  </div>
                </div>


          {/* Choose EE Speciely if chose EE */}
          {courseType === 'ee' && (
            <div className="mt-4 flex flex-col items-center mb-3">
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


        {/* Courses Grid - Conditionally render based on courseType */}
        {courseType === 'cs' ? (
          <CourseList />
        ) : (
          <CourseList electricalEngineering={true} selectedTag={selectedTag} /> 
        )}



   

       {/* Tutors Section */}
      <Card className={`mb-8 bg-white ${courseType === 'cs' ? 'border-sky-200' : 'border-purple-200'}`}>
        <CardHeader>
          <CardTitle className={`text-3xl flex items-center gap-2 ${courseType === 'cs' ? 'text-sky-950' : 'text-purple-950'}`}>
            <GraduationCap className={`h-8 w-8 ${courseType === 'cs' ? 'text-sky-600' : 'text-purple-600'}`} />
            מורים פרטיים מומלצים
          </CardTitle>
          <CardDescription className={`text-lg ${courseType === 'cs' ? 'text-sky-700' : 'text-purple-700'}`}>
            מורים פרטיים מנוסים לקורסים השונים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {tutorsToShow.map((tutor, index) => (
              <Card
                key={index}
                className={`flex flex-col justify-between hover:shadow-md transition-shadow ${
                  courseType === 'cs'
                    ? 'bg-sky-50 border-sky-100'
                    : 'bg-purple-50 border-purple-100'
                }`}
              >
                <CardHeader className="p-4">
                  <CardTitle className={`text-xl ${courseType === 'cs' ? 'text-sky-900' : 'text-purple-900'}`}>
                    {tutor.name}
                  </CardTitle>
                  <CardDescription className={`text-base ${courseType === 'cs' ? 'text-sky-700' : 'text-purple-700'}`} dir="rtl">
                    {tutor.subjects.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto p-4 pt-0">
                  <Button
                    variant="outline"
                    className={`w-full text-lg ${
                      courseType === 'cs'
                        ? 'border-sky-300 text-sky-700 hover:bg-sky-100'
                        : 'border-purple-300 text-purple-700 hover:bg-purple-100'
                    }`}
                    onClick={() => {
                      const formattedNumber = `972${tutor.contact.slice(1)}`;
                      window.open(`https://api.whatsapp.com/send?phone=${formattedNumber}`, "_blank");
                    }}
                  >
                    {tutor.contact}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>




        {/* Missing Tests Banner */}
        <Card className={`mb-8 bg-${courseType === 'cs' ? 'blue-50' : 'purple-50'} border-${courseType === 'cs' ? 'blue-200' : 'purple-200'}`}>
          <CardHeader>
            <CardTitle className={`text-3xl flex items-center gap-2 justify-center ${courseType === 'cs' ? 'text-blue-950' : 'text-purple-950'}`}>
              <FileText className={`h-8 w-8 ${courseType === 'cs' ? 'text-blue-600' : 'text-purple-600'}`} aria-hidden="true" />
              <span>חוסרים</span>
            </CardTitle>
            <CardDescription className={`text-center text-lg ${courseType === 'cs' ? 'text-blue-800' : 'text-purple-800'}`}>
              יש לך מבחנים שאינם נמצאים במאגר? נשמח שתשלח לנו אותם
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-4 sm:px-6">
            <Button
              size="lg"
              className={`text-base sm:text-lg w-full sm:w-auto break-words text-white ${courseType === 'cs' ? 'bg-blue-800 hover:bg-blue-900' : 'bg-purple-800 hover:bg-purple-900'}`}
              onClick={() => window.location.href = 'mailto:cs24.hit@gmail.com'}
            >
              <Mail className="mr-2 h-5 w-5 shrink-0" />
              <span className="truncate">cs24.hit@gmail.com</span>
            </Button>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default App;