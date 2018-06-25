/* eslint-disable max-len */
/* eslint-disable jsx-a11y/href-no-hash */
import React from 'react';

import './History.css';

import SoundService from '../SoundService';
import ClipListItem from '../ClipListItem/ClipListItem';

export default () => {
  const clips = SoundService.getHistoryClips();

  return (
    <ul className="history">{
      clips.map(clip => (
        <ClipListItem
          key={clip.timestamp}
          clip={clip}
          onDelete={id => SoundService.deleteHistoryClip(id)}
        >
          <button
            className="pin"
            title="Pin"
            onClick={() => SoundService.pinClip(clip.id)}
          >
            <svg
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 193.826 193.826"
              style={{ 'enable-background': 'new 0 0 193.826 193.826;' }}
            >
              <path d="M191.495,55.511L137.449,1.465c-1.951-1.953-5.119-1.953-7.07,0l-0.229,0.229c-3.314,3.313-5.14,7.72-5.14,12.406
                c0,3.019,0.767,5.916,2.192,8.485l-56.55,48.533c-4.328-3.868-9.852-5.985-15.703-5.985c-6.305,0-12.232,2.455-16.689,6.913
                l-0.339,0.339c-1.953,1.952-1.953,5.118,0,7.07l32.378,32.378l-31.534,31.533c-0.631,0.649-15.557,16.03-25.37,28.27
                c-9.345,11.653-11.193,13.788-11.289,13.898c-1.735,1.976-1.639,4.956,0.218,6.822c0.973,0.977,2.256,1.471,3.543,1.471
                c1.173,0,2.349-0.41,3.295-1.237c0.083-0.072,2.169-1.885,13.898-11.289c12.238-9.813,27.619-24.74,28.318-25.421l31.483-31.483
                l30.644,30.644c0.976,0.977,2.256,1.465,3.535,1.465s2.56-0.488,3.535-1.465l0.339-0.339c4.458-4.457,6.913-10.385,6.913-16.689
                c0-5.851-2.118-11.375-5.985-15.703l48.533-56.55c2.569,1.425,5.466,2.192,8.485,2.192c4.687,0,9.093-1.825,12.406-5.14l0.229-0.229
                C193.448,60.629,193.448,57.463,191.495,55.511z"
              />
            </svg>
          </button>
        </ClipListItem>))
    }
    </ul>
  );
};
