import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmergencyRequest, RequestStatus } from '@/src/types';
import { useUser } from './UserContext';

import { useNotifications } from './NotificationContext';

interface RequestContextType {
  requests: EmergencyRequest[];
  activeRequest: EmergencyRequest | null;
  loading: boolean;
  createRequest: (data: Partial<EmergencyRequest>) => Promise<string | undefined>;
  updateRequestStatus: (id: string, status: RequestStatus, extra?: any) => Promise<void>;
  sendMessage: (requestId: string, text: string) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useUser();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRequests = localStorage.getItem('track_requests');
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem('track_requests', JSON.stringify(requests));
    }
  }, [requests]);

  const filteredRequests = profile 
    ? profile.role === 'user' 
      ? requests.filter(r => r.userId === profile.uid)
      : requests // For ambulance/admin, show all for now
    : [];

  const activeRequest = filteredRequests.find(r => r.status !== 'completed' && r.status !== 'cancelled') || null;

  const createRequest = async (data: Partial<EmergencyRequest>) => {
    if (!profile) return;
    const newRequest: EmergencyRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: profile.uid,
      userName: profile.displayName,
      userPhone: data.userPhone || '',
      location: data.location || { latitude: 0, longitude: 0 },
      emergencyType: data.emergencyType || 'General',
      severity: data.severity || 'medium',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      medicalInfo: profile.medicalInfo,
      messages: [],
      ...data
    };
    setRequests(prev => [newRequest, ...prev]);
    addNotification({
      title: 'Request Created',
      message: 'Your emergency request has been sent to dispatch.',
      type: 'success'
    });
    return newRequest.id;
  };

  const updateRequestStatus = async (id: string, status: RequestStatus, extra?: any) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status, updatedAt: Date.now(), ...extra } : r
    ));

    const req = requests.find(r => r.id === id);
    if (req) {
      addNotification({
        title: 'Status Updated',
        message: `Request for ${req.emergencyType} is now ${status}.`,
        type: status === 'completed' ? 'success' : 'info'
      });
    }
  };

  const sendMessage = async (requestId: string, text: string) => {
    if (!profile) return;
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: profile.uid,
      text,
      timestamp: Date.now(),
    };
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, messages: [...(r.messages || []), newMessage] } : r
    ));
  };

  return (
    <RequestContext.Provider value={{ requests: filteredRequests, activeRequest, loading, createRequest, updateRequestStatus, sendMessage }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
