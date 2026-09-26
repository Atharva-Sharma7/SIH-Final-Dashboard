import { create } from 'zustand';
import type {
  MissionState,
  StageId,
  StageStatus,
  SensorFeed,
  PipelineStage,
  Target,
  DroneTelemetry,
} from '@/types';
import {
  TARGETS,
  HAZARDS,
  RESCUE_TEAM,
  SAFE_ROUTE,
  FAST_ROUTE,
  RESCUE_TEAM_LOCATION,
  DRONE_LOCATION,
  STAGE_DURATIONS,
  generateMissionId,
  formatTime,
} from '@/config/missionData';
import { SENSOR_VIDEO_CONFIG, SENSOR_LABELS, SENSOR_DESCRIPTIONS } from '@/config/sensorVideos';
import type { SensorId } from '@/types';

const PIPELINE_ORDER: StageId[] = [
  'init',
  'survey',
  'reconstruct',
  'detect',
  'fuse',
  'prioritize',
  'route',
  'report',
];

function createInitialPipeline(): PipelineStage[] {
  return [
    { id: 'init', label: 'INIT', status: 'idle', progress: 0 },
    { id: 'survey', label: 'SURVEY', status: 'idle', progress: 0 },
    { id: 'reconstruct', label: '3D MAP', status: 'idle', progress: 0 },
    { id: 'detect', label: 'DETECT', status: 'idle', progress: 0 },
    { id: 'fuse', label: 'FUSE', status: 'idle', progress: 0 },
    { id: 'prioritize', label: 'PRIORITIZE', status: 'idle', progress: 0 },
    { id: 'route', label: 'PLAN ROUTE', status: 'idle', progress: 0 },
    { id: 'report', label: 'REPORT', status: 'idle', progress: 0 },
  ];
}

function createInitialSensors(): SensorFeed[] {
  const ids: SensorId[] = ['rgb', 'thermal', 'lidar', 'uwb', 'em'];
  return ids.map((id) => ({
    id,
    label: SENSOR_LABELS[id],
    description: SENSOR_DESCRIPTIONS[id],
    status: 'standby',
    hasVideo: SENSOR_VIDEO_CONFIG[id] !== '',
  }));
}

function createInitialTelemetry(): DroneTelemetry {
  return {
    altitude: 0,
    flight: 'IDLE',
    battery: 100,
    position: { ...DRONE_LOCATION },
  };
}

const STANDBY_STATE: MissionState = {
  missionId: null,
  missionStatus: 'standby',
  currentStage: 'init',
  stageStatus: 'idle',
  stageProgress: 0,
  sensorFeeds: createInitialSensors(),
  targets: [],
  selectedTargetId: null,
  selectedFeedId: null,
  rescueTeam: null,
  safeRoute: null,
  fastRoute: null,
  selectedRoute: null,
  hazards: [],
  droneTelemetry: createInitialTelemetry(),
  pipeline: createInitialPipeline(),
  createdAt: null,
  error: null,
  failedStage: null,
};

interface MissionStore {
  state: MissionState;
  resetMission: () => void;
  createMission: () => void;
  selectTarget: (id: string) => void;
  selectRoute: (id: string) => void;
  selectFeed: (id: SensorId | null) => void;
  setStageProgress: (progress: number) => void;
  _timers: ReturnType<typeof setTimeout>[];
  _clearTimers: () => void;
}

function updatePipeline(
  pipeline: PipelineStage[],
  stageId: StageId,
  status: StageStatus,
  progress: number,
): PipelineStage[] {
  return pipeline.map((s) =>
    s.id === stageId ? { ...s, status, progress } : s,
  );
}

function startStage(
  state: MissionState,
  stage: StageId,
): Partial<MissionState> {
  return {
    currentStage: stage,
    stageStatus: 'active',
    stageProgress: 0,
    pipeline: updatePipeline(state.pipeline, stage, 'active', 0),
  };
}

