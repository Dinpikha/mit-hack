import React, { useState } from 'react';
import { useUser } from '@/src/context/UserContext';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { User, Shield, Heart, AlertCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { profile, updateProfile } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bloodGroup: profile?.medicalInfo?.bloodGroup || '',
    allergies: profile?.medicalInfo?.allergies || '',
    medications: profile?.medicalInfo?.medications || '',
    chronicConditions: profile?.medicalInfo?.chronicConditions || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: formData.displayName,
      medicalInfo: {
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        medications: formData.medications,
        chronicConditions: formData.chronicConditions,
      }
    });
    alert('Profile updated successfully!');
  };

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{profile.displayName}</h1>
            <p className="text-slate-500 capitalize">{profile.role} Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Heart className="w-5 h-5 text-red-500" />
                Emergency Medical Profile
              </CardTitle>
              <CardDescription>
                This information will be shared with ambulance crews during an emergency.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blood Group</label>
                  <select 
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allergies</label>
                <textarea 
                  className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="List any drug or food allergies..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Medications</label>
                <textarea 
                  className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="List any regular medications..."
                  value={formData.medications}
                  onChange={(e) => setFormData({...formData, medications: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chronic Conditions</label>
                <textarea 
                  className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Diabetes, Hypertension, etc..."
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({...formData, chronicConditions: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full py-6 text-lg font-bold">
            SAVE PROFILE
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
