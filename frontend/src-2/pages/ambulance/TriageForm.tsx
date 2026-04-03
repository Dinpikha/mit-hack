import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Wind, 
  Stethoscope, 
  ClipboardList, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { TriageData } from '@/src/types';

interface TriageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TriageData) => void;
  initialData?: TriageData;
}

const TriageForm: React.FC<TriageFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [vitals, setVitals] = useState({
    heartRate: initialData?.vitals?.heartRate || '',
    bloodPressure: initialData?.vitals?.bloodPressure || '',
    spo2: initialData?.vitals?.spo2 || '',
    temp: initialData?.vitals?.temp || '',
    respiratoryRate: initialData?.vitals?.respiratoryRate || '',
  });

  const [gcs, setGcs] = useState(initialData?.gcs || 15);
  const [painScale, setPainScale] = useState(initialData?.painScale || 0);
  const [primaryAssessment, setPrimaryAssessment] = useState(initialData?.primaryAssessment || '');
  const [treatment, setTreatment] = useState(initialData?.treatmentAdministered?.join(', ') || '');
  const [priority, setPriority] = useState(initialData?.transportPriority || 'medium');
  const [hospital, setHospital] = useState(initialData?.destinationHospital || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: TriageData = {
      vitals: {
        heartRate: Number(vitals.heartRate) || undefined,
        bloodPressure: vitals.bloodPressure || undefined,
        spo2: Number(vitals.spo2) || undefined,
        temp: Number(vitals.temp) || undefined,
        respiratoryRate: Number(vitals.respiratoryRate) || undefined,
      },
      gcs,
      painScale,
      primaryAssessment,
      treatmentAdministered: treatment.split(',').map(t => t.trim()).filter(t => t !== ''),
      transportPriority: priority as any,
      destinationHospital: hospital,
      notes,
    };
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="p-6 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">On-Scene Triage Report</h2>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Arrival Documentation</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Vitals Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Patient Vital Signs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" /> Heart Rate (BPM)
                  </label>
                  <Input 
                    type="number" 
                    placeholder="72" 
                    value={vitals.heartRate}
                    onChange={e => setVitals({...vitals, heartRate: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-500" /> BP (mmHg)
                  </label>
                  <Input 
                    placeholder="120/80" 
                    value={vitals.bloodPressure}
                    onChange={e => setVitals({...vitals, bloodPressure: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-blue-400" /> SpO2 (%)
                  </label>
                  <Input 
                    type="number" 
                    placeholder="98" 
                    value={vitals.spo2}
                    onChange={e => setVitals({...vitals, spo2: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-orange-500" /> Temp (°C)
                  </label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="36.6" 
                    value={vitals.temp}
                    onChange={e => setVitals({...vitals, temp: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-slate-400" /> Resp Rate
                  </label>
                  <Input 
                    type="number" 
                    placeholder="16" 
                    value={vitals.respiratoryRate}
                    onChange={e => setVitals({...vitals, respiratoryRate: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Assessment Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Clinical Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Glasgow Coma Scale (3-15)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="3" 
                      max="15" 
                      value={gcs}
                      onChange={e => setGcs(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">{gcs}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Pain Scale (0-10)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={painScale}
                      onChange={e => setPainScale(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <span className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold">{painScale}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Primary Assessment (ABCDE)</label>
                <textarea 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                  placeholder="Airway clear, breathing labored, circulation stable..."
                  value={primaryAssessment}
                  onChange={e => setPrimaryAssessment(e.target.value)}
                />
              </div>
            </section>

            {/* Treatment & Transport */}
            <section className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Treatment & Transport
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Treatment Administered (comma separated)</label>
                  <Input 
                    placeholder="Oxygen, IV Fluids, Morphine..." 
                    value={treatment}
                    onChange={e => setTreatment(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Transport Priority</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high', 'critical'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p as any)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                            priority === p 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Destination Hospital</label>
                    <Input 
                      placeholder="City General Hospital" 
                      value={hospital}
                      onChange={e => setHospital(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Additional Notes</label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                    placeholder="Any other relevant observations..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </form>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12 font-bold">
              CANCEL
            </Button>
            <Button onClick={handleSubmit} className="flex-1 h-12 font-bold bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              SAVE REPORT
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TriageForm;
