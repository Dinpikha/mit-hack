import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { MapPin, Phone, Clock, ChevronLeft, Search, Hospital as HospitalIcon } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Hospitals: React.FC = () => {
  const navigate = useNavigate();
  const hospitals = [
    { id: 1, name: 'City General Hospital', address: '123 Medical Dr, Downtown', phone: '(555) 123-4567', type: 'Level 1 Trauma', status: 'Open 24/7', distance: '2.4km' },
    { id: 2, name: 'St. Mary Medical Center', address: '456 Wellness Ave, Northside', phone: '(555) 987-6543', type: 'Cardiac Care', status: 'Open 24/7', distance: '3.1km' },
    { id: 3, name: 'Children\'s Specialty', address: '789 Pediatric Ln, West End', phone: '(555) 456-7890', type: 'Pediatric', status: 'Open 24/7', distance: '5.8km' },
    { id: 4, name: 'Mercy Community Clinic', address: '321 Care St, Southside', phone: '(555) 222-3333', type: 'General Medicine', status: 'Closes at 8 PM', distance: '1.2km' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Network Hospitals</h1>
          <p className="text-slate-500">Find the nearest medical facilities in our network.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search hospitals..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hosp) => (
          <Card key={hosp.id} className="hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <HospitalIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-green-100 text-green-700 rounded">
                  {hosp.status}
                </span>
              </div>
              <CardTitle className="text-xl mt-4">{hosp.name}</CardTitle>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{hosp.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{hosp.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{hosp.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{hosp.distance} away</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">DIRECTIONS</Button>
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Hospitals;
