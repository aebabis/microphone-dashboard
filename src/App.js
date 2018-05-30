import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxValue: 0,
    }
  }

  componentDidMount() {
    const DEBOUNCE = 1000; // ms
    const THRESHOLD = .5;
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
        const maxValue = Math.max(...data);
        if (maxValue > THRESHOLD) {
          lastThresholdTime = now;
        }
        if (now - lastThresholdTime < DEBOUNCE) {
          queue.push(data.slice());
        } else if (queue.length > 0) {
          playSoundQueue(queue);
          queue = [];
        }
        if (this.state.maxValue < maxValue) {
          this.setState(state => ({
            ...state,
            maxValue,
          }));
        }
      };
    });
  }

  render() {
    const { maxValue } = this.state;
    return (
      <div className="App">
        {maxValue}
      </div>
    );
  }
}

export default App;
