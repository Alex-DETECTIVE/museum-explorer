import React, { useRef, useEffect, useState } from 'react';
import { Museum, Theme, Photo } from '../types';
import { X, Star, MapPin, Clock, CircleDollarSign } from 'lucide-react';

interface BottomSheetProps {
  museum: Museum | null;
  onClose: () => void;
  onImageClick: (photo: Photo, theme: Theme) => void;
}

type SnapState = 'closed' | 'half' | 'full';

const BottomSheet: React.FC<BottomSheetProps> = ({ museum, onClose, onImageClick }) => {
  const [snapState, setSnapState] = useState<SnapState>('closed');
  const [isMobile, setIsMobile] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Refs for gesture handling
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Constants for snapping
  const SNAP_HALF_RATIO = 0.55; // 55% from top (visible 45%)
  const DRAG_THRESHOLD = 50; 

  // Handle Resize to switch modes correctly
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (museum) {
      setSnapState('half');
    } else {
      setSnapState('closed');
    }
  }, [museum]);

  // Calculate transform value based on state
  const getTransformY = (state: SnapState): string => {
    if (state === 'closed') return '100%';
    if (state === 'full') return '0%';
    return `${SNAP_HALF_RATIO * 100}%`; 
  };

  // --- Gesture Handlers ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sheetRef.current || !isMobile) return;
    
    // We strictly follow the drag handle/header. 
    // PREVIOUS BUG FIX: Removed the scrollTop check here. 
    // If the user touches the handle/header, we ALWAYS allow drag, regardless of content scroll.

    isDragging.current = true;
    startY.current = e.touches[0].clientY;
    
    // Disable transition for instant follow
    sheetRef.current.style.transition = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current || !isMobile) return;

    // Prevent default to stop scrolling the body/map while dragging sheet
    // e.preventDefault(); // Optional: careful with this on some devices

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startY.current;
    
    const windowHeight = window.innerHeight;
    
    // Calculate initial offset based on current snap state
    let startOffset = 0;
    if (snapState === 'half') startOffset = windowHeight * SNAP_HALF_RATIO;
    // if full, startOffset is 0
    
    let newY = startOffset + deltaY;

    // Resistance at the top (negative Y)
    if (newY < 0) newY = newY * 0.3; 

    sheetRef.current.style.transform = `translateY(${newY}px)`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current || !isMobile) return;
    isDragging.current = false;
    sheetRef.current.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)'; // Restore smooth transition

    const touchY = e.changedTouches[0].clientY;
    const deltaY = touchY - startY.current;
    const windowHeight = window.innerHeight;

    // Current visual position (approx)
    let startOffset = snapState === 'half' ? windowHeight * SNAP_HALF_RATIO : 0;
    const currentPos = startOffset + deltaY;
    const ratio = currentPos / windowHeight;

    // Logic: Snap to nearest point based on where we let go
    // Points: 0 (Top/Full), 0.55 (Half), 1.0 (Closed)
    
    const distToFull = Math.abs(ratio - 0);
    const distToHalf = Math.abs(ratio - SNAP_HALF_RATIO);
    const distToClosed = Math.abs(ratio - 1); // Or slightly more than 1 ensures easy close

    // Simple velocity/flick check: if moved significantly in one direction, prefer that direction
    if (Math.abs(deltaY) > DRAG_THRESHOLD) {
       if (deltaY > 0) { 
           // Dragging DOWN
           if (snapState === 'full') {
               // If dragged down from full, go half unless dragged waaaay down
               if (ratio > 0.8) onClose();
               else setSnapState('half');
           } else {
               // From half, dragging down closes
               onClose();
           }
       } else {
           // Dragging UP
           setSnapState('full');
       }
    } else {
        // Drag was small, snap to nearest position logic
        if (distToFull < distToHalf && distToFull < distToClosed) {
            setSnapState('full');
        } else if (distToHalf < distToClosed) {
            setSnapState('half');
        } else {
            onClose();
        }
    }
    
    // Clean up inline style so React state takes over via class/style prop
    sheetRef.current.style.transform = '';
  };

  // Keyboard support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const transformStyle = isMobile ? { transform: `translateY(${getTransformY(snapState)})` } : {};
  
  // Overlay visibility: Only on Mobile AND when fully expanded
  const showOverlay = isMobile && museum && snapState === 'full';

  return (
    <>
      {/* Overlay - visible only when full on mobile to darken map */}
      <div 
        className={`fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 ${
          showOverlay ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSnapState('half')} 
      />

      <div
        ref={sheetRef}
        className={`
          fixed z-40 bg-white flex flex-col shadow-2xl
          inset-x-0 bottom-0 
          h-[100dvh] md:h-auto 
          rounded-t-3xl md:rounded-2xl
          transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
          md:inset-auto md:top-6 md:left-6 md:bottom-6 md:w-[400px] md:border md:border-slate-200
          ${!isMobile && !museum ? 'translate-x-[-120%]' : ''} 
          ${!isMobile && museum ? 'translate-x-0' : ''}
        `}
        style={isMobile ? transformStyle : {}}
      >
        {/* Drag Handle Area (Mobile Only) */}
        {/* HIT AREA INCREASED for better UX */}
        <div 
            className="w-full pt-4 pb-2 flex justify-center flex-shrink-0 md:hidden touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {museum && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Section - Also draggable */}
            <div 
                className="px-6 pb-4 flex justify-between items-start flex-shrink-0 touch-none md:touch-auto md:mt-6"
                onTouchStart={isMobile ? handleTouchStart : undefined}
                onTouchMove={isMobile ? handleTouchMove : undefined}
                onTouchEnd={isMobile ? handleTouchEnd : undefined}
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight pr-4">{museum.name}</h2>
                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                  <Star fill="currentColor" size={16} />
                  <span className="font-semibold text-slate-700">{museum.rating}</span>
                  <span className="text-slate-400 text-sm">({museum.reviewCount})</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10 shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            {/* LOGIC CHANGED: Padding bottom is dynamic. 
                If 'full', small padding (pb-8). 
                If 'half', massive padding (pb-[60vh]) to allow scroll. */}
            <div 
                ref={contentRef}
                className={`
                    flex-1 overflow-y-auto no-scrollbar px-6 overflow-x-hidden
                    ${snapState === 'full' ? 'pb-8' : 'pb-[60vh]'}
                    md:pb-6
                `}
            >
              <div className="flex flex-col gap-2 mb-6 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3"><MapPin size={16} className="text-indigo-500 shrink-0" /><span>{museum.address}</span></div>
                <div className="flex items-center gap-3"><Clock size={16} className="text-indigo-500 shrink-0" /><span>{museum.hours}</span></div>
                <div className="flex items-center gap-3"><CircleDollarSign size={16} className="text-indigo-500 shrink-0" /><span>{museum.price}</span></div>
              </div>

              <div className="space-y-8">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Выставки</h3>
                {museum.themes.map((theme) => (
                  <div key={theme.id}>
                    <h4 className="font-semibold text-slate-700 mb-3">{theme.title}</h4>
                    
                    {/* Gallery items */}
                    <div 
                      key={`${museum.id}-${theme.id}`}
                      className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-6 -mx-6 md:mx-0 md:px-0 max-w-[100vw] md:max-w-full snap-x snap-mandatory scroll-pl-6 justify-start"
                    >
                      {theme.photos.map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => onImageClick(photo, theme)}
                          className="relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden snap-start shadow-sm group"
                        >
                          <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      ))}
                    </div>

                    <p className="mt-3 text-slate-600 text-sm leading-relaxed">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BottomSheet;