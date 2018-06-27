import React from 'react';
import PropTypes from 'prop-types';

import './Slider.css';
import './Slider.dark.css';

const Slider = (props) => {
  const {
    label,
    min,
    max,
    step,
    value,
    onChange,
    backgroundWidth,
    backgroundColor,
  } = props;

  const width = (Math.min(100, Math.max(0, backgroundWidth - min) * 100) / (max - min));
  const decimal = step.split('.')[1];
  const decimalPlaces = decimal ? decimal.length : 0;

  const id = Object.values(props).join('-');

  return (
    <div className="slider dashboard-box">
      <label htmlFor={id}>
        <span>{label}</span>
        <div className="control">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={({ target }) => onChange(+target.value)}
          />
          <div
            className="bar"
            style={{
            width: `${width.toFixed()}%`,
            backgroundColor: backgroundColor, // eslint-disable-line object-shorthand
            }}
          />
        </div>
      </label>
      <div className="value">
        {value.toFixed(decimalPlaces)}
      </div>
    </div>
  );
};

Slider.propTypes = {
  label: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  backgroundWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backgroundColor: PropTypes.string,
};

Slider.defaultProps = {
  label: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  value: undefined,
  onChange: undefined,
  backgroundWidth: undefined,
  backgroundColor: undefined,
};

export default Slider;
