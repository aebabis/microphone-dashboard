import React from 'react';
import './Graph.css';

export default (props) => {
  const {
    values,
    minValue = 0,
    maxValue = 1,
    maxSize,
  } = props;

  const zeroes = new Array(maxSize - values.length).fill(0);
  const valuesList = [...zeroes, ...values];

  return (
    <div className="graph">{
      valuesList.map(sample => (
        <div
          key={sample}
          className="sample"
          style={{ height: `${(Math.floor((sample - minValue) * 100) / maxValue)}%` }}
        />))
    }
    </div>
  );
};
