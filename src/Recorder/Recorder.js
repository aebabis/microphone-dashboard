import { Component } from 'react';
import PropTypes from 'prop-types';

import SoundService from '../SoundService';

const ONSET_BUFFER_COUNT = 3;
const BUFFER_SIZE_THRESHOLD = 3;

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.reset();
  }

  componentDidMount() {
    if (this.props.enabled) {
      this.start();
    }
  }

  componentDidUpdate({ enabled: wasEnabled }) {
    const { enabled } = this.props;
    if (wasEnabled !== enabled) {
      if (enabled) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  start() {
    this.setState(state => ({
      ...state,
      context: navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(SoundService.BUFFER_LENGTH, 1, 1);

        source.connect(processor);
        processor.connect(context.destination);

        processor.onaudioprocess = ({ inputBuffer }) => {
          if (!this.props.enabled) {
            if (this.queue.length > 0) {
              this.reset();
            }
          } else {
            this.handleBuffer(inputBuffer);
          }
        };
        return context;
      }),
    }));
  }

  stop() {
    const { context } = this.state;
    if (context) {
      context.then(c => c.close());
      this.reset();
    }
  }

  handleBuffer(inputBuffer) {
    const { queue, thresholdStartTime, lastThresholdTime } = this;
    const data = inputBuffer.getChannelData(0);
    const now = +new Date();
    const amplitude = Math.max(...data);
    const {
      debounce,
      lowerThreshold,
      upperThreshold,
      onSampleRecorded,
      onClipRecorded,
    } = this.props;

    onSampleRecorded(amplitude);

    const isWindowOpen = now - lastThresholdTime < debounce;

    // Keep a leading buffer to prevent onset artifacts
    queue.push(data.slice());
    if (!isWindowOpen && queue.length > ONSET_BUFFER_COUNT) {
      queue.shift();
    }

    const isRecording = queue.length > ONSET_BUFFER_COUNT;

    // Start recording if lower threshold is cleared
    if (!isRecording && amplitude > upperThreshold) {
      this.thresholdStartTime = now;
    }

    if (amplitude > lowerThreshold) {
      if (isRecording || amplitude > upperThreshold) {
        this.lastThresholdTime = now;
        this.setState(state => ({
          ...state,
          lastThresholdTime,
        }));
      }
    }

    if (!isWindowOpen && isRecording) {
      const samples = queue.map(arr => Math.max(...arr));
      // Remove trailing silence
      while (samples[samples.length - 1] < lowerThreshold) {
        samples.pop();
      }
      if (samples.length > ONSET_BUFFER_COUNT + BUFFER_SIZE_THRESHOLD) { // Ignore blips
        onClipRecorded({
          clip: queue,
          startTime: thresholdStartTime,
          duration: now - thresholdStartTime,
          samples,
        });
      }
      this.queue = [];
    }
  }

  reset() {
    this.queue = [];
    this.thresholdStartTime = 0;
    this.lastThresholdTime = 0;
  }

  render() {
    return null;
  }
}

Recorder.defaultProps = {
  enabled: true,
};

Recorder.propTypes = {
  enabled: PropTypes.bool,
  debounce: PropTypes.number.isRequired,
  lowerThreshold: PropTypes.number.isRequired,
  upperThreshold: PropTypes.number.isRequired,
  onSampleRecorded: PropTypes.func.isRequired,
  onClipRecorded: PropTypes.func.isRequired,
};

export default Recorder;
