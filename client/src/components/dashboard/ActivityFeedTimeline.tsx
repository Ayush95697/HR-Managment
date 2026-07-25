import { useActivityFeed } from '../../hooks/useDashboardData';
import type { ActivityFeedItemDto } from '../../api/dashboard.api';
import React from 'react';

function TimeAgo({ dateStr }: { dateStr: string }) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let text = '';
  if (days > 0) text = `${days}d ago`;
  else if (hours > 0) text = `${hours}h ago`;
  else if (minutes > 0) text = `${minutes}m ago`;
  else text = 'just now';

  return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{text}</span>;
}

export function ActivityFeedTimeline() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityFeed();

  return (
    <div 
      style={{
        background: 'var(--surface)',
        borderRadius: '12px 32px 12px 32px',
        border: '1px solid var(--border)',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '380px',
        maxHeight: '380px',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      className="hover-scale-subtle"
    >
      <style>{`
        @keyframes livePulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #4f46e5;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          animation: livePulse 2s infinite;
        }
      `}</style>
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', display: 'flex', alignItems: 'center' }}>
        <span className="live-dot" title="Live updates active"></span>
        Live Activity Feed
      </h3>
      
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data?.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.map((item: ActivityFeedItemDto, idx: number) => (
                <div key={`${item.id}-${idx}`} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(79, 70, 229, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    color: '#4f46e5'
                  }}>
                    {item.kind === 'Onboarding' ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 00-4-4H5c-1.1 0-2 .9-2 2v2M8.5 7a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                      </svg>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {item.message}
                    </span>
                    <TimeAgo dateStr={item.timestamp} />
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
          
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              style={{
                marginTop: '8px',
                padding: '8px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
              className="hover-opacity"
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load older events'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
