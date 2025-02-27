import { EventEmitter } from '../utils/EventEmitter';

interface AudioNode {
  osc: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  lfo?: OscillatorNode;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private synthNodes: Map<string, AudioNode[]> = new Map();
  private isPlaying: boolean = false;
  private eventEmitter: EventEmitter;
  private currentScene: string = 'tunnel';

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      await this.setupSceneSynths();
    }
  }

  private async setupSceneSynths() {
    if (!this.audioContext) return;
    
    const tunnelNodes = this.createTunnelSynth();
    const cathedralNodes = this.createCathedralSynth();
    const crystalNodes = this.createCrystalSynth();
    const beachNodes = this.createBeachSynth();
    const galaxyNodes = this.createGalaxySynth();
    const cyberpunkNodes = this.createCyberpunkSynth();
    
    this.synthNodes.set('tunnel', tunnelNodes);
    this.synthNodes.set('castle', cathedralNodes);
    this.synthNodes.set('crystal', crystalNodes);
    this.synthNodes.set('beach', beachNodes);
    this.synthNodes.set('galaxy', galaxyNodes);
    this.synthNodes.set('cyberpunk', cyberpunkNodes);
  }

  private createTunnelSynth(): AudioNode[] {
    if (!this.audioContext || !this.masterGain) return [];

    const nodes: AudioNode[] = [];
    // Base frequencies inspired by .the .product
    const baseFreq = 146.83; // D3
    const frequencies = [
      baseFreq,
      baseFreq * 2, // D4
      baseFreq * 3, // A4
      baseFreq * 4, // D5
    ];

    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const filter = this.audioContext!.createBiquadFilter();
      const gain = this.audioContext!.createGain();
      const lfo = this.audioContext!.createOscillator();
      const lfoGain = this.audioContext!.createGain();

      // Sawtooth wave like in the original
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

      // Filter setup for that classic demoscene sound
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, this.audioContext!.currentTime);
      filter.Q.setValueAtTime(8, this.audioContext!.currentTime);

      // LFO for filter movement
      lfo.frequency.setValueAtTime(4 + i, this.audioContext!.currentTime);
      lfoGain.gain.setValueAtTime(1000, this.audioContext!.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      gain.gain.setValueAtTime(0.15, this.audioContext!.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();

      nodes.push({ osc, filter, gain, lfo });
    });

    return nodes;
  }

  private createCathedralSynth(): AudioNode[] {
    // Add gothic cathedral-like sounds
    const nodes: AudioNode[] = [];
    const baseFreq = 55;
    
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext!.createOscillator();
      const chorus = this.audioContext!.createDelay();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * (i + 1), this.audioContext!.currentTime);
      
      chorus.delayTime.setValueAtTime(0.03 + i * 0.01, this.audioContext!.currentTime);
      
      gain.gain.setValueAtTime(0.15 / (i + 1), this.audioContext!.currentTime);
      
      osc.connect(chorus);
      chorus.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      nodes.push({ osc, chorus, gain });
    }
    
    return nodes;
  }

  private createCrystalSynth(): AudioNode[] {
    // Add crystal-like sounds
    const nodes: AudioNode[] = [];
    const baseFreq = 220;
    
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext!.createOscillator();
      const filter = this.audioContext!.createBiquadFilter();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * (i + 1), this.audioContext!.currentTime);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * (i + 1) * 2, this.audioContext!.currentTime);
      filter.Q.setValueAtTime(10, this.audioContext!.currentTime);
      
      gain.gain.setValueAtTime(0.15 / (i + 1), this.audioContext!.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      nodes.push({ osc, filter, gain });
    }
    
    return nodes;
  }

  private createBeachSynth(): AudioNode[] {
    if (!this.audioContext || !this.masterGain) return [];
    const nodes: AudioNode[] = [];

    // Wave sounds
    const waveOsc = this.audioContext.createOscillator();
    const waveFilter = this.audioContext.createBiquadFilter();
    const waveGain = this.audioContext.createGain();
    const waveLFO = this.audioContext.createOscillator();
    const waveLFOGain = this.audioContext.createGain();

    waveOsc.type = 'noise' as OscillatorType;
    waveOsc.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    
    waveFilter.type = 'lowpass';
    waveFilter.frequency.setValueAtTime(400, this.audioContext.currentTime);
    waveFilter.Q.setValueAtTime(10, this.audioContext.currentTime);

    waveLFO.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    waveLFOGain.gain.setValueAtTime(200, this.audioContext.currentTime);

    waveGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    waveLFO.connect(waveLFOGain);
    waveLFOGain.connect(waveFilter.frequency);
    waveOsc.connect(waveFilter);
    waveFilter.connect(waveGain);
    waveGain.connect(this.masterGain);

    waveOsc.start();
    waveLFO.start();

    nodes.push({ osc: waveOsc, filter: waveFilter, gain: waveGain, lfo: waveLFO });

    // Seagull-like sounds
    for (let i = 0; i < 3; i++) {
      const birdOsc = this.audioContext.createOscillator();
      const birdFilter = this.audioContext.createBiquadFilter();
      const birdGain = this.audioContext.createGain();

      birdOsc.type = 'sine';
      birdOsc.frequency.setValueAtTime(800 + i * 200, this.audioContext.currentTime);

      birdFilter.type = 'bandpass';
      birdFilter.frequency.setValueAtTime(1000 + i * 500, this.audioContext.currentTime);
      birdFilter.Q.setValueAtTime(20, this.audioContext.currentTime);

      birdGain.gain.setValueAtTime(0.01, this.audioContext.currentTime);

      birdOsc.connect(birdFilter);
      birdFilter.connect(birdGain);
      birdGain.connect(this.masterGain);

      birdOsc.start();
      nodes.push({ osc: birdOsc, filter: birdFilter, gain: birdGain });
    }

    return nodes;
  }

  private createGalaxySynth(): AudioNode[] {
    if (!this.audioContext || !this.masterGain) return [];
    const nodes: AudioNode[] = [];

    // Ethereal pad sounds
    const frequencies = [220, 277.18, 329.63, 440]; // A3, C#4, E4, A4
    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const filter = this.audioContext!.createBiquadFilter();
      const gain = this.audioContext!.createGain();
      const lfo = this.audioContext!.createOscillator();
      const lfoGain = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, this.audioContext!.currentTime);
      filter.Q.setValueAtTime(5, this.audioContext!.currentTime);

      lfo.frequency.setValueAtTime(0.1 + i * 0.05, this.audioContext!.currentTime);
      lfoGain.gain.setValueAtTime(100, this.audioContext!.currentTime);

      gain.gain.setValueAtTime(0.1, this.audioContext!.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      lfo.start();

      nodes.push({ osc, filter, gain, lfo });
    });

    return nodes;
  }

  private createCyberpunkSynth(): AudioNode[] {
    if (!this.audioContext || !this.masterGain) return [];
    const nodes: AudioNode[] = [];

    // Bass synth
    const bassOsc = this.audioContext.createOscillator();
    const bassFilter = this.audioContext.createBiquadFilter();
    const bassGain = this.audioContext.createGain();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    bassFilter.Q.setValueAtTime(15, this.audioContext.currentTime);

    bassGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);

    bassOsc.start();
    nodes.push({ osc: bassOsc, filter: bassFilter, gain: bassGain });

    // Arpeggiator
    const arpNotes = [220, 277.18, 329.63, 440, 554.37, 659.26];
    arpNotes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const filter = this.audioContext!.createBiquadFilter();
      const gain = this.audioContext!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 2, this.audioContext!.currentTime);
      filter.Q.setValueAtTime(5, this.audioContext!.currentTime);

      gain.gain.setValueAtTime(0.1, this.audioContext!.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      nodes.push({ osc, filter, gain });
    });

    return nodes;
  }

  async restart() {
    // Stop all current audio
    this.synthNodes.forEach((nodes) => {
      nodes.forEach(node => {
        if (node.osc) {
          node.osc.stop();
          node.osc.disconnect();
        }
        if (node.filter) node.filter.disconnect();
        if (node.gain) node.gain.disconnect();
        if (node.lfo) {
          node.lfo.stop();
          node.lfo.disconnect();
        }
      });
    });
    
    // Clear nodes
    this.synthNodes.clear();
    
    // Close and recreate audio context
    if (this.audioContext) {
      await this.audioContext.close();
    }
    
    // Reinitialize
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    
    // Setup synths again
    await this.setupSceneSynths();
    
    // Start playing
    this.isPlaying = true;
    this.eventEmitter.emit('playingStateChanged', this.isPlaying);
  }

  switchScene(sceneName: string) {
    if (this.currentScene === sceneName) return;
    
    // Fade out current scene's synth
    const currentNodes = this.synthNodes.get(this.currentScene);
    if (currentNodes) {
      currentNodes.forEach(node => {
        if (node.gain) {
          node.gain.gain.setTargetAtTime(0, this.audioContext!.currentTime, 0.1);
        }
      });
    }
    
    // Fade in new scene's synth
    const newNodes = this.synthNodes.get(sceneName);
    if (newNodes) {
      newNodes.forEach(node => {
        if (node.gain) {
          node.gain.gain.setTargetAtTime(
            this.isPlaying ? 0.15 : 0,
            this.audioContext!.currentTime,
            0.1
          );
        }
      });
    }
    
    this.currentScene = sceneName;
  }

  async toggle() {
    if (!this.audioContext) {
      await this.initialize();
    }
    
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    const targetGain = this.isPlaying ? 0 : 0.5;
    this.masterGain?.gain.setTargetAtTime(targetGain, this.audioContext!.currentTime, 0.1);
    this.isPlaying = !this.isPlaying;
    this.eventEmitter.emit('playingStateChanged', this.isPlaying);
  }

  onPlayingStateChanged(callback: (isPlaying: boolean) => void) {
    this.eventEmitter.on('playingStateChanged', callback);
  }
} 