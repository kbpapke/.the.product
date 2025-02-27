import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { Controls } from './components/Controls';
import { AudioManager } from './audio/AudioManager';
import { SceneManager } from './scene/SceneManager';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = React.useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState('castle');
  const audioManager = useRef<AudioManager>();
  const sceneManager = useRef<SceneManager>();

  useEffect(() => {
    if (containerRef.current) {
      audioManager.current = new AudioManager();
      sceneManager.current = new SceneManager(containerRef.current);
      sceneManager.current.animate();

      audioManager.current.onPlayingStateChanged(setIsPlaying);

      // Set initial camera position for cathedral
      sceneManager.current.switchScene('castle');

      // Add resize handler
      const handleResize = () => {
        sceneManager.current?.onWindowResize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        audioManager.current?.restart();
      };
    }
  }, []);

  const handleToggleAudio = () => {
    audioManager.current?.toggle();
  };

  const handleRestart = async () => {
    await audioManager.current?.restart();
    sceneManager.current?.reset();
  };

  const handleSceneChange = (sceneName: string) => {
    setCurrentScene(sceneName);
    sceneManager.current?.switchScene(sceneName);
    audioManager.current?.switchScene(sceneName);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Main scene */}
      <div ref={containerRef} className="fixed inset-0" />
      
      {/* Info button */}
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
      >
        <Info size={24} />
      </button>
      
      {/* Info panel */}
      {showInfo && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-md text-white p-6 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">About this demo</h2>
            <p className="mb-4">
              This is a tribute to the legendary demoscene production "fr-08: .the .product" by Farbrausch.
              It features procedurally generated textures and synthesized audio created with Web Audio API.
            </p>
            <p className="mb-4">
              All visuals and audio are generated dynamically without external assets,
              in the spirit of the demoscene tradition.
            </p>
            <button 
              onClick={() => setShowInfo(false)}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Title overlay */}
      <div className="absolute bottom-8 left-8 z-10 text-white">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-blue-400">.</span>the <span className="text-blue-400">.</span>product
        </h1>
        <p className="text-sm opacity-70">A tribute to Farbrausch</p>
      </div>

      {/* Controls */}
      <Controls 
        isPlaying={isPlaying}
        currentScene={currentScene}
        onToggleAudio={handleToggleAudio}
        onRestart={handleRestart}
        onSceneChange={handleSceneChange}
      />
    </div>
  );
}

export default App;