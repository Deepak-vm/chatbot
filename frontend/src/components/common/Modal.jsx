import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * Modal — accessible dialog with backdrop
 */
export function Modal({ isOpen, onClose, title, children, className = '' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative z-10 bg-[#0d111c] border border-[#1f2937] rounded-2xl shadow-2xl w-full max-w-md p-6 focus:outline-none ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
