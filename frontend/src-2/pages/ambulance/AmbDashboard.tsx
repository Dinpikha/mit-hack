import React, { useState, useEffect } from 'react';
import { useRequests } from '@/src/context/RequestContext';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { MapPin, Phone, Activity, Navigation, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDateTime } from '@/src/utils/helpers';
import { useNavigate } from 'react-router-dom';

const AmbDashboard: React.FC = () => {
  const { requests, updateRequestStatus } = useRequests();
  const navigate = useNavigate();
  
  // Filter for pending requests
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeTask = requests.find(r => ['accepted', 'en-route', 'arrived'].includes(r.status));

  const handleAccept = async (id: string) => {
    await updateRequestStatus(id, 'accepted', { ambulanceId: 'AMB-001' });
    navigate(`/ambulance/task/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ambulance Dashboard</h1>
          <p className="text-slate-500">Vehicle ID: <span className="font-bold text-slate-700">AMB-001</span> • Status: <span className="text-green-600 font-bold">Available</span></p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">GPS Active</span>
          </div>
        </div>
      </div>

      {activeTask && (
        <Card className="mb-12 border-blue-200 bg-blue-50/30 overflow-hidden shadow-xl shadow-blue-50">
          <div className="bg-blue-600 px-6 py-3 text-white font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 animate-bounce" />
              CURRENT ACTIVE MISSION
            </div>
            <span className="text-xs bg-blue-500 px-2 py-1 rounded uppercase">{activeTask.status}</span>
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-100 rounded-2xl text-blue-600">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{activeTask.emergencyType}</h2>
                    <p className="text-slate-500 mt-1">Patient: {activeTask.userName} • {activeTask.userPhone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pickup Location</p>
                    <div className="flex items-center gap-3 text-slate-700">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <p className="font-medium">GPS Coordinates: {activeTask.location.latitude.toFixed(4)}, {activeTask.location.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Time</p>
                    <div className="flex items-center gap-3 text-slate-700">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <p className="font-medium">{formatDateTime(activeTask.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center gap-4">
                <Button onClick={() => navigate(`/ambulance/task/${activeTask.id}`)} className="w-full py-8 text-xl font-bold bg-blue-600 hover:bg-blue-700">
                  OPEN NAVIGATION
                </Button>
                <Button variant="outline" className="w-full py-4 border-slate-200">
                  CONTACT DISPATCH
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          Incoming Emergency Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              {pendingRequests.length} NEW
            </span>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Pending Requests</h3>
              <p className="text-slate-500">Stand by for incoming emergencies from your sector.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map(req => (
              <Card key={req.id} className="hover:shadow-lg transition-all border-blue-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      req.severity === 'critical' ? 'bg-blue-600 text-white' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {req.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{req.id}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{req.emergencyType}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">Sector 4, Main Street</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(req.createdAt)}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/ambulance/request/${req.id}`)} 
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold"
                    disabled={!!activeTask}
                  >
                    VIEW DETAILS
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbDashboard;
