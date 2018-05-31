import React from 'react';
import './Graph.css';

export default (props) => {
  const {
    values,
    minValue = 0,
    maxValue = 1,
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
      valuesList.map(sample => (
        <div
          className="sample"
          style={{ height: `${(Math.floor((sample - minValue) * 100) / maxValue)}%` }}
        />))
    }
    </div>
  );
};
