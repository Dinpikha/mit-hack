import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { ChevronLeft, Heart, Zap, Wind, Droplets, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const FirstAid: React.FC = () => {
  const navigate = useNavigate();
  const guides = [
    { title: 'CPR (Adult)', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', steps: ['Check the scene', 'Call 911', 'Check for breathing', 'Push hard, push fast (100-120 bpm)'] },
    { title: 'Choking', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-50', steps: ['5 back blows', '5 abdominal thrusts', 'Repeat until object is forced out'] },
    { title: 'Severe Bleeding', icon: Droplets, color: 'text-red-600', bg: 'bg-red-50', steps: ['Apply direct pressure', 'Do not remove soaked bandages', 'Apply a tourniquet if necessary'] },
    { title: 'Seizures', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', steps: ['Clear the area', 'Do not restrain', 'Time the seizure', 'Turn on side after it stops'] },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          First Aid Guide
        </h1>
        <p className="text-slate-500 mt-2">Essential steps to take while waiting for professional help.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, i) => (
          <Card key={i} className="overflow-hidden border-slate-200">
            <CardHeader className={`${guide.bg} border-b border-slate-100`}>
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <guide.icon className={`w-6 h-6 ${guide.color}`} />
                {guide.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                {guide.steps.map((step, si) => (
                  <li key={si} className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                      {si + 1}
                    </span>
                    <p className="text-sm text-slate-700 font-medium">{step}</p>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6">
                READ FULL GUIDE
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-slate-900 text-white border-none">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 bg-red-500/20 rounded-2xl text-red-500">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">Emergency? Don't wait.</h3>
            <p className="text-slate-400">If someone is in immediate danger, call emergency services or request an ambulance through the app dashboard immediately.</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            GO TO DASHBOARD
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstAid;
