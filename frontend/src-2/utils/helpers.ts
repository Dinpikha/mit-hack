import { format } from 'date-fns';

export const formatDateTime = (timestamp: number) => {
  return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(2);
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-700 bg-red-100 border-red-200';
    case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
    case 'medium': return 'text-blue-700 bg-blue-100 border-blue-200';
    case 'low': return 'text-green-700 bg-green-100 border-green-200';
    default: return 'text-slate-700 bg-slate-100 border-slate-200';
  }
};
