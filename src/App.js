import {Mail, Laptop, BookOpen, FileText, Link as LinkIcon, GraduationCap } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './components/ui/card'

const helpfulLinks = [
  { 
    title: "דרייב האגודה",
    description: "מערכת הקורסים של המכון",
    url: "https://drive.google.com/drive/folders/1ITwPTm_Jv3w-nVT7PpE2HViDn56W_VWN"
  },
  {
    title: "cs20",
    description: "דרייב ישן יותר של מבחנים",
    url: "https://drive.google.com/drive/u/1/folders/1Mmh1MW_zwNyqhNDB1gtkeklA4w_kHV5V"
  },
  {
    title: "חומרים בטלגרם",
    description: "ניתן למצוא חומרים בלינק ועוד על ידי חיפוש שם המשתמש הבא בטלגרם:  @Hithelpbot",
    url: "https://t.me/+1afwRPetXHA0NGFk"
  },
  {
    title: "הדרייב של ליז",
    description: "מומלץ להעזר בה, המון המון שיטות וחומרים",
    url: "https://drive.google.com/drive/folders/1amxc9ZpT5xzNFdFeYSndfhn32GlebnvG"
  },
  {
    title: "הדרייב של אלעד עטייא",
    description: "למי שרוצה לעשות ארגזים בהייטקס",
    url: "https://drive.google.com/drive/u/0/folders/1EOpfuGEXp-hCD_DCBYerJiXP-YIrIfnB"
  },
  {
  title: "הדרייב של דוד עזרן",
  description: "דרייב עם קורסים של שנה ב בלבד",
  url: "https://drive.google.com/drive/folders/1qvJJWikw7Z9DN1dwkV2I94daLqudayU5?usp=drive_link"
  }
]

const tutors = [
  
    {name: "דוד עזרן ", subjects: ["תכנות מונחה עצמים", "סדנה מתקדמת בתכנות", "מבני נתונים", "מבוא למדעי המחשב"] , contact: "0508121999"},
    {name: "עידן מרמור" , subjects: ["אלגוריתמים 1", "מבני נתונים", "מבוא למדעי המחשב", "אלגוריתמים 2" ] , contact:"0537204416"},
    {name: "אורי גבע" , subjects: ["מבוא למערכות מחשב"], contact: "0542244171"},
    {name: "טל זכריה" , subjects: ["מבוא למדעי המחשב","סדנה מתקדמת בתכנות", "אוטומטים ושפות פורמליות", "חישוביות וסיבוכיות"], contact: "0542075966"}


  
]



const subjects = [
  { id: 1, name: "תכנות מונחה עצמים", driveLink: "https://drive.google.com/drive/folders/1DfI4EwDUx4pNjWIeQz0SU_TITPy4PBMn?usp=drive_link" },
  { id: 2, name: "סדנה מתקדמת בתכנות", driveLink: "https://drive.google.com/drive/folders/1gW2LE8jD_Yhb9BNzdS583aonXdSGpOk_?usp=drive_link" },
  { id: 3, name: "מבני נתונים", driveLink: "https://drive.google.com/drive/folders/17Sv6VSK3HgaofeZ7Tl-FB3SbzLeoeCuU?usp=drive_link" },
  { id: 4, name: "מבוא למערכות מחשב", driveLink: "https://drive.google.com/drive/folders/19tlwYTe4Zllp8onApPhIi_4LKA72g1rp?usp=drive_link" },
  { id: 5, name: "מבוא למדעי המחשב", driveLink: "https://drive.google.com/drive/folders/1Cy-yEGmXx4u0PA2ejUZxQ33-pBzBQ6xn?usp=drive_link" },
  { id: 6, name: "בדידה 2", driveLink: "https://drive.google.com/drive/folders/1NquaLProAL_ewrNRx9ZJy13ysWBpQyLH?usp=drive_link" },
  { id: 7, name: "בדידה 1", driveLink: "https://drive.google.com/drive/folders/1XdBYqhLtbtflQU3fp-XlmEL9ajt9Hh1g?usp=drive_link" },
  { id: 8, name: "אלגברה לינארית 1", driveLink: "https://drive.google.com/drive/folders/1jP8H6qmem2HtKChLG7mUg6lQ0C1hcojW?usp=drive_link" },
  { id: 9, name: "אינפי 1", driveLink: "https://drive.google.com/drive/folders/1ViNjQEhT571efRNEpvS51xH0FZz8ABJa?usp=drive_link" },
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
<Card className="mb-4 bg-white border-blue-200">
  <div className="p-6 bg-blue-100">
    <div className="flex items-center gap-2 mb-4">
      <LinkIcon className="h-6 w-6 text-blue-600" />
      <h2 className="text-2xl font-semibold text-blue-950">קישורים שיכולים לעזור</h2>
    </div>
    <div className="grid gap-3">
      {helpfulLinks.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white hover:bg-blue-50 transition-all duration-300 border-blue-200 rounded-lg p-4 shadow-md hover:shadow-lg"
        >
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-md">
                <LinkIcon className="h-5 w-5 text-blue-800 shrink-0" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">{link.title}</h3>
                <p className="text-sm text-blue-700" dir="rtl">{link.description}</p>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>
</Card>


        {/* Courses Grid */}
<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 mb-4">
  {subjects.map((subject) => (
    <a
      key={subject.id}
      href={subject.driveLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-200 rounded-lg shadow-md hover:shadow-lg"
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded-md">
            <BookOpen className="h-5 w-5 text-blue-800 shrink-0" />
          </div>
          <h3 className="text-lg font-medium text-blue-900">{subject.name}</h3>
        </div>
      </div>
    </a>
  ))}
</div>


   

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