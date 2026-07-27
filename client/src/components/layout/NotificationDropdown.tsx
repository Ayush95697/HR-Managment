import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type Notification } from '../../api/notifications.api';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown = ({ onClose }: NotificationDropdownProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getList(1, 20),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });

  function handleClick(n: Notification) {
    if (!n.isRead) {
      markReadMutation.mutate(n.id);
    }
    onClose();
    if (n.boardId && n.taskCardId) {
      navigate(`/boards/${n.boardId}?card=${n.taskCardId}`);
    }
  }

  return (
    <div 
      className="dropdown-panel"
      style={{
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '8px',
        width: '320px',
        maxHeight: '400px',
        backgroundColor: 'rgba(8, 8, 12, 0.95)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
        <button 
          onClick={() => markAllReadMutation.mutate()}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            padding: '4px'
          }}
          className="hover-opacity"
        >
          Mark all as read
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {isLoading && <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}
        
        {!isLoading && notifications?.items.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications yet
          </div>
        )}

        {!isLoading && notifications?.items.map(n => (
          <div 
            key={n.id} 
            onClick={() => handleClick(n)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              backgroundColor: n.isRead ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
            className="hover-opacity"
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              {!n.isRead && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0, marginTop: '6px' }} />
              )}
              <span style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.4 }}>
                {n.message}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', paddingLeft: n.isRead ? '0' : '14px' }}>
              {formatDistanceToNow(n.createdAt.endsWith('Z') ? new Date(n.createdAt) : new Date(n.createdAt + 'Z'), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;
