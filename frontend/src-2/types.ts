export type UserRole = 'user' | 'ambulance' | 'admin';
export type RequestStatus = 'pending' | 'accepted' | 'en-route' | 'arrived' | 'completed' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  ambulanceId?: string;
  createdAt: number;
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string;
    medications?: string;
    chronicConditions?: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  emergencyType: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  injuryType?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: RequestStatus;
  ambulanceId?: string;
  ambulanceLocation?: {
    latitude: number;
    longitude: number;
  };
  aiRecommendation?: string;
  medicalInfo?: UserProfile['medicalInfo'];
  messages?: ChatMessage[];
  triageData?: TriageData;
  createdAt: number;
  updatedAt: number;
}

export interface TriageData {
  vitals: {
    heartRate?: number;
    bloodPressure?: string;
    spo2?: number;
    temp?: number;
    respiratoryRate?: number;
  };
  gcs?: number;
  painScale?: number;
  primaryAssessment?: string;
  treatmentAdministered?: string[];
  transportPriority?: 'low' | 'medium' | 'high' | 'critical';
  destinationHospital?: string;
  notes?: string;
}

export interface Ambulance {
  id: string;
  driverName: string;
  vehicleNumber: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: number;
}
