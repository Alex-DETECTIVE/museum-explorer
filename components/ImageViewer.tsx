import React, { useState, useEffect, useRef } from 'react';
import { Photo, Theme } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  theme: Theme;
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ theme, photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll active thumbnail
  useEffect(() => {
    if (thumbnailsRef.current) {
        const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement;
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [currentIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in fade-in duration-200">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div>
           <p className="text-white font-medium text-lg drop-shadow-md">{theme.title}</p>
           <p className="text-white/60 text-xs mt-1">{currentIndex + 1} / {photos.length}</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-md transition-colors"><X size={24} /></button>
      </div>

      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
         <button onClick={handlePrev} className="absolute left-4 z-10 p-4 text-white/50 hover:text-white hidden md:block rounded-full bg-black/20 hover:bg-black/50 transition-all"><ChevronLeft size={40} /></button>
         <button onClick={handleNext} className="absolute right-4 z-10 p-4 text-white/50 hover:text-white hidden md:block rounded-full bg-black/20 hover:bg-black/50 transition-all"><ChevronRight size={40} /></button>
         <img key={currentPhoto.url} src={currentPhoto.url} alt={currentPhoto.caption} className="max-w-full max-h-full object-contain select-none animate-in zoom-in-95 duration-300" />
      </div>

      <div className="bg-black/90 p-6 pb-10 flex flex-col gap-4">
        <p className="text-white text-center text-sm font-medium">{currentPhoto.caption}</p>
        
        {/* Thumbnails - Centered Logic */}
        <div className="flex w-full justify-center">
            <div 
                ref={thumbnailsRef}
                className="flex gap-3 overflow-x-auto no-scrollbar px-4 max-w-full"
            >
            {photos.map((photo, idx) => (
                <button 
                    key={idx} 
                    onClick={() => setCurrentIndex(idx)} 
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        idx === currentIndex 
                            ? 'border-indigo-500 opacity-100 shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                            : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </button>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;