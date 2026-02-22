import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ allowedRoles }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, loading } = useAuth();

    // Afficher un état de chargement initial si nécessaire
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    // Rediriger vers login si non connecté
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Protéger la route par rôle (Optionnel si on veut forcer admin/student)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Si l'utilisateur n'a pas le droit d'être ici, redirige-le vers son dashboard par défaut
        const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
