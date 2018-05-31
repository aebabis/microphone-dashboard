import React, { Component } from 'react';
import './History.css';

import SoundService from '../SoundService';

export default class History extends Component {
  render() {
    const {
      onSelect,
    } = this.props;

    const clips = SoundService.getClips();

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
