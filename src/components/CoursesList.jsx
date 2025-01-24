import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const yearOneCourses = [
    { id: 1, name: "תכנות מונחה עצמים", driveLink: "https://drive.google.com/drive/folders/1DfI4EwDUx4pNjWIeQz0SU_TITPy4PBMn?usp=drive_link" },
    { id: 2, name: "סדנה מתקדמת בתכנות", driveLink: "https://drive.google.com/drive/folders/1gW2LE8jD_Yhb9BNzdS583aonXdSGpOk_?usp=drive_link" },
    { id: 3, name: "מבני נתונים", driveLink: "https://drive.google.com/drive/folders/17Sv6VSK3HgaofeZ7Tl-FB3SbzLeoeCuU?usp=drive_link" },
    { id: 4, name: "מבוא למערכות מחשב", driveLink: "https://drive.google.com/drive/folders/19tlwYTe4Zllp8onApPhIi_4LKA72g1rp?usp=drive_link" },
    { id: 5, name: "מבוא למדעי המחשב", driveLink: "https://drive.google.com/drive/folders/1Cy-yEGmXx4u0PA2ejUZxQ33-pBzBQ6xn?usp=drive_link" },
    { id: 6, name: "בדידה 2", driveLink: "https://drive.google.com/drive/folders/1NquaLProAL_ewrNRx9ZJy13ysWBpQyLH?usp=drive_link" },
    { id: 7, name: "בדידה 1", driveLink: "https://drive.google.com/drive/folders/1XdBYqhLtbtflQU3fp-XlmEL9ajt9Hh1g?usp=drive_link" },
    { id: 8, name: "אלגברה לינארית 1", driveLink: "https://drive.google.com/drive/folders/1jP8H6qmem2HtKChLG7mUg6lQ0C1hcojW?usp=drive_link" },
    { id: 9, name: "אינפי 1", driveLink: "https://drive.google.com/drive/folders/1ViNjQEhT571efRNEpvS51xH0FZz8ABJa?usp=drive_link" },
]; 

const yearTwoCourses = [
  { id: 10, name: "רשתות תקשורת מחשבים", driveLink: "https://drive.google.com/drive/folders/1YSnDxrx-nV7U5CodB21-yUpZMvZjyCDP?usp=share_link" },
  { id: 11, name: "מבוא למדעי הנתונים", driveLink: "https://drive.google.com/drive/folders/158eBODzY05k568sBR9dpMLbClGOL9ApT?usp=share_link" },
  { id: 12, name: "הסתברות", driveLink: "https://drive.google.com/drive/folders/1Nnnun-DJtFXBgrmQtLjhAe0ymLMVfE00?usp=sharing" },
  { id: 13, name: "אלגוריתמים 1", driveLink: "https://drive.google.com/drive/folders/17RoVASkatTiZ7zi3ndTO-2re2k7jgbWX?usp=share_link" },
  { id: 14, name: "אלגברה 2", driveLink: "https://drive.google.com/drive/folders/18gC5jhaB0QOFBMdQTNsja2kD1re-0CV7?usp=share_link" },
  { id: 15, name: "אינפי 2", driveLink: "https://drive.google.com/drive/folders/10r1SxcljTerC4JjeStG_WDpAa71FrNIE?usp=share_link" },
  { id: 16, name: "למידת מכונה", driveLink: "https://drive.google.com/drive/folders/1tK0A1K4iTJAAdDdmvurhi8LT8ulFGZkn?usp=share_link" },
  { id: 17, name: "הנדסת תוכנה", driveLink: "https://drive.google.com/drive/folders/10b0Jv8IdFOqGftwe0dtJ7K4lCrS_FRTF?usp=share_link" },
  { id: 18, name: "מערכות בסיסי נתונים", driveLink: "https://drive.google.com/drive/folders/1af6AZiAjVhAz--66Rix01xGk5ItTDKVW?usp=share_link" },
  { id: 19, name: "מערכות הפעלה", driveLink: "https://drive.google.com/drive/folders/1qnu2ZhfhX2wYc-mCwQCAaVFx9zvbXP9O?usp=share_link" },
  { id: 20, name: "אלגוריתמים 2", driveLink: "https://drive.google.com/drive/folders/1ME21TQUflIfQR93COVr0BKGtHHy5hpy2?usp=share_link" },
];


const yearThreeCourses = [
  
  { id: 21, name: "אוטומטים ושפות פורמליות", driveLink: "https://drive.google.com/drive/folders/1HHv_5NGFKITUMbLM8INccG3jzz2cCmFS?usp=sharing" }
];

const YearSection = ({ title, courses }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-800 text-white p-4 rounded-lg flex justify-between items-center hover:bg-blue-700 transition-colors"
      >
        <span className="text-xl font-bold">{title}</span>
        {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
      </button>
      
      {isOpen && (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 mt-2">
          {courses.map((course) => (
            <a
              key={course.id}
              href={course.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white hover:bg-blue-50 transition-all duration-300 border border-blue-200 rounded-lg shadow-md hover:shadow-lg"
            >
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-md">
                    <BookOpen className="h-5 w-5 text-blue-800 shrink-0" />
                  </div>
                  <h3 className="text-lg font-medium text-blue-900">{course.name}</h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const CoursesList = () => {
  return (
    <div className="mb-8">
      <YearSection title="שנה א׳" courses={yearOneCourses} />
      <YearSection title="שנה ב׳" courses={yearTwoCourses} />
      <YearSection title="שנה ג׳" courses={yearThreeCourses} />
    </div>
  );
};

export default CoursesList;