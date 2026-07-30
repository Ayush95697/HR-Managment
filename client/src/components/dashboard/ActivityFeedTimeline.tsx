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

  return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{text}</span>;
}

export function ActivityFeedTimeline() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityFeed();

  return (
    <div 
      className="glass-card-antigravity hover-scale-subtle"
      style={{
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '380px',
        maxHeight: '380px',
      }}
    >
      <style>{`
        @keyframes liveCyanPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(0, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
        }
        .live-cyan-dot {
          width: 8px;
          height: 8px;
          background-color: #00FFFF;
          border-radius: 50%;
          display: inline-block;
          margin-right: 10px;
          animation: liveCyanPulse 2s infinite;
        }
      `}</style>
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.125rem', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
        <span className="live-cyan-dot" title="Live updates active"></span>
        Live Activity Feed
      </h3>
      
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00FFFF' }}>
          Loading activity stream...
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', position: 'relative' }}>
          {/* Trail Connecting Line (1px wide, glowing rgba(127, 0, 255, 0.5)) */}
          <div 
            style={{
              position: 'absolute',
              top: '16px',
              bottom: '16px',
              left: '16px',
              width: '1px',
              background: 'rgba(127, 0, 255, 0.5)',
              boxShadow: '0 0 8px rgba(127, 0, 255, 0.8)',
              zIndex: 1,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 2 }}>
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.map((item: ActivityFeedItemDto, idx: number) => (
                  <div key={`${item.id}-${idx}`} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Glowing Activity Icon */}
                    <div 
                      className="activity-icon-glow"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(9, 10, 20, 0.9)',
                        border: '1px solid rgba(0, 255, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#00FFFF',
                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.25)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 14px rgba(0, 255, 255, 0.7)';
                        e.currentTarget.style.borderColor = '#00FFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.25)';
                        e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
                      }}
                    >
                      {item.kind === 'Onboarding' ? (
                        <svg width="15" height="15" fill="none" stroke="#00FFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M16 21v-2a4 4 0 00-4-4H5c-1.1 0-2 .9-2 2v2M8.5 7a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" fill="none" stroke="#7F00FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
                  padding: '8px 16px',
                  background: 'rgba(0, 255, 255, 0.08)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                  borderRadius: '9999px',
                  color: '#00FFFF',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 255, 255, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 255, 255, 0.08)')}
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load older events'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
