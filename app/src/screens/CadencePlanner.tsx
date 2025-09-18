import React from 'react';
import { View, Text, Button } from 'react-native';
import { useStore } from '../lib/store';

export default function CadencePlanner() {
  const { plan, setPlan } = useStore();
  if (!plan) return <Text>Compose a plan first.</Text> as any;

  const tweak = (idx: number, delta: number) => {
    const seg = { ...plan.segments[idx], targetSecs: Math.max(10, plan.segments[idx].targetSecs + delta) };
    const segments = [...plan.segments]; segments[idx] = seg;
    setPlan({ ...plan, segments });
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Cadence Planner</Text>
      {plan.segments.map((s, i) => (
        <View key={s.id} style={{ marginVertical: 12 }}>
          <Text>{s.title}</Text>
          <Text>Target: {s.targetSecs}s</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="-5s" onPress={() => tweak(i, -5)} />
            <Button title="+5s" onPress={() => tweak(i, +5)} />
          </View>
        </View>
      ))}
    </View>
  );
}
