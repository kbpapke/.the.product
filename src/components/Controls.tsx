import React from 'react';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  currentScene: string;
  onToggleAudio: () => void;
  onRestart: () => void;
  onSceneChange: (scene: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  currentScene,
  onToggleAudio,
  onRestart,
  onSceneChange
}) => {
  const scenes = [
    { id: 'tunnel', name: 'Tunnel' },
    { id: 'castle', name: 'Cathedral' },
    { id: 'crystal', name: 'Crystal' }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center z-20">
      {/* Scene selection */}
      <div className="flex gap-2">
        {scenes.map(scene => (
          <button
            key={scene.id}
            onClick={() => onSceneChange(scene.id)}
            className={`px-4 py-2 rounded-full transition-colors backdrop-blur-sm ${
              currentScene === scene.id
                ? 'bg-blue-500/90 text-white'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            {scene.name}
          </button>
        ))}
      </div>

      {/* Audio controls */}
      <div className="flex gap-2">
        <button
          onClick={onToggleAudio}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors text-white"
          aria-label={isPlaying ? 'Mute' : 'Unmute'}
        >
          {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
        <button
          onClick={onRestart}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors text-white"
          aria-label="Restart"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 