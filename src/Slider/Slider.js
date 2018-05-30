import React, { Component } from 'react';
import './Slider.css';

export default class Slider extends Component {
  render() {
    const {
      label,
      min,
      max,
      step,
      value,
      onChange,
      backgroundWidth,
      backgroundColor,
    } = this.props;

    const width = Math.min(100, Math.max(0, backgroundWidth - min) * 100 / (max - min));
    const decimal = step.split('.')[1];
    const decimalPlaces = decimal ? decimal.length : 0;

    return (
      <div className="slider">
        <label>
          <span>{label}</span>
          <div className="control">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={({ target }) => onChange(+target.value)}
            />
            <div className="bar" style={{width: width.toFixed() + '%', backgroundColor: backgroundColor}} />
          </div>
        </label>
        <div className="value">
          {value.toFixed(decimalPlaces)}
        </div>
      </div>
    );
  }
}
