import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, Github, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, FileText, GitBranch, Users, MessageSquare, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

interface PRTemplate {
  id: string;
  name: string;
  description: string;
  targetRepo: string;
  branch: string;
}

const PR_TEMPLATES: PRTemplate[] = [
  {
    id: 'circuit-contrib',
    name: 'Neural Circuit Contribution',
    description: 'Submit a new circuit design to c302',
    targetRepo: 'openworm/c302',
    branch: 'student-circuits',
  },
  {
    id: 'neuroml-update',
    name: 'NeuroML Model Update',
    description: 'Update existing neuron models in CElegansNeuroML',
    targetRepo: 'openworm/CElegansNeuroML',
    branch: 'model-updates',
  },
  {
    id: 'behavior-study',
    name: 'Behavioral Analysis',
    description: 'Document new behavioral findings',
    targetRepo: 'openworm/open-worm-analysis-toolbox',
    branch: 'behavior-studies',
  },
];

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
}

export function GitHubPRBot() {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  const [selectedTemplate, setSelectedTemplate] = useState<PRTemplate | null>(null);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'tested', label: 'Circuit tested in simulator', checked: false, required: true },
    { id: 'documented', label: 'Added inline documentation', checked: false, required: true },
    { id: 'validated', label: 'NeuroML schema validated', checked: false, required: true },
    { id: 'peer-reviewed', label: 'Peer review completed', checked: false, required: false },
    { id: 'screenshots', label: 'Included simulation screenshots', checked: false, required: false },
  ]);

  const handleTemplateSelect = (templateId: string) => {
    const template = PR_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setPrTitle(`[Student] ${template.name}`);
      setPrDescription(`## Description\n\nStudent contribution via NeuroQuest Learning Platform.\n\n## Type\n${template.description}\n\n## Testing\n- [ ] Tested in NeuroQuest simulator\n- [ ] Verified NeuroML output\n\n## Related Issues\nN/A`);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const allRequiredChecked = checklist.filter(c => c.required).every(c => c.checked);

  const simulatePRSubmission = async () => {
    if (!selectedTemplate || !prTitle.trim() || !allRequiredChecked) {
      toast.error('Please complete all required fields and checklist items');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate PR creation
      await new Promise(r => setTimeout(r, 2000));

      // Generate mock PR URL
      const prNumber = Math.floor(Math.random() * 1000) + 100;
      const mockUrl = `https://github.com/${selectedTemplate.targetRepo}/pull/${prNumber}`;
      setPrUrl(mockUrl);

      addXp(100);
      addPoints(200);
      unlockAchievement('github-contributor');
      toast.success('🎉 Pull Request submitted successfully!');

    } catch (error) {
      toast.error('Failed to submit PR. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setPrTitle('');
    setPrDescription('');
    setPrUrl(null);
    setChecklist(items => items.map(i => ({ ...i, checked: false })));
  };

  if (prUrl) {
    return (
      <Card className="border-2 border-green-500/30">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <GitPullRequest className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">PR Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your contribution has been submitted to {selectedTemplate?.targetRepo}
            </p>

            <div className="p-4 bg-muted rounded-lg mb-6">
              <p className="text-sm font-mono break-all">{prUrl}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-xl font-bold text-primary">+100</p>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <p className="text-xl font-bold text-amber-600">+200</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Badge className="bg-green-500 text-white text-xs">
                  Contributor
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <a href={prUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
              <Button onClick={resetForm}>
                Submit Another
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Github className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <CardTitle>GitHub PR Bot</CardTitle>
            <CardDescription>Submit research contributions to OpenWorm repositories</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Template Selection */}
        <div>
          <Label>Contribution Type</Label>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select contribution type..." />
            </SelectTrigger>
            <SelectContent>
              {PR_TEMPLATES.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Target Info */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <Badge variant="outline">
                <Github className="w-3 h-3 mr-1" />
                {selectedTemplate.targetRepo}
              </Badge>
              <Badge variant="secondary">
                <GitBranch className="w-3 h-3 mr-1" />
                {selectedTemplate.branch}
              </Badge>
            </div>

            {/* PR Title */}
            <div>
              <Label htmlFor="pr-title">Pull Request Title</Label>
              <Input
                id="pr-title"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* PR Description */}
            <div>
              <Label htmlFor="pr-desc">Description</Label>
              <Textarea
                id="pr-desc"
                value={prDescription}
                onChange={(e) => setPrDescription(e.target.value)}
                className="mt-1 min-h-32 font-mono text-sm"
              />
            </div>

            {/* Checklist */}
            <div>
              <Label className="mb-2 block">Submission Checklist</Label>
              <div className="space-y-2">
                {checklist.map(item => (
                  <motion.button
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      item.checked 
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-500/30' 
                        : 'bg-muted/30 border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.checked 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.required && (
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={simulatePRSubmission}
              disabled={isSubmitting || !allRequiredChecked}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting PR...
                </>
              ) : (
                <>
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Submit Pull Request
                </>
              )}
            </Button>

            {!allRequiredChecked && (
              <p className="text-sm text-amber-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Complete all required checklist items to submit
              </p>
            )}
          </motion.div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Student Contributions</h4>
              <p className="text-xs text-muted-foreground">
                All student PRs are reviewed by OpenWorm maintainers before merging. 
                High-quality contributions may be featured in research publications!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
