import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { showNotification } from '../components/ui/notification';
import useAuth from '../hooks/useAuth';

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

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert('יש לאשר את תנאי השימוש כדי להמשיך');
      return;
    }

    setLoading(true);

    // 1. ensure we're logged in
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !session) {
      alert('יש להתחבר כדי לבצע רכישה');
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
          <div className="w-full max-w-3xl mx-20">
            {/* <button 
              onClick={closePayment}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button> */}
            <iframe 
              src={paymentUrl}
              className="w-full h-[551px] rounded-lg outline outline-8 outline-indigo-600"
              allow="payment"
            />
          </div>
          <div className="flex-1 h-full justify-center items-center hidden lg:flex" style={{
            backgroundColor: backgroundConfig.backgroundColor,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='110' height='110' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${backgroundConfig.patternColor}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            boxShadow: `inset -20px 0 40px ${backgroundConfig.shadowColor}`
          }}>
            <div className="flex flex-col">
              <div className="flex flex-col gap-6 justify-center items-center bg-white pt-12 pb-6 px-12 rounded-t-lg shadow-lg">
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
          </div>
        </div>
      )}
    </>
  );
} 