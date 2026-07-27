import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Building2, User, KanbanSquare, LayoutTemplate, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import type { SearchEmployeeDto } from '../../api/search.api';
import EmployeeModal from './EmployeeModal';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedEmployee, setSelectedEmployee] = useState<SearchEmployeeDto | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useSearch(query);

  const flatResults = [
    ...(data?.tasks.map(t => ({ type: 'task' as const, item: t })) || []),
    ...(data?.boards.map(b => ({ type: 'board' as const, item: b })) || []),
    ...(data?.employees.map(e => ({ type: 'employee' as const, item: e })) || []),
    ...(data?.departments.map(d => ({ type: 'department' as const, item: d })) || []),
  ];

  const handleSelect = (result: typeof flatResults[0]) => {
    setIsOpen(false);
    setQuery('');
    
    if (result.type === 'task') {
      navigate(`/boards/${result.item.boardId}`);
    } else if (result.type === 'board') {
      navigate(`/boards/${result.item.id}`);
    } else if (result.type === 'department') {
      navigate(`/departments?selectedId=${result.item.id}`);
    } else if (result.type === 'employee') {
      setSelectedEmployee(result.item);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [data]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < flatResults.length) {
        handleSelect(flatResults[focusedIndex]);
      } else if (flatResults.length > 0) {
        handleSelect(flatResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div ref={containerRef} style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-full overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-500 z-0">
            <motion.div className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(1px)" }} animate={{ left: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }} />
            <motion.div className="absolute top-0 right-0 h-[100%] w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(1px)" }} animate={{ top: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }} />
            <motion.div className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(1px)" }} animate={{ right: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }} />
            <motion.div className="absolute bottom-0 left-0 h-[100%] w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70" initial={{ filter: "blur(1px)" }} animate={{ bottom: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }} />
          </div>

          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, employees, departments..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              padding: '8px 12px 8px 36px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
            }}
            onFocusCapture={(e) => {
               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
               e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            }}
            onBlurCapture={(e) => {
               e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
               e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            }}
          />
          {query && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents input from losing focus
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                zIndex: 20
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && query.trim().length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(8, 8, 12, 0.95)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {(isLoading || isFetching) && !data ? (
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : flatResults.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No results found for "{query}"
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                {data?.tasks.length! > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Tasks
                    </div>
                    {data?.tasks.map((task) => {
                      const idx = flatResults.findIndex(r => r.item.id === task.id);
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleSelect({ type: 'task', item: task })}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: focusedIndex === idx ? 'var(--surface-hover)' : 'transparent',
                          }}
                          onMouseEnter={() => setFocusedIndex(idx)}
                        >
                          <KanbanSquare size={16} color="var(--accent)" />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.boardName} • {task.status}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {data?.boards.length! > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Boards
                    </div>
                    {data?.boards.map((board) => {
                      const idx = flatResults.findIndex(r => r.item.id === board.id);
                      return (
                        <div
                          key={board.id}
                          onClick={() => handleSelect({ type: 'board', item: board })}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: focusedIndex === idx ? 'var(--surface-hover)' : 'transparent',
                          }}
                          onMouseEnter={() => setFocusedIndex(idx)}
                        >
                          <LayoutTemplate size={16} color="var(--success)" />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{board.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Owner: {board.ownerName} {board.departmentName ? `• ${board.departmentName}` : ''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {data?.employees.length! > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Employees
                    </div>
                    {data?.employees.map((emp) => {
                      const idx = flatResults.findIndex(r => r.item.id === emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleSelect({ type: 'employee', item: emp })}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: focusedIndex === idx ? 'var(--surface-hover)' : 'transparent',
                          }}
                          onMouseEnter={() => setFocusedIndex(idx)}
                        >
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0
                          }}>
                            {emp.avatarUrl ? <img src={emp.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={12} />}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.role} {emp.departmentName ? `• ${emp.departmentName}` : ''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {data?.departments.length! > 0 && (
                  <div>
                    <div style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Departments
                    </div>
                    {data?.departments.map((dept) => {
                      const idx = flatResults.findIndex(r => r.item.id === dept.id);
                      return (
                        <div
                          key={dept.id}
                          onClick={() => handleSelect({ type: 'department', item: dept })}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: focusedIndex === idx ? 'var(--surface-hover)' : 'transparent',
                          }}
                          onMouseEnter={() => setFocusedIndex(idx)}
                        >
                          <Building2 size={16} color="var(--success)" />
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{dept.name}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <EmployeeModal 
        isOpen={selectedEmployee !== null} 
        onClose={() => setSelectedEmployee(null)} 
        employee={selectedEmployee} 
      />
    </>
  );
}
