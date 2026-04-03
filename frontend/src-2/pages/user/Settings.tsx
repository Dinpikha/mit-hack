import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { ChevronLeft, Bell, Shield, Eye, Smartphone, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/src/context/UserContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const sections = [
    { title: 'Notifications', icon: Bell, items: ['Push Notifications', 'SMS Alerts', 'Email Updates'] },
    { title: 'Privacy & Security', icon: Shield, items: ['Location Permissions', 'Data Sharing', 'Change Password'] },
    { title: 'App Preferences', icon: Smartphone, items: ['Language', 'Dark Mode', 'Units (km/miles)'] },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card key={i} className="border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-wider">
                <section.icon className="w-4 h-4 text-blue-600" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {section.items.map((item, ii) => (
                  <button key={ii} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{item}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button 
          variant="outline" 
          className="w-full py-6 text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-bold flex items-center gap-2"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut className="w-5 h-5" />
          SIGN OUT
        </Button>
      </div>
    </div>
  );
};

export default Settings;
