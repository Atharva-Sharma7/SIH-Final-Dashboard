import { Video, VideoOff, Wifi, WifiOff } from 'lucide-react';
import { useMissionStore } from '@/store/missionStore';
import { SENSOR_VIDEO_CONFIG } from '@/config/sensorVideos';
import type { SensorFeed } from '@/types';

// ================================================================
// SENSOR CARD — used in sidebar (thumbnail view, click to select)
// ================================================================
interface SensorCardProps {
  feed: SensorFeed;
}

function SensorCard({ feed }: SensorCardProps) {
  const { state, selectFeed } = useMissionStore();
  const videoSrc = SENSOR_VIDEO_CONFIG[feed.id];
  const hasVideo = videoSrc !== '';
  const isStandby = feed.status === 'standby';
  const isActive = feed.status === 'active' || feed.status === 'playing';
  const isSelected = state.selectedFeedId === feed.id;

  const handleClick = () => {
    // Toggle: clicking the already-selected feed clears it
    selectFeed(isSelected ? null : feed.id);
  };

  const statusColor = isStandby ? 'text-gray-600' : isActive ? 'text-green-400' : 'text-amber-400';

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg overflow-hidden border cursor-pointer transition-all ${
        isSelected
          ? 'border-cyan-500/60 ring-1 ring-cyan-500/30 bg-navy-800'
          : 'border-navy-700 bg-navy-850 hover:border-navy-500'
      }`}
    >
      {/* Thumbnail area — aspect-ratio 16:9 */}
      <div className="relative bg-navy-950 overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {hasVideo && !isStandby ? (
          <video
            src={videoSrc}
            muted
            autoPlay
            playsInline
            loop
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <div className="grid-bg absolute inset-0 opacity-20" />
            {isStandby ? (
              <>
                <VideoOff className="w-4 h-4 text-gray-700 relative z-10" />
                <span className="text-[9px] text-gray-700 tracking-widest relative z-10">STANDBY</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4 text-navy-500 relative z-10" />
                <span className="text-[9px] text-amber-500/60 tracking-widest relative z-10 text-center px-1">
                  AWAITING ASSET
                </span>
              </>
            )}
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 bg-cyan-500 rounded px-1 py-0.5 z-10">
            <span className="text-[8px] font-bold text-navy-950">SELECTED</span>
          </div>
        )}
      </div>

      {/* Label bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-navy-800">
        <div className="flex items-center gap-1.5 min-w-0">
          {isActive
            ? <Wifi className={`w-2.5 h-2.5 flex-shrink-0 ${statusColor}`} />
            : <WifiOff className="w-2.5 h-2.5 flex-shrink-0 text-gray-600" />
          }
          <span className="text-[10px] font-semibold text-gray-300 tracking-wide truncate">{feed.label}</span>
        </div>
        <span className={`text-[9px] font-mono flex-shrink-0 ml-1 ${statusColor}`}>
          {isStandby ? 'STBY' : isActive ? (hasVideo ? 'LIVE' : 'SIM') : 'PAUSED'}
        </span>
      </div>
    </div>
  );
}

// ================================================================
// SENSOR SIDEBAR — used in CommandCenter (scrollable feed list)
// ================================================================
export function SensorSidebar() {
  const { state } = useMissionStore();
  const activeCount = state.sensorFeeds.filter(f => f.status !== 'standby').length;

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-navy-700">
        <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
          Sensor Feeds
        </span>
        <span className="text-[9px] text-gray-600 font-mono">{activeCount}/5 ACTIVE</span>
      </div>

      {/* Scrollable feed list — min-h-0 is critical to allow shrinking */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2 space-y-2">
        {state.sensorFeeds.map((feed) => (
          <SensorCard key={feed.id} feed={feed} />
        ))}
      </div>

      {/* Hint when a feed is selected */}
      {state.selectedFeedId && (
        <div className="flex-shrink-0 px-2 py-1.5 border-t border-navy-700 bg-navy-800">
          <p className="text-[9px] text-cyan-400/70 text-center tracking-wide">
            Click again to close · ESC to dismiss
          </p>
        </div>
      )}
    </div>
  );
}

// ================================================================
// SURVEY SENSOR GRID — still exported for backward compatibility
// ================================================================
export function SurveySensorGrid() {
  return null; // SurveyHero now handles this internally
}
