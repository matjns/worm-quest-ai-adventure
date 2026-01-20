import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Users,
  School,
  CheckCircle,
  Loader2,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface ClassroomInfo {
  id: string;
  name: string;
  grade_level: string;
  school_name: string | null;
}

export function JoinClassroom() {
  const { user, isAuthenticated } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [classroom, setClassroom] = useState<ClassroomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const formatJoinCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  };

  const lookupClassroom = async () => {
    if (joinCode.length !== 6) {
      setError('Join code must be 6 characters');
      return;
    }

    setLookupLoading(true);
    setError(null);
    setClassroom(null);
    setAlreadyJoined(false);

    try {
      // Look up classroom by join code
      const { data, error: lookupError } = await supabase
        .from('classrooms')
        .select('id, name, grade_level, school_name')
        .eq('join_code', joinCode)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (!data) {
        setError('No classroom found with this code. Please check and try again.');
        return;
      }

      setClassroom(data);

      // Check if user already joined this classroom
      if (user) {
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id')
          .eq('classroom_id', data.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingStudent) {
          setAlreadyJoined(true);
        }
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('Failed to look up classroom. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const joinClassroom = async () => {
    if (!classroom || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Get user's display name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const displayName = profile?.display_name || user.email?.split('@')[0] || 'Student';

      // Join the classroom
      const { error: joinError } = await supabase
        .from('students')
        .insert({
          classroom_id: classroom.id,
          user_id: user.id,
          display_name: displayName,
          progress_data: {
            missions_completed: 0,
            total_xp: 0,
            accuracy: 0,
            strengths: [],
            weaknesses: []
          }
        });

      if (joinError) {
        if (joinError.code === '23505') {
          setAlreadyJoined(true);
          setError('You have already joined this classroom.');
        } else {
          throw joinError;
        }
        return;
      }

      setSuccess(true);
      toast.success(`Successfully joined ${classroom.name}!`);
    } catch (err) {
      console.error('Join error:', err);
      setError('Failed to join classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="border-2 max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <KeyRound className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sign in to Join</h3>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to join a classroom with a code.
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success && classroom) {
    return (
      <Card className="border-2 border-green-500/50 bg-green-500/5 max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Welcome to Class!</h3>
          <p className="text-muted-foreground mb-2">
            You've successfully joined <strong>{classroom.name}</strong>
          </p>
          {classroom.school_name && (
            <p className="text-sm text-muted-foreground mb-4">at {classroom.school_name}</p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/neuroquest">
              <Button variant="hero">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            </Link>
            <Link to="/learn">
              <Button variant="outline">View Lessons</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <School className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Join Your Classroom</CardTitle>
        <CardDescription>
          Enter the 6-character code your teacher gave you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Join Code Input */}
        <div className="space-y-2">
          <Label htmlFor="join-code">Classroom Code</Label>
          <div className="flex gap-2">
            <Input
              id="join-code"
              placeholder="ABC123"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(formatJoinCode(e.target.value));
                setError(null);
                setClassroom(null);
                setAlreadyJoined(false);
              }}
              className="text-center text-2xl font-mono tracking-widest uppercase"
              maxLength={6}
            />
            <Button 
              onClick={lookupClassroom} 
              disabled={joinCode.length !== 6 || lookupLoading}
              variant="outline"
            >
              {lookupLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Find'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ask your teacher for the classroom join code
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Classroom Preview */}
        {classroom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted/50 rounded-lg border-2 border-primary/20"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-lg">{classroom.name}</h4>
                {classroom.school_name && (
                  <p className="text-sm text-muted-foreground">{classroom.school_name}</p>
                )}
              </div>
              <Badge>{classroom.grade_level}</Badge>
            </div>
            
            {alreadyJoined ? (
              <div className="flex items-center gap-2 mt-4 p-2 bg-green-500/10 rounded text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>You're already in this class!</span>
              </div>
            ) : (
              <Button 
                onClick={joinClassroom} 
                className="w-full mt-4" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join This Classroom
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )}

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>Your progress will be shared with your teacher</p>
        </div>
      </CardContent>
    </Card>
  );
}