function completeStage(
  state: MissionState,
  stage: StageId,
): Partial<MissionState> {
  return {
    stageStatus: 'complete',
    stageProgress: 100,
    pipeline: updatePipeline(state.pipeline, stage, 'complete', 100),
  };
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  state: { ...STANDBY_STATE },
  _timers: [],
  _clearTimers: () => {
    get()._timers.forEach((t) => clearTimeout(t));
    set({ _timers: [] });
  },

  resetMission: () => {
    get()._clearTimers();
    set({
      state: {
        ...STANDBY_STATE,
        sensorFeeds: createInitialSensors(),
        pipeline: createInitialPipeline(),
        droneTelemetry: createInitialTelemetry(),
      },
      _timers: [],
    });
  },

  setStageProgress: (progress: number) => {
    set((store) => ({
      state: {
        ...store.state,
        stageProgress: progress,
        pipeline: store.state.pipeline.map((s) =>
          s.id === store.state.currentStage
            ? { ...s, progress }
            : s,
        ),
      },
    }));
  },

  createMission: () => {
    get()._clearTimers();
    const missionId = generateMissionId();
    const now = new Date();
    const createdAt = formatTime(now);

    const sensors = createInitialSensors().map((s) => ({
      ...s,
      status: 'active' as const,
    }));

    const freshPipeline = createInitialPipeline().map((s) =>
      s.id === 'init' ? { ...s, status: 'complete' as const, progress: 100 } : s,
    );

    set({
      state: {
        ...STANDBY_STATE,
        missionId,
        missionStatus: 'active',
        currentStage: 'survey',
        stageStatus: 'active',
        stageProgress: 0,
        sensorFeeds: sensors,
        pipeline: freshPipeline,
        createdAt,
        droneTelemetry: {
          altitude: 0,
          flight: 'ASCENDING',
          battery: 100,
          position: { ...DRONE_LOCATION },
        },
      },
      _timers: [],
    });

    runPipeline(set, get);
  },

  selectTarget: (id: string) => {
    set((store) => ({
      state: { ...store.state, selectedTargetId: id },
    }));
  },

  selectRoute: (id: string) => {
    set((store) => ({
      state: { ...store.state, selectedRoute: id },
    }));
  },

  selectFeed: (id: SensorId | null) => {
    set((store) => ({
      state: { ...store.state, selectedFeedId: id },
    }));
  },
}));

type StoreSetter = (
  partial: Partial<MissionStore> | ((state: MissionStore) => Partial<MissionStore>),
) => void;

