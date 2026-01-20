import { useCallback, useRef } from "react";

interface TouchDragOptions {
  onDragStart?: (id: string, x: number, y: number) => void;
  onDragMove?: (id: string, x: number, y: number) => void;
  onDragEnd?: (id: string) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export function useTouchDrag({ onDragStart, onDragMove, onDragEnd, containerRef }: TouchDragOptions) {
  const activeTouch = useRef<{ id: string; touchId: number } | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((id: string, currentX: number, currentY: number) => 
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      offsetRef.current = {
        x: touchX - currentX,
        y: touchY - currentY,
      };

      activeTouch.current = { id, touchId: touch.identifier };
      onDragStart?.(id, touchX, touchY);
    }, [containerRef, onDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!activeTouch.current) return;
    e.preventDefault();

    const touch = Array.from(e.touches).find(t => t.identifier === activeTouch.current?.touchId);
    if (!touch) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchX = touch.clientX - rect.left - offsetRef.current.x;
    const touchY = touch.clientY - rect.top - offsetRef.current.y;

    // Clamp to container bounds
    const clampedX = Math.max(20, Math.min(touchX, rect.width - 20));
    const clampedY = Math.max(20, Math.min(touchY, rect.height - 20));

    onDragMove?.(activeTouch.current.id, clampedX, clampedY);
  }, [containerRef, onDragMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!activeTouch.current) return;

    const stillActive = Array.from(e.touches).some(
      t => t.identifier === activeTouch.current?.touchId
    );

    if (!stillActive) {
      onDragEnd?.(activeTouch.current.id);
      activeTouch.current = null;
    }
  }, [onDragEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isActive: (id: string) => activeTouch.current?.id === id,
  };
}
