import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STUDENT_LINKS, ADMIN_LINKS } from './navLinks';
import clsx from 'clsx';
import { LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    // Définit les liens a afficher selon le rôle
    const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

    return (
        <>
            {/* Overlay Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col h-screen",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center justify-center px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-primary-600 tracking-tight">E-Suivi</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                    <div className="mb-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Menu Principal
                    </div>
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)} // Ferme sur mobile
                            className={({ isActive }) =>
                                clsx(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary-50 text-primary-700"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )
                            }
                        >
                            <link.icon className={clsx(
                                "mr-3 flex-shrink-0 h-5 w-5",
                                // Si on veut colorier l'icone différemment quand c'est actif
                            )}
                                aria-hidden="true"
                            />
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Profil Section Bas de page */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center">
                        <div>
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                {user?.username || 'Utilisateur'}
                            </p>
                            <button
                                onClick={logout}
                                className="text-xs font-medium text-red-600 hover:text-red-500 flex items-center mt-1"
                            >
                                <LogOut className="w-3 h-3 mr-1" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
