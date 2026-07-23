import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications.api';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 15000, // Poll every 15s as requested
  });

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(o => !o)} 
        aria-label="Notifications"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
        className="hover-opacity"
      >
        <Bell size={20} />
        {data && data.count > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '6px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--danger)',
              borderRadius: '50%',
              border: '2px solid var(--surface)'
            }} 
          />
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
