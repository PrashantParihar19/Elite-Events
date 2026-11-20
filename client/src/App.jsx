import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent'; 
import OrganizerDashboard from './pages/OrganizerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ManageEvents from './pages/ManageEvents';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';
import ForgotPassword from './pages/ForgotPassword'; 
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard'; 
import AdminRoute from './components/AdminRoute'; 
import Profile from './pages/Profile';
import Scanner from './pages/Scanner';
import TicketDetail from './pages/TicketDetail';
import { Toaster } from 'react-hot-toast'; // 🎯 Import is here

console.log("Elite API URL Check:", import.meta.env.VITE_API_URL);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          
          {/* 🎯 THE TOASTER: Global configuration for the Elite Theme */}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#111827', // Dark gray
                color: '#EAB308',      // Elite Yellow
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '16px',
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              },
              success: {
                iconTheme: {
                  primary: '#EAB308',
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444', // Red for errors
                  secondary: '#000',
                },
              },
            }}
          />

          <div className="container mx-auto px-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" 
                element={
                  <ProtectedRoute organizerOnly={true}>
                    <OrganizerDashboard/>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/create" 
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                } 
              />

              <Route path="/manage-events" element={ <ProtectedRoute> <ManageEvents /> </ProtectedRoute>} />
              <Route path="/edit-event/:id" element={<ProtectedRoute> <EditEvent /> </ProtectedRoute>} />
              <Route path="/event/:id" element={<EventDetails />} />

              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route 
                path="/superadmin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route path="/profile" element={<Profile />} />
              <Route 
                  path="/scanner" 
                  element={
                    <ProtectedRoute organizerOnly={true}>
                      <Scanner />
                    </ProtectedRoute>
                  } 
              />
              <Route path="/my-tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />  
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;