import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

// Lazy loading des pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

// Pages étudiant
const EtudiantDashboard = lazy(() => import('./pages/dashboard/EtudiantDashboard'))
const ProfilPage = lazy(() => import('./pages/profil/ProfilPage'))
const SuggestionsPage = lazy(() => import('./pages/ia/SuggestionsPage'))
const NotesPage = lazy(() => import('./pages/notes/NotesPage'))
const ExercicesPage = lazy(() => import('./pages/exercices/ExercicesPage'))
const StatistiquesPage = lazy(() => import('./pages/statistiques/StatistiquesPage'))

// Pages professeur
const ProfesseurDashboard = lazy(() => import('./pages/dashboard/ProfesseurDashboard'))
const GestionEtudiantsPage = lazy(() => import('./pages/professeur/GestionEtudiantsPage'))
const SaisieNotesPage = lazy(() => import('./pages/professeur/SaisieNotesPage'))
const CreationExercicePage = lazy(() => import('./pages/professeur/CreationExercicePage'))

// Pages admin
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const GestionUtilisateursPage = lazy(() => import('./pages/admin/GestionUtilisateursPage'))
const GestionClassesPage = lazy(() => import('./pages/admin/GestionClassesPage'))
const GestionMatieresPage = lazy(() => import('./pages/admin/GestionMatieresPage'))
const LogsPage = lazy(() => import('./pages/admin/LogsPage'))
const RessourcesPage = lazy(() => import('./pages/admin/RessourcesPage'))
const ValidationsProfesseursPage = lazy(() => import('./pages/admin/ValidationsProfesseursPage'))

// Pages communes
const ParametresPage = lazy(() => import('./pages/parametres/ParametresPage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const CalendrierPage = lazy(() => import('./pages/calendrier/CalendrierPage'))
const ChatPage = lazy(() => import('./pages/chat/ChatPage'))

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-primary-600 font-medium">Chargement...</span>
      </div>
    </div>
  </div>
)

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ===== ROUTES PUBLIQUES ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== ROUTES PROTÉGÉES AVEC LAYOUT ===== */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Redirection par défaut */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard selon le rôle */}
          <Route path="dashboard" element={<RoleBasedDashboard />} />

          {/* ===== ROUTES COMMUNES À TOUS LES UTILISATEURS ===== */}
          <Route path="profil" element={<ProfilPage />} />
          <Route path="suggestions" element={<SuggestionsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="exercices" element={<ExercicesPage />} />
          <Route path="statistiques" element={<StatistiquesPage />} />
          <Route path="parametres" element={<ParametresPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="calendrier" element={<CalendrierPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="ressources" element={<RessourcesPage />} />

          {/* ===== ROUTES PROFESSEUR ===== */}
          <Route path="etudiants" element={
            <ProtectedRoute allowedRoles={['professeur', 'admin']}>
              <GestionEtudiantsPage />
            </ProtectedRoute>
          } />

          <Route path="notes/saisie" element={
            <ProtectedRoute allowedRoles={['professeur', 'admin']}>
              <SaisieNotesPage />
            </ProtectedRoute>
          } />

          <Route path="exercices/creation" element={
            <ProtectedRoute allowedRoles={['professeur', 'admin']}>
              <CreationExercicePage />
            </ProtectedRoute>
          } />

          {/* ===== ROUTES ADMIN ===== */}
          <Route path="utilisateurs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionUtilisateursPage />
            </ProtectedRoute>
          } />

          <Route path="classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionClassesPage />
            </ProtectedRoute>
          } />

          <Route path="matieres" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GestionMatieresPage />
            </ProtectedRoute>
          } />

          <Route path="logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LogsPage />
            </ProtectedRoute>
          } />

          <Route path="admin/validations" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ValidationsProfesseursPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* ===== ROUTE 404 ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
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

// Composant pour la page 404
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-100 to-secondary-200">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-secondary-800 mb-4">404</h1>
        <p className="text-xl text-secondary-600 mb-8">Page non trouvée</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  )
}

export default App