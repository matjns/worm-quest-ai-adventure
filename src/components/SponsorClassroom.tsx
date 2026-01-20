import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Heart,
  DollarSign,
  Sparkles,
  GraduationCap,
  Zap,
  Users,
  Brain,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface SponsorClassroomProps {
  classroomId?: string;
  classroomName?: string;
  schoolName?: string;
  gradeLevel?: string;
  onSuccess?: () => void;
}

const donationTiers = [
  { amount: 25, credits: 100, label: 'Supporter', description: '1 week of AI lessons' },
  { amount: 50, credits: 250, label: 'Champion', description: '2 weeks + bonus features' },
  { amount: 100, credits: 600, label: 'Patron', description: '1 month of full access' },
  { amount: 250, credits: 2000, label: 'Benefactor', description: 'Full semester + recognition' },
];

export function SponsorClassroom({
  classroomId,
  classroomName = 'NeuroQuest Classroom',
  schoolName,
  gradeLevel,
  onSuccess
}: SponsorClassroomProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getCreditsForAmount = (amount: number): number => {
    // Find matching tier or calculate proportionally
    const tier = donationTiers.find(t => t.amount === amount);
    if (tier) return tier.credits;
    // Base rate: $1 = 4 credits
    return Math.floor(amount * 4);
  };

  const finalAmount = selectedTier || (customAmount ? parseInt(customAmount) : 0);
  const finalCredits = getCreditsForAmount(finalAmount);

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount < 5) {
      toast.error('Minimum donation is $5');
      return;
    }

    if (!donorEmail) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd integrate with Stripe here
      // For now, we'll just record the sponsorship intent
      const { error } = await supabase
        .from('classroom_sponsorships')
        .insert({
          classroom_id: classroomId || crypto.randomUUID(), // Fallback for demo
          donor_name: isAnonymous ? null : donorName,
          donor_email: donorEmail,
          amount_cents: finalAmount * 100,
          compute_credits_granted: finalCredits,
          message: message || null,
          is_anonymous: isAnonymous,
          status: 'pending' // Would be 'completed' after payment confirmation
        });

      if (error) throw error;

      setSuccess(true);
      toast.success('Thank you for your sponsorship!');
      onSuccess?.();
    } catch (error) {
      console.error('Sponsorship error:', error);
      toast.error('Failed to process sponsorship');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-2 border-green-500/50 bg-green-500/5">
        <CardContent className="py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-4">
            Your sponsorship of ${finalAmount} will provide {finalCredits} compute credits for {classroomName}.
          </p>
          <p className="text-sm text-muted-foreground">
            You'll receive a confirmation email at {donorEmail}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Sponsor a Classroom</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          Help {classroomName} {schoolName && `at ${schoolName}`} access AI-powered neuroscience education.
          {gradeLevel && <Badge variant="outline" className="ml-2">{gradeLevel}</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* What sponsors provide */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your sponsorship provides:
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>AI compute credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>AI lesson generation</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>Personalized learning</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span>Full class access</span>
            </div>
          </div>
        </div>

        {/* Donation tiers */}
        <div className="grid grid-cols-2 gap-3">
          {donationTiers.map((tier) => (
            <button
              key={tier.amount}
              onClick={() => {
                setSelectedTier(tier.amount);
                setCustomAmount('');
              }}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedTier === tier.amount
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-bold">${tier.amount}</span>
                <Badge variant="secondary" className="text-xs">{tier.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{tier.description}</p>
              <p className="text-xs text-primary mt-1">+{tier.credits} credits</p>
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="space-y-2">
          <Label>Or enter custom amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedTier(null);
              }}
              className="pl-8"
              min="5"
            />
          </div>
          {customAmount && parseInt(customAmount) >= 5 && (
            <p className="text-xs text-primary">
              +{getCreditsForAmount(parseInt(customAmount))} compute credits
            </p>
          )}
        </div>

        {/* Donor info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input
              placeholder="Your name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              disabled={isAnonymous}
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Leave an encouraging message for the classroom..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <label htmlFor="anonymous" className="text-sm cursor-pointer">
              Make my donation anonymous
            </label>
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={!finalAmount || finalAmount < 5 || !donorEmail || loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Heart className="w-4 h-4 mr-2" />
          )}
          {finalAmount ? `Donate $${finalAmount}` : 'Select an amount'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Donations are processed securely. You'll receive a receipt by email.
        </p>
      </CardContent>
    </Card>
  );
}