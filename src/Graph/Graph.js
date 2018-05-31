import React, { Component } from 'react';
import './Graph.css';

export default class Graph extends Component {
  render() {
    const {
      values,
      minValue = 0,
      maxValue = 1,
      maxSize,
    } = this.props;

    const zeroes = new Array(maxSize - values.length).fill(0);
    const valuesList = [...zeroes, ...values];

    return (
      <div className="graph">{
        valuesList.map((sample, index) => (
          <div
            key={index}
            className="sample"
            style={{height: Math.floor((sample - minValue) * 100 / maxValue) + '%'}}
          />))
      }
      </div>
    );
  }
}
