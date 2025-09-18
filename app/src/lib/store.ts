import { create } from 'zustand';
import { SessionPlan } from './types';

type S = { plan?: SessionPlan; setPlan: (p: SessionPlan) => void; };
export const useStore = create<S>((set) => ({ setPlan: (plan) => set({ plan }) }));
