import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Brain, AlertCircle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface AIRecommendationProps {
  recommendation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  onAccept: () => void;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({ recommendation, severity, onAccept }) => {
  const getSeverityStyle = () => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-100 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-50 border-blue-100 text-blue-800';
      default: return 'bg-green-50 border-green-100 text-green-800';
    }
  };

  return (
    <Card className={`border-2 shadow-xl overflow-hidden ${getSeverityStyle()}`}>
      <CardHeader className="bg-white/50 border-b border-inherit">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          AI Medical Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Severity Level: {severity}</p>
            <p className="text-xl font-bold leading-tight">
              {recommendation}
            </p>
          </div>
        </div>

        <div className="bg-white/40 p-4 rounded-xl space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Info className="w-4 h-4" />
            Why this recommendation?
          </h4>
          <p className="text-sm opacity-80 leading-relaxed">
            Based on the symptoms provided, our AI has identified potential risks that require immediate professional attention. An ambulance has been prioritized for your location.
          </p>
        </div>

        <Button onClick={onAccept} className="w-full py-8 text-xl font-bold bg-slate-900 hover:bg-black text-white">
          CONFIRM & REQUEST
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIRecommendation;
