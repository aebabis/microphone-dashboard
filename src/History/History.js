import React from 'react';
import moment from 'moment';

import './History.css';

import SoundService from '../SoundService';
import Graph from '../Graph/Graph';

export default () => {
  const clips = SoundService.getClips();

  return (
    <ul className="history">{
      clips.map(({
        id,
        data,
        timestamp,
        duration,
        samples,
      }) => (
        <li
          key={timestamp}
        >
          <Graph values={samples} />
          <div className="time">
            <div className="timestamp">{moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div className="duration">{duration}ms</div>
          </div>
          <div className="buttons">
            <button className="play" title="Play" onClick={() => SoundService.playSound(data)} />
          </div>
          <button
            className="download"
            title="Download"
            onClick={() => SoundService.downloadClip(data)}
          >
            Download
          </button>
          <button className="delete" title="Delete" onClick={() => SoundService.deleteClip(id)}>
            <div className="top" />
            <div className="right" />
            <div className="bottom" />
            <div className="left" />
          </button>
        </li>))
    }
    </ul>
  );
};
