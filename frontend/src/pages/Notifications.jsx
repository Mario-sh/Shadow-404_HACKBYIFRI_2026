import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, Check, Clock, Trash2, Info } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
        } catch (error) {
            console.error("Erreur notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/marquer_lu/`);
            setNotifications(notifications.map(n =>
                n.id_notification === id ? { ...n, lu: true } : n
            ));
            toast.success("Notification marquée comme lue");
        } catch (error) {
            toast.error("Échec de l'opération");
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}/`);
            setNotifications(notifications.filter(n => n.id_notification !== id));
            toast.success("Notification supprimée");
        } catch (error) {
            toast.error("Échec de la suppression");
        }
    };

    if (loading) return <div className="mt-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-primary-600" />
                    Votre Centre de Notifications
                </h1>
                <span className="text-sm text-gray-500">{notifications.filter(n => !n.lu).length} non lues</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id_notification}
                                className={`p-4 md:p-6 transition-colors flex gap-4 ${notif.lu ? 'bg-white' : 'bg-primary-50/50'}`}
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.lu ? 'bg-gray-100 text-gray-500' : 'bg-primary-100 text-primary-600'}`}>
                                    <Info className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className={`text-sm md:text-base font-bold truncate ${notif.lu ? 'text-gray-600' : 'text-gray-900'}`}>
                                            {notif.titre}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400 whitespace-nowrap">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notif.date_creation).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className={`text-sm mt-1 leading-relaxed ${notif.lu ? 'text-gray-500' : 'text-gray-700'}`}>
                                        {notif.message}
                                    </p>

                                    <div className="mt-4 flex gap-3">
                                        {!notif.lu && (
                                            <button
                                                onClick={() => markAsRead(notif.id_notification)}
                                                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                            >
                                                <Check className="w-3 h-3" /> Marquer comme lu
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif.id_notification)}
                                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <p>Vous n'avez aucune notification pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
