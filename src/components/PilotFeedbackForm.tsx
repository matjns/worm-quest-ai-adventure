import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Bug,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PilotFeedbackFormProps {
  experimentName?: string;
  onSubmit?: (feedback: FeedbackData) => void;
  className?: string;
}

interface FeedbackData {
  experimentName: string;
  overallRating: number;
  easeOfUse: "very-easy" | "easy" | "moderate" | "difficult" | "very-difficult";
  didAchieveGoal: boolean;
  whatWorkedWell: string;
  whatCouldImprove: string;
  bugReports: string;
  featureRequests: string;
  scientificAccuracy: number;
  engagementLevel: number;
  wouldRecommend: boolean;
  categories: string[];
  additionalNotes: string;
  timestamp: number;
}

const FEEDBACK_CATEGORIES = [
  { id: "ui", label: "User Interface", icon: Sparkles },
  { id: "simulation", label: "Simulation Accuracy", icon: AlertCircle },
  { id: "ai", label: "AI Suggestions", icon: Lightbulb },
  { id: "learning", label: "Learning Experience", icon: Star },
  { id: "bugs", label: "Bug Report", icon: Bug },
];

export function PilotFeedbackForm({ experimentName = "", onSubmit, className }: PilotFeedbackFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FeedbackData>>({
    experimentName,
    overallRating: 0,
    easeOfUse: undefined,
    didAchieveGoal: undefined,
    whatWorkedWell: "",
    whatCouldImprove: "",
    bugReports: "",
    featureRequests: "",
    scientificAccuracy: 0,
    engagementLevel: 0,
    wouldRecommend: undefined,
    categories: [],
    additionalNotes: "",
  });

  const handleRatingClick = (field: "overallRating" | "scientificAccuracy" | "engagementLevel", value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories?.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...(prev.categories || []), categoryId],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const feedback: FeedbackData = {
        ...formData as FeedbackData,
        timestamp: Date.now(),
      };
      
      // Store in localStorage for now (could be sent to backend)
      const existingFeedback = JSON.parse(localStorage.getItem("pilot-feedback") || "[]");
      localStorage.setItem("pilot-feedback", JSON.stringify([...existingFeedback, feedback]));
      
      onSubmit?.(feedback);
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    label: string;
  }) => (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                star <= value
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Feedback Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Your feedback helps us improve the experiment experience and align with the Presidential AI Challenge validation requirements.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Submit Another Response
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Pilot Run Feedback</CardTitle>
              <CardDescription>Help us improve the experimentation experience</CardDescription>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  s <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Label>Experiment Name</Label>
                <Input
                  value={formData.experimentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, experimentName: e.target.value }))}
                  placeholder="Name of the experiment you're providing feedback for"
                  className="mt-1"
                />
              </div>

              <StarRating
                value={formData.overallRating || 0}
                onChange={(v) => handleRatingClick("overallRating", v)}
                label="Overall Experience"
              />

              <div>
                <Label className="mb-3 block">Ease of Use</Label>
                <RadioGroup
                  value={formData.easeOfUse}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, easeOfUse: v as FeedbackData["easeOfUse"] }))}
                  className="flex flex-wrap gap-3"
                >
                  {[
                    { value: "very-easy", label: "Very Easy" },
                    { value: "easy", label: "Easy" },
                    { value: "moderate", label: "Moderate" },
                    { value: "difficult", label: "Difficult" },
                    { value: "very-difficult", label: "Very Difficult" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-3 block">Did you achieve your experiment goal?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.didAchieveGoal === true ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, didAchieveGoal: true }))}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={formData.didAchieveGoal === false ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, didAchieveGoal: false }))}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Label>What worked well?</Label>
                <Textarea
                  value={formData.whatWorkedWell}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatWorkedWell: e.target.value }))}
                  placeholder="Describe what aspects of the experiment experience were positive..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>What could be improved?</Label>
                <Textarea
                  value={formData.whatCouldImprove}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatCouldImprove: e.target.value }))}
                  placeholder="Describe any challenges or areas for improvement..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <StarRating
                  value={formData.scientificAccuracy || 0}
                  onChange={(v) => handleRatingClick("scientificAccuracy", v)}
                  label="Scientific Accuracy"
                />
                <StarRating
                  value={formData.engagementLevel || 0}
                  onChange={(v) => handleRatingClick("engagementLevel", v)}
                  label="Engagement Level"
                />
              </div>

              <div>
                <Label className="mb-3 block">Feedback Categories (select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.categories?.includes(cat.id);
                    return (
                      <Badge
                        key={cat.id}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer gap-1 py-1.5 px-3 transition-colors",
                          isSelected && "bg-primary"
                        )}
                        onClick={() => handleCategoryToggle(cat.id)}
                      >
                        <Icon className="w-3 h-3" />
                        {cat.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <Label>Bug Reports (if any)</Label>
                <Textarea
                  value={formData.bugReports}
                  onChange={(e) => setFormData(prev => ({ ...prev, bugReports: e.target.value }))}
                  placeholder="Describe any bugs or issues you encountered..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label>Feature Requests</Label>
                <Textarea
                  value={formData.featureRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, featureRequests: e.target.value }))}
                  placeholder="What features would make the experiment experience better?"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label className="mb-3 block">Would you recommend this tool to other students/teachers?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.wouldRecommend === true ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: true }))}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes, definitely!
                  </Button>
                  <Button
                    type="button"
                    variant={formData.wouldRecommend === false ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, wouldRecommend: false }))}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Not yet
                  </Button>
                </div>
              </div>

              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any other thoughts or feedback..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
