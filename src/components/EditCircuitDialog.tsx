import { useState, useEffect } from 'react';
import { Pencil, Save, Trash2, Loader2, X, Tag, Check } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SharedCircuit } from '@/hooks/useCommunity';

const SUGGESTED_TAGS = [
  'Creative', 'Scientific', 'Beginner', 'Advanced', 
  'Experimental', 'Educational', 'Fun', 'Complex'
];

interface EditCircuitDialogProps {
  circuit: SharedCircuit;
  onUpdate: (circuitId: string, updates: {
    title?: string;
    description?: string;
    tags?: string[];
  }) => Promise<{ error: unknown; data: unknown }>;
  onDelete: (circuitId: string) => Promise<{ error: unknown }>;
  children?: React.ReactNode;
}

export function EditCircuitDialog({ circuit, onUpdate, onDelete, children }: EditCircuitDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(circuit.title);
  const [description, setDescription] = useState(circuit.description || '');
  const [tags, setTags] = useState<string[]>(circuit.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when circuit changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(circuit.title);
      setDescription(circuit.description || '');
      setTags(circuit.tags || []);
    }
  }, [open, circuit]);

  const addTag = (tag: string) => {
    if (tags.length >= 5) return;
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

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    const result = await onUpdate(circuit.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    setIsSaving(false);

    if (!result.error) {
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await onDelete(circuit.id);
    setIsDeleting(false);

    if (!result.error) {
      setOpen(false);
    }
  };

  const hasChanges = 
    title !== circuit.title ||
    description !== (circuit.description || '') ||
    JSON.stringify(tags) !== JSON.stringify(circuit.tags || []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" title="Edit circuit">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Edit Circuit
          </DialogTitle>
          <DialogDescription>
            Update your shared circuit's details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="Circuit name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your circuit..."
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

          {/* Circuit Info (read-only) */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Behavior:</span>
              <span className="font-mono text-xs">{circuit.behavior}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Neurons:</span>
              <span>{circuit.neurons_used.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Likes:</span>
              <span>{circuit.likes_count}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Circuit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{circuit.title}" and all its likes and comments. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex-1" />

          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !hasChanges}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
