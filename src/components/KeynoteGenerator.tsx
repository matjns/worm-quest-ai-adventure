import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PptxGenJS from 'pptxgenjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, Presentation, Download, Sparkles, ChevronLeft, ChevronRight,
  FileText, Eye, Settings, Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Slide {
  title: string;
  content: string;
  bulletPoints?: string[];
  equations?: string;
  imagePrompt?: string;
  speakerNotes?: string;
}

interface KeynoteGeneratorProps {
  className?: string;
}

const PRESET_TOPICS = [
  'C. elegans as ExO bio-AI archetype',
  'Hodgkin-Huxley model and neural computation',
  'From connectome to behavior: lessons from the worm',
  'Neuromorphic computing inspired by C. elegans',
  'OpenWorm: digitizing life for scientific discovery',
];

const STYLE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Clean, corporate style' },
  { value: 'academic', label: 'Academic', description: 'Research-focused with citations' },
  { value: 'creative', label: 'Creative', description: 'Engaging with storytelling' },
  { value: 'technical', label: 'Technical', description: 'Deep technical content' },
];

export function KeynoteGenerator({ className }: KeynoteGeneratorProps) {
  const [topic, setTopic] = useState('C. elegans as ExO bio-AI archetype');
  const [slideCount, setSlideCount] = useState(7);
  const [style, setStyle] = useState('professional');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateKeynote = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);
    setSlides([]);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('keynote-generator', {
        body: { topic, slideCount, style },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setCurrentSlide(0);
        toast.success(`Generated ${data.slides.length} slides!`);
      } else {
        throw new Error('No slides generated');
      }
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error('Failed to generate keynote. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, slideCount, style]);

  const exportToPptx = useCallback(async () => {
    if (slides.length === 0) {
      toast.error('Generate slides first');
      return;
    }

    setIsExporting(true);
    try {
      const pptx = new PptxGenJS();
      pptx.author = 'WormQuest AI';
      pptx.title = topic;
      pptx.subject = 'AI-Generated Keynote';

      // Define slide master
      pptx.defineSlideMaster({
        title: 'MAIN',
        background: { color: '0f172a' },
      });

      slides.forEach((slide, i) => {
        const pptSlide = pptx.addSlide({ masterName: 'MAIN' });

        // Title
        pptSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 32,
          bold: true,
          color: 'ffffff',
          fontFace: 'Arial',
        });

        // Main content
        if (slide.content) {
          pptSlide.addText(slide.content, {
            x: 0.5,
            y: 1.5,
            w: 9,
            h: 0.6,
            fontSize: 16,
            color: 'a1a1aa',
            fontFace: 'Arial',
          });
        }

        // Bullet points
        if (slide.bulletPoints && slide.bulletPoints.length > 0) {
          const bulletText = slide.bulletPoints.map(bp => ({
            text: bp,
            options: { bullet: true, color: 'e2e8f0', fontSize: 14 }
          }));
          
          pptSlide.addText(bulletText, {
            x: 0.5,
            y: 2.3,
            w: 9,
            h: 2,
            fontFace: 'Arial',
            valign: 'top',
          });
        }

        // Equations
        if (slide.equations) {
          pptSlide.addText(slide.equations, {
            x: 0.5,
            y: 4.5,
            w: 9,
            h: 0.5,
            fontSize: 12,
            color: '60a5fa',
            fontFace: 'Courier New',
            italic: true,
          });
        }

        // Slide number
        pptSlide.addText(`${i + 1}`, {
          x: 9,
          y: 5.2,
          w: 0.5,
          h: 0.3,
          fontSize: 10,
          color: '64748b',
          align: 'right',
        });

        // Speaker notes
        if (slide.speakerNotes) {
          pptSlide.addNotes(slide.speakerNotes);
        }
      });

      await pptx.writeFile({ fileName: `WormQuest_Keynote_${Date.now()}.pptx` });
      toast.success('Keynote exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export PPTX');
    } finally {
      setIsExporting(false);
    }
  }, [slides, topic]);

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="w-5 h-5 text-primary" />
                Keynote Generator
              </CardTitle>
              <CardDescription>
                AI-powered presentations on C. elegans and neural computation
              </CardDescription>
            </div>
            {slides.length > 0 && (
              <Button onClick={exportToPptx} disabled={isExporting} className="gap-2">
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export PPTX
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="gap-2">
                <Wand2 className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={slides.length === 0} className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="edit" disabled={slides.length === 0} className="gap-2">
                <FileText className="w-4 h-4" />
                Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              {/* Topic input */}
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your keynote topic..."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_TOPICS.map(preset => (
                    <Badge
                      key={preset}
                      variant={topic === preset ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => setTopic(preset)}
                    >
                      {preset.length > 30 ? preset.slice(0, 30) + '...' : preset}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Settings row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Slides</Label>
                  <Select value={slideCount.toString()} onValueChange={(v) => setSlideCount(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 7, 10, 12, 15].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} slides</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate button */}
              <Button
                onClick={generateKeynote}
                disabled={isGenerating || !topic.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Keynote...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Keynote
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-center text-muted-foreground">
                    AI is crafting your presentation...
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              {slides.length > 0 && (
                <div className="space-y-4">
                  {/* Slide preview */}
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="aspect-video bg-slate-900 rounded-lg p-8 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        {slides[currentSlide]?.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {slides[currentSlide]?.content}
                      </p>
                      {slides[currentSlide]?.bulletPoints && (
                        <ul className="space-y-2 flex-1">
                          {slides[currentSlide].bulletPoints?.map((bp, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300">
                              <span className="text-primary mt-1">•</span>
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {slides[currentSlide]?.equations && (
                        <div className="mt-auto pt-4 font-mono text-sm text-blue-400">
                          {slides[currentSlide].equations}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 text-slate-500 text-sm">
                      {currentSlide + 1} / {slides.length}
                    </div>
                  </motion.div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                      disabled={currentSlide === slides.length - 1}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Speaker notes */}
                  {slides[currentSlide]?.speakerNotes && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Speaker Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {slides[currentSlide].speakerNotes}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {slides.map((slide, i) => (
                    <Card key={i} className={currentSlide === i ? 'border-primary' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Slide {i + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentSlide(i)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={slide.title}
                            onChange={(e) => updateSlide(i, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Content</Label>
                          <Textarea
                            value={slide.content}
                            onChange={(e) => updateSlide(i, { content: e.target.value })}
                            rows={2}
                          />
                        </div>
                        {slide.equations && (
                          <div className="space-y-1">
                            <Label className="text-xs">Equations</Label>
                            <Input
                              value={slide.equations}
                              onChange={(e) => updateSlide(i, { equations: e.target.value })}
                              className="font-mono text-sm"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
