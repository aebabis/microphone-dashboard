import React, { Component } from 'react';

import SoundService from './SoundService';

import Graph from './Graph/Graph';
import History from './History/History';
import Slider from './Slider/Slider';

const THRESHOLD_MIN = 0.1;
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
    };

    this.state = {
      amplitude: 0,
      clips: [],
      debounce: loadNumber('debounce', 500),
      lastThresholdTime: 0,
      samples: [],
      threshold: loadNumber('threshold', 0.5),
      volume: loadNumber('volume', 1),
    }
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(SoundService.BUFFER_LENGTH, 1, 1);

      source.connect(processor);
      processor.connect(context.destination);

      let queue = [];
      let thresholdStartTime = 0;
      let lastThresholdTime = 0;
      processor.onaudioprocess = ({ inputBuffer }) => {
        const data = inputBuffer.getChannelData(0);
        const now = +new Date();
        const amplitude = Math.max(...data);

        this.handleSample(amplitude);

        if (amplitude > this.state.threshold) {
          lastThresholdTime = now;
          if (queue.length === 0) {
            thresholdStartTime = now;
          }
          this.setState(state => ({
            ...state,
            lastThresholdTime,
          }));
        }
        if (now - lastThresholdTime < this.state.debounce) {
          queue.push(data.slice());
        } else if (queue.length > 0) {
          SoundService.saveClip(queue, thresholdStartTime, now - thresholdStartTime);
          SoundService.playSound(queue, this.state.volume);
          queue = [];
        }
      };
    });
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

  render() {
    const {
      amplitude,
      clips,
      debounce,
      lastThresholdTime,
      samples,
      threshold,
      volume,
    } = this.state;
    return (
      <div className="App">
        <div className="soundboard">
          <div className="left">
            <History
              clips={clips}
              onSelect={data => SoundService.playSound(data, volume)}
            />
          </div>
          <div className="middle">
            <div className="graphs">
              <Graph
                values={samples}
                maxSize={SAMPLE_BUFFER_LENGTH}
              />
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
          <div className="right">
          </div>
        </div>
      </div>
    );
  }
}

export default App;
