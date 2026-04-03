import React from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { ChevronLeft, Bell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const notifications = [
    { id: 1, title: 'Ambulance Arrived', message: 'AMB-001 has arrived at your location.', time: '2 hours ago', type: 'success', icon: CheckCircle },
    { id: 2, title: 'Severe Weather Alert', message: 'Heavy rain expected in your area. Drive safely.', time: '5 hours ago', type: 'warning', icon: AlertTriangle },
    { id: 3, title: 'Profile Updated', message: 'Your medical profile has been successfully updated.', time: '1 day ago', type: 'info', icon: Info },
    { id: 4, title: 'Emergency Contact Added', message: 'Michael Smith was added as an emergency contact.', time: '2 days ago', type: 'info', icon: Info },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Notifications
        </h1>
        <Button variant="ghost" className="text-slate-500 hover:text-red-600 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Clear All
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id} className="border-slate-200 hover:border-blue-100 transition-colors cursor-pointer">
            <CardContent className="p-4 flex gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${
                notif.type === 'success' ? 'bg-green-100 text-green-600' :
                notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <notif.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-600">{notif.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
