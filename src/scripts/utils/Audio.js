import fs from 'fs';

const toArrayBuffer = (buffer) => {
  const ab   = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);

  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }

  return ab;
};

class Audio {
  constructor () {
    this.ctx = new AudioContext();

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 1.0;
    this.gainNode.connect(this.ctx.destination);

    this.source     = null;
    this.sourcePath = null;
  }

  setGain (val) {
    this.gainNode.gain.value = val;
  }

  setRate (val) {
    if (this.source) {
      this.source.playbackRate.value = val;
    }
  }

  play (song, time, rate, callback) {
    if (this.sourcePath === song.path) {
      this.playBuffer(this.buffer, time, rate, callback);
      return;
    }

    const abuf = toArrayBuffer(fs.readFileSync(song.path));

    this.ctx.decodeAudioData(abuf, (buf) => {
      this.buffer = buf;
      this.sourcePath = song.path;
      song.duration = buf.length / buf.sampleRate;
      this.playBuffer(this.buffer, time, rate, callback);
    });
  }


  playBuffer (buffer, at, rate, callback) {
    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.playbackRate.value = rate;
    this.source.connect(this.gainNode);
    this.source.start(0, at);
    this.source.onended = this.callbackOnEnded;
    callback();
  }

  pause () {
    if (this.source) {
      this.source.onended = null;
      this.source.stop(0);
      this.source = null;
    }
  }

  onEnded (fn) {
    this.callbackOnEnded = fn;
  }
}

export default new Audio();
