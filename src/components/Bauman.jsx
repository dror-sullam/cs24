import React, { useState } from 'react';
import { Shield, Users, Tag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const SubscriptionCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mt-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-lg cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-blue-900 flex items-center justify-center gap-2">
          מנוי שנתי לפלטפורמת דני באומן
        </CardTitle>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Military Subscription */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-700" />
                  <h3 className="font-semibold text-blue-800">משרתי מילואים</h3>
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-3">₪49</p>
              </div>
              <a
                href="https://bit.ly/hitbaumannidf"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="הרשמה למשרתי מילואים - מחיר מיוחד 49 שקלים"
                onClick={(e) => e.stopPropagation()}
              >
                הרשמה למשרתי מילואים
              </a>
            </div>
            
            {/* Students Subscription */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-700" />
                  <h3 className="font-semibold text-blue-800">שאר הסטודנטים</h3>
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-3">₪149</p>
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Tag className="h-4 w-4" />
                    <span>קוד קופון: </span>
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono">Hit2025</code>
                    <span>+ 6 ספרות ת.ז אחרונות</span>
                  </div>
                </div>
              </div>
              <a
                href="https://baumann.co.il/#choose-university"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="הרשמה לסטודנטים - מחיר 149 שקלים"
                onClick={(e) => e.stopPropagation()}
              >
                הרשמה לסטודנטים
              </a>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubscriptionCard;
