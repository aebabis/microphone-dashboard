import React, { Component } from 'react';

import Slider from './Slider';

const THRESHOLD_MIN = .1;
const THRESHOLD_MAX = 1;

const DEBOUNCE_MIN = 100;
const DEBOUNCE_MAX = 3000;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amplitude: 0,
      debounce: 500,
      lastThresholdTime: 0,
      threshold: .5,
    }
  }

  setThreshold(threshold) {
    this.setState(state => ({
      ...state,
      threshold,
    }));
  }

  setDebounce(debounce) {
    this.setState(state => ({
      ...state,
      debounce,
    }));
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
            if (queue.length > 0) {
              const output = outputBuffer.getChannelData(0);
              const data = queue.shift();
              for (let i = 0; i < BUFFER_LENGTH; i++) {
                output[i] = data[i];
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

        this.setState(state => ({
          ...state,
          amplitude,
        }));

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
    } = this.state;
    return (
      <div className="App">
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
        </div>
      </div>
    );
  }
}

export default App;
