import { useState, useRef, useEffect, forwardRef, type SelectHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[];
  value?: string;
  onChange?: (e: any) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onChange, className, style, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const [internalValue, setInternalValue] = useState(props.defaultValue || options[0]?.value || '');
    const currentValue = value !== undefined ? value : internalValue;
    
    const containerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    const handleRef = (el: HTMLSelectElement) => {
      selectRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    const [dropdownStyles, setDropdownStyles] = useState({});

    useEffect(() => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyles({
          position: 'fixed',
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
        });
      }
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          const target = event.target as Element;
          if (!target.closest('.select-dropdown')) {
            setIsOpen(false);
          }
        }
      };
      
      const handleScrollOrResize = (event: Event) => {
        // If the user is scrolling inside the dropdown itself, don't close it
        const target = event.target as Element;
        if (target && target.closest && target.closest('.select-dropdown')) {
          return;
        }
        setIsOpen(false);
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScrollOrResize, true); // true = capture phase to catch modal scrolls
        window.addEventListener('resize', handleScrollOrResize);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }, [isOpen]);

    const handleOptionClick = (val: string) => {
      if (value === undefined) {
        setInternalValue(val);
      }
      
      if (selectRef.current) {
        selectRef.current.value = val;
        const event = new Event('change', { bubbles: true });
        selectRef.current.dispatchEvent(event);
        
        if (onChange) {
           onChange({ target: { value: val, name: props.name } });
        }
      } else if (onChange) {
         onChange({ target: { value: val, name: props.name } });
      }

      setIsOpen(false);
    };

    const selectedOption = options.find(o => o.value === currentValue) || { label: 'Select...', value: '' };

    return (
      <div className="relative" ref={containerRef} style={{ width: style?.width || '100%' }}>
        {/* Hidden Native Select for forms */}
        <select 
          ref={handleRef}
          value={currentValue}
          onChange={onChange}
          style={{ display: 'none' }}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Custom UI */}
        <button
          type="button"
          className={`form-select ${className || ''}`}
          style={{ 
            ...style, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%',
            textAlign: 'left'
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption.label}</span>
          <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: 'var(--text-muted)' }} />
        </button>

        {isOpen && typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            <motion.div
              className="select-dropdown"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              style={{
                ...dropdownStyles,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
                zIndex: 999999,
                maxHeight: '250px',
                overflowY: 'auto',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {options.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: option.value === currentValue ? 'var(--accent)' : 'var(--text-primary)',
                    backgroundColor: option.value === currentValue ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (option.value !== currentValue) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={e => {
                    if (option.value !== currentValue) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {option.label}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
