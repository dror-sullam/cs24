import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const AdminPanel = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Loaded requests:', data); // Debug log
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('שגיאה בטעינת הבקשות');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tutor_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      // If approved, create a new tutor entry
      if (newStatus === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: tutorError } = await supabase
            .from('tutors')
            .insert([{
              name: request.name,
              phone: request.phone,
              subjects: request.subjects,
              degree: request.degree
            }]);

          if (tutorError) throw tutorError;
        }
      }

      loadRequests();
      alert(newStatus === 'approved' ? 'הבקשה אושרה בהצלחה' : 'הבקשה נדחתה');
    } catch (error) {
      console.error('Error updating request:', error);
      alert('שגיאה בעדכון הבקשה');
    }
  };

  // Check if user is admin
  const adminEmail = process.env.NODE_ENV === 'development'
    ? 'selerbi3@gmail.com'
    : process.env.REACT_APP_ADMIN_EMAIL;
    
  const isAdmin = user?.email === adminEmail;

  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="mb-8 max-h-[600px] flex flex-col">
      <CardHeader className="border-b sticky top-0 bg-white z-10">
        <CardTitle className="text-2xl">ניהול בקשות מורים</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-500">אין בקשות חדשות</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{request.name}</h3>
                    <p className="text-sm text-gray-600">{request.phone}</p>
                    <p className="text-sm text-gray-600">
                      {request.degree === 'cs' ? 'מדעי המחשב' : 'הנדסת חשמל'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleStatusChange(request.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(request.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    >
                      {expandedRequest === request.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {expandedRequest === request.id && (
                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="text-sm font-medium">שנים:</p>
                      <p className="text-sm text-gray-600">{request.years.join(', ')}</p>
                    </div>
                    {request.specialization && (
                      <div>
                        <p className="text-sm font-medium">התמחות:</p>
                        <p className="text-sm text-gray-600">{request.specialization}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">קורסים:</p>
                      <p className="text-sm text-gray-600">{request.subjects.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">סטטוס:</p>
                      <p className={`text-sm ${
                        request.status === 'approved' ? 'text-green-600' :
                        request.status === 'rejected' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {request.status === 'approved' ? 'מאושר' :
                         request.status === 'rejected' ? 'נדחה' :
                         'ממתין לאישור'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">תאריך הגשה:</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">אימייל:</p>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPanel; 