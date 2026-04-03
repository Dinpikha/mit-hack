import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/src/context/UserContext';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { UserRole } from '@/src/types';
import { Activity, Navigation } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, role);
    navigate(role === 'user' ? '/dashboard' : '/ambulance/dashboard');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Map Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/loginmap/1200/800')] bg-cover opacity-20 grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-slate-900/20"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-none bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pt-8">
          <div className="flex items-center justify-center">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-200">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">TRACK</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Emergency Dispatch & Tracking System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === 'user' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Activity className="w-6 h-6" />
                  <span className="text-sm font-bold">Citizen</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('ambulance')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === 'ambulance' 
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' 
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Navigation className="w-6 h-6" />
                  <span className="text-sm font-bold">Ambulance</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-xl">
              SIGN IN
            </Button>
            <p className="text-center text-xs text-slate-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
