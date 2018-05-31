import React, { Component } from 'react';
import './History.css';

export default class History extends Component {
  render() {
    const {
      clips,
      onSelect,
    } = this.props;

    return (
      <ul className="history">{
        clips.map(({data, timestamp, duration}) => (
          <li
            key={timestamp}
          >
            <button onClick={() => onSelect(data)}>
              {timestamp}
            </button>
          </li>))
      }
      </ul>
    );
  }
}
