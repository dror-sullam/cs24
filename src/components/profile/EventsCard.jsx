import { Calendar } from "lucide-react";

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

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
};

const UpcomingEvents = ({
  styles,
  events
}) => {
  return (
    <section
      className={`py-8 ${events.length === 0 ? "hidden" : ""}`} dir="rtl"
    >
      <div className="flex items-center gap-3 border-b pb-6 md:mb-4 mb-0">
        <Calendar className={`h-6 w-6 ${styles.iconColor}`} />
        <h2 className={`text-2xl font-bold ${styles.textColor}`}>אירועים קרובים</h2>
      </div>

      <div className="flex flex-row md:flex-row gap-6">
        <div className="w-full md:w-full mt-6 md:mt-0">
          <h3 className={`text-lg font-bold mb-4 mr-2 ${styles.textColor}`}></h3>
          <div className={`grid grid-cols-1 gap-4 overflow-y-auto pr-1 ${events.length > 3 ? "max-h-96" : ""}`}>
            {events.map((event) => {
              const startDate = formatDate(event.startDate || event.start_date);
              const endDate = formatDate(event.endDate || event.end_date);
              
              if (!startDate) {
                return null; // Skip rendering events with invalid dates
              }

              const startDay = startDate.getDate();
              const endDay = endDate ? endDate.getDate() : null;
              const startMonth = startDate.toLocaleDateString("he-IL", { month: "short" });
              const endMonth = endDate ? endDate.toLocaleDateString("he-IL", { month: "short" }) : null;
              const isMultiDay = endDate && endDate.getTime() !== startDate.getTime();

              return (
                <div
                  key={event.id}
                  className="flex items-stretch bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all relative"
                >
                  <div className={`${styles.eventBg} text-white flex flex-col items-center justify-center w-20 flex-shrink-0 px-2`}>
                    <div className="text-xl font-bold">
                      {isMultiDay ? `${startDay}-${endDay}` : startDay}
                    </div>
                    <div className="text-sm">
                      {isMultiDay && endMonth !== startMonth 
                        ? `${startMonth}-${endMonth}`
                        : startMonth}
                    </div>
                    {event.event_link && (
                      <a 
                        href={event.event_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-4 text-sm bg-white text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        הרשמה
                      </a>
                    )}
                  </div>

                  <div className="flex-1 p-4 mb-6 text-right w-[90%]">
                    <h4 className="font-bold text-lg mb-1">{event.title}</h4>

                    <div className="text-right md:pr-2 pr-4 md:pl-6 pl-2 w-[90%]">
                      {event.location && (
                        <div className="text-sm text-gray-600 mb-1">מיקום: {event.location}</div>
                      )}

                      {event.description && (
                        <p className="text-sm text-gray-700 text-wrap break-words whitespace-normal">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-gray-600 flex items-center justify-end gap-1 absolute bottom-2 left-4">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatTime(event.endTime || event.end_time)} - {formatTime(event.startTime || event.start_time)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;