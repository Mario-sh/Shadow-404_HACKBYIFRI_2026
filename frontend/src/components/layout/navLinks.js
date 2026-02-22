import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Bell,
    Settings,
    Users,
    FileCheck
} from 'lucide-react';

export const STUDENT_LINKS = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Mes Notes', path: '/student/grades', icon: ClipboardList },
    { name: 'Suggestions IA', path: '/student/suggestions', icon: BookOpen },
    { name: 'Notifications', path: '/student/notifications', icon: Bell },
    { name: 'Paramètres', path: '/student/settings', icon: Settings },
];

export const ADMIN_LINKS = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Étudiants', path: '/admin/students', icon: Users },
    { name: 'Gestion des Notes', path: '/admin/grades', icon: FileCheck },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
];