function runPipeline(
  set: StoreSetter,
  get: () => MissionStore,
) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const addTimer = (fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timers.push(t);
  };

  set({ _timers: timers });

  // === SURVEY === ~10 seconds
  // Progress updates
  const surveyDuration = STAGE_DURATIONS.survey;
  const surveySteps = 50;
  for (let i = 1; i <= surveySteps; i++) {
    addTimer(() => {
      const progress = (i / surveySteps) * 100;
      set((store) => ({
        state: {
          ...store.state,
          stageProgress: progress,
          droneTelemetry: {
            ...store.state.droneTelemetry,
            altitude: Math.min(45, (i / surveySteps) * 45),
            flight: i < surveySteps ? 'ASCENDING' : 'HOLDING',
            battery: Math.max(85, 100 - (i / surveySteps) * 15),
          },
          pipeline: store.state.pipeline.map((s) =>
            s.id === 'survey' ? { ...s, progress } : s,
          ),
        },
      }));
    }, (surveyDuration / surveySteps) * i);
  }

  // Survey complete
  addTimer(() => {
    set((store) => ({
      state: {
        ...store.state,
        ...completeStage(store.state, 'survey'),
        sensorFeeds: store.state.sensorFeeds.map((s) => ({
          ...s,
          status: 'playing',
        })),
      },
    }));
  }, surveyDuration);

  // === RECONSTRUCT (3D MAP) === ~5 seconds
  const reconstructStart = surveyDuration + 200;
  addTimer(() => {
    set((store) => ({
      state: { ...store.state, ...startStage(store.state, 'reconstruct') },
    }));
  }, reconstructStart);

  const reconDuration = STAGE_DURATIONS.reconstruct;
  const reconSteps = 40;
  for (let i = 1; i <= reconSteps; i++) {
    addTimer(() => {
      const progress = (i / reconSteps) * 100;
      set((store) => ({
        state: {
          ...store.state,
          stageProgress: progress,
          pipeline: store.state.pipeline.map((s) =>
            s.id === 'reconstruct' ? { ...s, progress } : s,
          ),
        },
      }));
    }, reconstructStart + (reconDuration / reconSteps) * i);
  }

  addTimer(() => {
    set((store) => ({
      state: {
        ...store.state,
        ...completeStage(store.state, 'reconstruct'),
      },
    }));
  }, reconstructStart + reconDuration);

  // === DETECT === ~12 seconds
  const detectStart = reconstructStart + reconDuration + 200;
  addTimer(() => {
    set((store) => ({
      state: { ...store.state, ...startStage(store.state, 'detect') },
    }));
  }, detectStart);

  // Targets appear one by one
  const detectDuration = STAGE_DURATIONS.detect;
  const targetAppearTimes = [0.15, 0.4, 0.65, 0.9];
  TARGETS.forEach((target, idx) => {
    addTimer(() => {
      set((store) => ({
        state: {
          ...store.state,
          targets: [...store.state.targets, target],
          stageProgress: ((idx + 1) / TARGETS.length) * 100,
          pipeline: store.state.pipeline.map((s) =>
            s.id === 'detect'
              ? { ...s, progress: ((idx + 1) / TARGETS.length) * 100 }
              : s,
          ),
        },
      }));
    }, detectStart + detectDuration * targetAppearTimes[idx]);
  });

  addTimer(() => {
    set((store) => ({
      state: {
        ...store.state,
        ...completeStage(store.state, 'detect'),
        selectedTargetId: 'T01',
      },
    }));
  }, detectStart + detectDuration);

  // === FUSE === ~3 seconds
  const fuseStart = detectStart + detectDuration + 200;
  addTimer(() => {
    set((store) => ({
      state: { ...store.state, ...startStage(store.state, 'fuse') },
    }));
  }, fuseStart);

  const fuseDuration = STAGE_DURATIONS.fuse;
  const fuseSteps = 30;
  for (let i = 1; i <= fuseSteps; i++) {
    addTimer(() => {
      const progress = (i / fuseSteps) * 100;
      set((store) => ({
        state: {
          ...store.state,
          stageProgress: progress,
          pipeline: store.state.pipeline.map((s) =>
            s.id === 'fuse' ? { ...s, progress } : s,
          ),
        },
      }));
    }, fuseStart + (fuseDuration / fuseSteps) * i);
  }

  addTimer(() => {
    set((store) => ({
      state: {
        ...store.state,
        ...completeStage(store.state, 'fuse'),
      },
    }));
  }, fuseStart + fuseDuration);

  // === PRIORITIZE === ~5 seconds
  const priorStart = fuseStart + fuseDuration + 200;
  addTimer(() => {
    set((store) => ({
      state: { ...store.state, ...startStage(store.state, 'prioritize') },
    }));
  }, priorStart);

  const priorDuration = STAGE_DURATIONS.prioritize;
  const priorSteps = 40;
  for (let i = 1; i <= priorSteps; i++) {
    addTimer(() => {
      const progress = (i / priorSteps) * 100;
      set((store) => ({
        state: {
          ...store.state,
          stageProgress: progress,
          pipeline: store.state.pipeline.map((s) =>
            s.id === 'prioritize' ? { ...s, progress } : s,
          ),
        },
      }));
    }, priorStart + (priorDuration / priorSteps) * i);
  }

  addTimer(() => {
    set((store) => ({
      state: {
        ...store.state,
        ...completeStage(store.state, 'prioritize'),
        rescueTeam: {
          ...RESCUE_TEAM,
          distanceToTarget: computeDistance(RESCUE_TEAM_LOCATION, TARGETS[0].location),
        },
      },
    }));
  }, priorStart + priorDuration);

  // === ROUTE === ~6 seconds
  const routeStart = priorStart + priorDuration + 200;
  addTimer(() => {
    set((store) => ({
      state: {
        ...store.state,
        ...startStage(store.state, 'route'),
        hazards: HAZARDS,
      },
    }));
  }, routeStart);

  const routeDuration = STAGE_DURATIONS.route;
  const routeSteps = 40;
  for (let i = 1; i <= routeSteps; i++) {
    addTimer(() => {
      const progress = (i / routeSteps) * 100;
      set((store) => ({
        state: {
          ...store.state,
          stageProgress: progress,
          pipeline: store.state.pipeline.map((s) =>
            s.id === 'route' ? { ...s, progress } : s,
          ),
        },
      }));
    }, routeStart + (routeDuration / routeSteps) * i);
  }

  // Show safe route at 40%
  addTimer(() => {
    set((store) => ({
      state: { ...store.state, safeRoute: SAFE_ROUTE, selectedRoute: 'safe' },
    }));
  }, routeStart + routeDuration * 0.4);

  // Show fast route at 70%
  addTimer(() => {
    set((store) => ({
      state: { ...store.state, fastRoute: FAST_ROUTE },
    }));
  }, routeStart + routeDuration * 0.7);

  // Route complete → mission ready
  addTimer(() => {
    set((store) => {
      // First mark 'route' complete on the current pipeline
      const pipelineWithRoute = updatePipeline(store.state.pipeline, 'route', 'complete', 100);
      // Then mark 'report' complete on top of that
      const pipelineFinal = updatePipeline(pipelineWithRoute, 'report', 'complete', 100);
      return {
        state: {
          ...store.state,
          stageStatus: 'complete',
          stageProgress: 100,
          currentStage: 'report',
          missionStatus: 'ready',
          pipeline: pipelineFinal,
        },
      };
    });
  }, routeStart + routeDuration);
}

function computeDistance(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 10) / 10;
}
