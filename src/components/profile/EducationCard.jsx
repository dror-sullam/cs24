import { GraduationCap, Calendar, BookOpen } from "lucide-react"

const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (e) {
    return null;
  }
};

export default function EducationCard({ tutor, styles }) {
  if (!tutor || !tutor.education || tutor.education.length === 0) return null;
  
  const average =
    tutor.grades?.length > 0
      ? (
          tutor.grades.reduce((sum, g) => sum + Number(g.grade), 0) /
          tutor.grades.length
        ).toFixed(1)
      : "N/A";

  return (
    <section className="py-8  -mb-12" dir="rtl">
      <div className="w-full">
        <div className="flex items-center gap-3 border-b pb-6 mb-8">
          <GraduationCap className={`h-6 w-6 ${styles.iconColor}`} />
          <h2 className={`text-2xl font-bold ${styles.textColor}`}>השכלה</h2>
        </div>

        <div className="mb-8">
          {tutor.education[0] && (
            <div className={`${styles.subjectBg} p-4 rounded-lg`}>
              <div className="flex flex-row justify-between items-start gap-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{tutor.education[0].degree_name}</h3>
                  <div className="flex items-center mt-1 text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2 ml-2" />
                    <span className="mb-1">{tutor.education[0].academy_name}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 shrink-0 pt-8 pl-2">
                  <Calendar className={`h-4 w-4 mr-2 ml-2 ${styles.iconColor}`} />
                  <span>
                    {(() => {
                      const startDate = formatDate(tutor.education[0].startDate || tutor.education[0].start_date);
                      const endDate = formatDate(tutor.education[0].endDate || tutor.education[0].end_date);
                      
                      if (!startDate || !endDate) return "תאריך לא זמין";
                      
                      return `${endDate.getFullYear()} — ${startDate.getFullYear()}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {tutor.grades && tutor.grades.length > 0 && (
            <>
              <div className="relative overflow-x-auto mt-4">
                <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                  <table className="w-full text-right border-collapse">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className={`border-b ${styles.cardBorder}`}>
                        <th className={`px-4 py-3 text-sm font-bold ${styles.textColor} bg-white`}>מקצוע</th>
                        <th className={`px-4 py-3 text-sm font-bold ${styles.textColor} bg-white`}>שנה</th>
                        <th className={`px-5 py-3 text-sm font-bold ${styles.textColor} bg-white`}>ציון</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutor.grades.map((grade, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? styles.bgLight : ""}`}>
                          <td className={`px-4 py-3 text-sm text-right ${styles.textColor}`}>{grade.course_name}</td>
                          <td className={`px-6 py-3 text-sm text-right  ${styles.textColor}`}>{grade.year}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-bold ${styles.textSecondary}`}>
                              {grade.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm">
                <div className={`flex items-center gap-1 text-lg ${styles.textColor}`}>
                  <span className="font-bold">ממוצע:</span> {average}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
