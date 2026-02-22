import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ setIsSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Menu Hamburger pour mobile */}
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
            >
                <span className="sr-only">Ouvrir le menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator pour Desktop */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-between">
                <div className="flex flex-1">
                    {/* Espace vide ou recherche */}
                </div>

                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications Button */}
                    <Link
                        to={user?.role === 'admin' ? '/admin/notifications' : '/student/notifications'}
                        className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative"
                    >
                        <span className="sr-only">Voir les notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                    </Link>

                    {/* User Info pour bureau */}
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                    <div className="flex items-center gap-x-4">
                        <span className="text-sm font-semibold leading-6 text-gray-900">
                            {user?.role === 'admin' ? 'Espace Administration' : 'Espace Étudiant'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
