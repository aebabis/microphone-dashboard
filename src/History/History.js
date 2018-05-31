import React from 'react';
import './History.css';

import SoundService from '../SoundService';

export default ({ onSelect }) => {
  const clips = SoundService.getClips();

  return (
    <ul className="history">{
      clips.map(({
        id,
        data,
        timestamp,
        duration,
      }) => (
        <li
          key={timestamp}
        >
          {timestamp} - {duration}
          <button onClick={() => SoundService.deleteClip(id)}>X</button>
          <button onClick={() => onSelect(data)}>Play</button>
        </li>))
    }
    </ul>
  );
};
