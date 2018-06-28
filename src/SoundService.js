import moment from 'moment';

import RecorderWorker from './RecorderWorker';

let listeners = [];
let historyClips = [];
let pinnedClips = [];

const notifyObservers = () => listeners.forEach(listener => listener());

const SoundService = {
  BUFFER_LENGTH: 1024,

  getHistoryClips() {
    return historyClips.slice();
  },

  getPinnedClips() {
    return pinnedClips.slice();
  },

  getClip(id) {
    return historyClips.find(clip => clip.id === id) ||
      pinnedClips.find(clip => clip.id === id);
  },

  saveClip(data, timestamp, duration, samples) {
    const id = Math.floor(Math.random() * 1000000);
    historyClips.push({
      id,
      data,
      timestamp,
      duration,
      samples,
    });
    if (historyClips.length > 10) {
      historyClips.shift();
    }
    notifyObservers();
    return id;
  },

  pinClip(id) {
    const index = historyClips.findIndex(clip => clip.id === id);
    const clip = historyClips.splice(index, 1)[0];
    pinnedClips.push(clip);
    notifyObservers();
  },

  deleteHistoryClip(id) {
    historyClips = historyClips.filter(clip => clip.id !== id);
    notifyObservers();
  },

  deletePinnedClip(id) {
    pinnedClips = pinnedClips.filter(clip => clip.id !== id);
    notifyObservers();
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

  playSound(id, volume = 1) {
    const { data } = SoundService.getClip(id);
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
          context.close();
        }
      };

      sound.loop = false;
      sound.connect(context.destination);
    });
  },

  addChangeListener(listener) {
    listeners.push(listener);
  },

  removeChangeListener(listener) {
    listeners = listeners.filter(other => other !== listener);
  },
};

export default SoundService;
