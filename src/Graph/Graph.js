/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import './Graph.css';
import './Graph.dark.css';

const Graph = (props) => {
  const {
    values,
    minValue,
    maxValue,
    maxSize,
  } = props;

  let valuesList;
  if (typeof maxSize === 'number') {
    const zeroes = new Array(maxSize - values.length).fill(0);
    valuesList = [...zeroes, ...values];
  } else {
    valuesList = values;
  }

  return (
    <div className="graph">{
      valuesList.map((sample, index) => (
        <div
          key={index}
          className="sample"
          style={{ height: `${(Math.floor((sample - minValue) * 100) / maxValue)}%` }}
        />))
    }
    </div>
  );
};

Graph.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  maxSize: PropTypes.number,
};

Graph.defaultProps = {
  values: undefined,
  minValue: 0,
  maxValue: 1,
  maxSize: undefined,
};

export default Graph;
