import { Component } from 'react';
import PropTypes from 'prop-types';

import SoundService from '../SoundService';

class Recorder extends Component {
  constructor(props) {
    super(props);
    this.queue = [];
    this.thresholdStartTime = 0;
    this.lastThresholdTime = 0;
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(SoundService.BUFFER_LENGTH, 1, 1);

      source.connect(processor);
      processor.connect(context.destination);

      processor.onaudioprocess = ({ inputBuffer }) => {
        this.handleBuffer(inputBuffer);
      };
    });
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

    if (amplitude > lowerThreshold) {
      if (queue.length > 0 || amplitude > upperThreshold) {
        this.lastThresholdTime = now;
        this.setState(state => ({
          ...state,
          lastThresholdTime,
        }));
      }
      if (queue.length === 0 && amplitude > upperThreshold) {
        this.thresholdStartTime = now;
      }
    }
    if (now - lastThresholdTime < debounce) {
      queue.push(data.slice());
    } else if (queue.length > 0) {
      const samples = queue.map(arr => Math.max(...arr));
      // Remove trailing silence
      while (samples[samples.length - 1] < lowerThreshold) {
        samples.pop();
      }
      onClipRecorded({
        clip: queue,
        startTime: thresholdStartTime,
        duration: now - thresholdStartTime,
        samples,
      });
      this.queue = [];
    }
  }

  render() {
    return null;
  }
}

Recorder.propTypes = {
  debounce: PropTypes.number.isRequired,
  lowerThreshold: PropTypes.number.isRequired,
  upperThreshold: PropTypes.number.isRequired,
  onSampleRecorded: PropTypes.func.isRequired,
  onClipRecorded: PropTypes.func.isRequired,
};

export default Recorder;
