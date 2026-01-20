import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CollaborativeSandbox } from '@/components/CollaborativeSandbox';

function generateRoomId() {
  const adjectives = ['cosmic', 'neural', 'quantum', 'stellar', 'bright', 'swift'];
  const nouns = ['worm', 'brain', 'synapse', 'circuit', 'spark', 'wave'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}-${noun}-${num}`;
}

export default function CollabSandbox() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  // If we have a roomId, show the collaborative sandbox
  if (roomId) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/collab')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Collaborative Sandbox
              </h1>
              <p className="text-sm text-muted-foreground">
                Build neural circuits together in real-time
              </p>
            </div>
          </div>

          {/* Sandbox */}
          <CollaborativeSandbox roomId={roomId} />
        </div>
      </div>
    );
  }

  // Landing page for creating/joining rooms
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="text-6xl"
          >
            🧠👥
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">
            Collaborative Sandbox
          </h1>
          <p className="text-muted-foreground">
            Build neural circuits together with friends in real-time!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create new room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-primary/30 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Create New Room
                </CardTitle>
                <CardDescription>
                  Start a fresh collaborative sandbox and invite others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate(`/collab/${generateRoomId()}`)}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Create Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Join existing room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔗 Join Existing Room
                </CardTitle>
                <CardDescription>
                  Enter a room code to join your friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="e.g., cosmic-worm-123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && joinCode.trim()) {
                      navigate(`/collab/${joinCode.trim()}`);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => joinCode.trim() && navigate(`/collab/${joinCode.trim()}`)}
                  disabled={!joinCode.trim()}
                  className="w-full"
                  size="lg"
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 text-center"
        >
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <div className="text-2xl mb-2">👆</div>
            <p className="text-sm text-muted-foreground">Live cursors</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm text-muted-foreground">Real-time sync</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <div className="text-2xl mb-2">🔗</div>
            <p className="text-sm text-muted-foreground">Easy sharing</p>
          </div>
        </motion.div>

        {/* Back link */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/sandbox')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Solo Sandbox
          </Button>
        </div>
      </div>
    </div>
  );
}
