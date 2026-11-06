import { useEffect, useState } from "react";
import { Bell, X, Check } from "lucide-react";
import api from "../../services/api";

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get("/notifications?limit=10"); // increased limit a bit
            if (res.data?.success) {
                setNotifications(res.data.data || []);
                setUnread(res.data.unreadCount || 0);
            }
        } catch (err) {
            console.error("Notification error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);

            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnread(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.put("/notifications/read-all");

            // Update all notifications locally
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnread(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <>
            {/* Bell Button */}
            <button
                onClick={() => {
                    setOpen(true);
                    fetchNotifications();
                }}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition"
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unread}
                    </span>
                )}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/30 z-40"
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">Notifications</h2>
                    <div className="flex items-center gap-2">
                        {unread > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
                            >
                                <Check className="h-4 w-4" />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto h-[calc(100%-60px)]">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => !n.isRead && markAsRead(n._id)}
                                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${!n.isRead ? "bg-blue-50" : ""
                                    }`}
                            >
                                <h4 className="font-semibold text-sm">{n.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(n.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}