import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '@/src/context/RequestContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { MapPin, Phone, Activity, Clock, ChevronLeft, AlertCircle, Shield } from 'lucide-react';
import { formatDateTime } from '@/src/utils/helpers';

const RequestDetails: React.FC = () => {
  const { id } = useParams();
  const { requests, updateRequestStatus } = useRequests();
  const navigate = useNavigate();
  const request = requests.find(r => r.id === id);

  if (!request) return <div>Request not found</div>;

  const handleAccept = async () => {
    await updateRequestStatus(request.id, 'accepted', { ambulanceId: 'AMB-001' });
    navigate(`/ambulance/task/${request.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{request.emergencyType}</h1>
            <p className="text-slate-500">Request ID: {request.id} • {formatDateTime(request.createdAt)}</p>
          </div>
          <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${
            request.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'
          }`}>
            {request.severity} Severity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Location & Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-48 bg-slate-100 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/loc/800/400')] bg-cover opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Patient Name</p>
                  <p className="font-bold text-slate-900">{request.userName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Contact Number</p>
                  <p className="font-bold text-slate-900">{request.userPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Age / Gender</p>
                  <p className="font-bold text-slate-900">{request.patientAge}y / {request.patientGender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">Injury Type</p>
                  <p className="font-bold text-slate-900">{request.injuryType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-blue-600 text-white border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Mission Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-100">Accept this mission to begin navigation to the patient's location.</p>
                <Button onClick={handleAccept} className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-6">
                  ACCEPT MISSION
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Dispatch
                </Button>
                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50">
                  Decline Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
