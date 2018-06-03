import React from 'react';

import './History.css';

import SoundService from '../SoundService';
import ClipListItem from '../ClipListItem/ClipListItem';

export default () => {
  const clips = SoundService.getClips();

  return (
    <ul className="history">{
      clips.map(clip => (
        <ClipListItem clip={clip}>
          <button
            className="download"
            title="Download"
            onClick={() => SoundService.downloadClip(clip.id)}
          >
            Download
          </button>
        </ClipListItem>))
    }
    </ul>
  );
};
