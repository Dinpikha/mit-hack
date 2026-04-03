import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';
import { ChevronLeft, Users, Plus, Phone, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useNavigate } from 'react-router-dom';

const EmergencyContacts: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Sarah Johnson', relation: 'Spouse', phone: '(555) 123-4567' },
    { id: 2, name: 'Michael Smith', relation: 'Father', phone: '(555) 987-6543' },
  ]);

  const removeContact = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Emergency Contacts
          </h1>
          <p className="text-slate-500 mt-2">These people will be notified automatically in case of an emergency.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          ADD NEW
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id} className="border-slate-200 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{contact.name}</h3>
                    <p className="text-xs text-slate-500">{contact.relation}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeContact(contact.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone className="w-4 h-4 text-blue-600" />
                  {contact.phone}
                </div>
                <Button variant="outline" size="sm">EDIT</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {contacts.length === 0 && (
          <Card className="md:col-span-2 border-dashed border-2 bg-slate-50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500">No emergency contacts added yet.</p>
              <Button variant="link" className="text-blue-600 font-bold mt-2">Add your first contact</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="mt-12 border-blue-100 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
          <CardDescription>
            When you request an ambulance, we'll send an automated SMS alert to your emergency contacts with your live location and status.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default EmergencyContacts;
