import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, MapPin, Radio, AlertCircle, ChevronRight } from 'lucide-react';
import { useMissionStore } from '@/store/missionStore';
import type { Target, PriorityTier } from '@/types';

const tierConfig: Record<PriorityTier, { color: string; bg: string; border: string; label: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', label: 'HIGH' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', label: 'MEDIUM' },
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', label: 'LOW' },
};

function TargetCard({ target, rank }: { target: Target; rank: number }) {
  const { state, selectTarget } = useMissionStore();
  const isSelected = state.selectedTargetId === target.id;
  const tier = tierConfig[target.priorityTier];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      onClick={() => selectTarget(target.id)}
      className={`rounded-lg border p-3 cursor-pointer transition-all ${
        isSelected
          ? `${tier.bg} ${tier.border} ring-1 ring-cyan-500/30`
          : 'bg-navy-850 border-navy-700 hover:border-navy-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">#{rank}</span>
          <span className="text-sm font-bold text-white tracking-wide">{target.label}</span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tier.bg} ${tier.color} ${tier.border} border`}>
          {tier.label}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Crosshair className={`w-3 h-3 ${tier.color}`} />
          <span className={`text-lg font-bold font-mono ${tier.color}`}>
            {Math.round(target.confidence * 100)}%
          </span>
          <span className="text-[9px] text-gray-500 uppercase">conf</span>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-gray-500 uppercase">Priority</div>
          <div className="text-xs font-mono text-gray-300">{target.priorityScore.toFixed(3)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {target.detectionSources.map((src) => (
          <span key={src} className="text-[9px] px-1.5 py-0.5 rounded bg-navy-700 text-gray-400 uppercase tracking-wide">
            {src}
          </span>
        ))}
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed">{target.description}</p>

      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 pt-2 border-t border-navy-600 space-y-1.5"
        >
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <EvidenceBar label="Thermal" value={target.evidence.thermal} color="bg-amber-400" />
            <EvidenceBar label="UWB" value={target.evidence.uwb} color="bg-cyan-400" />
            <EvidenceBar label="EM/RF" value={target.evidence.em} color="bg-purple-400" />
            <EvidenceBar label="RGB" value={target.evidence.rgb} color="bg-blue-400" />
            <EvidenceBar label="Geometry" value={target.evidence.geometry} color="bg-green-400" />
            <EvidenceBar label="Hazard" value={target.evidence.hazardPenalty} color="bg-red-400" />
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1">
            <span className="text-gray-500 uppercase">Urgency</span>
            <span className="font-mono text-gray-300">{target.urgency.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500 uppercase">Access</span>
            <span className="font-mono text-gray-300">{target.accessibility.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500 uppercase">Depth</span>
            <span className="font-mono text-gray-300">{target.depth.toFixed(1)}m</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500 uppercase">Position</span>
            <span className="font-mono text-gray-300">
              {target.location.x.toFixed(1)}, {target.location.y.toFixed(1)}, {target.location.z.toFixed(1)}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function EvidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono text-gray-300">{value.toFixed(2)}</span>
      </div>
      <div className="h-1 rounded-full bg-navy-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function RescueTeamCard() {
  const { state } = useMissionStore();
  if (!state.rescueTeam) return null;
  const team = state.rescueTeam;

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-850 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-bold text-white tracking-wide">{team.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-green-400">LoRa Connected</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div>
          <span className="text-gray-500 uppercase">Status</span>
          <div className="text-gray-300 font-medium">{team.status}</div>
        </div>
        <div>
          <span className="text-gray-500 uppercase">Distance</span>
          <div className="font-mono text-cyan-400">{team.distanceToTarget}m</div>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500 uppercase">Position</span>
          <div className="font-mono text-gray-300">
            [{team.position.x.toFixed(1)}, {team.position.z.toFixed(1)}]
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteCard({ routeId }: { routeId: 'safe' | 'fast' }) {
  const { state, selectRoute } = useMissionStore();
  const route = routeId === 'safe' ? state.safeRoute : state.fastRoute;
  if (!route) return null;

  const isSelected = state.selectedRoute === routeId;
  const colorClass = routeId === 'safe' ? 'text-cyan-400 border-cyan-500/40' : 'text-amber-400 border-amber-500/40';

  return (
    <div
      onClick={() => selectRoute(routeId)}
      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
        isSelected ? `${colorClass} bg-navy-800` : 'border-navy-700 bg-navy-850 hover:border-navy-500'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-bold ${routeId === 'safe' ? 'text-cyan-400' : 'text-amber-400'}`}>
          {route.label}
        </span>
        <ChevronRight className="w-3 h-3 text-gray-600" />
      </div>
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <div>
          <span className="text-gray-500 uppercase">Dist</span>
          <div className="font-mono text-gray-300">{route.distance}m</div>
        </div>
        <div>
          <span className="text-gray-500 uppercase">ETA</span>
          <div className="font-mono text-gray-300">{route.etaMinutes}m</div>
        </div>
        <div>
          <span className="text-gray-500 uppercase">Hazard</span>
          <div className={`font-mono ${route.hazardCost < 0.1 ? 'text-green-400' : route.hazardCost < 0.2 ? 'text-amber-400' : 'text-red-400'}`}>
            {(route.hazardCost * 100).toFixed(0)}%
          </div>
        </div>
      </div>
      <div className="text-[9px] text-gray-600 mt-1">{route.algorithm}</div>
    </div>
  );
}

export function TargetPanel() {
  const { state } = useMissionStore();

  return (
    <div className="flex flex-col h-full p-2 gap-2 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
          Detected Targets
        </span>
        <span className="text-[9px] text-gray-600 font-mono">
          {state.targets.length}/4
        </span>
      </div>

      {state.targets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Crosshair className="w-8 h-8 text-gray-700" />
          <span className="text-xs text-gray-600 tracking-wide">NO ACTIVE TARGETS</span>
        </div>
      ) : (
        <div className="space-y-2">
          {state.targets.map((target, idx) => (
            <TargetCard key={target.id} target={target} rank={idx + 1} />
          ))}
        </div>
      )}

      {/* Rescue Team */}
      <div className="mt-1">
        <div className="flex items-center gap-1.5 px-1 pb-1">
          <Radio className="w-3 h-3 text-green-400" />
          <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
            Rescue Team
          </span>
        </div>
        {state.rescueTeam ? <RescueTeamCard /> : (
          <div className="rounded-lg border border-navy-700 bg-navy-850 p-3 text-center">
            <span className="text-xs text-gray-600">NOT DEPLOYED</span>
          </div>
        )}
      </div>

      {/* Routes */}
      {(state.safeRoute || state.fastRoute) && (
        <div className="mt-1">
          <div className="flex items-center gap-1.5 px-1 pb-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
              Rescue Routes
            </span>
          </div>
          <div className="space-y-2">
            {state.safeRoute && <RouteCard routeId="safe" />}
            {state.fastRoute && <RouteCard routeId="fast" />}
          </div>
        </div>
      )}
    </div>
  );
}
