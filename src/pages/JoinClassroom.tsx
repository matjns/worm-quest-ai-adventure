import { Header } from '@/components/Header';
import { JoinClassroom } from '@/components/JoinClassroom';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

export default function JoinClassroomPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">NeuroQuest</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Join Your Class</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter your classroom code to connect with your teacher and start learning about AI and neuroscience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <JoinClassroom />
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
            Why join a classroom?
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="p-4 rounded-lg bg-muted/30">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="font-medium">Track Progress</p>
              <p className="text-xs text-muted-foreground">See how you're doing</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <Brain className="w-5 h-5 mx-auto mb-2 text-accent" />
              <p className="font-medium">Get Feedback</p>
              <p className="text-xs text-muted-foreground">AI-powered insights</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Earn Rewards</p>
              <p className="text-xs text-muted-foreground">Compete with classmates</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}