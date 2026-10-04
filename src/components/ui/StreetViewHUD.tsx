import React from 'react';
import { NavigationWaypoint } from '../../types/bus';
import { Compass, Footprints, LayoutGrid, MousePointerClick } from 'lucide-react';

interface StreetViewHUDProps {
  waypoints: NavigationWaypoint[];
  currentWaypointId: string;
  onSelectWaypoint: (wp: NavigationWaypoint) => void;
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
}

export const StreetViewHUD: React.FC<StreetViewHUDProps> = ({
  waypoints,
  currentWaypointId,
  onSelectWaypoint,
  showMiniMap,
  onToggleMiniMap,
}) => {
  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-2.5 px-4">
      {/* Street View Quick Navigation Points Ribbon */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-neutral-950/85 backdrop-blur-md border border-neutral-800 rounded-full shadow-2xl overflow-x-auto max-w-full">
        <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-sky-400 border-r border-neutral-800 shrink-0">
          <Footprints className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Aisle Points:</span>
        </div>

        {waypoints.map((wp) => {
          const isActive = wp.id === currentWaypointId;
          return (
            <button
              key={wp.id}
              onClick={() => onSelectWaypoint(wp)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {wp.label.split(' ')[0]} {wp.label.includes('Entrance') ? 'Entrance' : wp.label.includes('Exit') ? 'Exit' : ''}
            </button>
          );
        })}

        <div className="border-l border-neutral-800 pl-1 shrink-0">
          <button
            onClick={onToggleMiniMap}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
              showMiniMap ? 'bg-neutral-700 text-sky-300' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
            title="Toggle 2D Seat Matrix"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">2D Map</span>
          </button>
        </div>
      </div>

      {/* Street View Interaction Guide Subtext */}
      <div className="flex items-center gap-3 px-3 py-1 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/80 rounded-md text-[11px] text-neutral-300 shadow">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Compass className="w-3 h-3 text-sky-400" />
          <span>Drag to look 360°</span>
        </div>
        <span className="text-neutral-700">·</span>
        <div className="flex items-center gap-1.5 text-neutral-400">
          <MousePointerClick className="w-3 h-3 text-emerald-400" />
          <span>Click floor discs to walk</span>
        </div>
        <span className="text-neutral-700">·</span>
        <span className="text-neutral-200">Click any seat to inspect & book</span>
      </div>
    </div>
  );
};
