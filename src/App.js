import {Mail, Laptop, FileText,  GraduationCap} from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './components/ui/card'
import CourseList from './components/CoursesList'
import HelpfulLinksSection from './components/HelpfulLinks'
import SubscriptionCard from './components/Bauman'



const tutors = [
  
    {name: "דוד עזרן ", subjects: ["תכנות מונחה עצמים", "סדנה מתקדמת בתכנות", "מבני נתונים", "מבוא למדעי המחשב"] , contact: "0508121999"},
    {name: "עידן מרמור" , subjects: ["אלגוריתמים 1", "מבני נתונים", "מבוא למדעי המחשב", "אלגוריתמים 2" ] , contact:"0537204416"},
    {name: "אורי גבע" , subjects: ["מבוא למערכות מחשב", "אנגלית כל הרמות"], contact: "0542244171"},
    {name: "טל זכריה" , subjects: ["מבוא למדעי המחשב","סדנה מתקדמת בתכנות", "אוטומטים ושפות פורמליות", "חישוביות וסיבוכיות"], contact: "0542075966"},
    {name: "עמית אוחנה" , subjects: ["מבוא למדעי המחשב", "סדנה מתקדמת בתכנות","מבני נתונים","אלגו 1 + 2"], contact: "0537005288"},
    {name: "עדי (הדקדוקטטור) צלניקר" , subjects: ["1+2 אינפי ","ליניארית 1+2"], contact: "0507304007"}


]





const App = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-4">
  <h1 className="text-5xl font-bold mb-4 text-center text-blue-950">CS24</h1>
  <p className="text-xl text-blue-950 text-center">
    ברוכים הבאים למאגר המידע המקיף ביותר שהיה במכון הטכנולוגי חולון
  </p>
  <SubscriptionCard />
</div>

        {/* Laptop Section */}
        <Card className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 shadow-xl hover:shadow-2xl transition-all border-2 border-blue-600 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full hidden sm:block">
                <Laptop className="h-7 w-7 text-white animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white drop-shadow-md">מחפשים מחשב נייד?</h3>
            </div>
            <Button
              className="w-full sm:w-auto bg-white hover:bg-blue-50 text-lg font-bold text-blue-800 px-8 py-3 shadow-lg hover:scale-105 transition-transform"
              onClick={() => window.open('https://toplaptop.net', '_blank')}
            >
              לחצו כאן!
            </Button>
          </div>
        </Card>

        
       
       {/* Links Section */}
       <HelpfulLinksSection/>



        {/* Courses Grid */}
        <CourseList />



   

           {/* Tutors Section */}
           <Card className="mb-8 bg-white border-sky-200">
  <CardHeader>
    <CardTitle className="text-3xl flex items-center gap-2 text-sky-950">
      <GraduationCap className="h-8 w-8 text-sky-600" />
      מורים פרטיים מומלצים
    </CardTitle>
    <CardDescription className="text-lg text-sky-700">
      מורים פרטיים מנוסים לקורסים השונים
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {tutors.map((tutor, index) => (
        <Card
          key={index}
          className="bg-sky-50 hover:shadow-md transition-shadow border-sky-100 flex flex-col justify-between"
        >
          <CardHeader className="p-4">
            <CardTitle className="text-xl text-sky-900">{tutor.name}</CardTitle>
            <CardDescription className="text-base text-sky-700" dir="rtl">
              {tutor.subjects.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto p-4 pt-0">
            <Button
              variant="outline"
              className="w-full text-lg border-sky-300 text-sky-700 hover:bg-sky-100"
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
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2 justify-center text-blue-950">
            <FileText className="h-8 w-8 text-blue-600" aria-hidden="true" />
            <span>חוסרים</span>
          </CardTitle>

            <CardDescription className="text-center text-lg text-blue-800">
              יש לך מבחנים שאינם נמצאים במאגר? נשמח שתשלח לנו אותם
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center px-4 sm:px-6">
            <Button
              size="lg"
              className="bg-blue-800 hover:bg-blue-900 text-white text-base sm:text-lg w-full sm:w-auto break-words"
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