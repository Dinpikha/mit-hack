import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '@/src/context/RequestContext';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { AlertTriangle, MapPin, Phone, ChevronLeft, Loader2, BrainCircuit, Mic, Users } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

import AILoading from '../ai/AILoading';
import AIRecommendation from '../ai/AIRecommendation';

const RequestForm: React.FC = () => {
  const [emergencyType, setEmergencyType] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [injuryType, setInjuryType] = useState('General');
  const [step, setStep] = useState<'form' | 'loading' | 'recommendation'>('form');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isRecording, setIsRecording] = useState(false);
  const [notifyFamily, setNotifyFamily] = useState(true);
  
  const { createRequest } = useRequests();
  const navigate = useNavigate();

  const injuryOptions = [
    'General Emergency',
    'Cardiac / Heart Attack',
    'Respiratory / Breathing Difficulty',
    'Trauma / Road Accident',
    'Neurological / Stroke',
    'Severe Bleeding',
    'Burn / Scald',
    'Fracture / Bone Injury',
    'Poisoning / Overdose',
    'Pregnancy / Labor',
    'Pediatric Emergency',
    'Seizure / Epilepsy',
    'Allergic Reaction / Anaphylaxis',
    'Other'
  ];

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Mock transcription after 3 seconds
      setTimeout(() => {
        setEmergencyType(prev => prev + (prev ? ' ' : '') + "Patient is having severe chest pain and difficulty breathing.");
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleAnalyze = async () => {
    if (!emergencyType) return;
    setStep('loading');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this emergency:
        Patient: ${age} year old ${gender}
        Injury Type: ${injuryType}
        Description: "${emergencyType}"
        
        Provide a severity level (low, medium, high, critical), immediate first aid advice, and the type of hospital specialist needed (e.g., Cardiologist, Trauma Surgeon, Neurologist).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
              advice: { type: Type.STRING },
              specialistNeeded: { type: Type.STRING },
              triageScore: { type: Type.NUMBER }
            },
            required: ['severity', 'advice', 'specialistNeeded']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setSeverity(data.severity);
      setAiRecommendation(`${data.advice}\n\nRecommended Specialist: ${data.specialistNeeded}`);
      setStep('recommendation');
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setSeverity('high');
      setAiRecommendation("Stay calm. Ensure the patient is breathing and keep them still until help arrives.");
      setStep('recommendation');
    }
  };

  const handleSubmit = async () => {
    // Get current location (mocked for now)
    let location = { latitude: 40.7128, longitude: -74.0060 }; 

    const requestId = await createRequest({
      emergencyType,
      patientAge: parseInt(age),
      patientGender: gender,
      injuryType,
      userPhone: phone,
      severity,
      location,
      aiRecommendation: aiRecommendation || undefined
    });
    
    if (requestId) {
      navigate(`/search?id=${requestId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (step === 'loading') return <AILoading onComplete={() => {}} />;
  
  if (step === 'recommendation' && aiRecommendation) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <AIRecommendation 
          recommendation={aiRecommendation} 
          severity={severity} 
          onAccept={handleSubmit} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <Card className="shadow-xl border-blue-100">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100">
          <CardTitle className="text-2xl flex items-center gap-2 text-blue-700">
            <AlertTriangle className="w-6 h-6" />
            Request Emergency Assistance
          </CardTitle>
          <CardDescription>
            Provide details about the emergency. AI will help triage and find the right specialist.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Patient Age</label>
                <Input 
                  type="number" 
                  placeholder="Age" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Patient Gender</label>
                <select 
                  className="w-full p-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Type of Injury / Condition</label>
              <select 
                className="w-full p-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={injuryType}
                onChange={(e) => setInjuryType(e.target.value)}
                required
              >
                {injuryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Describe the situation</label>
                <button 
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  {isRecording ? 'Recording...' : 'Voice Note'}
                </button>
              </div>
              <textarea 
                className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="E.g., Chest pain, car accident, heavy bleeding..."
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Your phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input 
                  type="checkbox" 
                  id="notifyFamily" 
                  checked={notifyFamily}
                  onChange={(e) => setNotifyFamily(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notifyFamily" className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4 text-blue-600" />
                  Notify Emergency Contacts
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-8 text-xl font-bold rounded-2xl shadow-lg shadow-blue-100 bg-blue-600 hover:bg-blue-700">
                <BrainCircuit className="w-6 h-6 mr-2" />
                START AI TRIAGE
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


export default RequestForm;
