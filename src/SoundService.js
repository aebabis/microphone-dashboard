import moment from 'moment';

import RecorderWorker from './RecorderWorker';

let clips = [];

const SoundService = {
  BUFFER_LENGTH: 1024,

  getClips() {
    return clips.slice();
  },

  getClip(id) {
    return clips.find(clip => clip.id === id);
  },

  saveClip(data, timestamp, duration, samples) {
    clips.push({
      id: Math.floor(Math.random() * 1000000),
      data,
      timestamp,
      duration,
      samples,
    });
    if (clips.length > 10) {
      clips.shift();
    }
  },

  deleteClip(id) {
    clips = clips.filter(clip => clip.id !== id);
  },

  downloadClip(id) {
    const clip = SoundService.getClip(id);
    const worker = RecorderWorker();
    worker.addEventListener('message', ({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = `voice-clip ${moment(clip.timestamp).format('YYYY-MM-DD HH:mm:ss')}.wav`;
      a.click();
      window.URL.revokeObjectURL(url);
    });

    worker.postMessage({ command: 'init', config: { sampleRate: new AudioContext().sampleRate } });
    clip.data.forEach((buffer) => {
      worker.postMessage({ command: 'record', buffer: [buffer, buffer] });
    });
    worker.postMessage({ command: 'exportWAV', type: 'audio/wav' });
  },

  playSound(data, volume = 1) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(SoundService.BUFFER_LENGTH, 1, 1);

      source.connect(processor);
      processor.connect(context.destination);

      const queue = data.slice();
      const sound = context.createScriptProcessor(SoundService.BUFFER_LENGTH, 1, 1);
      sound.onaudioprocess = ({ outputBuffer }) => {
        if (queue.length > 0) {
          const output = outputBuffer.getChannelData(0);
          const buffer = queue.shift();
          for (let i = 0; i < SoundService.BUFFER_LENGTH; i += 1) {
            output[i] = buffer[i] * volume;
          }
        } else {
          sound.disconnect();
        }
      };

      sound.loop = false;
      sound.connect(context.destination);
    });
  },
};

export default SoundService;
