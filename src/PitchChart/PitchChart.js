import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { parse } from 'note-parser';

import './PitchChart.css';
import './PitchChart.dark.css';

const C_0_FREQ = 16.351;
const OCTAVE_OFFSET = Math.log2(C_0_FREQ);
const BAR_RES = 10;
const HEIGHT = 500;

const NOTES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b', 'b#'];
const MAX_OCTAVE = 6;
const OCTAVES = new Array(MAX_OCTAVE + 1).fill(null).map((_, i) => i);
const ALL_NOTES = [].concat(...OCTAVES
  .map(octave => NOTES.map(note => parse(`${note}${octave}`))));

const getOctave = freq => Math.log2(freq) - OCTAVE_OFFSET;

class PitchChart extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidMount() {
    const handle = () => {
      requestAnimationFrame(handle);
      this.redraw();
    };
    handle();
  }

  redraw() {
    const canvas = this.canvas.current;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    const { values, maxSize } = this.props;
    const width = (maxSize + 1) * BAR_RES;
    canvas.width = width;
    canvas.height = HEIGHT;

    ALL_NOTES.forEach(({
      pc,
      oct,
      acc,
      freq,
    }) => {
      const octave = Math.log2(freq) - OCTAVE_OFFSET;
      const offset = HEIGHT - ((octave * HEIGHT) / 6);
      context.beginPath();
      context.moveTo(20, offset);
      context.lineTo(width, offset);
      context.strokeStyle = pc === 'C' ? 'rgb(70, 70, 70)' : 'rgb(20, 20, 20)';
      context.stroke();

      if (acc === '') {
        context.fillStyle = 'rgb(50, 50, 50)';
        context.fillText(`${pc}${oct}`, 2, offset + 3);
      }
    });

    values.slice().reverse().forEach((value, index) => {
      const octave = getOctave(value);
      const offset = HEIGHT - ((octave * HEIGHT) / 6);
      context.beginPath();
      context.moveTo((maxSize - index) * BAR_RES, offset);
      context.lineTo(((maxSize - index) + 1) * BAR_RES, offset);
      context.strokeStyle = 'rgb(100, 50, 0)';
      context.stroke();
    });
  }

  render() {
    return (
      <div className="pitch-chart">
        <canvas ref={this.canvas} />
      </div>
    );
  }
}

PitchChart.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  maxSize: PropTypes.number.isRequired,
};

export default PitchChart;
