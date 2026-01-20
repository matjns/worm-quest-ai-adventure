import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Collaborator } from '@/hooks/useCollaborativeSandbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CollaboratorsListProps {
  collaborators: Map<string, Collaborator>;
  myName: string;
  myColor: string;
  isConnected: boolean;
}

export function CollaboratorsList({
  collaborators,
  myName,
  myColor,
  isConnected,
}: CollaboratorsListProps) {
  const allUsers = [
    { odid: 'me', odname: myName, color: myColor, isMe: true },
    ...Array.from(collaborators.values()).map(c => ({ ...c, isMe: false })),
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Connection status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`p-1.5 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isConnected ? 'Connected to room' : 'Connecting...'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User avatars */}
      <div className="flex items-center -space-x-2">
        <AnimatePresence mode="popLayout">
          {allUsers.slice(0, 5).map((user, index) => (
            <TooltipProvider key={user.odid}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                    style={{ zIndex: allUsers.length - index }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.odname.charAt(0).toUpperCase()}
                    </div>
                    {user.isMe && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border border-background" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  {user.odname} {user.isMe && '(you)'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </AnimatePresence>
        
        {allUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
            +{allUsers.length - 5}
          </div>
        )}
      </div>

      {/* User count badge */}
      <Badge variant="secondary" className="gap-1">
        <Users className="w-3 h-3" />
        {allUsers.length}
      </Badge>
    </div>
  );
}
