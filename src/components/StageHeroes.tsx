import { motion } from 'framer-motion';
import { Activity, Box, ScanLine, Layers, GitMerge, ListOrdered, Route as RouteIcon, Loader2, VideoOff } from 'lucide-react';
import { useMissionStore } from '@/store/missionStore';
import { DisasterScene } from './DisasterScene';
import { CONFIDENCE_WEIGHTS, HAZARD_WEIGHT, PRIORITY_WEIGHTS, TARGETS } from '@/config/missionData';
import { SENSOR_VIDEO_CONFIG } from '@/config/sensorVideos';
import type { Target } from '@/types';

// ================================================================
// SURVEY HERO — HELPER COMPONENTS
// ================================================================

const SURVEY_SENSOR_META = {
  rgb:     { label: 'RGB CAMERA',     tag: 'VIS',   sub: 'VISIBLE-LIGHT AERIAL SURVEY',    footerL: '30 FPS',     footerR: '4K UHD'  },
  thermal: { label: 'THERMAL CAMERA', tag: 'LWIR',  sub: 'INFRARED HEAT-SIGNATURE IMAGING', footerL: 'LWIR 8–14μm', footerR: '30 FPS' },
  lidar:   { label: '3D LiDAR',       tag: 'LIDAR', sub: '3D ENVIRONMENT RECONSTRUCTION',   footerL: '120K pts/s', footerR: '10 Hz'  },
  uwb:     { label: 'UWB RADAR',      tag: 'UWB',   sub: 'SUBSURFACE / MOTION SIGNATURE',   footerL: '3–11 GHz',   footerR: '50 Hz'  },
  em:      { label: 'EM / RF SENSOR', tag: 'EM/RF', sub: 'ELECTRONIC SOURCE LOCALIZATION',  footerL: '850 MHz',    footerR: 'SCAN'   },
} as const;

type SurveyFeedId = keyof typeof SURVEY_SENSOR_META;

