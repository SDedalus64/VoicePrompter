import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { Segment, SessionPlan } from '../lib/types';
import { useStore } from '../lib/store';
import { v4 as uuid } from 'uuid';

export default function ScriptComposer() {
  const { plan, setPlan } = useStore();
  const [title, setTitle] = useState(plan?.title ?? 'Service vs Product: Trust Analogy');

  const addSegment = () => {
    const seg: Segment = {
      id: uuid(),
      title: 'Glass → Basic',
      keyPoints: ['Serviceable but limited', 'No temperature control', 'No spill guard'],
      promptType: 'topic',
      targetSecs: 45,
      toleranceSecs: 15,
      minGapMs: 400,
      cueStyle: 'tone_then_tts',
      priority: 2,
    };
    const next: SessionPlan = plan ? { ...plan, segments: [...plan.segments, seg] } :
      { id: uuid(), title, segments: [seg], policy: { interruptMode:'tone_only', maxRambleSecs: 70, preRollToneMs: 250, asrEnabled:false } as any };
    setPlan(next);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Script Composer</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Session title" />
      <Button title="Add example segment" onPress={addSegment} />
      <FlatList
        data={plan?.segments ?? []}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
            <Text>{item.keyPoints.join(' • ')}</Text>
          </View>
        )}
      />
    </View>
  );
}
