import React, { useEffect, useRef } from 'react';
import { Museum } from '../types';
import { INITIAL_MAP_VIEW } from '../constants';

// Safe access to global Leaflet object
const getL = () => (window as any).L;

interface MapAreaProps {
  museums: Museum[];
  onMarkerClick: (museum: Museum) => void;
  activeMuseumId: string | null;
}

const MapArea: React.FC<MapAreaProps> = ({ museums, onMarkerClick, activeMuseumId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const clusterGroupRef = useRef<any | null>(null);
  const markersRef = useRef<{ [id: string]: any }>({});

  // Helper to generate Marker HTML
  const getMarkerHtml = (museum: Museum, isActive: boolean) => {
    return `
      <div class="relative group flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-transform duration-300 origin-bottom">
         <div class="w-14 h-14 rounded-full border-[3px] shadow-lg flex items-center justify-center text-2xl relative z-10 
            ${isActive ? 'bg-rose-600 border-white text-white shadow-rose-900/40 ring-4 ring-rose-600/20' : 'bg-white border-indigo-600 text-indigo-600'}">
           ${museum.icon}
         </div>
         <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] -mt-[2px] relative z-0
            ${isActive ? 'border-t-rose-600' : 'border-t-indigo-600'}"></div>
      </div>
    `;
  };

  // 1. Initialize Map
  useEffect(() => {
    const L = getL();
    if (!mapContainerRef.current || mapInstanceRef.current || !L) return;

    const map = L.map(mapContainerRef.current, {
      center: [INITIAL_MAP_VIEW.lat, INITIAL_MAP_VIEW.lng],
      zoom: INITIAL_MAP_VIEW.zoom,
      minZoom: 4,
      zoomControl: false,
      attributionControl: false,
      // Restrict view to roughly Russia boundaries
      maxBounds: [
        [41.0, 19.0], // South West
        [82.0, 180.0] // North East
      ],
      maxBoundsViscosity: 1.0 // Makes bounds completely solid (no bounce back)
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 20
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        let sizeClass = 'custom-cluster-small';
        if (count > 10) sizeClass = 'custom-cluster-medium';
        if (count > 50) sizeClass = 'custom-cluster-large';
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `custom-cluster-icon ${sizeClass}`,
          iconSize: [50, 50]
        });
      }
    });

    map.addLayer(clusterGroup);
    mapInstanceRef.current = map;
    clusterGroupRef.current = clusterGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Initialize/Update Markers (Only when list changes, NOT when active ID changes)
  useEffect(() => {
    const L = getL();
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup || !L) return;

    clusterGroup.clearLayers();
    markersRef.current = {};

    museums.forEach((museum) => {
      if (!museum.coordinates || isNaN(museum.coordinates.lat) || isNaN(museum.coordinates.lng)) return;

      const marker = L.marker([museum.coordinates.lat, museum.coordinates.lng], {
        icon: L.divIcon({ 
          html: getMarkerHtml(museum, false), // Initial state is inactive
          className: 'bg-transparent', 
          iconSize: [56, 70], 
          iconAnchor: [28, 68] 
        })
      });

      marker.on('click', () => onMarkerClick(museum));
      markersRef.current[museum.id] = marker;
      clusterGroup.addLayer(marker);
    });
  }, [museums, onMarkerClick]);

  // 3. Handle Active State Updates (Without recreating markers)
  useEffect(() => {
    const L = getL();
    if (!L) return;

    Object.keys(markersRef.current).forEach((id) => {
      const marker = markersRef.current[id];
      const museum = museums.find(m => m.id === id);
      if (marker && museum) {
        const isActive = activeMuseumId === id;
        
        // Update Icon
        const newIcon = L.divIcon({ 
          html: getMarkerHtml(museum, isActive), 
          className: 'bg-transparent', 
          iconSize: [56, 70], 
          iconAnchor: [28, 68] 
        });
        marker.setIcon(newIcon);
        
        // Update Z-Index
        marker.setZIndexOffset(isActive ? 1000 : 0);
      }
    });
  }, [activeMuseumId, museums]);

  // 4. Handle Centering (setView)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeMuseumId) return;
    
    const museum = museums.find(m => m.id === activeMuseumId);
    if (museum) {
      const L = getL();
      const targetLatLng = [museum.coordinates.lat, museum.coordinates.lng];
      const targetZoom = 16;

      if (window.innerWidth < 768) {
        // --- Centering Logic ---
        // Visual Goal: Center the pin's CIRCLE in the "available map area".
        // 
        // 1. Available Area: The bottom sheet takes ~55-60% of the screen.
        //    The visible map is the top ~40-45%.
        //    The center of this visible area is roughly at 20-23% of the screen height.
        //
        // 2. Pin Geometry: The anchor is at the bottom tip.
        //    The center of the circle is ~42px above the tip.
        
        const point = map.project(targetLatLng, targetZoom);
        
        // Calculation:
        // We want the marker circle at ~27% of screen height.
        // Higher marker = larger positive offset for the center unprojection.
        
        const offset = (window.innerHeight * 0.27) - 42; 
        
        const newCenter = map.unproject(L.point(point.x, point.y + offset), targetZoom);
        
        // Use setView instead of flyTo for stability (no shake)
        map.setView(newCenter, targetZoom, { animate: true });
      } else {
        map.setView(targetLatLng, targetZoom, { animate: true });
      }
    }
  }, [activeMuseumId, museums]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapArea;