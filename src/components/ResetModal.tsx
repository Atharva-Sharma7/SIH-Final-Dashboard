import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ResetModalProps {
  open: boolean;
  missionId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetModal({ open, missionId, onCancel, onConfirm }: ResetModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full max-w-md rounded-xl border border-navy-600 bg-navy-900 shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-white tracking-wide">RESET CURRENT MISSION?</span>
              </div>
              <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-gray-400 mb-3">
                All simulated mission progress, targets and routes will be cleared.
              </p>
              {missionId && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-navy-850 border border-navy-700">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Current Mission</span>
                  <span className="font-mono text-cyan-400 font-semibold">{missionId}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-navy-700">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 bg-navy-800 hover:bg-navy-700 border border-navy-600 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-red-500 hover:bg-red-400 transition-colors"
              >
                RESET MISSION
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
