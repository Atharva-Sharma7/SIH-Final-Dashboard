import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Crosshair, MapPin, Plane, X, VideoOff, Video } from 'lucide-react';
import { useMissionStore } from '@/store/missionStore';
import { Header } from '@/components/Header';
import { SensorSidebar } from '@/components/SensorSidebar';
import { TargetPanel } from '@/components/TargetPanel';
import { PipelineBar } from '@/components/PipelineBar';
import { DisasterScene, StandbyScene } from '@/components/DisasterScene';
import { ResetModal } from '@/components/ResetModal';
import { SENSOR_VIDEO_CONFIG } from '@/config/sensorVideos';
import {
  SurveyHero,
  ReconstructHero,
  DetectHero,
  FuseHero,
  PrioritizeHero,
  RouteHero,
} from '@/components/StageHeroes';
import type { SensorId } from '@/types';

// ================================================================
// SENSOR MAIN VIEWER — center pane when a sensor is selected
// ================================================================
function SensorMainViewer() {
  const { state, selectFeed } = useMissionStore();
  const feedId = state.selectedFeedId as SensorId;
  const feed = state.sensorFeeds.find((f) => f.id === feedId);
  const videoSrc = SENSOR_VIDEO_CONFIG[feedId];
  const hasVideo = videoSrc !== '';
  const isActive = feed?.status !== 'standby';

  // ESC key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectFeed(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectFeed]);

  return (
    <motion.div
      key={feedId}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col bg-navy-950"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-navy-900 border-b border-navy-700">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
          <span className="text-sm font-bold text-white tracking-wide">{feed?.label}</span>
          <span className="text-[9px] bg-navy-700 text-gray-500 px-2 py-0.5 rounded font-mono tracking-wider">
            SIMULATED
          </span>
        </div>
        <button
          onClick={() => selectFeed(null)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-navy-700 transition-colors border border-navy-600"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Close feed</span>
        </button>
      </div>

      {/* Feed area — use object-fit: contain for main viewer */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-navy-950 p-3">
        {hasVideo && isActive ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="max-w-full max-h-full rounded"
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="grid-bg absolute inset-0 opacity-10 rounded" />
            {isActive ? (
              <>
                <Video className="w-10 h-10 text-navy-500" />
                <div>
                  <div className="text-sm text-gray-500 font-medium">Sensor Feed Unavailable</div>
                  <div className="text-xs text-gray-700 mt-1">{feed?.label} — No asset configured</div>
                </div>
              </>
            ) : (
              <>
                <VideoOff className="w-10 h-10 text-gray-700" />
                <div>
                  <div className="text-sm text-gray-600 font-medium">System Standby</div>
                  <div className="text-xs text-gray-700 mt-1">Create a mission to activate sensors</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-navy-900 border-t border-navy-700">
        <span className="text-[10px] text-gray-600">{feed?.description}</span>
        <span className="text-[10px] font-mono text-gray-700 hidden sm:block">ESC to close</span>
      </div>
    </motion.div>
  );
}

// ================================================================
// MOBILE SENSOR STRIP — horizontal scrollable sensor selector
// ================================================================
function MobileSensorStrip() {
  const { state, selectFeed } = useMissionStore();
  const isStandby = state.missionStatus === 'standby';

  return (
    <div className="flex-shrink-0 border-t border-navy-700 bg-navy-900">
      <div className="flex overflow-x-auto gap-2 px-2 py-1.5" style={{ scrollbarWidth: 'none' }}>
        {state.sensorFeeds.map((feed) => {
          const isSelected = state.selectedFeedId === feed.id;
          const isActive = feed.status !== 'standby';
          return (
            <button
              key={feed.id}
              disabled={isStandby}
              onClick={() => selectFeed(isSelected ? null : feed.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg border transition-all min-w-[52px] ${
                isSelected
                  ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                  : isStandby
                    ? 'border-navy-700 bg-navy-850 text-gray-700'
                    : 'border-navy-700 bg-navy-850 text-gray-500 active:bg-navy-700'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className="text-[9px] font-mono tracking-wide">{feed.id.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
// STANDBY CENTER
// ================================================================
function StandbyCenter() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 relative">
      <div className="absolute inset-0 opacity-50">
        <StandbyScene />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full border-2 border-navy-600 flex items-center justify-center">
          <Radar className="w-10 h-10 text-navy-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-500 tracking-wider">Awaiting Mission Start</h2>
          <p className="text-sm text-gray-600 mt-1">CREATE A MISSION TO BEGIN AERIAL SEARCH</p>
        </div>
        <div className="flex items-center gap-6 mt-4">
          {[
            { icon: Plane, label: 'DRONE' },
            { icon: Crosshair, label: 'TARGETS' },
            { icon: MapPin, label: 'ROUTES' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <item.icon className="w-5 h-5 text-navy-600" />
              <span className="text-[10px] text-gray-700 tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// COMMAND CENTER — the main multi-column dashboard
// ================================================================
function CommandCenter() {
  const { state } = useMissionStore();
  const hasSelectedFeed = state.selectedFeedId !== null;

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* ── LEFT SIDEBAR: Sensor Feeds (md and up) ── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 border-r border-navy-700 bg-navy-900"
        style={{ width: 'clamp(200px, 22%, 260px)' }}
      >
        <SensorSidebar />
      </aside>

      {/* ── CENTER: 3D Map or Selected Feed ── */}
      <main className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Main view area */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {hasSelectedFeed ? (
              <SensorMainViewer key="feed-viewer" />
            ) : (
              <motion.div
                key="disaster-scene"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <DisasterScene />
                {/* Telemetry overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-navy-900/80 backdrop-blur-sm border border-navy-700 z-10 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <Plane className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-gray-500 uppercase">Alt</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {state.droneTelemetry.altitude.toFixed(1)}m
                    </span>
                  </div>
                  <div className="w-px h-3 bg-navy-600" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 uppercase">Bat</span>
                    <span className="text-[10px] font-mono text-green-400">
                      {state.droneTelemetry.battery.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile-only sensor strip */}
        <div className="md:hidden">
          <MobileSensorStrip />
        </div>
      </main>

      {/* ── RIGHT SIDEBAR: Target Panel (lg and up) ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 border-l border-navy-700 bg-navy-900"
        style={{ width: 'clamp(240px, 22%, 300px)' }}
      >
        <TargetPanel />
      </aside>
    </div>
  );
}

// ================================================================
// MOBILE COMMAND CENTER — compact stacked layout
// ================================================================
function MobileCommandCenter() {
  const { state } = useMissionStore();
  const hasSelectedFeed = state.selectedFeedId !== null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Main view */}
      <div className="flex-shrink-0" style={{ height: '45vh', minHeight: '240px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {hasSelectedFeed ? (
            <SensorMainViewer key="feed-viewer" />
          ) : (
            <motion.div key="scene" className="w-full h-full">
              <DisasterScene />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile sensor strip */}
      <MobileSensorStrip />

      {/* Compact target list */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TargetPanel />
      </div>
    </div>
  );
}

// ================================================================
// CENTER CONTENT — routes to the right hero per stage
// ================================================================
function CenterContent() {
  const { state } = useMissionStore();

  if (state.missionStatus === 'standby') {
    // On desktop use StandbyCenter embedded in CommandCenter shell,
    // on mobile use a simple standby + sensor strip
    return (
      <>
        {/* Desktop standby */}
        <div className="hidden md:flex flex-1 min-h-0">
          <aside
            className="flex-col flex-shrink-0 border-r border-navy-700 bg-navy-900 hidden md:flex"
            style={{ width: 'clamp(200px, 22%, 260px)' }}
          >
            <SensorSidebar />
          </aside>
          <main className="flex-1 min-h-0 bg-navy-950">
            <StandbyCenter />
          </main>
          <aside
            className="flex-col flex-shrink-0 border-l border-navy-700 bg-navy-900 hidden lg:flex"
            style={{ width: 'clamp(240px, 22%, 300px)' }}
          >
            <TargetPanel />
          </aside>
        </div>
        {/* Mobile standby */}
        <div className="flex md:hidden flex-1 flex-col min-h-0">
          <div className="flex-1 min-h-0 bg-navy-950">
            <StandbyCenter />
          </div>
          <MobileSensorStrip />
        </div>
      </>
    );
  }

  // Stage heroes (full-screen during active stage)
  if (state.currentStage === 'survey'      && state.stageStatus === 'active') return <SurveyHero />;
  if (state.currentStage === 'reconstruct' && state.stageStatus === 'active') return <ReconstructHero />;
  if (state.currentStage === 'detect'      && state.stageStatus === 'active') return <DetectHero />;
  if (state.currentStage === 'fuse'        && state.stageStatus === 'active') return <FuseHero />;
  if (state.currentStage === 'prioritize'  && state.stageStatus === 'active') return <PrioritizeHero />;
  if (state.currentStage === 'route'       && state.stageStatus === 'active') return <RouteHero />;

  // Final command center (after all stages or between stages)
  return (
    <>
      {/* Desktop 3-col layout */}
      <CommandCenter />
    </>
  );
}

// ================================================================
// APP ROOT
// ================================================================
export default function App() {
  const { state, resetMission } = useMissionStore();
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleResetConfirm = () => {
    resetMission();
    setResetModalOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-navy-950 overflow-hidden">
      <Header onResetClick={() => setResetModalOpen(true)} />

      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.currentStage}-${state.stageStatus}-${state.missionStatus}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 flex flex-col relative"
          >
            <CenterContent />
          </motion.div>
        </AnimatePresence>
      </div>

      <PipelineBar />

      <ResetModal
        open={resetModalOpen}
        missionId={state.missionId}
        onCancel={() => setResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
}
