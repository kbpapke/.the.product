/**
 * Creates a Web Audio API synthesizer inspired by Farbrausch's .the .product
 */
export function createAudioSystem() {
  // Initialize audio context
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContext();
  
  // Master volume
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
  
  // Compressor for better sound
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 30;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;
  compressor.connect(masterGain);
  
  // Create oscillators
  const createOscillator = (type: OscillatorType, frequency: number, detune: number = 0) => {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    return osc;
  };
  
  // Create a filter
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;
  filter.Q.value = 8;
  filter.connect(compressor);
  
  // Create a delay effect
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.25;
  
  const delayFeedback = audioCtx.createGain();
  delayFeedback.gain.value = 0.3;
  
  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delay.connect(compressor);
  
  // Create a reverb effect (more like .the .product)
  const convolver = audioCtx.createConvolver();
  
  // Create impulse response for reverb
  const impulseLength = audioCtx.sampleRate * 2.5; // 2.5 seconds
  const impulse = audioCtx.createBuffer(2, impulseLength, audioCtx.sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    for (let i = 0; i < impulseLength; i++) {
      // Exponential decay
      impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
    }
  }
  
  convolver.buffer = impulse;
  convolver.connect(compressor);
  
  // Active oscillators and nodes
  const activeNodes: { stop: () => void }[] = [];
  
  // Bass synth (more like .the .product's deep bass)
  const bassSynth = {
    oscillator: null as OscillatorNode | null,
    gain: audioCtx.createGain(),
    filter: audioCtx.createBiquadFilter(),
    
    start() {
      if (this.oscillator) return;
      
      this.oscillator = createOscillator('sawtooth', 55);
      this.gain.gain.value = 0.4;
      
      // Filter for bass
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 300;
      this.filter.Q.value = 2;
      
      this.oscillator.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(filter);
      
      this.oscillator.start();
      activeNodes.push(this.oscillator);
    },
    
    stop() {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator = null;
      }
    },
    
    update(time: number) {
      if (!this.oscillator) return;
      
      // Bass sequence more like .the .product
      const bassSequence = [0, 0, 3, 0, 5, 5, 7, 7];
      const step = Math.floor(time * 1.5) % bassSequence.length;
      const note = bassSequence[step];
      
      // Base frequency is A1 (55Hz)
      const baseFreq = 55;
      const freq = baseFreq * Math.pow(2, note / 12);
      
      // Smooth transition
      this.oscillator.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
      
      // Filter modulation
      this.filter.frequency.setValueAtTime(
        200 + 100 * Math.sin(time * 0.5),
        audioCtx.currentTime
      );
      
      // Envelope
      if (step % 2 === 0) {
        this.gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        this.gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.3);
      }
    }
  };
  
  // Lead synth (more like .the .product's lead sounds)
  const leadSynth = {
    oscillators: [] as OscillatorNode[],
    gain: audioCtx.createGain(),
    
    start() {
      if (this.oscillators.length > 0) return;
      
      // Create two oscillators with slight detune for fatness
      const osc1 = createOscillator('square', 220);
      const osc2 = createOscillator('sawtooth', 220, 7);
      
      this.oscillators = [osc1, osc2];
      this.gain.gain.value = 0.15;
      
      osc1.connect(this.gain);
      osc2.connect(this.gain);
      this.gain.connect(filter);
      this.gain.connect(delay);
      this.gain.connect(convolver);
      
      osc1.start();
      osc2.start();
      activeNodes.push(osc1, osc2);
    },
    
    stop() {
      this.oscillators.forEach(osc => osc.stop());
      this.oscillators = [];
    },
    
    update(time: number) {
      if (this.oscillators.length === 0) return;
      
      // Lead sequence - more like .the .product's melody
      const leadSequence = [7, 10, 12, 14, 12, 10, 7, 5];
      const step = Math.floor(time * 0.75) % leadSequence.length;
      const note = leadSequence[step];
      
      // Base frequency is A3 (220Hz)
      const baseFreq = 220;
      const freq = baseFreq * Math.pow(2, note / 12);
      
      // Smooth transition
      this.oscillators.forEach(osc => {
        osc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
      });
      
      // Envelope
      this.gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      this.gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.4);
    }
  };
  
  // Pad synth (more like .the .product's atmospheric pads)
  const padSynth = {
    oscillators: [] as OscillatorNode[],
    gain: audioCtx.createGain(),
    
    start() {
      if (this.oscillators.length > 0) return;
      
      // Create chord oscillators - minor chord for that .the .product feel
      const frequencies = [220, 261.63, 329.63]; // A3, C4, E4 (A minor chord)
      
      this.oscillators = frequencies.map(freq => {
        const osc = createOscillator('sine', freq);
        osc.connect(this.gain);
        osc.start();
        activeNodes.push(osc);
        return osc;
      });
      
      this.gain.gain.value = 0.08;
      this.gain.connect(filter);
      this.gain.connect(convolver);
    },
    
    stop() {
      this.oscillators.forEach(osc => osc.stop());
      this.oscillators = [];
    },
    
    update(time: number) {
      if (this.oscillators.length === 0) return;
      
      // Slowly modulate filter
      filter.frequency.setValueAtTime(
        800 + 700 * Math.sin(time * 0.1),
        audioCtx.currentTime
      );
      
      // Chord progression every 8 seconds - more like .the .product's minor progressions
      const progression = [
        [220, 261.63, 329.63], // A minor
        [196, 233.08, 293.66], // G minor
        [174.61, 207.65, 261.63], // F minor
        [164.81, 196, 246.94]  // E minor
      ];
      
      const chordIndex = Math.floor(time / 8) % progression.length;
      const chord = progression[chordIndex];
      
      // Update frequencies
      this.oscillators.forEach((osc, i) => {
        osc.frequency.setTargetAtTime(chord[i], audioCtx.currentTime, 0.5);
      });
    }
  };
  
  // Arpeggiated synth (characteristic of .the .product)
  const arpSynth = {
    oscillator: null as OscillatorNode | null,
    gain: audioCtx.createGain(),
    
    start() {
      if (this.oscillator) return;
      
      this.oscillator = createOscillator('square', 440);
      this.gain.gain.value = 0.1;
      
      this.oscillator.connect(this.gain);
      this.gain.connect(filter);
      this.gain.connect(delay);
      
      this.oscillator.start();
      activeNodes.push(this.oscillator);
    },
    
    stop() {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator = null;
      }
    },
    
    update(time: number) {
      if (!this.oscillator) return;
      
      // Arpeggio pattern
      const arpSequence = [0, 7, 12, 19, 12, 7, 24, 19];
      const step = Math.floor(time * 4) % arpSequence.length;
      const note = arpSequence[step];
      
      // Base frequency is A4 (440Hz)
      const baseFreq = 440;
      const freq = baseFreq * Math.pow(2, note / 12);
      
      // Quick transition for arpeggio effect
      this.oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      // Envelope
      this.gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      this.gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    }
  };
  
  // Percussion (more like .the .product's minimal percussion)
  const percussion = {
    nextTriggerTime: 0,
    
    trigger() {
      // Create a noise burst for kick drum
      const kickOsc = audioCtx.createOscillator();
      kickOsc.frequency.value = 120;
      
      const kickGain = audioCtx.createGain();
      kickGain.gain.value = 0.4;
      
      kickOsc.connect(kickGain);
      kickGain.connect(compressor);
      
      kickOsc.start();
      kickOsc.stop(audioCtx.currentTime + 0.1);
      
      // Frequency sweep
      kickOsc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
      
      // Amplitude envelope
      kickGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      // Hi-hat (more subtle, like in .the .product)
      if (Math.random() > 0.3) {
        const hihatOsc = audioCtx.createOscillator();
        hihatOsc.type = 'square';
        hihatOsc.frequency.value = 6000;
        
        const hihatGain = audioCtx.createGain();
        hihatGain.gain.value = 0.05;
        
        // Highpass filter
        const hihatFilter = audioCtx.createBiquadFilter();
        hihatFilter.type = 'highpass';
        hihatFilter.frequency.value = 5000;
        
        hihatOsc.connect(hihatFilter);
        hihatFilter.connect(hihatGain);
        hihatGain.connect(compressor);
        
        hihatOsc.start();
        hihatOsc.stop(audioCtx.currentTime + 0.03);
        
        hihatGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);
      }
    },
    
    update(time: number) {
      // Trigger on beats
      const currentTime = audioCtx.currentTime;
      const tempo = 135; // BPM (more like .the .product's faster tempo)
      const beatDuration = 60 / tempo;
      
      if (currentTime >= this.nextTriggerTime) {
        this.trigger();
        this.nextTriggerTime = currentTime + beatDuration;
      }
    }
  };
  
  // Start and update functions
  const startAudio = () => {
    // Resume audio context if suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    bassSynth.start();
    leadSynth.start();
    padSynth.start();
    arpSynth.start();
  };
  
  const stopAudio = () => {
    bassSynth.stop();
    leadSynth.stop();
    padSynth.stop();
    arpSynth.stop();
    
    // Stop all active nodes
    activeNodes.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Ignore errors if node is already stopped
      }
    });
  };
  
  const updateAudio = (time: number) => {
    bassSynth.update(time);
    leadSynth.update(time);
    padSynth.update(time);
    arpSynth.update(time);
    percussion.update(time);
  };
  
  return {
    startAudio,
    stopAudio,
    updateAudio
  };
}