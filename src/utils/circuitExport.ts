import { SharedCircuit } from "@/hooks/useCommunity";
import { toast } from "sonner";

/**
 * Export a circuit as JSON file
 */
export function exportCircuitAsJSON(circuit: SharedCircuit) {
  const exportData = {
    title: circuit.title,
    description: circuit.description,
    behavior: circuit.behavior,
    neurons_used: circuit.neurons_used,
    tags: circuit.tags,
    circuit_data: circuit.circuit_data,
    exported_at: new Date().toISOString(),
    source: "NeuroQuest",
    author: circuit.profiles?.display_name || "Anonymous",
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${circuit.title.replace(/\s+/g, "-").toLowerCase()}-circuit.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success("Circuit exported as JSON!");
}

/**
 * Export a circuit visualization as PNG
 */
export async function exportCircuitAsPNG(circuit: SharedCircuit): Promise<void> {
  const neurons = circuit.circuit_data?.neurons || [];
  const connections = circuit.circuit_data?.connections || [];

  // Create canvas
  const canvas = document.createElement("canvas");
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    toast.error("Failed to create canvas context");
    return;
  }

  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);

  // Draw grid pattern
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.fillText(circuit.title.toUpperCase(), width / 2, 40);

  // Draw subtitle
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "14px monospace";
  ctx.fillText(`by ${circuit.profiles?.display_name || "Anonymous"} • ${circuit.behavior}`, width / 2, 65);

  // Offset for circuit visualization
  const offsetX = 100;
  const offsetY = 100;
  const vizWidth = width - 200;
  const vizHeight = height - 200;

  // Draw connections
  connections.forEach((conn) => {
    const fromNeuron = neurons.find((n) => n.id === conn.from);
    const toNeuron = neurons.find((n) => n.id === conn.to);
    if (!fromNeuron || !toNeuron) return;

    const x1 = offsetX + (fromNeuron.x / 100) * vizWidth;
    const y1 = offsetY + (fromNeuron.y / 100) * vizHeight;
    const x2 = offsetX + (toNeuron.x / 100) * vizWidth;
    const y2 = offsetY + (toNeuron.y / 100) * vizHeight;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = conn.type === "excitatory" ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLen = 10;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowLen * Math.cos(angle - Math.PI / 6),
      y2 - arrowLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - arrowLen * Math.cos(angle + Math.PI / 6),
      y2 - arrowLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = conn.type === "excitatory" ? "#22c55e" : "#ef4444";
    ctx.fill();
  });

  // Draw neurons
  neurons.forEach((neuron) => {
    const cx = offsetX + (neuron.x / 100) * vizWidth;
    const cy = offsetY + (neuron.y / 100) * vizHeight;

    // Glow effect
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    gradient.addColorStop(0, "rgba(236, 72, 153, 0.4)");
    gradient.addColorStop(1, "rgba(236, 72, 153, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    // Neuron circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#ec4899";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Neuron label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(neuron.id.slice(0, 6), cx, cy);
  });

  // Draw stats at bottom
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    `${neurons.length} neurons • ${connections.length} connections • Exported from NeuroQuest`,
    width / 2,
    height - 30
  );

  // Empty state
  if (neurons.length === 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("No visualization data available", width / 2, height / 2);
  }

  // Download
  const link = document.createElement("a");
  link.download = `${circuit.title.replace(/\s+/g, "-").toLowerCase()}-circuit.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Circuit exported as PNG!");
}
