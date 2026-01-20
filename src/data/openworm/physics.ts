/**
 * Sibernetic Physics Engine - JavaScript Port
 * 
 * This module provides a simplified JavaScript implementation of the physics
 * concepts from OpenWorm's Sibernetic project (github.com/openworm/sibernetic).
 * 
 * Sibernetic uses Smoothed Particle Hydrodynamics (SPH) to simulate the worm's
 * body mechanics in fluid environments. This JS version provides educational
 * approximations suitable for browser-based learning.
 * 
 * Physical properties based on:
 * - Cohen & Sanders, 2014: Muscle contraction mechanics
 * - Boyle et al., 2012: C. elegans locomotion physics
 * - Sznitman et al., 2010: Swimming mechanics in low Reynolds number
 */

// Physical constants for C. elegans
export const WORM_PHYSICS = {
  // Body dimensions (micrometers converted to simulation units)
  bodyLength: 1000,       // ~1mm
  bodyRadius: 40,         // ~40μm average radius
  numSegments: 24,        // Standard body segments
  
  // Material properties
  cuticleStiffness: 0.8,   // Normalized stiffness (0-1)
  muscleTension: 0.6,      // Maximum muscle tension
  fluidViscosity: 0.001,   // Water-like viscosity
  
  // Motion parameters
  crawlingFrequency: 0.5,  // Hz - sinusoidal crawling
  swimmingFrequency: 2.0,  // Hz - faster in liquid
  wavelength: 0.6,         // Body wavelengths in one cycle
  
  // Reynolds number (low = viscous-dominated)
  reynoldsNumber: 0.01,    // Very low, viscous forces dominate
};

export interface WormSegment {
  index: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  dorsalActivation: number;  // 0-1 muscle activation
  ventralActivation: number; // 0-1 muscle activation
  curvature: number;         // Current curvature
}

export interface PhysicsState {
  segments: WormSegment[];
  time: number;
  isSwimming: boolean;
  bodyAngle: number;
}

export interface MotorCommand {
  dorsalWave: number[];     // Activation pattern for dorsal muscles
  ventralWave: number[];    // Activation pattern for ventral muscles
  frequency: number;
  amplitude: number;
  direction: "forward" | "backward";
}

/**
 * Initialize worm body segments in a resting pose
 */
export function createWormBody(numSegments: number = 24): WormSegment[] {
  const segments: WormSegment[] = [];
  const segmentLength = WORM_PHYSICS.bodyLength / numSegments;
  
  for (let i = 0; i < numSegments; i++) {
    segments.push({
      index: i,
      position: {
        x: 0,
        y: i * segmentLength,
        z: 0,
      },
      velocity: { x: 0, y: 0, z: 0 },
      dorsalActivation: 0,
      ventralActivation: 0,
      curvature: 0,
    });
  }
  
  return segments;
}

/**
 * Generate motor command for locomotion
 * Based on propagating wave patterns in real C. elegans
 */
export function generateMotorCommand(
  direction: "forward" | "backward",
  amplitude: number = 0.5,
  isSwimming: boolean = false
): MotorCommand {
  const numSegments = WORM_PHYSICS.numSegments;
  const dorsalWave: number[] = [];
  const ventralWave: number[] = [];
  const frequency = isSwimming ? WORM_PHYSICS.swimmingFrequency : WORM_PHYSICS.crawlingFrequency;
  
  for (let i = 0; i < numSegments; i++) {
    // Phase offset creates traveling wave
    const phase = (direction === "forward" ? i : numSegments - i - 1) * (2 * Math.PI / numSegments) * WORM_PHYSICS.wavelength;
    
    // Dorsal and ventral are 180° out of phase (alternating contraction)
    dorsalWave.push(Math.max(0, Math.sin(phase)) * amplitude);
    ventralWave.push(Math.max(0, Math.sin(phase + Math.PI)) * amplitude);
  }
  
  return { dorsalWave, ventralWave, frequency, amplitude, direction };
}

/**
 * Update physics simulation for one timestep
 * Simplified SPH-inspired calculations
 */
