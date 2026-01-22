import React, { useState, useCallback } from 'react';
import MapArea from './components/MapArea';
import BottomSheet from './components/BottomSheet';
import ImageViewer from './components/ImageViewer';
import ListDrawer from './components/ListDrawer';
import { MUSEUMS } from './constants';
import { Museum, Photo, Theme } from './types';
import { Menu, Map as MapIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeMuseumId, setActiveMuseumId] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  // Replaced simple photo state with gallery state (theme + index)
  const [viewingGallery, setViewingGallery] = useState<{ theme: Theme; initialIndex: number } | null>(null);

  const activeMuseum = activeMuseumId 
    ? MUSEUMS.find(m => m.id === activeMuseumId) || null 
    : null;

  const handleMarkerClick = useCallback((museum: Museum) => {
    setActiveMuseumId(museum.id);
  }, []);

  const handleListSelect = useCallback((museum: Museum) => {
    setActiveMuseumId(museum.id);
    setIsListOpen(false);
  }, []);

  const handleImageClick = useCallback((photo: Photo, theme: Theme) => {
    const index = theme.photos.findIndex(p => p.url === photo.url);
    setViewingGallery({ 
      theme, 
      initialIndex: index !== -1 ? index : 0 
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-100 flex flex-col">
      {/* Header / Floating Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-sm px-4 py-2 border border-slate-200/50">
           <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
             <span className="text-lg">🏛️</span> Музейный Гид
           </h1>
        </div>
        
        <button
          onClick={() => setIsListOpen(true)}
          className="pointer-events-auto bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors active:scale-95"
          aria-label="Открыть список"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main Map View */}
      <main className="flex-1 relative z-0">
        <MapArea 
          museums={MUSEUMS} 
          onMarkerClick={handleMarkerClick}
          activeMuseumId={activeMuseumId}
        />
      </main>

      {/* List Drawer (Overlay) */}
      <ListDrawer 
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        museums={MUSEUMS}
        onSelect={handleListSelect}
      />

      {/* Bottom Sheet Details */}
      <BottomSheet 
        museum={activeMuseum} 
        onClose={() => setActiveMuseumId(null)}
        onImageClick={handleImageClick}
      />

      {/* Full Screen Gallery Viewer */}
      {viewingGallery && (
        <ImageViewer 
          theme={viewingGallery.theme}
          photos={viewingGallery.theme.photos}
          initialIndex={viewingGallery.initialIndex}
          onClose={() => setViewingGallery(null)}
        />
      )}
    </div>
  );
};

export default App;