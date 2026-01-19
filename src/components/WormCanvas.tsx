import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WormCanvasProps {
  className?: string;
  neuronCount?: number;
  animated?: boolean;
}

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number[];
  pulsePhase: number;
  active: boolean;
}

// Canvas-compatible colors (must use comma-separated format)
const COLORS = {
  primary: { h: 200, s: 98, l: 39 },
  accent: { h: 142, s: 76, l: 36 },
};

const hslToString = (color: typeof COLORS.primary, alpha: number = 1) => {
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
};

export function WormCanvas({ className, neuronCount = 50, animated = true }: WormCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuronsRef = useRef<Neuron[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize neurons
    const neurons: Neuron[] = [];
    for (let i = 0; i < neuronCount; i++) {
      const neuron: Neuron = {
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 3 + Math.random() * 4,
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2,
        active: Math.random() > 0.7,
      };

      // Create connections
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const target = Math.floor(Math.random() * neuronCount);
        if (target !== i) {
          neuron.connections.push(target);
        }
      }

      neurons.push(neuron);
    }
    neuronsRef.current = neurons;

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const neurons = neuronsRef.current;

      // Draw connections
      neurons.forEach((neuron) => {
        neuron.connections.forEach((targetIdx) => {
          if (targetIdx < neurons.length) {
            const target = neurons[targetIdx];
            const dx = target.x - neuron.x;
            const dy = target.y - neuron.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) {
              const opacity = (1 - dist / 200) * 0.3;
              ctx.beginPath();
              ctx.moveTo(neuron.x, neuron.y);
              ctx.lineTo(target.x, target.y);
              ctx.strokeStyle = hslToString(COLORS.primary, opacity);
              ctx.lineWidth = 1;
              ctx.stroke();

              // Pulse effect on active connections
              if (neuron.active && animated) {
                const pulsePos = (Math.sin(neuron.pulsePhase) + 1) / 2;
                const pulseX = neuron.x + dx * pulsePos;
                const pulseY = neuron.y + dy * pulsePos;

                ctx.beginPath();
                ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
                ctx.fillStyle = hslToString(COLORS.accent, 0.8);
                ctx.fill();
              }
            }
          }
        });
      });

      // Draw neurons
      neurons.forEach((neuron) => {
        const glowIntensity = neuron.active ? 0.6 + Math.sin(neuron.pulsePhase) * 0.4 : 0.3;

        // Glow for active neurons
        if (neuron.active) {
          const gradient = ctx.createRadialGradient(
            neuron.x, neuron.y, 0,
            neuron.x, neuron.y, neuron.radius * 3
          );
          gradient.addColorStop(0, hslToString(COLORS.accent, glowIntensity));
          gradient.addColorStop(1, hslToString(COLORS.accent, 0));
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, neuron.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Neuron body
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
        ctx.fillStyle = neuron.active 
          ? hslToString(COLORS.accent, 1) 
          : hslToString(COLORS.primary, 0.5);
        ctx.fill();

        // Border
        ctx.strokeStyle = hslToString(COLORS.primary, 0.8);
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      if (animated) {
        // Update positions
        neurons.forEach((neuron) => {
          neuron.x += neuron.vx;
          neuron.y += neuron.vy;
          neuron.pulsePhase += 0.05;

          // Bounce off edges
          if (neuron.x < 0 || neuron.x > canvas.offsetWidth) neuron.vx *= -1;
          if (neuron.y < 0 || neuron.y > canvas.offsetHeight) neuron.vy *= -1;

          // Random activation
          if (Math.random() > 0.995) {
            neuron.active = !neuron.active;
          }
        });

        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [neuronCount, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full", className)}
    />
  );
}