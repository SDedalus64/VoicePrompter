export type PromptType = "topic" | "line";
export type CueStyle = "tone_then_tts" | "tone_only" | "tts_only";
export type InterruptMode = "none" | "tone_only" | "soft_duck";

export interface Segment {
  id: string;
  title: string;
  keyPoints: string[];
  promptType: PromptType;
  targetSecs: number;
  toleranceSecs?: number;
  minGapMs: number;
  cueStyle: CueStyle;
  priority: number;
  promptText?: string;
}

export interface SessionPolicy {
  interruptMode: InterruptMode;
  maxRambleSecs: number;
  fallbackCueText?: string;
  preRollToneMs: number;
  asrEnabled: boolean;
  ttsVoiceId?: string;
}

export interface SessionPlan {
  id: string;
  title: string;
  segments: Segment[];
  policy: SessionPolicy;
}
