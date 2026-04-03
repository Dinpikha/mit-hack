import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '@/src/context/RequestContext';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { MapPin, Phone, Activity, Navigation, CheckCircle, Clock, ChevronLeft, AlertTriangle, ClipboardList, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '@/src/utils/helpers';
import TriageForm from './TriageForm';
import { TriageData } from '@/src/types';

import Chat from '@/src/components/Chat';

const EnRoute: React.FC = () => {
  const { id } = useParams();
  const { requests, updateRequestStatus } = useRequests();
  const navigate = useNavigate();
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const request = requests.find(r => r.id === id);

  if (!request) return <div>Request not found</div>;

  const handleUpdateStatus = async (status: any) => {
    await updateRequestStatus(request.id, status);
    if (status === 'completed') {
      navigate('/ambulance/dashboard');
    }
  };

  const handleSaveTriage = async (data: TriageData) => {
    await updateRequestStatus(request.id, request.status, { triageData: data });
    setIsTriageOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/ambulance/dashboard')} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-blue-200 shadow-xl">
            <div className="h-64 bg-slate-200 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/800/400')] bg-cover opacity-50 grayscale"></div>
              <div className="relative z-10 text-center p-6 bg-white/90 rounded-2xl shadow-xl border border-white backdrop-blur-sm">
                <Navigation className="w-12 h-12 text-blue-600 mx-auto mb-2 animate-pulse" />
                <h3 className="text-xl font-bold text-slate-900">Navigation Active</h3>
                <p className="text-slate-500 text-sm">Estimated arrival: 4 mins</p>
              </div>
              {/* Mock Ambulance Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white">
                  <Navigation className="w-5 h-5 rotate-45" />
                </div>
              </div>
              {/* Mock Destination Marker */}
              <div className="absolute top-1/4 right-1/4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">{request.emergencyType}</h2>
                  <p className="text-slate-500 font-medium">Patient: {request.userName}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  request.status === 'en-route' ? 'bg-blue-100 text-blue-700' : 
                  request.status === 'arrived' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {request.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Distance</p>
                  <p className="text-2xl font-black text-slate-900">1.2 km</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-2xl font-black text-slate-900">4 mins</p>
                </div>
              </div>

              <div className="space-y-4">
                {request.status === 'accepted' && (
                  <Button onClick={() => handleUpdateStatus('en-route')} className="w-full py-8 text-xl font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg shadow-blue-100">
                    START NAVIGATION
                  </Button>
                )}
                {request.status === 'en-route' && (
                  <Button onClick={() => handleUpdateStatus('arrived')} className="w-full py-8 text-xl font-bold bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-lg shadow-orange-100">
                    MARK AS ARRIVED
                  </Button>
                )}
                {request.status === 'arrived' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={() => setIsTriageOpen(true)} variant="outline" className="py-8 text-lg font-bold rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                      <ClipboardList className="w-6 h-6 mr-2" />
                      {request.triageData ? 'EDIT TRIAGE' : 'START TRIAGE'}
                    </Button>
                    <Button onClick={() => handleUpdateStatus('completed')} className="py-8 text-lg font-bold bg-green-600 hover:bg-green-700 rounded-2xl shadow-lg shadow-green-100">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      COMPLETE MISSION
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Chat requestId={request.id} />
        </div>

        <div className="space-y-6">
          {request.triageData && (
            <Card className="border-green-100 bg-green-50/30">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4" />
                  Triage Report Filed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded border border-green-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">HR</p>
                    <p className="font-bold">{request.triageData.vitals.heartRate || '--'} BPM</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-green-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">BP</p>
                    <p className="font-bold">{request.triageData.vitals.bloodPressure || '--'}</p>
                  </div>
                </div>
                <Button variant="link" onClick={() => setIsTriageOpen(true)} className="w-full text-xs text-green-700 font-bold mt-2 h-auto p-0">
                  VIEW FULL REPORT
                </Button>
              </CardContent>
            </Card>
          )}

          {request.medicalInfo && (
            <Card className="border-blue-100">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Patient Medical Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Blood Group</p>
                    <p className="text-sm font-bold text-red-600">{request.medicalInfo.bloodGroup || 'Unknown'}</p>
                  </div>
                </div>
                {request.medicalInfo.allergies && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Allergies</p>
                    <p className="text-sm text-slate-700">{request.medicalInfo.allergies}</p>
                  </div>
                )}
                {request.medicalInfo.chronicConditions && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Conditions</p>
                    <p className="text-sm text-slate-700">{request.medicalInfo.chronicConditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{request.userName}</p>
                  <p className="text-xs text-slate-500">{request.patientAge}y / {request.patientGender} • {request.injuryType}</p>
                  <p className="text-xs text-slate-500">{request.userPhone}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Patient
              </Button>
            </CardContent>
          </Card>

          {request.aiRecommendation && (
            <Card className="bg-red-50 border-red-100">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  AI Triage Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 leading-relaxed italic">
                  "{request.aiRecommendation}"
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Nearby Hospitals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'City General Hospital', dist: '2.4km', time: '8 min', type: 'Level 1 Trauma' },
                  { name: 'St. Mary Medical Center', dist: '3.1km', time: '12 min', type: 'Cardiac Care' },
                  { name: 'Children\'s Specialty', dist: '5.8km', time: '18 min', type: 'Pediatric' },
                ].map((hosp, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600">{hosp.name}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{hosp.dist}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">{hosp.type}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {hosp.time}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600">
                        SELECT
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <TriageForm 
        isOpen={isTriageOpen} 
        onClose={() => setIsTriageOpen(false)} 
        onSave={handleSaveTriage}
        initialData={request.triageData}
      />
    </div>
  );
};

export default EnRoute;
