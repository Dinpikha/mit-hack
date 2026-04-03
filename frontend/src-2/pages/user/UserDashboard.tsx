import React, { useState } from 'react';
import { useRequests } from '@/src/context/RequestContext';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Activity, MapPin, Phone, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime, getSeverityColor } from '@/src/utils/helpers';

const UserDashboard: React.FC = () => {
  const { requests, activeRequest } = useRequests();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Emergency Dashboard</h1>
          <p className="text-slate-500">Get immediate assistance or track your active requests.</p>
        </div>
        {!activeRequest && (
          <Link to="/request">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-2 text-xl font-bold transition-all hover:scale-105">
              <Activity className="w-6 h-6" />
              REQUEST AMBULANCE
            </Button>
          </Link>
        )}
      </div>

      {activeRequest && (
        <Card className="mb-8 border-blue-200 bg-blue-50/30 overflow-hidden">
          <div className="bg-blue-600 px-6 py-2 text-white text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            ACTIVE EMERGENCY REQUEST
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{activeRequest.emergencyType}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${getSeverityColor(activeRequest.severity)}`}>
                      {activeRequest.severity} Severity
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location set via GPS</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Requested {formatDateTime(activeRequest.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <Link to={`/track/${activeRequest.id}`} className="w-full">
                  <Button className="w-full py-6 text-lg font-bold">
                    TRACK AMBULANCE
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-xs text-slate-500">
                  Status: <span className="font-bold text-blue-600 uppercase">{activeRequest.status}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent History
          </h2>
          {requests.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No emergency requests found in your history.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <Card key={req.id} className="hover:border-slate-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(req.severity)}`}>
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{req.emergencyType}</h4>
                        <p className="text-xs text-slate-500">{formatDateTime(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-blue-600 text-white border-none shadow-lg shadow-blue-100">
              <CardContent className="p-6">
                <Phone className="w-8 h-8 mb-4" />
                <h3 className="font-bold text-lg mb-1">Call Emergency Services</h3>
                <p className="text-blue-100 text-sm mb-4">Direct line to local dispatch center</p>
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  DIAL 911
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              <Link to="/first-aid">
                <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-bold text-slate-900">First Aid</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/hospitals">
                <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-bold text-slate-900">Hospitals</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/contacts">
                <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-bold text-slate-900">Contacts</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/settings">
                <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-bold text-slate-900">Settings</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
