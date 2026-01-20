import { motion, AnimatePresence } from 'framer-motion';
import { Collaborator } from '@/hooks/useCollaborativeSandbox';

interface LiveCursorsProps {
  collaborators: Map<string, Collaborator>;
}

export function LiveCursors({ collaborators }: LiveCursorsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {Array.from(collaborators.values()).map((collab) => {
          if (!collab.odcursor) return null;
          
          return (
            <motion.div
              key={collab.odid}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: collab.odcursor.x,
                y: collab.odcursor.y,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                type: 'spring',
                damping: 30,
                stiffness: 500,
              }}
              className="absolute top-0 left-0"
              style={{ transform: `translate(${collab.odcursor.x}px, ${collab.odcursor.y}px)` }}
            >
              {/* Cursor pointer */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-lg"
                style={{ transform: 'translate(-2px, -2px)' }}
              >
                <path
                  d="M5.5 3L19 12L12 13L9 20L5.5 3Z"
                  fill={collab.color}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              
              {/* Name label */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-5 left-4 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shadow-lg"
                style={{ 
                  backgroundColor: collab.color,
                  color: 'white',
                }}
              >
                {collab.odname}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
