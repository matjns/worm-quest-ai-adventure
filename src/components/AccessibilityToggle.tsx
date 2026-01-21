import { useState } from 'react';
import {
  Eye, Type, Zap, Volume2, Settings, Check, Keyboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAccessibility } from './AccessibilityProvider';
import { toast } from 'sonner';

export function AccessibilityToggle() {
  const {
    highContrast,
    reducedMotion,
    largeText,
    screenReaderMode,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    toggleScreenReaderMode,
  } = useAccessibility();

  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleToggle = (toggle: () => void, name: string, enabled: boolean) => {
    toggle();
    toast.success(`${name} ${enabled ? 'disabled' : 'enabled'}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Accessibility options"
        >
          <Eye className={`w-5 h-5 ${highContrast ? 'text-primary' : ''}`} />
          {(highContrast || reducedMotion || largeText) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Accessibility Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleToggle(toggleHighContrast, 'High contrast', highContrast)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>High Contrast</span>
            </div>
            {highContrast && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleToggle(toggleReducedMotion, 'Reduced motion', reducedMotion)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Reduce Motion</span>
            </div>
            {reducedMotion && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleToggle(toggleLargeText, 'Large text', largeText)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>Large Text</span>
            </div>
            {largeText && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleToggle(toggleScreenReaderMode, 'Screen reader mode', screenReaderMode)}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span>Screen Reader Mode</span>
            </div>
            {screenReaderMode && <Check className="w-4 h-4 text-primary" />}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard Shortcuts</span>
          </div>
        </DropdownMenuItem>
        
        {showShortcuts && (
          <div className="px-2 py-2 text-xs space-y-1 bg-muted/50 rounded-md mx-2 mb-2">
            <p><kbd className="px-1 bg-muted rounded">Alt+H</kbd> Home</p>
            <p><kbd className="px-1 bg-muted rounded">Alt+P</kbd> Play</p>
            <p><kbd className="px-1 bg-muted rounded">Alt+L</kbd> Learn</p>
            <p><kbd className="px-1 bg-muted rounded">Alt+C</kbd> Toggle Contrast</p>
            <p><kbd className="px-1 bg-muted rounded">Shift+?</kbd> Help</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
