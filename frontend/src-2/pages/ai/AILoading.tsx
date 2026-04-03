import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Brain, Shield, Zap } from 'lucide-react';

interface AILoadingProps {
  onComplete?: () => void;
}

const AILoading: React.FC<AILoadingProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-8">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="w-32 h-32 rounded-full border-4 border-blue-100 border-t-blue-600"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">AI Triage Analysis</h2>
        <p className="text-slate-500 max-w-xs mx-auto">
          Our AI is analyzing your symptoms and location to prioritize your request...
        </p>
      </div>

      <div className="flex gap-4">
        {[
          { icon: Shield, label: 'Secure' },
          { icon: Zap, label: 'Fast' },
          { icon: Activity, label: 'Smart' }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AILoading;
