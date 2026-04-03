import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '@/src/context/RequestContext';
import { useAuth } from '@/src/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { History as HistoryIcon, ChevronLeft, MapPin, Calendar, Clock, CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { formatDateTime } from '@/src/utils/helpers';

const History: React.FC = () => {
  const { requests } = useRequests();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Filter completed or cancelled requests
  const historyRequests = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
          <HistoryIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Mission History</h1>
          <p className="text-slate-500 font-medium">Review your past emergency requests and missions</p>
        </div>
      </div>

      {historyRequests.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <HistoryIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No History Found</h3>
            <p className="text-slate-500 max-w-xs">You haven't completed any emergency missions or requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historyRequests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(profile?.role === 'user' ? `/track/${req.id}` : `/ambulance/task/${req.id}`)}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-2 bg-gradient-to-b ${req.status === 'completed' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'}`}></div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">{req.emergencyType}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(req.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Severity</p>
                          <p className={`text-sm font-black uppercase ${
                            req.severity === 'critical' ? 'text-red-600' : 'text-orange-500'
                          }`}>{req.severity}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          req.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {req.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium truncate">{req.location.address || 'Location Recorded'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Duration: 12 mins</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <HistoryIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">ID: {req.id}</span>
                      </div>
                    </div>

                    {req.triageData && (
                      <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Triage Report Filed</span>
                        </div>
                        <div className="flex gap-3 text-[10px] font-bold text-slate-500">
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-100">HR: {req.triageData.vitals.heartRate || '--'}</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-100">BP: {req.triageData.vitals.bloodPressure || '--'}</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-100">GCS: {req.triageData.gcs || '--'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