export function updatePhysics(
  state: PhysicsState,
  motorCommand: MotorCommand,
  deltaTime: number
): PhysicsState {
  const { segments, time, isSwimming } = state;
  const newTime = time + deltaTime;
  
  // Apply motor commands with time-dependent wave
  const phaseOffset = newTime * motorCommand.frequency * 2 * Math.PI;
  
  const newSegments = segments.map((segment, i) => {
    // Calculate current muscle activation from wave pattern
    const wavePhase = phaseOffset + (i / segments.length) * 2 * Math.PI * WORM_PHYSICS.wavelength;
    const baseDorsal = motorCommand.dorsalWave[i] || 0;
    const baseVentral = motorCommand.ventralWave[i] || 0;
    
    // Modulate with traveling wave
    const dorsalActivation = baseDorsal * Math.max(0, Math.sin(wavePhase));
    const ventralActivation = baseVentral * Math.max(0, Math.sin(wavePhase + Math.PI));
    
    // Calculate curvature from muscle differential
    const curvature = (dorsalActivation - ventralActivation) * WORM_PHYSICS.muscleTension;
    
    // Update position based on curvature (simplified bending mechanics)
    const curvatureIntegral = curvature * (WORM_PHYSICS.bodyLength / segments.length);
    const angle = state.bodyAngle + curvatureIntegral * i;
    
    // New position from bending
    const newX = segment.position.x + Math.sin(angle) * curvatureIntegral;
    const newZ = segment.position.z + Math.cos(angle) * curvatureIntegral * 0.5;
    
    // Apply viscous damping (low Reynolds number)
    const dampingFactor = isSwimming ? 0.95 : 0.8;
    const velocityX = (newX - segment.position.x) / deltaTime * dampingFactor;
    const velocityZ = (newZ - segment.position.z) / deltaTime * dampingFactor;
    
    return {
      ...segment,
      position: { ...segment.position, x: newX, z: newZ },
      velocity: { x: velocityX, y: 0, z: velocityZ },
      dorsalActivation,
      ventralActivation,
      curvature,
    };
  });
  
  // Calculate forward/backward movement based on wave propagation
  const propulsiveForce = motorCommand.direction === "forward" ? 1 : -1;
  const speed = motorCommand.amplitude * (isSwimming ? 2 : 0.5) * propulsiveForce;
  
  // Update positions with net movement
  const movedSegments = newSegments.map((segment, i) => ({
    ...segment,
    position: {
      ...segment.position,
      y: segment.position.y + speed * deltaTime * (1 - i / newSegments.length * 0.1),
    },
  }));
  
  return {
    segments: movedSegments,
    time: newTime,
    isSwimming,
    bodyAngle: state.bodyAngle + (movedSegments[0]?.curvature || 0) * deltaTime,
  };
}

/**
 * Calculate body shape from segment data
 * Returns points for rendering as a spline
 */
export function getBodySpline(segments: WormSegment[]): { x: number; y: number; z: number }[] {
  return segments.map(s => s.position);
}

/**
 * Calculate muscle visualization data
 */
export function getMuscleVisualization(segments: WormSegment[]): {
  segment: number;
  dorsal: number;
  ventral: number;
  color: string;
}[] {
  return segments.map((s, i) => {
    const dorsal = s.dorsalActivation;
    const ventral = s.ventralActivation;
    
    // Color based on which muscle is more active
    let color: string;
    if (dorsal > ventral + 0.1) {
      color = `hsl(0, 80%, ${50 + dorsal * 30}%)`; // Red for dorsal
    } else if (ventral > dorsal + 0.1) {
      color = `hsl(220, 80%, ${50 + ventral * 30}%)`; // Blue for ventral
    } else {
      color = `hsl(0, 0%, ${60}%)`; // Gray for balanced
    }
    
    return { segment: i, dorsal, ventral, color };
  });
}

/**
 * Simulate touch response using physics
 */
export function simulateTouchResponse(
  touchLocation: "head" | "tail" | "body",
  touchForce: number = 0.5
): MotorCommand {
  switch (touchLocation) {
    case "head":
      // Escape backward
      return generateMotorCommand("backward", touchForce * 0.8);
    case "tail":
      // Escape forward
      return generateMotorCommand("forward", touchForce * 0.8);
    case "body":
      // Curl away from touch
      return generateMotorCommand("backward", touchForce * 0.4);
    default:
      return generateMotorCommand("forward", 0.3);
  }
}

/**
 * Create initial physics state
 */
export function createPhysicsState(isSwimming: boolean = false): PhysicsState {
  return {
    segments: createWormBody(),
    time: 0,
    isSwimming,
    bodyAngle: 0,
  };
}

/**
 * Physics simulation loop (for use with requestAnimationFrame)
 */
export class WormPhysicsSimulator {
  private state: PhysicsState;
  private motorCommand: MotorCommand;
  private lastTime: number = 0;
  private onUpdate?: (state: PhysicsState) => void;
  private animationFrame?: number;
  
  constructor(isSwimming: boolean = false) {
    this.state = createPhysicsState(isSwimming);
    this.motorCommand = generateMotorCommand("forward", 0.5, isSwimming);
  }
  
  setMotorCommand(command: MotorCommand) {
    this.motorCommand = command;
  }
  
  setDirection(direction: "forward" | "backward", amplitude: number = 0.5) {
    this.motorCommand = generateMotorCommand(direction, amplitude, this.state.isSwimming);
  }
  
  applyTouch(location: "head" | "tail" | "body", force: number = 0.5) {
    this.motorCommand = simulateTouchResponse(location, force);
  }
  
  start(onUpdate: (state: PhysicsState) => void) {
    this.onUpdate = onUpdate;
    this.lastTime = performance.now();
    this.animate();
  }
  
  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  getState(): PhysicsState {
    return this.state;
  }
  
  private animate = () => {
    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = now;
    
    this.state = updatePhysics(this.state, this.motorCommand, deltaTime);
    
    if (this.onUpdate) {
      this.onUpdate(this.state);
    }
    
    this.animationFrame = requestAnimationFrame(this.animate);
  };
}
