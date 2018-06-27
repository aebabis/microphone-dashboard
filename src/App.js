import React, { Component } from 'react';

import SoundService from './SoundService';

import Graph from './Graph/Graph';
import History from './History/History';
import PinnedClips from './PinnedClips/PinnedClips';
import Recorder from './Recorder/Recorder';
import Slider from './Slider/Slider';

const THRESHOLD_MIN = 0.01;
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
      isDarkTheme: localStorage.isDarkTheme === 'true',
      isRecording: localStorage.isRecording !== 'false',
      amplitude: 0,
      debounce: loadNumber('debounce', 500),
      lastThresholdTime: 0,
      samples: [],
      lowerThreshold: loadNumber('lowerThreshold', 0.05),
      upperThreshold: loadNumber('upperThreshold', 0.15),
      volume: loadNumber('volume', 1),
    };
  }

  onClipRecorded({
    clip,
    startTime,
    duration,
    samples,
  }) {
    const { volume } = this.state;
    SoundService.saveClip(clip, startTime, duration, samples);
    SoundService.playSound(clip, volume);
  }

  setDebounce(debounce) {
    localStorage.debounce = debounce;
    this.setState(state => ({
      ...state,
      debounce,
    }));
  }

  setLowerThreshold(lowerThreshold) {
    localStorage.lowerThreshold = lowerThreshold;
    this.setState(state => ({
      ...state,
      lowerThreshold,
    }));
  }

  setUpperThreshold(upperThreshold) {
    localStorage.upperThreshold = upperThreshold;
    this.setState(state => ({
      ...state,
      upperThreshold,
    }));
  }

  setVolume(volume) {
    localStorage.volume = volume;
    this.setState(state => ({
      ...state,
      volume,
    }));
  }

  toggleDarkTheme() {
    const isDarkTheme = !this.state.isDarkTheme;
    localStorage.isDarkTheme = isDarkTheme;
    this.setState(state => ({
      ...state,
      isDarkTheme,
    }));
  }

  toggleRecording() {
    const isRecording = !this.state.isRecording;
    localStorage.isRecording = isRecording;
    this.setState(state => ({
      ...state,
      isRecording,
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
      isDarkTheme,
      isRecording,
      amplitude,
      debounce,
      lastThresholdTime,
      samples,
      lowerThreshold,
      upperThreshold,
      volume,
    } = this.state;
    return (
      <div className="App" data-is-dark={isDarkTheme}>
        <Recorder
          enabled={isRecording}
          debounce={debounce}
          lowerThreshold={lowerThreshold}
          upperThreshold={upperThreshold}
          onSampleRecorded={sample => this.handleSample(sample)}
          onClipRecorded={clipData => this.onClipRecorded(clipData)}
        />
        <div className="soundboard">
          <div className="left">
            <History />
          </div>
          <div className="middle">
            <div className="top-bar">
              <button
                className="theme"
                onClick={() => this.toggleDarkTheme()}
              >
                &#9728;
              </button>
            </div>
            <div className="graphs">
              <Graph
                values={samples}
                maxSize={SAMPLE_BUFFER_LENGTH}
              />
            </div>
            <div className="control-panel">
              <Slider
                label="Lower Threshold"
                min={THRESHOLD_MIN}
                max={THRESHOLD_MAX}
                step=".01"
                value={lowerThreshold}
                onChange={value => this.setLowerThreshold(value)}
                backgroundWidth={amplitude}
                backgroundColor="green"
              />
              <Slider
                label="Upper Threshold"
                min={THRESHOLD_MIN}
                max={THRESHOLD_MAX}
                step=".01"
                value={upperThreshold}
                onChange={value => this.setUpperThreshold(value)}
                backgroundWidth={amplitude}
                backgroundColor="green"
              />
              <div className="pause" data-is-recording={isRecording}>
                <button
                  onClick={() => this.toggleRecording()}
                  title={isRecording ? 'Pause' : 'Resume'}
                />
              </div>
              <Slider
                label="Delay"
                min={DEBOUNCE_MIN}
                max={DEBOUNCE_MAX}
                step="100"
                value={debounce}
                onChange={value => this.setDebounce(value)}
                backgroundWidth={Math.min(debounce, new Date() - lastThresholdTime)}
                backgroundColor="skyblue"
              />
              <Slider
                label="Volume"
                min={VOLUME_MIN}
                max={VOLUME_MAX}
                step=".1"
                value={volume}
                onChange={value => this.setVolume(value)}
                backgroundWidth={amplitude * volume}
                backgroundColor="green"
              />
            </div>
          </div>
          <div className="right">
            <PinnedClips />
            <div className="attribution">Icon made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC 3.0 BY</a></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
