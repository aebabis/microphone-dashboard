import React, { Component } from 'react';
import './Slider.css';

export default class Slider extends Component {
  render() {
    const {
      min,
      max,
      step,
      value,
      onChange,
      backgroundWidth,
      backgroundColor,
    } = this.props;
    const width = Math.max(0, backgroundWidth - min) * 100 / (max - min);
    return (
      <div className="slider">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={({ target }) => onChange(target.value)}
        />
        <div className="bar" style={{width: width.toFixed() + '%', backgroundColor: backgroundColor}} />
      </div>
    );
  }
}
