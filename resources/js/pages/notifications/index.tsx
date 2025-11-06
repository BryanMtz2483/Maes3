import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InstagramNav from '@/components/social/instagram-nav';
import { Card } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { Bell, BellOff, Heart, MessageCircle, Bookmark, User, Trash2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface Notification {
    id: number;
    type: string;
    message: string;
    data: {
        node_id?: string;
        node_title?: string;
        node_cover?: string;
        roadmap_id?: string;
        roadmap_name?: string;
        roadmap_cover?: string;
        comment_id?: string;
        comment_text?: string;
        commenter_name?: string;
        created_at?: string;
    };
    read: boolean;
    read_at?: string;
    created_at: string;
}

interface NotificationsProps {
    notifications?: Notification[];
}

export default function NotificationsIndex({ notifications: initialNotifications = [] }: NotificationsProps) {
    const { auth } = usePage().props as any;
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications.data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await axios.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearReadNotifications = async () => {
        try {
            await axios.delete('/notifications/clear-read');
            setNotifications(notifications.filter(n => !n.read));
        } catch (error) {
            console.error('Error clearing read notifications:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'node_comment':
            case 'roadmap_comment':
                return <MessageCircle className="w-5 h-5 text-blue-400" />;
            case 'like':
                return <Heart className="w-5 h-5 text-yellow-400 fill-current" />;
            case 'bookmark':
                return <Bookmark className="w-5 h-5 text-yellow-400 fill-current" />;
            case 'follow':
                return <User className="w-5 h-5 text-green-400" />;
            default:
                return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const getNotificationLink = (notification: Notification) => {
        if (notification.data.node_id) {
            return `/nodes/${notification.data.node_id}`;
        }
        if (notification.data.roadmap_id) {
            return `/roadmaps/${notification.data.roadmap_id}`;
        }
        return '#';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Hace unos minutos';
        if (hours < 24) return `Hace ${hours}h`;
        if (hours < 168) return `Hace ${Math.floor(hours / 24)}d`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const filteredNotifications = filter === 'unread' 
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <Head title="Notificaciones" />
            <div className="min-h-screen bg-black">
                <InstagramNav currentUser={auth?.user} />
                
                <div className="container mx-auto max-w-4xl pt-8 px-4 pb-12">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Bell className="w-8 h-8 text-yellow-400" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                                    Notificaciones
                                </h1>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <Button
                                        onClick={markAllAsRead}
                                        variant="outline"
                                        size="sm"
                                        className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                                    >
                                        <CheckCheck className="w-4 h-4 mr-2" />
                                        Marcar todas como leídas
                                    </Button>
                                )}
                                {notifications.some(n => n.read) && (
                                    <Button
                                        onClick={clearReadNotifications}
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Limpiar leídas
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                    filter === 'all'
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                                }`}
                            >
                                Todas ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                                    filter === 'unread'
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-gray-900 text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/40'
                                }`}
                            >
                                No leídas ({unreadCount})
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                            <p className="text-gray-400 mt-4">Cargando notificaciones...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={`overflow-hidden border transition-all duration-300 ${
                                        notification.read
                                            ? 'border-gray-800 bg-gray-900/50'
                                            : 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent'
                                    } hover:border-yellow-500/50`}
                                >
                                    <div className="flex items-start gap-4 p-4">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                            notification.read ? 'bg-gray-800' : 'bg-yellow-500/10'
                                        }`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={getNotificationLink(notification)}
                                                onClick={() => !notification.read && markAsRead(notification.id)}
                                                className="block group"
                                            >
                                                <p className={`text-sm mb-1 ${
                                                    notification.read ? 'text-gray-400' : 'text-gray-200 font-medium'
                                                }`}>
                                                    {notification.message}
                                                </p>
                                                
                                                {notification.data.comment_text && (
                                                    <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">
                                                        "{notification.data.comment_text}"
                                                    </p>
                                                )}

                                                {/* Preview Image */}
                                                {(notification.data.node_cover || notification.data.roadmap_cover) && (
                                                    <div className="mt-2 rounded-lg overflow-hidden w-20 h-20 border border-yellow-500/20">
                                                        <img
                                                            src={notification.data.node_cover || notification.data.roadmap_cover}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                                    )}
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex-shrink-0 flex gap-2">
                                            {!notification.read && (
                                                <Button
                                                    onClick={() => markAsRead(notification.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                                    title="Marcar como leída"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => deleteNotification(notification.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <BellOff className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 mb-2">
                                {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {filter === 'unread' 
                                    ? 'Todas tus notificaciones están al día'
                                    : 'Cuando recibas notificaciones aparecerán aquí'
                                }
                            </p>
                            {filter === 'unread' && notifications.length > 0 && (
                                <Button
                                    onClick={() => setFilter('all')}
                                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                                >
                                    Ver todas las notificaciones
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
