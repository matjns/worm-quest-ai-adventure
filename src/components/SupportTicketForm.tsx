import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAdminControls } from "@/hooks/useAdminControls";
import { HelpCircle, Send, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing & Account" },
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
];

const PRIORITIES = [
  { value: "low", label: "Low - Not urgent" },
  { value: "normal", label: "Normal - Can wait" },
  { value: "high", label: "High - Need help soon" },
  { value: "urgent", label: "Urgent - Blocking issue" },
];

interface SupportTicketFormProps {
  onSuccess?: () => void;
}

export function SupportTicketForm({ onSuccess }: SupportTicketFormProps) {
  const { createTicket } = useAdminControls();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    const success = await createTicket(subject, description, category, priority);
    setIsSubmitting(false);
    
    if (success) {
      setSubject("");
      setDescription("");
      setCategory("general");
      setPriority("normal");
      onSuccess?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Submit Support Ticket
        </CardTitle>
        <CardDescription>
          Need help? Submit a ticket and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your issue in detail. Include any error messages or steps to reproduce the problem."
              rows={5}
              required
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
