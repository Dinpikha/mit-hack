import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRequests } from '@/src/context/RequestContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { MapPin, Navigation, Clock, Activity, Phone, ChevronLeft, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '@/src/utils/helpers';

import Chat from '@/src/components/Chat';

const TrackingView: React.FC = () => {
  const { id } = useParams();
  const { requests } = useRequests();
  const navigate = useNavigate();
  const request = requests.find(r => r.id === id);

  if (!request) return <div>Request not found</div>;

  const steps = [
    { label: 'Request Received', status: 'completed', icon: Clock },
    { label: 'Ambulance Assigned', status: ['accepted', 'en-route', 'arrived', 'completed'].includes(request.status) ? 'completed' : 'pending', icon: ShieldCheck },
    { label: 'En Route', status: ['en-route', 'arrived', 'completed'].includes(request.status) ? 'completed' : 'pending', icon: Navigation },
    { label: 'Arrived', status: ['arrived', 'completed'].includes(request.status) ? 'completed' : 'pending', icon: MapPin },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-blue-100 shadow-xl shadow-blue-50">
            <div className="h-80 bg-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/trackmap/1000/600')] bg-cover opacity-60 grayscale"></div>
              
              {/* Animated Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 100 300 Q 250 150 400 200 T 700 100" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
              </svg>

              {/* Ambulance Marker */}
              <div className="absolute top-[200px] left-[400px] transition-all duration-1000">
                <div className="relative">
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
                  <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-blue-600 z-10 relative">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-[10px] font-bold whitespace-nowrap">
                    AMBULANCE AMB-001
                  </div>
                </div>
              </div>

              {/* User Marker */}
              <div className="absolute top-[100px] left-[700px]">
                <div className="w-8 h-8 bg-slate-900 rounded-full shadow-xl flex items-center justify-center border-2 border-white">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Tracking Ambulance</h2>
                  <p className="text-slate-500">Estimated arrival: <span className="text-blue-600 font-bold">4-6 minutes</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-lg font-bold text-blue-600 uppercase">{request.status}</p>
                </div>
              </div>

              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.status === 'completed' 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase text-center max-w-[60px] ${
                      step.status === 'completed' ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Chat requestId={request.id} />
        </div>

        <div className="space-y-6">
          <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Live Vitals Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-900">78</span>
                    <span className="text-[10px] font-bold text-slate-400 mb-1">BPM</span>
                  </div>
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: ['40%', '60%', '40%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full bg-red-500"
                    />
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">SpO2</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-900">98</span>
                    <span className="text-[10px] font-bold text-slate-400 mb-1">%</span>
                  </div>
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[98%]"></div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-medium italic">
                Syncing with emergency medical devices...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ambulance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">AMB-001</p>
                  <p className="text-xs text-slate-500">Advanced Life Support Unit</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Driver
                </Button>
                <Button variant="secondary" className="w-full">
                  Share Live Location
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">While you wait...</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Stay on the line if possible
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Clear a path for the ambulance
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Gather patient's medications
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackingView;
