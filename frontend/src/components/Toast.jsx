import { useEffect } from 'react';

export default function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast toast-top toast-center z-50 mt-4 transition-all duration-300">
      <div 
        className={`alert rounded-xl shadow-xl font-baskervville flex items-center gap-3 ${
          type === 'error' 
            ? 'bg-error-bg border border-error-text text-error-text' 
            : 'bg-oscuro border border-lila text-lila'
        }`}
      >
        {type === 'error' && (
          <i className="bi bi-exclamation-circle text-2xl"></i>
        )}
        
        {type === 'success' && (
          <i className="bi bi-check-circle text-2xl"></i>
        )}

        <span>{message}</span>
      </div>
    </div>
  );
}