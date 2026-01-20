import { useState, useCallback, useRef } from "react";
import { RaceParticipant } from "./useWormRace";

export interface RaceFrame {
  timestamp: number;
  participants: {
    id: string;
    position: number;
    worm_name: string;
    user_id: string;
    circuit_data: Record<string, unknown>;
    speed: number;
    neuronActivity: number[];
  }[];
}

export interface RaceRecording {
  raceId: string;
  raceName: string;
  raceDistance: number;
  startTime: number;
  endTime: number;
  duration: number;
  frames: RaceFrame[];
  finalResults: {
    id: string;
    worm_name: string;
    user_id: string;
    finish_rank: number | null;
    finish_time: number | null;
    avgSpeed: number;
    maxSpeed: number;
    neuronCount: number;
    connectionCount: number;
  }[];
}

export function useRaceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<RaceRecording | null>(null);
  const framesRef = useRef<RaceFrame[]>([]);
  const startTimeRef = useRef<number>(0);
  const speedHistoryRef = useRef<Map<string, number[]>>(new Map());

  const startRecording = useCallback((raceId: string, raceName: string, raceDistance: number) => {
    framesRef.current = [];
    speedHistoryRef.current = new Map();
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setRecording({
      raceId,
      raceName,
      raceDistance,
      startTime: startTimeRef.current,
      endTime: 0,
      duration: 0,
      frames: [],
      finalResults: [],
    });
  }, []);

  const recordFrame = useCallback((
    participants: RaceParticipant[],
    speedMap: Map<string, number>,
  ) => {
    if (!isRecording) return;

    const timestamp = Date.now() - startTimeRef.current;
    
    const frameParticipants = participants.map((p) => {
      const speed = speedMap.get(p.id) || 0;
      
      // Track speed history for analytics
      if (!speedHistoryRef.current.has(p.id)) {
        speedHistoryRef.current.set(p.id, []);
      }
      speedHistoryRef.current.get(p.id)?.push(speed);

      // Simulate neuron activity based on circuit data
      const neurons = (p.circuit_data?.neurons as unknown[]) || [];
      const neuronActivity = neurons.map((_, idx) => 
        Math.sin(timestamp / 200 + idx) * 0.5 + 0.5 + Math.random() * 0.2
      );

      return {
        id: p.id,
        position: p.position,
        worm_name: p.worm_name,
        user_id: p.user_id,
        circuit_data: p.circuit_data,
        speed,
        neuronActivity,
      };
    });

    framesRef.current.push({
      timestamp,
      participants: frameParticipants,
    });
  }, [isRecording]);

  const stopRecording = useCallback((participants: RaceParticipant[]) => {
    if (!isRecording || !recording) return null;

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;

    // Calculate final results with analytics
    const finalResults = participants.map((p) => {
      const speeds = speedHistoryRef.current.get(p.id) || [];
      const avgSpeed = speeds.length > 0 
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
        : 0;
      const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
      
      const neurons = (p.circuit_data?.neurons as unknown[]) || [];
      const connections = (p.circuit_data?.connections as unknown[]) || [];

      // Calculate finish time from first frame at 100%
      const finishFrame = framesRef.current.find(
        (f) => f.participants.find((fp) => fp.id === p.id)?.position >= 100
      );

      return {
        id: p.id,
        worm_name: p.worm_name,
        user_id: p.user_id,
        finish_rank: p.finish_rank,
        finish_time: finishFrame ? finishFrame.timestamp : null,
        avgSpeed,
        maxSpeed,
        neuronCount: neurons.length,
        connectionCount: connections.length,
      };
    });

    const completeRecording: RaceRecording = {
      ...recording,
      endTime,
      duration,
      frames: framesRef.current,
      finalResults,
    };

    setRecording(completeRecording);
    setIsRecording(false);
    return completeRecording;
  }, [isRecording, recording]);

  const clearRecording = useCallback(() => {
    setRecording(null);
    framesRef.current = [];
    speedHistoryRef.current = new Map();
  }, []);

  return {
    isRecording,
    recording,
    startRecording,
    recordFrame,
    stopRecording,
    clearRecording,
  };
}
