
export enum EditorTab {
  Scene = 'SCENE',
  Scripting = 'SCRIPTING',
  Assets = 'ASSETS',
  Architecture = 'ARCHITECTURE',
  Build = 'BUILD'
}

export interface Asset {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'pdf' | 'script' | 'folder';
  size: string;
  parentId: string | null;
  url?: string;
}

export interface GameObject {
  id: string;
  name: string;
  type: string; 
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
  zIndex: number;
  color: string;
  locked?: boolean;
  components: {
    rigidbody?: { mass: number; gravityScale: number; isDynamic: boolean };
    collider?: { width: number; height: number; isTrigger: boolean; shape?: 'box' | 'circle' };
    animator?: { currentClip: string; speed: number };
    audio?: { clip: string; volume: number; playOnAwake: boolean };
    light?: { intensity: number; range: number; type: 'point' | 'spot' | 'area' };
    text?: { content: string; fontSize: number };
    ui?: { interactionType: string };
    script?: { source: string };
  };
  // Runtime state (not saved in project JSON usually, but kept in memory)
  runtime?: {
    vx: number;
    vy: number;
    vr: number;
  };
}

export interface ArchitectureModule {
  name: string;
  description: string;
  classes: string[];
  snippet: string;
}
