import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import './ClipListItem.css';

import SoundService from '../SoundService';
import Graph from '../Graph/Graph';

const ClipListItem = ({
  clip,
  onDelete,
  children,
}) => (
  <li
    className="clip-list-item"
  >
    <Graph values={clip.samples} />
    <div className="time">
      <div className="timestamp">{moment(clip.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
      <div className="duration">{clip.duration}ms</div>
    </div>
    <div className="buttons">
      <button className="play" title="Play" onClick={() => SoundService.playSound(clip.data)} />
    </div>
    <button
      className="download"
      title="Download"
      onClick={() => SoundService.downloadClip(clip.id)}
    >
      Download
    </button>
    <button className="delete" title="Delete" onClick={() => onDelete(clip.id)}>
      <div className="top" />
      <div className="right" />
      <div className="bottom" />
      <div className="left" />
    </button>
    {children}
  </li>);

ClipListItem.propTypes = {
  clip: PropTypes.shape({
    id: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    timestamp: PropTypes.number,
    duration: PropTypes.number,
    samples: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  children: PropTypes.node,
};

ClipListItem.defaultProps = {
  children: undefined,
};

export default ClipListItem;
