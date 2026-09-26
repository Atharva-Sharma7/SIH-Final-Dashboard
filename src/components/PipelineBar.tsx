import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useMissionStore } from '@/store/missionStore';
import type { PipelineStage } from '@/types';

function StageIndicator({ stage }: { stage: PipelineStage }) {
  const { state } = useMissionStore();
  const isCurrent = state.currentStage === stage.id && state.stageStatus === 'active';
  const isComplete = stage.status === 'complete';

  const dotColor = isComplete
    ? 'bg-green-400'
    : isCurrent
      ? 'bg-cyan-400 animate-pulse'
      : 'bg-navy-600';

  const textColor = isComplete
    ? 'text-green-400'
    : isCurrent
      ? 'text-cyan-400'
      : 'text-gray-600';

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
        isComplete ? 'border-green-400/50 bg-green-500/10' :
        isCurrent  ? 'border-cyan-400/50 bg-cyan-500/10' :
                     'border-navy-600 bg-navy-800'
      }`}>
        {isComplete ? (
          <Check className="w-2.5 h-2.5 text-green-400" />
        ) : isCurrent ? (
          <Loader2 className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
        ) : (
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wide ${textColor} whitespace-nowrap`}>
          {stage.label}
        </span>
        {isCurrent && (
          <motion.div
            className="h-0.5 rounded-full bg-cyan-400 mt-0.5"
            initial={{ width: 0 }}
            animate={{ width: `${state.stageProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
        {isComplete && (
          <div className="h-0.5 rounded-full bg-green-400/50 mt-0.5 w-full" />
        )}
      </div>
    </div>
  );
}

export function PipelineBar() {
  const { state } = useMissionStore();
  const stages = state.pipeline.filter((s) => s.id !== 'init' && s.id !== 'report');

  return (
    <div className="flex-shrink-0 flex items-center bg-navy-900 border-t border-navy-700 overflow-x-auto"
         style={{ scrollbarWidth: 'none' }}>
      <div className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 min-w-max">
        <span className="text-[10px] font-semibold text-gray-600 tracking-widest uppercase mr-2 flex-shrink-0">
          Pipeline
        </span>
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center gap-1">
            <StageIndicator stage={stage} />
            {idx < stages.length - 1 && (
              <div className={`w-4 sm:w-6 h-px mx-1 flex-shrink-0 ${stage.status === 'complete' ? 'bg-green-400/50' : 'bg-navy-600'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
