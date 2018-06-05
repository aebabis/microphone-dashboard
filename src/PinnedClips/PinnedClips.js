import React from 'react';

import './PinnedClips.css';

import SoundService from '../SoundService';
import ClipListItem from '../ClipListItem/ClipListItem';

export default () => (
  <ul className="history">{
    SoundService.getPinnedClips().map(clip => (
      <ClipListItem
        key={clip.timestamp}
        clip={clip}
        onDelete={id => SoundService.deletePinnedClip(id)}
      />))
  }
  </ul>
);
