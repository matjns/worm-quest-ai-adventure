import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, Camera, Upload, X, Image as ImageIcon, 
  Sparkles, Tag, Check, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';

interface CreationData {
  type: 'canvas' | 'simulation' | 'network';
  neurons?: Array<{ id: string; x: number; y: number; color?: string; connections?: string[] }>;
  params?: Record<string, number>;
  layers?: Array<{ id: string; neurons: number; activation: string }>;
}

interface ShareCreationDialogProps {
  creationData: CreationData;
  canvasRef?: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}

const SUGGESTED_TAGS = [
  'Creative', 'Scientific', 'Beginner', 'Advanced', 
  'Experimental', 'Educational', 'Fun', 'Complex'
];

export function ShareCreationDialog({ creationData, canvasRef, children }: ShareCreationDialogProps) {
  const { user } = useAuth();
  const { shareCircuit } = useCommunity();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureScreenshot = useCallback(async () => {
    if (!canvasRef?.current) {
      toast.error('No canvas to capture');
      return;
    }

    setIsCapturing(true);
    
    try {
      // Use html2canvas-like approach with DOM serialization
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const element = canvasRef.current;
      const rect = element.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw neurons from creation data
        if (creationData.neurons) {
          creationData.neurons.forEach(neuron => {
            const x = neuron.x;
            const y = neuron.y;
            const color = neuron.color || 'hsl(280, 80%, 60%)';
            
            // Draw glow
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.fill();
            
            // Draw neuron
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = 1;
            ctx.fill();
          });
          
          // Draw connections
          ctx.strokeStyle = 'hsl(280, 80%, 60%)';
          ctx.lineWidth = 2;
          creationData.neurons.forEach(neuron => {
            if (neuron.connections) {
              neuron.connections.forEach(targetId => {
                const target = creationData.neurons?.find(n => n.id === targetId);
                if (target) {
                  ctx.beginPath();
                  ctx.moveTo(neuron.x, neuron.y);
                  ctx.lineTo(target.x, target.y);
                  ctx.stroke();
                }
              });
            }
          });
        }
        
        // Add watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.fillText('Created with NeuroQuest', 10, canvas.height - 10);
        
        const dataUrl = canvas.toDataURL('image/png');
        setScreenshot(dataUrl);
        toast.success('Screenshot captured!');
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      toast.error('Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  }, [canvasRef, creationData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      toast.success('Image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const addTag = (tag: string) => {
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  const getBehaviorDescription = (): string => {
    switch (creationData.type) {
      case 'canvas':
        return `Visual neural canvas with ${creationData.neurons?.length || 0} neurons`;
      case 'simulation':
        return `Simulation with custom parameters`;
      case 'network':
        return `Neural network with ${creationData.layers?.length || 0} layers`;
      default:
        return 'Custom creation';
    }
  };

  const getNeuronsUsed = (): string[] => {
    if (creationData.neurons) {
      return creationData.neurons.map((n, i) => `N${i + 1}`);
    }
    if (creationData.layers) {
      return creationData.layers.map(l => l.id);
    }
    return ['custom'];
  };

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to share your creation');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSharing(true);

    try {
      const circuitData = {
        neurons: creationData.neurons?.map(n => ({ 
          id: n.id, 
          x: n.x, 
          y: n.y 
        })) || [],
        connections: creationData.neurons?.flatMap(n => 
          n.connections?.map(c => ({ from: n.id, to: c, type: 'excitatory' })) || []
        ) || [],
        screenshot,
        creationType: creationData.type,
        params: creationData.params,
        layers: creationData.layers,
      };

      const result = await shareCircuit({
        title: title.trim(),
        description: description.trim() || undefined,
        circuit_data: circuitData,
        behavior: getBehaviorDescription(),
        neurons_used: getNeuronsUsed(),
        tags: tags.length > 0 ? tags : undefined,
      });

      if (!result.error) {
        setOpen(false);
        setTitle('');
        setDescription('');
        setTags([]);
        setScreenshot(null);
      }
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share creation');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Creation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Share Your Creation
          </DialogTitle>
          <DialogDescription>
            Share your neural creation with the community gallery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Screenshot Section */}
          <div className="space-y-2">
            <Label>Preview Image</Label>
            <div className="relative">
              {screenshot ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={screenshot} 
                    alt="Creation preview" 
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setScreenshot(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-24 flex-col gap-2"
                    onClick={captureScreenshot}
                    disabled={isCapturing || !canvasRef?.current}
                  >
                    {isCapturing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                    <span className="text-xs">Capture Screenshot</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-24 flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Upload Image</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Give your creation a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you created and how it works..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_TAGS.map(tag => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                >
                  {tags.includes(tag) && <Check className="w-3 h-3 mr-1" />}
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addCustomTag}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Creation Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline">{creationData.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Elements:</span>
              <span>{creationData.neurons?.length || creationData.layers?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={handleShare}
            disabled={isSharing || !title.trim()}
          >
            {isSharing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share to Gallery
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