function TelValue({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <div className="text-[9px] text-gray-600 uppercase tracking-widest">{label}</div>
      <div className={`font-mono text-xs font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function PlaceholderEmpty() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 relative bg-navy-950">
      <div className="grid-bg absolute inset-0 opacity-20" />
      <VideoOff className="w-5 h-5 text-gray-700 relative z-10" />
      <div className="relative z-10 text-center">
        <div className="text-[10px] font-mono text-gray-600 tracking-wider">SENSOR FEED</div>
        <div className="text-[10px] font-mono text-gray-700 tracking-wide">AWAITING ASSET</div>
      </div>
    </div>
  );
}

function LidarPlaceholder({ isActive }: { isActive: boolean }) {
  if (!isActive) return <PlaceholderEmpty />;
  return (
    <div className="w-full h-full relative bg-navy-950 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent animate-scan" />
      <div className="absolute top-2 left-3">
        <div className="text-[9px] font-mono text-cyan-400/60 tracking-wider">POINTS: 12,850</div>
        <div className="text-[9px] font-mono text-gray-700 mt-0.5">SURFACE: ACQUIRING</div>
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-cyan-400/50">10 Hz</div>
    </div>
  );
}

function UwbPlaceholder({ isActive }: { isActive: boolean }) {
  if (!isActive) return <PlaceholderEmpty />;
  return (
    <div className="w-full h-full relative bg-navy-950 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
        {[20, 40, 60].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#f59e0b" strokeWidth="0.4" opacity="0.2" />
        ))}
        <polyline
          points="0,40 10,32 20,48 30,22 40,54 50,35 60,47 70,26 80,52 90,38 100,45 110,25 120,51 130,33 140,50 150,28 160,48 170,36 180,50 190,34 200,40"
          fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8"
        />
        <polyline
          points="0,45 10,38 20,54 30,28 40,60 50,42 60,52 70,32 80,58 90,44 100,51 110,31 120,57 130,39 140,56 150,34 160,54 170,42 180,56 190,40 200,45"
          fill="none" stroke="#f59e0b" strokeWidth="0.7" opacity="0.3"
        />
      </svg>
      <div className="absolute top-2 left-3">
        <div className="text-[9px] font-mono text-amber-400/60">3–11 GHz</div>
        <div className="text-[9px] font-mono text-gray-700 mt-0.5">RANGE: SCANNING</div>
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-amber-400/50">50 Hz</div>
    </div>
  );
}

function EmRfPlaceholder({ isActive }: { isActive: boolean }) {
  if (!isActive) return <PlaceholderEmpty />;
  const bars = [30, 45, 38, 72, 55, 85, 70, 52, 65, 42, 78, 80, 55, 62, 35, 90, 68, 45, 72, 55, 40, 75, 62, 48, 58, 35, 80, 65, 45, 60];
  return (
    <div className="w-full h-full relative bg-navy-950 overflow-hidden">
      <div className="absolute inset-0 flex items-end px-3 pb-6 gap-px">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-purple-400 rounded-t-sm min-w-0"
            style={{ height: `${h}%`, opacity: 0.4 + (h / 200) }}
          />
        ))}
      </div>
      <div className="absolute bottom-6 left-3 right-3 h-px bg-purple-500/30" />
      <div className="absolute top-2 left-3">
        <div className="text-[9px] font-mono text-purple-400/60">850 MHz – 2.4 GHz</div>
        <div className="text-[9px] font-mono text-gray-700 mt-0.5">SOURCE: SCANNING</div>
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-purple-400/50">RF SPECTRUM</div>
      <div className="absolute bottom-2 left-3 text-[9px] font-mono text-gray-700">NOISE FLOOR −85 dBm</div>
    </div>
  );
}

function SurveyFeedCard({ id, videoSrc, isActive }: { id: SurveyFeedId; videoSrc: string; isActive: boolean }) {
  const meta = SURVEY_SENSOR_META[id];
  const hasVideo = videoSrc !== '';

  const renderFeed = () => {
    if (hasVideo && isActive) {
      return (
        <video
          src={videoSrc}
          autoPlay muted loop playsInline preload="auto"
          className="w-full h-full object-cover"
        />
      );
    }
    if (id === 'lidar') return <LidarPlaceholder isActive={isActive} />;
    if (id === 'uwb')   return <UwbPlaceholder isActive={isActive} />;
    if (id === 'em')    return <EmRfPlaceholder isActive={isActive} />;
    return <PlaceholderEmpty />;
  };

  return (
    <div className="flex flex-col h-full rounded-lg overflow-hidden border border-navy-700 bg-navy-900 min-h-0">
      {/* Card header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1 bg-navy-800 border-b border-navy-700">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
          <span className="text-[11px] font-bold text-gray-200 tracking-wider truncate">{meta.label}</span>
          <span className="flex-shrink-0 text-[9px] bg-navy-700 text-gray-500 px-1.5 py-px rounded font-mono">{meta.tag}</span>
        </div>
        <span className="flex-shrink-0 ml-2 text-[9px] text-gray-600 tracking-widest">SIMULATED</span>
      </div>

      {/* Feed — fills all remaining space */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {renderFeed()}
      </div>

      {/* Card footer */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1 bg-navy-800 border-t border-navy-700">
        <span className="text-[9px] font-mono text-gray-600">{meta.footerL}</span>
        <span className="hidden sm:block text-[9px] text-gray-700 tracking-wide truncate mx-2">{meta.sub}</span>
        <span className={`text-[9px] font-semibold font-mono flex-shrink-0 ${isActive ? 'text-green-400' : 'text-gray-600'}`}>
          {isActive ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
}

// ================================================================
// SURVEY HERO
// ================================================================
export function SurveyHero() {
  const { state } = useMissionStore();
  const progress = state.stageProgress;
  const isActive = state.missionStatus !== 'standby';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--navy-950)' }}>
      {/* === TELEMETRY HEADER === */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-navy-900 border-b border-navy-700">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-cyan-400 tracking-wider">AERIAL SURVEY IN PROGRESS</span>
          </div>
          <p className="hidden sm:block text-[10px] text-gray-600 mt-0.5 tracking-widest uppercase">
            Multi-Sensor Acquisition · Simulated Mission · Recorded Sensor Data
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <TelValue label="ALT"    value={`${state.droneTelemetry.altitude.toFixed(1)}m`}    color="text-cyan-400"  />
          <TelValue label="FLIGHT" value={state.droneTelemetry.flight}                        color="text-gray-300"  />
          <TelValue label="BAT"    value={`${state.droneTelemetry.battery.toFixed(0)}%`}      color="text-green-400" />
        </div>
      </div>

      {/* === SENSOR FEEDS — RGB top ~65%, bottom 4 feeds ~35% === */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: '1.85fr 1fr', gap: '6px', padding: '6px' }}>
        {/* ROW 1: RGB large */}
        <div style={{ minHeight: 0 }}>
          <SurveyFeedCard id="rgb" videoSrc={SENSOR_VIDEO_CONFIG.rgb} isActive={isActive} />
        </div>

        {/* ROW 2: 4 feeds equally split */}
        <div style={{ minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
          <SurveyFeedCard id="thermal" videoSrc={SENSOR_VIDEO_CONFIG.thermal} isActive={isActive} />
          <SurveyFeedCard id="lidar"   videoSrc={SENSOR_VIDEO_CONFIG.lidar}   isActive={isActive} />
          <SurveyFeedCard id="uwb"     videoSrc={SENSOR_VIDEO_CONFIG.uwb}     isActive={isActive} />
          <SurveyFeedCard id="em"      videoSrc={SENSOR_VIDEO_CONFIG.em}      isActive={isActive} />
        </div>
      </div>

      {/* === PROGRESS FOOTER === */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-2 bg-navy-900 border-t border-navy-700 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">Aerial Survey Progress</span>
            <span className="text-xs font-mono text-cyan-400">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {(Object.keys(SURVEY_SENSOR_META) as SurveyFeedId[]).map((id) => (
            <div key={id} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className="text-[9px] font-mono text-gray-500 uppercase">{SURVEY_SENSOR_META[id].tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// 3D MAP RECONSTRUCTION HERO
// ================================================================
export function ReconstructHero() {
  const { state } = useMissionStore();
  const progress = state.stageProgress;
  const steps = [
    { label: 'LiDAR Acquisition', threshold: 15 },
    { label: 'Point Alignment', threshold: 35 },
    { label: 'Surface Reconstruction', threshold: 60 },
    { label: 'Debris Model', threshold: 80 },
    { label: '3D MAP READY', threshold: 100 },
  ];
  const currentStep = steps.filter((s) => progress >= s.threshold).pop() || steps[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full relative bg-navy-950"
    >
      <div className="absolute inset-0">
        <DisasterScene />
      </div>

      {/* Overlay */}
      <div className="absolute top-0 left-0 right-0 px-6 py-3 bg-gradient-to-b from-navy-950 to-transparent z-10">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold text-cyan-400 tracking-wider">RECONSTRUCTING DISASTER ENVIRONMENT...</span>
        </div>
      </div>

      {/* Bottom progress */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-navy-950 to-transparent z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
            <span className="text-xs text-cyan-400 font-semibold">{currentStep.label}</span>
          </div>
          <span className="text-xs font-mono text-cyan-400">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase">Points Captured</div>
            <div className="font-mono text-cyan-400 text-sm">{Math.round(progress * 128.5).toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase">Surface Coverage</div>
            <div className="font-mono text-cyan-400 text-sm">{progress.toFixed(0)}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase">Reconstruction</div>
            <div className="font-mono text-cyan-400 text-sm">{progress.toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ================================================================
// DETECT HERO — Multi-sensor detection & fusion analysis
// ================================================================
export function DetectHero() {
  const { state } = useMissionStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full flex bg-navy-950 overflow-hidden"
    >
      {/* Left: Detection process */}
      <div className="w-1/2 p-4 overflow-y-auto scrollbar-thin border-r border-navy-700">
        <div className="flex items-center gap-2 mb-4">
          <ScanLine className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold text-cyan-400 tracking-wider">ANALYZING MULTI-SENSOR EVIDENCE...</span>
        </div>

        {/* Sensor analysis cards */}
        <div className="space-y-2">
          {[
            { name: 'Thermal Analysis', icon: '🌡', desc: 'Heat-signature detection' },
            { name: 'UWB Analysis', icon: '📡', desc: 'Radar range profiling' },
            { name: 'EM/RF Localization', icon: '📻', desc: 'Radio frequency source detection' },
            { name: 'RGB Analysis', icon: '📷', desc: 'Visible-light pattern recognition' },
            { name: '3D Structural Analysis', icon: '🏗', desc: 'Geometric plausibility check' },
          ].map((item, idx) => {
            const delay = idx * 0.15;
            const isDone = state.stageProgress > (idx + 1) * 15;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, duration: 0.3 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                  isDone ? 'bg-navy-800 border-cyan-500/30' : 'bg-navy-850 border-navy-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-200">{item.name}</div>
                  <div className="text-[10px] text-gray-500">{item.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isDone ? 'bg-green-500/20' : 'bg-navy-700'
                }`}>
                  {isDone && <span className="text-green-400 text-xs">✓</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Confidence formula */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 rounded-lg bg-navy-850 border border-navy-600"
        >
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Confidence Formula
          </div>
          <div className="font-mono text-[11px] text-gray-300 leading-relaxed">
            <div>CONFIDENCE =</div>
            <div className="pl-3 text-cyan-400">W<sub>thermal</sub> × Thermal + W<sub>uwb</sub> × UWB</div>
            <div className="pl-3 text-purple-400">+ W<sub>em</sub> × EM/RF + W<sub>rgb</sub> × RGB</div>
            <div className="pl-3 text-amber-400">+ W<sub>geom</sub> × Structural − W<sub>hazard</sub> × Hazard</div>
          </div>
          <div className="mt-2 pt-2 border-t border-navy-700 grid grid-cols-2 gap-1 text-[10px] font-mono">
            <div className="text-gray-500">W<sub>thermal</sub> = {CONFIDENCE_WEIGHTS.thermal}</div>
            <div className="text-gray-500">W<sub>uwb</sub> = {CONFIDENCE_WEIGHTS.uwb}</div>
            <div className="text-gray-500">W<sub>em</sub> = {CONFIDENCE_WEIGHTS.em}</div>
            <div className="text-gray-500">W<sub>rgb</sub> = {CONFIDENCE_WEIGHTS.rgb}</div>
            <div className="text-gray-500">W<sub>geom</sub> = {CONFIDENCE_WEIGHTS.geometry}</div>
            <div className="text-gray-500">W<sub>hazard</sub> = {HAZARD_WEIGHT}</div>
          </div>
        </motion.div>
      </div>

      {/* Right: Target reveal */}
      <div className="w-1/2 p-4 overflow-y-auto scrollbar-thin">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Detected Targets
        </div>

        <div className="space-y-2">
          {state.targets.map((target, idx) => (
            <TargetReveal key={target.id} target={target} index={idx} />
          ))}
        </div>

        {state.targets.length === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center"
          >
            <div className="text-sm font-bold text-cyan-400">4 TARGET HYPOTHESES IDENTIFIED</div>
            <div className="text-xs text-gray-400 mt-1">
              1 HIGH · 2 MEDIUM · 1 LOW
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function TargetReveal({ target, index }: { target: Target; index: number }) {
  const tierColor = target.priorityTier === 'high' ? 'text-red-400 border-red-500/40 bg-red-500/10' :
    target.priorityTier === 'medium' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
    'text-gray-400 border-gray-500/30 bg-gray-500/10';

  const sourceLabel = target.detectionSources.join(' + ').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`rounded-lg border p-3 ${tierColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{target.label}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tierColor}`}>
            {target.priorityTier.toUpperCase()}
          </span>
        </div>
        <span className="text-xl font-bold font-mono">{Math.round(target.confidence * 100)}%</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 mb-2">
        {[
          { label: 'TH', val: target.evidence.thermal },
          { label: 'UWB', val: target.evidence.uwb },
          { label: 'EM', val: target.evidence.em },
          { label: 'RGB', val: target.evidence.rgb },
          { label: 'GEO', val: target.evidence.geometry },
        ].map((e) => (
          <div key={e.label} className="text-center">
            <div className="text-[9px] text-gray-500">{e.label}</div>
            <div className="text-[10px] font-mono text-gray-300">{e.val.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-gray-400">{sourceLabel}</div>
    </motion.div>
  );
}

// ================================================================
// FUSE HERO
// ================================================================
export function FuseHero() {
  const { state } = useMissionStore();
  const sensors = [
    { name: 'Thermal', done: state.stageProgress > 10 },
    { name: 'UWB', done: state.stageProgress > 30 },
    { name: 'EM/RF', done: state.stageProgress > 50 },
    { name: 'RGB', done: state.stageProgress > 70 },
    { name: '3D Geometry', done: state.stageProgress > 90 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col items-center justify-center bg-navy-950/95 relative"
    >
      <div className="absolute inset-0">
        <DisasterScene />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4 bg-navy-900/80 backdrop-blur-sm px-8 py-6 rounded-xl border border-navy-600">
        <div className="flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-base font-bold text-cyan-400 tracking-wider">FUSING MULTI-SENSOR EVIDENCE</span>
        </div>
        <div className="space-y-2">
          {sensors.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                s.done ? 'bg-green-500/20' : 'bg-navy-700'
              }`}>
                {s.done && <span className="text-green-400 text-xs">✓</span>}
              </div>
              <span className={`text-sm ${s.done ? 'text-green-400' : 'text-gray-500'}`}>{s.name}</span>
            </div>
          ))}
        </div>
        {state.stageProgress > 95 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-green-400"
          >
            FUSION COMPLETE
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ================================================================
// PRIORITIZE HERO
// ================================================================
export function PrioritizeHero() {
  const { state } = useMissionStore();
  const sortedTargets = [...TARGETS].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full flex bg-navy-950 overflow-hidden"
    >
      {/* Left: Formula */}
      <div className="w-2/5 p-4 overflow-y-auto scrollbar-thin border-r border-navy-700 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold text-cyan-400 tracking-wider">RANKING TARGETS...</span>
        </div>

        <div className="p-3 rounded-lg bg-navy-850 border border-navy-600 mb-4">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Priority Formula
          </div>
          <div className="font-mono text-[11px] text-gray-300 leading-relaxed">
            <div>Priority =</div>
            <div className="pl-3 text-amber-400">{PRIORITY_WEIGHTS.urgency} × Urgency</div>
            <div className="pl-3 text-cyan-400">+ {PRIORITY_WEIGHTS.accessibility} × Accessibility</div>
            <div className="pl-3 text-purple-400">+ {PRIORITY_WEIGHTS.confidence} × Detection Confidence</div>
          </div>
        </div>

        {/* Per-target breakdown */}
        <div className="space-y-2">
          {sortedTargets.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="p-2.5 rounded-lg bg-navy-850 border border-navy-700"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">{t.label}</span>
                <span className={`text-sm font-mono font-bold ${
                  t.priorityTier === 'high' ? 'text-red-400' :
                  t.priorityTier === 'medium' ? 'text-amber-400' : 'text-gray-400'
                }`}>{t.priorityScore.toFixed(3)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-500">Urgency</span>
                  <div className="font-mono text-gray-300">{t.urgency.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Access</span>
                  <div className="font-mono text-gray-300">{t.accessibility.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Conf</span>
                  <div className="font-mono text-gray-300">{t.confidence.toFixed(2)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Ranking animation */}
      <div className="w-3/5 p-4 flex flex-col justify-center">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Final Ranking
        </div>
        <div className="space-y-3">
          {sortedTargets.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, type: 'spring', stiffness: 100 }}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                t.priorityTier === 'high' ? 'bg-red-500/10 border-red-500/40' :
                t.priorityTier === 'medium' ? 'bg-amber-500/10 border-amber-500/40' :
                'bg-gray-500/10 border-gray-500/30'
              }`}
            >
              <div className={`text-2xl font-bold font-mono ${
                t.priorityTier === 'high' ? 'text-red-400' :
                t.priorityTier === 'medium' ? 'text-amber-400' : 'text-gray-400'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{t.label}</div>
                <div className="text-[10px] text-gray-500">{t.description}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  t.priorityTier === 'high' ? 'text-red-400' :
                  t.priorityTier === 'medium' ? 'text-amber-400' : 'text-gray-400'
                }`}>{t.priorityTier.toUpperCase()}</div>
                <div className="text-xs font-mono text-gray-400">{Math.round(t.confidence * 100)}%</div>
              </div>
            </motion.div>
          ))}
        </div>
        {state.stageProgress > 95 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm font-bold text-green-400"
          >
            PRIORITIZATION COMPLETE
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ================================================================
// ROUTE PLANNING HERO
// ================================================================
export function RouteHero() {
  const { state } = useMissionStore();
  const progress = state.stageProgress;

  const steps = [
    { label: 'ANALYZING TERRAIN', threshold: 15 },
    { label: 'BUILDING HAZARD COST MAP', threshold: 35 },
    { label: 'CALCULATING RESCUE ROUTES', threshold: 60 },
    { label: 'ROUTE READY', threshold: 100 },
  ];
  const currentStep = steps.filter((s) => progress >= s.threshold).pop() || steps[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative bg-navy-950"
    >
      <div className="absolute inset-0">
        <DisasterScene />
      </div>

      {/* Top overlay */}
      <div className="absolute top-0 left-0 right-0 px-6 py-3 bg-gradient-to-b from-navy-950 to-transparent z-10">
        <div className="flex items-center gap-2">
          <RouteIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold text-cyan-400 tracking-wider">CALCULATING SAFE RESCUE ACCESS...</span>
        </div>
      </div>

      {/* Bottom overlay with route info */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-navy-950 to-transparent z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-cyan-400 font-semibold">{currentStep.label}</span>
          <span className="text-xs font-mono text-cyan-400">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Route comparison */}
        <div className="grid grid-cols-2 gap-3">
          {state.safeRoute && (
            <div className="p-3 rounded-lg bg-navy-850 border border-cyan-500/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-xs font-bold text-cyan-400">{state.safeRoute.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-500 uppercase">Dist</span>
                  <div className="font-mono text-gray-300">{state.safeRoute.distance}m</div>
                </div>
                <div>
                  <span className="text-gray-500 uppercase">ETA</span>
                  <div className="font-mono text-gray-300">{state.safeRoute.etaMinutes}m</div>
                </div>
                <div>
                  <span className="text-gray-500 uppercase">Hazard</span>
                  <div className="font-mono text-green-400">{(state.safeRoute.hazardCost * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-600 mt-1">{state.safeRoute.algorithm}</div>
            </div>
          )}
          {state.fastRoute && (
            <div className="p-3 rounded-lg bg-navy-850 border border-amber-500/40">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-amber-400">{state.fastRoute.label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-500 uppercase">Dist</span>
                  <div className="font-mono text-gray-300">{state.fastRoute.distance}m</div>
                </div>
                <div>
                  <span className="text-gray-500 uppercase">ETA</span>
                  <div className="font-mono text-gray-300">{state.fastRoute.etaMinutes}m</div>
                </div>
                <div>
                  <span className="text-gray-500 uppercase">Hazard</span>
                  <div className="font-mono text-amber-400">{(state.fastRoute.hazardCost * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div className="text-[9px] text-gray-600 mt-1">{state.fastRoute.algorithm}</div>
            </div>
          )}
          {!state.safeRoute && !state.fastRoute && (
            <div className="col-span-2 text-center text-xs text-gray-500 py-2">
              Computing optimal paths...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
