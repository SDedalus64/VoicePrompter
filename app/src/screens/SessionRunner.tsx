import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import AudioCoach from '../lib/audio/AudioCoach';
import { useStore } from '../lib/store';

export default function SessionRunner() {
  const { plan } = useStore();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('idle');
  const [lastCue, setLastCue] = useState<string | undefined>(undefined);

  useEffect(() => {
    const sub = AudioCoach.addListener((evt) => {
      if (evt.type === 'status') setStatus(evt.message);
      if (evt.type === 'cue') setLastCue(evt.message);
    });
    return () => sub.remove();
  }, []);

  if (!plan) return <Text>Compose a plan first.</Text> as any;

  const start = async () => {
    await AudioCoach.startSession(plan);
    setRunning(true);
  };
  const stop = async () => {
    await AudioCoach.stopSession();
    setRunning(false);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Session Runner</Text>
      <Text>Status: {status}</Text>
      {lastCue ? <Text>Last cue: {lastCue}</Text> : null}
      {!running ? <Button title="Start" onPress={start} /> : <Button title="Stop" onPress={stop} />}
    </View>
  );
}
