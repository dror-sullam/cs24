import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';
import useAuth from '../hooks/useAuth';
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentButton({ videoId, courseName, tutorName, totalPrice, className }) {
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const backgroundConfig = {
    backgroundColor: '#4f46e5', // Main background color
    patternColor: '%23ffffff',  // Pattern color (URL encoded)
    shadowColor: 'rgba(55, 48, 163, 0.8)' // Shadow color
  };

  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const answerVariants = {
    expanded: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] } },
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] } }
  };
  const questions = [
    {
      id: 1,
      question: "איך מתבצעת הרכישה באתר?",
      answer: "פשוט מאוד – בוחרים קורס, לוחצים על כפתור הרכישה וממלאים פרטי תשלום מאובטחים. תוך רגע תקבלו גישה מלאה לקורס באזור האישי שלכם באתר או בדף הקורסים הכללי"
    },
    {
      id: 2,
      question: "האם הרכישה באתר מאובטחת?",
      answer: "בוודאי. אנחנו משתמשים בפרוטוקול אבטחה מתקדם (SSL) ובשירות סליקה מאובטח ברמה הגבוהה ביותר. המידע שלך לא נשמר אצלנו ולא נחשף לאף גורם אחר"
    },
    {
      id: 3,
      question: "מה עושים אם יש תקלה או בעיה בגישה?",
      answer: "יש לנו צוות תמיכה שזמין עבורך! ניתן לפנות ל-cs24.hit@gmail.com ואנו נחזור אליך בהקדם האפשרי כדי לפתור את בעיה"
    },
    {
      id: 4,
      question: "אם אני מחליף מחשב או נכנס מהטלפון – הגישה עדיין נשמרת?",
      answer: "כן. הקורסים זמינים מכל מכשיר – מחשב, טלפון או טאבלט. הקורס זמין לצפייה עד 3 מכשירים שונים, במידה ועברת את המכסה, נוכל להגדיל במקרה הצורך"
    }
  ];
  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prevExpanded) => {
      // If the clicked topic is already the one expanded, collapse it.
      if (prevExpanded.length === 1 && prevExpanded[0] === questionId) {
        return [];
      } else {
        // Otherwise, expand the clicked topic (and implicitly collapse any other).
        return [questionId];
      }
    });
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      showNotification('יש לאשר את תנאי השימוש כדי להמשיך', 'error');
      return;
    }

    setLoading(true);

    // 1. ensure we're logged in
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !session) {
      showNotification('יש להתחבר כדי לבצע רכישה', 'error');
      setLoading(false);
      return;
    }

    // 2. build the success URL
    const successUrl = `${window.location.origin}/thank-you?videoId=${videoId}&courseName=${encodeURIComponent(courseName || '')}`;

    try {
      // 3. invoke the Edge Function using direct fetch for better error handling
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: `order_${Date.now()}`,
          successUrl,
          userUid: session.user.id,
          videoId: Number(videoId),
          displayType: 'Iframe',
          couponCode: couponCode.trim() || null
        })
      });

      const data = await response.json();

      // Handle non-2xx status codes
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if the response contains an error
      if (data?.error) {
        throw new Error(data.error);
      }

      // 4. show payment iframe
      if (data.url) {
        setPaymentUrl(data.url);
      } else {
        showNotification('לא הצלחנו להגיע לעמוד התשלום, נסה שוב', 'error');
      }
    } catch (error) {
      const errMsg = error?.message || error?.error || "שגיאה כללית, נסה שוב";
      const translatedError = (() => {
        if (errMsg.includes("קוד הקופון שגוי")) return "קוד הקופון שגוי או לא קיים";
        if (errMsg.includes("פג תוקף")) return "הקופון פג תוקף";
        if (errMsg.includes("Missing required fields")) return "משהו חסר בבקשה, נסה שוב";
        if (errMsg.includes("Video not found")) return "לא נמצא הקורס";
        if (errMsg.includes("Could not fetch user")) return "יש להתחבר כדי לבצע רכישה";
        if (errMsg.includes("DB insert failed")) return "לא הצלחנו לשמור את ההזמנה";
        if (errMsg.includes("Takbull error")) return "שגיאה במערכת התשלומים, נסה שוב";
        if (errMsg.includes("בעיה בעת בדיקת הקופון")) return "בעיה כלשהי עם הקופון. נסה שוב";
        return errMsg;
      })();
      showNotification(translatedError, 'error');
    } finally {
      setLoading(false);
    }
  };

  const closePayment = () => {
    setPaymentUrl(null);
  };

  return (
    <>
      <div className="space-y-4">
        <button 
          onClick={handlePayment} 
          disabled={loading || !termsAccepted}
          className={`w-full bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>טוען...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>רכוש קורס</span>
            </>
          )}
        </button>

        {/* Coupon Code Input */}
        <div>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="הכנס קוד קופון (אופציונלי)"
            className="w-full px-4 py-2 transition border-2 border-gray-400 rounded-lg focus:border-indigo-500  outline-none"
          />
        </div>
        
        {/* Terms of Service Checkbox */}
        <div className="flex justify-center items-center gap-3 lg:gap-1">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="accent-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            אני מסכים ל
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700 ml-1">
              תנאי השימוש
            </a>
            <br className="block sm:hidden" />
            ול
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700">
              מדיניות הפרטיות
            </a>
          </label>
        </div>
      </div>

      {paymentUrl && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="flex-1 flex flex-col px-10 py-10 lg:px-20 lg:py-10 overflow-y-auto h-full gap-8">

            {/* Back Button */}

            <button
              onClick={closePayment}
              className="py-1 pl-4 pr-2 gap-1 rounded-full inline-flex justify-center items-center bg-indigo-700 hover:bg-indigo-800 text-white transition-colors w-fit"
            >
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              ביטול
            </button>

            {/* Payment iframe */}

            <iframe
              src={paymentUrl}
              className="shrink-0 w-full h-[755px] md:h-[551px] lg:h-[717px] rounded-lg outline outline-8 outline-indigo-600"
              allow="payment"
            />

            {/* Order Details - Mobile */}

            <div className="flex flex-col lg:hidden">
              <div className="flex flex-col gap-6 justify-center items-center bg-white pt-6 pb-6 px-12 rounded-t-lg border-2 border-gray-200">
                <h2 className="text-2xl font-bold">פרטי ההזמנה:</h2>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">מייל:</label>
                  <input 
                    type="text" 
                    value={user?.email || ''} 
                    className="text-lg border-2 border-gray-200 bg-gray-100 outline-none rounded-lg px-2 py-1 text-gray-600"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">שם הקורס:</label>
                  <input 
                    type="text" 
                    value={courseName || ''} 
                    className="text-lg border-2 border-gray-200 bg-gray-100 outline-none rounded-lg px-2 py-1 text-gray-600"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">שם המרצה:</label>
                  <input 
                    type="text" 
                    value={tutorName || ''} 
                    className="text-lg border-2 border-gray-200 bg-gray-100 outline-none rounded-lg px-2 py-1 text-gray-600"
                    readOnly
                  />
                </div>
                <img src="/secure-payment-banner.webp" className="w-48" />
              </div>
              <div className="bg-amber-400 px-12 py-4 text-white font-bold rounded-b-lg">
                <h2 className="text-amber-800 text-xl">סך הכל: ₪{totalPrice}</h2>
              </div>
            </div>

            {/* Q&A  - Mobile */}

            <div className="lg:hidden">
                <div className="bg-white rounded-lg border-2 border-gray-200 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-3">
                    <h2 className="text-lg font-semibold">
                      שאלות ותשובות
                    </h2>
                  </div>
                  
                  <div className="flex-1 min-h-0 max-h-96 overflow-y-auto overflow-x-hidden">
                    {questions.map((question) => {
                      const isExpanded = expandedQuestions.includes(question.id);
                          return (
                            <div key={question.id}>
                              {/* Title Header */}
                              <div
                                className={`p-4 border-t-2 cursor-pointer ${
                                  isExpanded ? 'bg-white' : ''
                                }`}
                                onClick={() => toggleQuestion(question.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg
                                      className={`w-4 h-4 text-gray-400 ml-2 transform transition-transform scale-x-[-1] ${
                                        isExpanded ? '-rotate-90' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div>
                                      <h3 className="font-medium text-gray-900">{question.question}</h3>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Answers */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="answer"
                                    variants={answerVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div className="bg-gray-50">
                                      <div className="p-4 border-t-2 border-gray-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center flex-1">
                                            <div className="flex-1">
                                              <p className="text-sm text-gray-500">{question.answer}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                </div>
              </div>
          </div>
          <div className="flex-1 h-full flex-col items-center hidden overflow-y-auto lg:flex gap-10" style={{
            backgroundColor: backgroundConfig.backgroundColor,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='110' height='110' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${backgroundConfig.patternColor}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            boxShadow: `inset -20px 0 40px ${backgroundConfig.shadowColor}`
          }}>


            {/* Order Details - Desktop */}

            <div className="flex flex-col">
              <div className="flex flex-col gap-6 justify-center items-center bg-white mt-16 pt-6 pb-6 px-12 rounded-t-lg shadow-lg">
                <h2 className="text-2xl font-bold">פרטי ההזמנה:</h2>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">מייל:</label>
                  <input 
                    type="text" 
                    value={user?.email || ''} 
                    className="text-lg border-2 border-gray-200 bg-gray-100 outline-none rounded-lg px-2 py-1 text-gray-600"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">שם הקורס:</label>
                  <input 
                    type="text" 
                    value={courseName || ''} 
                    className="text-lg border-2 border-gray-200 bg-gray-100 outline-none rounded-lg px-2 py-1 text-gray-600"
                    readOnly
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-lg font-medium">שם המרצה:</label>
                  <input 
                    type="text" 
                    value={tutorName || ''} 
                    className="text-lg border-2 border-gray-200 bg-gray-100 outline-none rounded-lg px-2 py-1 text-gray-600"
                    readOnly
                  />
                </div>
                <img src="/secure-payment-banner.webp" className="w-48" />
              </div>
              <div className="bg-amber-400 px-12 py-4 text-white font-bold rounded-b-lg">
                <h2 className="text-amber-800 text-xl">סך הכל: ₪{totalPrice}</h2>
              </div>
            </div>

            {/* Q&A - Desktop */}

            <div className="w-[351px] mb-16">
                <div className="bg-white rounded-lg border-2 border-gray-200 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-3">
                    <h2 className="text-lg font-semibold">
                      שאלות ותשובות
                    </h2>
                  </div>
                  
                  <div className="flex-1 min-h-0 max-h-96 overflow-y-auto overflow-x-hidden">
                    {questions.map((question) => {
                      const isExpanded = expandedQuestions.includes(question.id);
                          return (
                            <div key={question.id}>
                              {/* Title Header */}
                              <div
                                className={`p-4 border-t-2 cursor-pointer ${
                                  isExpanded ? 'bg-white' : ''
                                }`}
                                onClick={() => toggleQuestion(question.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg
                                      className={`w-4 h-4 text-gray-400 ml-2 transform transition-transform scale-x-[-1] ${
                                        isExpanded ? '-rotate-90' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div>
                                      <h3 className="font-medium text-gray-900">{question.question}</h3>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Answers */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="answer"
                                    variants={answerVariants}
                                    initial="collapsed"
                                    animate="expanded"
                                    exit="collapsed"
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div className="bg-gray-50">
                                      <div className="p-4 border-t-2 border-gray-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center flex-1">
                                            <div className="flex-1">
                                              <p className="text-sm text-gray-500">{question.answer}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                </div>
              </div>
          </div>
        </div>
      )}
    </>
  );
} 