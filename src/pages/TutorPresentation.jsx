import { ArrowRight, PlayCircle, UserCircle, LayoutDashboard, Upload, Coins, Clock, Sparkles, Zap, Shield, Lock, BarChart3, Percent, X } from 'lucide-react';
import { useState } from 'react';

// Image Modal Component
const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={onClose}>
      <button 
        className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>
      <img
        src={imageSrc}
        alt={imageAlt}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Clickable Image Component
const ClickableImage = ({ src, alt, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <img 
        src={src} 
        alt={alt}
        loading="lazy"
        className={`${className} cursor-pointer transition-transform hover:scale-[1.02]`}
        onClick={() => setIsModalOpen(true)}
        onError={(e) => {
          console.error(`Failed to load image: ${src}`);
          setHasError(true);
        }}
      />
      {hasError && (
        <div className="bg-red-100 text-red-600 p-4 rounded">
          Failed to load image: {src}
        </div>
      )}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={src}
        imageAlt={alt}
      />
    </>
  );
};

const FeatureSection = ({ title, description, imageDescription, mainImage, secondaryImage, icon: Icon, reverse }) => (
  <section className={`py-20 ${reverse ? 'bg-gray-100' : 'bg-white'}`}>
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-12">
          {/* Text Content - Centered below images */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-full bg-blue-100">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed">{description}</p>
        </div>
        {/* Images Section - Horizontal on desktop */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          {/* Main feature image */}
          <div className="w-full lg:w-1/2 rounded-xl shadow-lg overflow-hidden bg-white h-[300px] lg:h-[500px]">
            <ClickableImage 
              src={mainImage} 
              alt={imageDescription}
              className="w-full h-full object-contain p-2"
            />
          </div>
          {/* Secondary image */}
          {secondaryImage && (
            <div className="w-full lg:w-1/2 rounded-xl shadow-lg overflow-hidden bg-white h-[300px] lg:h-[500px]">
              <ClickableImage 
                src={secondaryImage.src} 
                alt={secondaryImage.description}
                className="w-full h-full object-contain p-2"
              />
            </div>
          )}
        </div>

      
      </div>
    </div>
  </section>
);

const PassiveIncomeCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 rounded-full bg-green-100">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function TutorPresentation() {
  const features = [
    {
      title: "העלאת תכנים קלה ומאובטחת",
      description: `העלה את התכנים שלך בביטחון מלא! הפלטפורמה שלנו משתמשת בתשתית Cloudflare המתקדמת, עם אבטחה ברמה הגבוהה ביותר להגנה על התכנים שלך. מערכת חכמה למניעת הורדות והעתקות, בדיוק כמו בפלטפורמות המובילות בעולם.`,
      imageDescription: "צילום מסך של מערכת האבטחה והגנת התוכן",
      mainImage: "/Pics/upload1.png",
      secondaryImage: {
        src: "/Pics/upload2.png",
        description: "ממשק העלאת קורסים פשוט ומאובטח"
      },
      icon: Shield
    },
    {
      title: "ניהול ואנליטיקס מתקדם",
      description: `קבל תמונה מלאה על הביצועים שלך עם דשבורד אנליטיקס חכם. עקוב אחר המכירות, הצפיות והרווחים שלך בזמן אמת. נהל את כל התכנים שלך במקום אחד, עם שליטה מלאה על המחירים והתכנים. שקיפות מלאה - 80% מהרווחים ישירות אליך!`,
      imageDescription: "צילום מסך של דשבורד האנליטיקס המתקדם",
      mainImage: "/Pics/dashboard1.png",
      secondaryImage: {
        src: "/Pics/dashboard4.png",
        description: "ניתוח מכירות ונתונים מפורטים"
      },
      icon: BarChart3
    },
    {
      title: "ניהול קורסים מתקדם",
      description: `נהל את הקורסים שלך בצורה חכמה ויעילה. ארגן את התכנים בצורה נוחה, הוסף מודולים ושיעורים בקלות, והגדר את המחירים בהתאם לערך שאתה מספק. המערכת מאפשרת לך לנהל מספר בלתי מוגבל של קורסים, עם אפשרויות מתקדמות לארגון וסידור התוכן.`,
      imageDescription: "ממשק ניהול הקורסים",
      mainImage: "/Pics/courses1.png",
      secondaryImage: {
        src: "/Pics/dashboard3.png",
        description: "ארגון ועריכת תכני הקורס"
      },
      icon: LayoutDashboard
    }
  ];

  const securityFeatures = [
    {
      icon: Lock,
      title: "אבטחה מתקדמת",
      description: "הגנה על התכנים שלך עם תשתית Cloudflare המובילה"
    },
    {
      icon: Shield,
      title: "הגנת תוכן",
      description: "מניעת הורדות והעתקות, בדיוק כמו בפלטפורמות המובילות"
    },
    {
      icon: Coins,
      title: "80% רווח למרצה",
      description: "מודל רווחים שקוף - 80% מהמכירות ישירות אליך"
    },
    {
      icon: BarChart3,
      title: "אנליטיקס מתקדם",
      description: "דשבורד מפורט לניהול וניתוח הביצועים שלך"
    }
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              הפוך את הידע שלך להכנסה פסיבית מאובטחת
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              פלטפורמה מאובטחת ומתקדמת להפצת קורסים, עם הגנת תוכן מקצועית ו-80% מהרווחים ישירות אליך
            </p>
            <div className="flex justify-center gap-6">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                הצטרף למרצים הנבחרים
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Hero Features - New Style */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
              {[
                {
                  icon: PlayCircle,
                  title: "פורמטים מגוונים",
                  description: "העלה וידאו, מצגות, PDF או כל תוכן לימודי אחר",
                  color: "from-blue-400 to-blue-600"
                },
                {
                  icon: UserCircle,
                  title: "קהילת לומדים",
                  description: "בנה קהילה סביב התכנים שלך עם פורומים ודיונים",
                  color: "from-purple-400 to-purple-600"
                },
                {
                  icon: Upload,
                  title: "העלאה פשוטה",
                  description: "ממשק העלאה אינטואיטיבי עם תמיכה בגרירת קבצים",
                  color: "from-green-400 to-green-600"
                },
                {
                  icon: Clock,
                  title: "גמישות מלאה",
                  description: "נהל את הזמן שלך בחופשיות, צור תוכן בקצב שלך",
                  color: "from-orange-400 to-orange-600"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} p-5 transform transition-transform group-hover:scale-110 shadow-lg`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Decorative Waves */}
            <div className="mt-16 relative h-24 overflow-hidden">
              <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="url(#gradient)" fillOpacity="0.1"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="0">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="50%" stopColor="#6366F1"/>
                    <stop offset="100%" stopColor="#8B5CF6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            אבטחה ושקיפות ברמה הגבוהה ביותר
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <FeatureSection key={index} {...feature} reverse={index % 2 === 1} />
      ))}

      {/* Benefits Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">יתרונות הפלטפורמה</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "80%", text: "מהרווחים ישירות אליך" },
              { number: "0", text: "דמי מנוי חודשיים" },
              { number: "24/7", text: "תמיכה טכנית זמינה" },
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300">
                <div className="text-5xl font-bold text-blue-600 mb-4">{benefit.number}</div>
                <div className="text-gray-600 text-xl">{benefit.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">מוכן להצטרף למרצים הנבחרים שלנו?</h2>
          <p className="text-xl text-blue-100 mb-8">
            הצטרף עכשיו והתחל ליצור הכנסה פסיבית מאובטחת מהידע שלך
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-50 transition-colors">
            צור קשר עכשיו
          </button>
        </div>
      </section>
    </div>
  );
} 