import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';
import type { SessionPlan } from '../types';

type CoachEvent = { type: 'status' | 'error' | 'cue'; message: string };

const { AudioCoach } = NativeModules as any;
const emitter = new NativeEventEmitter(AudioCoach);

export default {
  startSession(plan: SessionPlan): Promise<void> {
    return AudioCoach.startSession(JSON.stringify(plan));
  },
  stopSession(): Promise<void> {
    return AudioCoach.stopSession();
  },
  addListener(cb: (e: CoachEvent) => void): EmitterSubscription {
    return emitter.addListener('AudioCoachEvent', cb);
  },
};
