export default function NotificationPanel({ notifications, markAsRead }) {
    return (
        <div className="notification-panel p-2 shadow-2">
            {notifications.length === 0 && <div>Aucune notification</div>}
            {notifications.map(notif => (
                <div
                    key={notif.ID_NOTIFICATION}
                    onClick={() => markAsRead(notif.ID_NOTIFICATION)} // <- passe l’ID ici
                    style={{
                        padding: '8px',
                        marginBottom: '4px',
                        backgroundColor: notif.read ? '#f5f5f5' : '#e0f7fa',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                >
                    <strong>{notif.TITLE}</strong>
                    <div>{notif.MESSAGE}</div>
                    <small>{new Date(notif.DATE_ENREGISTREMENT).toLocaleString()}</small>
                </div>
            ))}
        </div>
    )
}
