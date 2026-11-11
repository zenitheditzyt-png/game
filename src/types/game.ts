export type PartShape = 'block' | 'cylinder' | 'wedge' | 'sphere' | 'truss';

export type PartMaterial = 
  | 'Plastic'
  | 'SmoothPlastic'
  | 'Neon'
  | 'Slate'
  | 'Wood'
  | 'Glass'
  | 'Forcefield'
  | 'CorrodedMetal';

export type PartBehavior = 
  | 'none'
  | 'kill'             // Classic red neon kill-brick (instant oof)
  | 'checkpoint'       // Saves player spawn point
  | 'trampoline'       // High vertical bounce
  | 'speed_boost'      // High forward speed launch
  | 'conveyor'         // Pushes player along X or Z axis
  | 'disappearing'     // Shakes and fades after touched, then reappears
  | 'spinner'          // Continuously spins around Y axis
  | 'coin'             // Collectible Robux coin
  | 'gravity_coil'     // Gives gravity coil (higher jumps)
  | 'speed_coil'       // Gives speed coil (faster sprint)
  | 'win_door';        // Triggers victory celebration

export type StageDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Insane';

export type SkyTheme = 'day' | 'sunset' | 'night' | 'twilight';

export type WeatherEvent = 
  | 'normal'
  | 'low_gravity'     // Jump super high
  | 'rain_slippery'    // Super slippery floor (sliding physics)
  | 'snow_cold'       // Snowflakes & frost chill
  | 'rising_lava'     // Molten lava floor rises
  | 'speed_rush';     // Super sprint speed

export interface PartData {
  id: string;
  name: string;
  shape: PartShape;
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number]; // in degrees
  color: string;                     // Hex string e.g. '#FF0000'
  material: PartMaterial;
  transparency: number;              // 0 to 1
  reflectance: number;               // 0 to 1
  canCollide: boolean;
  anchored: boolean;
  behavior: PartBehavior;
  behaviorParam?: number;            // e.g. bounce height, speed multiplier, stage number
  scriptCode?: string;               // Optional Lua-like code
  difficulty?: StageDifficulty;
}

export interface GamePlace {
  id: string;
  name: string;
  description: string;
  author: string;
  gravity: number;
  spawnPoint: [number, number, number];
  parts: PartData[];
  createdAt: number;
}

export type GameState = 'title' | 'playing' | 'studio' | 'paused' | 'victory';

export type StudioTool = 'select' | 'move' | 'scale' | 'rotate' | 'paint' | 'delete';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  coins: number;
  stage: number;
  maxStages: number;
  deaths: number;
  elapsedSeconds: number;
  hasGravityCoil: boolean;
  hasSpeedCoil: boolean;
  difficulty: StageDifficulty;
  godMode: boolean;
  flyMode: boolean;
  infiniteJump: boolean;
  speedMultiplier: number;
}

export interface AvatarConfig {
  headColor: string;
  torsoColor: string;
  leftArmColor: string;
  rightArmColor: string;
  leftLegColor: string;
  rightLegColor: string;
  faceType: 'smile' | 'chill' | 'cool' | 'epic';
  hatType: 'none' | 'baseball_cap' | 'golden_crown' | 'ninja_headband' | 'blox_visor';
}

export const DEFAULT_AVATAR: AvatarConfig = {
  headColor: '#F5CD2F',      // Classic Noob Yellow
  torsoColor: '#0D69AC',     // Classic Noob Blue
  leftArmColor: '#F5CD2F',
  rightArmColor: '#F5CD2F',
  leftLegColor: '#A4BD47',   // Classic Noob Green
  rightLegColor: '#A4BD47',
  faceType: 'smile',
  hatType: 'none'
};

// Undo/Redo Command definition
export type CommandActionType = 'add' | 'delete' | 'modify';

export interface CommandAction {
  type: CommandActionType;
  partId: string;
  beforeData?: PartData;
  afterData?: PartData;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarColor: string;
  stage: number;
  timeSeconds: number;
  deaths: number;
  robux: number;
  isPlayer: boolean;
  badge?: string;
  rank?: number;
}

