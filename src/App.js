import React, { Component } from 'react';

import Slider from './Slider/Slider';

const THRESHOLD_MIN = .1;
const THRESHOLD_MAX = 1;

const DEBOUNCE_MIN = 100;
const DEBOUNCE_MAX = 3000;

const VOLUME_MIN = 0;
const VOLUME_MAX = 3;

const SAMPLE_BUFFER_LENGTH = 200;

class App extends Component {
  constructor(props) {
    super(props);

    const loadNumber = (prop, def) => {
      const value = localStorage[prop];
      return typeof value === 'string' ? +value : def;
    }

    this.state = {
      amplitude: 0,
      debounce: loadNumber('debounce', 500),
      lastThresholdTime: 0,
      samples: [],
      threshold: loadNumber('threshold', .5),
      volume: loadNumber('volume', 1),
    }
  }

  setDebounce(debounce) {
    localStorage.debounce = debounce;
    this.setState(state => ({
      ...state,
      debounce,
    }));
  }

  setThreshold(threshold) {
    localStorage.threshold = threshold;
    this.setState(state => ({
      ...state,
      threshold,
    }));
  }

  setVolume(volume) {
    localStorage.volume = volume;
    this.setState(state => ({
      ...state,
      volume,
    }));
  }

  handleSample(amplitude) {
    const samples = this.state.samples.slice();
    samples.push(amplitude);
    if (samples.length > SAMPLE_BUFFER_LENGTH) {
      samples.shift();
    }
    this.setState(state => ({
      ...state,
      amplitude,
      samples,
    }));
  }

  getSamples() {
    const { samples } = this.state;
    const zeroes = new Array(SAMPLE_BUFFER_LENGTH - samples.length).fill(0);
    return [...zeroes, ...samples];
  }

  componentDidMount() {
    const BUFFER_LENGTH = 1024;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(BUFFER_LENGTH, 1, 1);

      source.connect(processor);
      processor.connect(context.destination);

      const playSoundQueue = (queue) => {
        setTimeout(() => {
          const sound = context.createScriptProcessor(BUFFER_LENGTH, 1, 1);
          sound.onaudioprocess = ({ outputBuffer }) => {
            const { volume } = this.state;
            if (queue.length > 0) {
              const output = outputBuffer.getChannelData(0);
              const data = queue.shift();
              for (let i = 0; i < BUFFER_LENGTH; i++) {
                output[i] = data[i] * volume;
              }
            } else {
              sound.disconnect();
            }
          }

          sound.loop = false;
          sound.connect(context.destination);
        });
      }

      let queue = [];
      let lastThresholdTime = 0;
      processor.onaudioprocess = ({ inputBuffer }) => {
        const data = inputBuffer.getChannelData(0);
        const now = +new Date();
        const amplitude = Math.max(...data);

        this.handleSample(amplitude);

        if (amplitude > this.state.threshold) {
          lastThresholdTime = now;
          this.setState(state => ({
            ...state,
            lastThresholdTime,
          }));
        }
        if (now - lastThresholdTime < this.state.debounce) {
          queue.push(data.slice());
        } else if (queue.length > 0) {
          playSoundQueue(queue);
          queue = [];
        }
      };
    });
  }

  render() {
    const {
      amplitude,
      debounce,
      lastThresholdTime,
      threshold,
      volume,
    } = this.state;
    return (
      <div className="App">
        <div className="graph">{
          this.getSamples().map((sample, index) => (
            <div
              key={index}
              className="sample"
              style={{height: Math.floor(sample * 100) + '%'}}
            />))
        }
        </div>
        <div className="control-panel">
          <Slider
            label="Threshold"
            min={THRESHOLD_MIN}
            max={THRESHOLD_MAX}
            step=".01"
            value={threshold}
            onChange={value => this.setThreshold(value)}
            backgroundWidth={amplitude}
            backgroundColor={'green'}
          />
          <Slider
            label="Delay"
            min={DEBOUNCE_MIN}
            max={DEBOUNCE_MAX}
            step="100"
            value={debounce}
            onChange={value => this.setDebounce(value)}
            backgroundWidth={Math.min(debounce, new Date() - lastThresholdTime)}
            backgroundColor={'skyblue'}
          />
          <Slider
            label="Volume"
            min={VOLUME_MIN}
            max={VOLUME_MAX}
            step=".1"
            value={volume}
            onChange={value => this.setVolume(value)}
            backgroundWidth={amplitude * volume}
            backgroundColor={'green'}
          />
        </div>
      </div>
    );
  }
}

export default App;
