import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentGrades from './pages/student/StudentGrades';
import AISuggestions from './pages/student/AISuggestions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminGradesValidation from './pages/admin/AdminGradesValidation';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';

// Removed placeholder AdminStudents

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Espace Étudiant - Protégé */}
          <Route path="/student" element={<MainLayout allowedRoles={['etudiant']} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="suggestions" element={<AISuggestions />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Espace Administrateur/Professeur - Protégé */}
          <Route path="/admin" element={<MainLayout allowedRoles={['admin', 'professeur']} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="grades" element={<AdminGradesValidation />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
            <div className="flex h-screen items-center justify-center flex-col">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="text-gray-500 mt-2">Page non trouvée</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
