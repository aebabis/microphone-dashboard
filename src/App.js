import React, { Component } from 'react';

import Slider from './Slider';

const THRESHOLD_MIN = .1;
const THRESHOLD_MAX = 1;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amplitude: 0,
      threshold: .5,
    }
  }

  setThreshold(threshold) {
    this.setState(state => ({
      ...state,
      threshold,
    }));
  }

  componentDidMount() {
    const DEBOUNCE = 1000; // ms
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
        }
        if (now - lastThresholdTime < DEBOUNCE) {
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
      threshold,
    } = this.state;
    return (
      <div className="App">
        <Slider
          min={THRESHOLD_MIN}
          max={THRESHOLD_MAX}
          step=".01"
          value={threshold}
          onChange={value => this.setThreshold(value)}
          backgroundWidth={amplitude}
          backgroundColor={'green'}
        />
      </div>
    );
  }
}

export default App;
