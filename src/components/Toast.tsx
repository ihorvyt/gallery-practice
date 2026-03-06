import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Notification } from '../types';

interface ToastProps {
  notifications: Notification[];
}

export const ToastContainer = ({ notifications }: ToastProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[300px] ${
              n.type === 'success' ? 'bg-emerald-500 text-white' :
              n.type === 'error' ? 'bg-rose-500 text-white' :
              'bg-slate-800 text-white'
            }`}
          >
            {n.type === 'success' && <CheckCircle size={18} />}
            {n.type === 'error' && <AlertCircle size={18} />}
            {n.type === 'info' && <Info size={18} />}
            <span className="flex-1 text-sm font-medium">{n.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
