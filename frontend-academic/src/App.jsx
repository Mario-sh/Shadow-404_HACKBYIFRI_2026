import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './hooks/useAuth'  // IMPORT IMPORTANT !

// Pages d'authentification
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Pages étudiant
import EtudiantDashboard from './pages/dashboard/EtudiantDashboard'
import ProfilPage from './pages/profil/ProfilPage'
import SuggestionsPage from './pages/ia/SuggestionsPage'
import NotesPage from './pages/notes/NotesPage'
import ExercicesPage from './pages/exercices/ExercicesPage'
import StatistiquesPage from './pages/statistiques/StatistiquesPage'

// Pages professeur
import ProfesseurDashboard from './pages/dashboard/ProfesseurDashboard'

// Pages admin
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ParametresPage from './pages/parametres/ParametresPage'


function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées avec layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="parametres" element={<ParametresPage />} />


        {/* Dashboard selon le rôle */}
        <Route path="dashboard" element={<RoleBasedDashboard />} />

        {/* Routes communes */}
        <Route path="profil" element={<ProfilPage />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="exercices" element={<ExercicesPage />} />
        <Route path="statistiques" element={<StatistiquesPage />} />

        {/* Routes professeur (en construction) */}
        <Route path="etudiants" element={
          <ProtectedRoute allowedRoles={['professeur', 'admin']}>
            <ConstructionPage title="Gestion des étudiants" />
          </ProtectedRoute>
        } />

        {/* Routes admin (en construction) */}
        <Route path="utilisateurs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ConstructionPage title="Gestion des utilisateurs" />
          </ProtectedRoute>
        } />
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// Composant pour le dashboard selon le rôle
const RoleBasedDashboard = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'professeur':
      return <ProfesseurDashboard />
    default:
      return <EtudiantDashboard />
  }
}

// Page de construction
const ConstructionPage = ({ title }) => (
  <div className="p-12 text-center">
    <div className="bg-yellow-50 inline-flex p-4 rounded-full mb-4">
      <svg className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-secondary-800 mb-2">{title}</h2>
    <p className="text-secondary-600">Cette page est en cours de développement.</p>
  </div>
)

// Page 404
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-100 to-secondary-200">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-secondary-800 mb-4">404</h1>
      <p className="text-xl text-secondary-600 mb-8">Page non trouvée</p>
      <a href="/" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
        Retour à l'accueil
      </a>
    </div>
  </div>
)

export default App