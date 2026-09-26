import { Plane, RotateCcw, Plus, Radio } from 'lucide-react';
import { useMissionStore } from '@/store/missionStore';

interface HeaderProps {
  onResetClick: () => void;
}

export function Header({ onResetClick }: HeaderProps) {
  const { state, createMission } = useMissionStore();
  const isStandby = state.missionStatus === 'standby';
  const isActive  = state.missionStatus === 'active';
  const isReady   = state.missionStatus === 'ready';

  const statusColor = isStandby ? 'text-gray-400' : isReady ? 'text-green-400' : 'text-cyan-400';
  const statusBg    = isStandby ? 'bg-navy-800' : isReady ? 'bg-green-500/10' : 'bg-cyan-500/10';
  const statusLabel = isStandby ? 'SYSTEM READY' : isReady ? 'MISSION READY' : 'MISSION ACTIVE';
  const dotColor    = isStandby ? 'bg-gray-500' : isReady ? 'bg-green-400' : 'bg-cyan-400 animate-pulse';

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-navy-900 border-b border-navy-700 z-50">
      {/* === LEFT: Logo + Status === */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-wider text-white leading-none">GARUDA</h1>
            <p className="hidden sm:block text-[10px] text-gray-500 tracking-widest uppercase mt-0.5">
              AI-Powered Aerial Rescue Command
            </p>
          </div>
        </div>

        {/* Mission status badge */}
        <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-md ${statusBg} border border-navy-600`}>
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotColor}`} />
          <span className={`text-[10px] sm:text-xs font-semibold tracking-wide ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Simulation badge — hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-800 border border-navy-700">
          <Radio className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-medium text-amber-400 tracking-wide">SIMULATED</span>
        </div>
      </div>

      {/* === RIGHT: Mission info + Buttons === */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Mission ID — hidden on mobile */}
        {state.missionId && (
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Mission ID</span>
              <span className="font-mono text-cyan-400 font-semibold">{state.missionId}</span>
            </div>
            {state.createdAt && (
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">Timestamp</span>
                <span className="font-mono text-gray-300">{state.createdAt}</span>
              </div>
            )}
          </div>
        )}

        {/* Create Mission button */}
        <button
          onClick={createMission}
          disabled={isActive}
          className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
            isActive
              ? 'bg-navy-700 text-gray-500 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-lg shadow-cyan-500/20'
          }`}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">CREATE MISSION</span>
          <span className="sm:hidden">CREATE</span>
        </button>

        {/* Reset button */}
        <button
          onClick={onResetClick}
          disabled={isStandby}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all border ${
            isStandby
              ? 'bg-navy-800 text-gray-600 border-navy-700 cursor-not-allowed'
              : 'bg-navy-800 hover:bg-navy-700 text-gray-300 border-navy-600'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">RESET</span>
        </button>
      </div>
    </header>
  );
}
