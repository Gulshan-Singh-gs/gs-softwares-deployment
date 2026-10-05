// src/suites/presentation/components/canvas/SlideCanvasStage.tsx
import React, { useRef } from 'react';
import { usePresentationStore } from '../../store/presentationStore';
import { SlideObject } from '../../store/types';

export const SlideCanvasStage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = usePresentationStore((s) => s.slides);
  const currentSlideIndex = usePresentationStore((s) => s.currentSlideIndex);
  const selectedObjectId = usePresentationStore((s) => s.selectedObjectId);
  const setSelectedObjectId = usePresentationStore((s) => s.setSelectedObjectId);
  const updateObject = usePresentationStore((s) => s.updateObject);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Dragging logic for direct manipulation
  const handleMouseDown = (e: React.MouseEvent, obj: SlideObject) => {
    e.stopPropagation();
    setSelectedObjectId(obj.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialObjX = obj.x;
    const initialObjY = obj.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // 16:9 canvas is virtually 960 x 540
      updateObject(obj.id, {
        x: Math.round(initialObjX + deltaX),
        y: Math.round(initialObjY + deltaY)
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onClick={() => setSelectedObjectId(null)}
      className="flex-1 flex items-center justify-center p-6 bg-[#07080D] overflow-hidden select-none relative"
    >
      {/* 16:9 Slide Viewport (960 x 540 Virtual Coordinate Resolution) */}
      <div
        ref={containerRef}
        style={{
          width: 960,
          height: 540,
          background: currentSlide?.background || '#0F121C'
        }}
        className="rounded-xl shadow-2xl relative border border-white/10 overflow-hidden shrink-0 transition-all"
      >
        {currentSlide?.objects.map((obj) => {
          const isSelected = selectedObjectId === obj.id;

          return (
            <div
              key={obj.id}
              onMouseDown={(e) => handleMouseDown(e, obj)}
              style={{
                position: 'absolute',
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                color: obj.style.color,
                backgroundColor: obj.style.bgColor,
                fontSize: obj.style.fontSize,
                fontWeight: obj.style.fontWeight as any,
                textAlign: obj.style.textAlign,
                borderRadius: obj.style.borderRadius,
                borderWidth: obj.style.borderWidth,
                borderColor: obj.style.borderColor,
                borderStyle: obj.style.borderWidth ? 'solid' : 'none',
                opacity: obj.style.opacity ?? 1,
                transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined
              }}
              className={`p-3 cursor-move flex items-center select-none transition-shadow ${
                isSelected
                  ? 'outline outline-2 outline-sky-400 shadow-lg shadow-sky-500/20'
                  : 'hover:outline hover:outline-1 hover:outline-white/20'
              }`}
            >
              {obj.type === 'text' ? (
                <div className="w-full whitespace-pre-wrap leading-tight">{obj.content}</div>
              ) : obj.type === 'image' ? (
                <img
                  src={obj.content}
                  alt="Slide object"
                  className="w-full h-full object-cover rounded pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center whitespace-pre-wrap text-center font-mono">
                  {obj.content}
                </div>
              )}

              {/* Resize Corner Handle (Visual) */}
              {isSelected && (
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-sky-400 rounded-sm border border-black shadow" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
