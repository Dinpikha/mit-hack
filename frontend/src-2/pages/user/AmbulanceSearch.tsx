import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, MapPin, Navigation, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/Card';

const AmbulanceSearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'searching' | 'connecting' | 'found'>('searching');
  const requestId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const searchTimer = setTimeout(() => setStatus('connecting'), 3000);
    const foundTimer = setTimeout(() => setStatus('found'), 6000);
    const redirectTimer = setTimeout(() => {
      if (requestId) {
        navigate(`/track/${requestId}`);
      } else {
        navigate('/dashboard');
      }
    }, 8500);

    return () => {
      clearTimeout(searchTimer);
      clearTimeout(foundTimer);
      redirectTimer && clearTimeout(redirectTimer);
    };
  }, [navigate, requestId]);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Map Background (Mock) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/darkmap/1200/800')] bg-cover opacity-30 grayscale invert"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900/90"></div>
        
        {/* Pulsing Radar Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            className="w-40 h-40 border-2 border-blue-500/30 rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
            className="w-40 h-40 border-2 border-blue-500/30 rounded-full"
          />
        </div>

        {/* Mock Ambulance Icons Moving */}
        <AnimatePresence>
          {status === 'searching' && (
            <>
              <motion.div 
                initial={{ x: -100, y: -100, opacity: 0 }}
                animate={{ x: 50, y: 50, opacity: 1 }}
                className="absolute top-1/4 left-1/4"
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
              </motion.div>
              <motion.div 
                initial={{ x: 200, y: 200, opacity: 0 }}
                animate={{ x: -50, y: -50, opacity: 1 }}
                className="absolute bottom-1/4 right-1/4"
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8 max-w-md w-full"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/40 flex items-center justify-center mx-auto mb-6">
              {status === 'found' ? (
                <ShieldCheck className="w-12 h-12 text-white" />
              ) : (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              )}
            </div>
            {status !== 'found' && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border-2 border-dashed border-blue-500/30 rounded-full"
              />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {status === 'searching' && "Searching for Help..."}
              {status === 'connecting' && "Connecting to Driver..."}
              {status === 'found' && "Ambulance Found!"}
            </h2>
            <p className="text-slate-400 text-lg">
              {status === 'searching' && "Locating nearest available ambulance units"}
              {status === 'connecting' && "Assigning AMB-001 to your location"}
              {status === 'found' && "Driver is preparing for immediate dispatch"}
            </p>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-white font-bold">Emergency Protocol Active</p>
                  <p className="text-slate-400 text-sm">Stay calm. Help is on the way.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Info Bar */}
      <div className="relative z-10 p-8 bg-slate-900/80 backdrop-blur-md border-t border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-sm font-medium uppercase tracking-wider">Live Dispatch Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span className="text-white font-bold">GPS: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceSearch;
