import { motion } from "framer-motion";
import { type NeuronData, NEURON_COLORS } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface MergePreviewProps {
  existingNeurons: PlacedNeuron[];
  incomingNeurons: PlacedNeuron[];
  duplicateNeuronIds: Set<string>;
}

export function CircuitMergePreview({
  existingNeurons,
  incomingNeurons,
  duplicateNeuronIds,
}: MergePreviewProps) {
  // Scale positions to fit preview
  const allNeurons = [...existingNeurons, ...incomingNeurons.filter(n => !duplicateNeuronIds.has(n.id))];
  
  if (allNeurons.length === 0) {
    return (
      <div className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No neurons to preview</p>
      </div>
    );
  }

  const minX = Math.min(...allNeurons.map(n => n.x)) - 20;
  const maxX = Math.max(...allNeurons.map(n => n.x)) + 20;
  const minY = Math.min(...allNeurons.map(n => n.y)) - 20;
  const maxY = Math.max(...allNeurons.map(n => n.y)) + 20;
  
  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 100);

  const scaleX = (x: number) => ((x - minX) / width) * 180 + 10;
  const scaleY = (y: number) => ((y - minY) / height) * 80 + 10;

  return (
    <svg
      className="w-full h-32 rounded-lg border-2 border-border"
      viewBox="0 0 200 100"
      style={{ background: "hsl(var(--background))" }}
    >
      <defs>
        <pattern id="merge-preview-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.2"
            strokeOpacity="0.3"
          />
        </pattern>
      </defs>
      <rect width="200" height="100" fill="url(#merge-preview-grid)" />

      {/* Existing neurons */}
      {existingNeurons.map((neuron, i) => (
        <motion.g key={`existing-${neuron.id}`}>
          <motion.circle
            cx={scaleX(neuron.x)}
            cy={scaleY(neuron.y)}
            r="6"
            fill={NEURON_COLORS[neuron.type]}
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
          />
          <text
            x={scaleX(neuron.x)}
            y={scaleY(neuron.y) - 10}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="6"
          >
            {neuron.id}
          </text>
        </motion.g>
      ))}

      {/* Incoming neurons (new only) */}
      {incomingNeurons
        .filter((n) => !duplicateNeuronIds.has(n.id))
        .map((neuron, i) => (
          <motion.g key={`incoming-${neuron.id}`}>
            <motion.circle
              cx={scaleX(neuron.x)}
              cy={scaleY(neuron.y)}
              r="6"
              fill={NEURON_COLORS[neuron.type]}
              stroke="hsl(142 76% 36%)"
              strokeWidth="2"
              strokeDasharray="2,2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.03 }}
            />
            <text
              x={scaleX(neuron.x)}
              y={scaleY(neuron.y) - 10}
              textAnchor="middle"
              fill="hsl(142 76% 36%)"
              fontSize="6"
              fontWeight="bold"
            >
              + {neuron.id}
            </text>
          </motion.g>
        ))}

      {/* Duplicate neurons indicator */}
      {incomingNeurons
        .filter((n) => duplicateNeuronIds.has(n.id))
        .map((neuron) => {
          const existing = existingNeurons.find((e) => e.id === neuron.id);
          if (!existing) return null;
          return (
            <motion.circle
              key={`dup-${neuron.id}`}
              cx={scaleX(existing.x)}
              cy={scaleY(existing.y)}
              r="9"
              fill="none"
              stroke="hsl(45 93% 47%)"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          );
        })}
    </svg>
  );
}

