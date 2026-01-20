import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User, Clock, Brain, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConflictEntry {
  userId: string;
  userName: string;
  action: string;
  timestamp: number;
  neurons: { length: number };
  connections: { length: number };
}

interface CollaborativeConflictDialogProps {
  open: boolean;
  localAction: ConflictEntry | null;
  remoteAction: ConflictEntry | null;
  onResolve: (keepLocal: boolean) => void;
}

export function CollaborativeConflictDialog({
  open,
  localAction,
  remoteAction,
  onResolve,
}: CollaborativeConflictDialogProps) {
  if (!localAction || !remoteAction) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="w-5 h-5" />
            Conflicting Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            Someone else made changes at the same time. Choose which version to
            keep.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Local changes */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Your Changes</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {localAction.action}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs gap-1 px-1">
                <Brain className="w-2.5 h-2.5" />
                {localAction.neurons.length}
              </Badge>
              <Badge variant="secondary" className="text-xs gap-1 px-1">
                <Zap className="w-2.5 h-2.5" />
                {localAction.connections.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(localAction.timestamp, { addSuffix: true })}
            </div>
          </motion.div>

          {/* Remote changes */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 rounded-lg border-2 border-muted bg-muted/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">{remoteAction.userName}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {remoteAction.action}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs gap-1 px-1">
                <Brain className="w-2.5 h-2.5" />
                {remoteAction.neurons.length}
              </Badge>
              <Badge variant="secondary" className="text-xs gap-1 px-1">
                <Zap className="w-2.5 h-2.5" />
                {remoteAction.connections.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(remoteAction.timestamp, { addSuffix: true })}
            </div>
          </motion.div>
        </div>

        <AlertDialogFooter className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onResolve(false)}
          >
            Use {remoteAction.userName}'s
          </Button>
          <Button className="flex-1" onClick={() => onResolve(true)}>
            Keep Mine
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
