import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { RequestProvider } from './context/RequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Splash from './pages/auth/Splash';
import UserDashboard from './pages/user/UserDashboard';
import RequestForm from './pages/user/RequestForm';
import TrackingView from './pages/user/TrackingView';
import AmbulanceSearch from './pages/user/AmbulanceSearch';
import AmbDashboard from './pages/ambulance/AmbDashboard';
import RequestDetails from './pages/ambulance/RequestDetails';
import EnRoute from './pages/ambulance/EnRoute';
import Profile from './pages/user/Profile';
import Hospitals from './pages/user/Hospitals';
import FirstAid from './pages/user/FirstAid';
import EmergencyContacts from './pages/user/EmergencyContacts';
import Settings from './pages/user/Settings';
import Notifications from './pages/user/Notifications';
import History from './pages/common/History';

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <RequestProvider>
          <Router>
            <div className="min-h-screen bg-slate-50">
              <Navbar />
              <div className="flex">
                <Sidebar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/splash" element={<Splash />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Common Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/history" element={<History />} />
                    </Route>
                    
                    {/* User Routes */}
                    <Route element={<ProtectedRoute role="user" />}>
                      <Route path="/dashboard" element={<UserDashboard />} />
                      <Route path="/request" element={<RequestForm />} />
                      <Route path="/search" element={<AmbulanceSearch />} />
                      <Route path="/track/:id" element={<TrackingView />} />
                      <Route path="/hospitals" element={<Hospitals />} />
                      <Route path="/first-aid" element={<FirstAid />} />
                      <Route path="/contacts" element={<EmergencyContacts />} />
                    </Route>

                    {/* Ambulance Routes */}
                    <Route element={<ProtectedRoute role="ambulance" />}>
                      <Route path="/ambulance/dashboard" element={<AmbDashboard />} />
                      <Route path="/ambulance/request/:id" element={<RequestDetails />} />
                      <Route path="/ambulance/task/:id" element={<EnRoute />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/splash" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </RequestProvider>
      </NotificationProvider>
    </UserProvider>
  );
}
