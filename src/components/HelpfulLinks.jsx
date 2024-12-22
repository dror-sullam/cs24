import React, { useState } from 'react';
import { Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card'

const HelpfulLinksSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  
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
    //{
      //title: "חומרים בטלגרם",
      //description: "ניתן למצוא חומרים בלינק ועוד על ידי חיפוש שם המשתמש הבא בטלגרם:  @Hithelpbot(יוצר האתר לא קשור לניהול הטלגרם)",
      //url: "https://t.me/+1afwRPetXHA0NGFk"
    //},
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
  
  return (
    <Card className="mb-4 bg-white border-blue-200">
      <div className="p-6 bg-blue-100">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 "
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-blue-950">קישורים שיכולים לעזור</h2>
          </div>
          {isOpen ? <ChevronUp className="h-6 w-6 text-blue-600" /> : <ChevronDown className="h-6 w-6 text-blue-600" />}
        </button>
        
        {isOpen && (
          <div className="grid gap-3 mt-4">
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
        )}
      </div>
    </Card>
  );
};

export default HelpfulLinksSection;