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

  /**
   * @param {Song} song
   * @param {number} time - 再生を開始する時点
   * @param {number} rate - 再生速度
   * @returns {Promise}
   */
  play (song, time, rate) {
    return new Promise((resolve, reject) => {
      if (this.sourcePath === song.path) {
        this.playBuffer(this.buffer, time, rate);
        return resolve();
      }

      let file;
      try {
        file = fs.readFileSync(song.path);
      }
      catch (e) {
        reject(e);
      }

      let abuf;
      try {
        abuf = toArrayBuffer(file);
      }
      catch (e) {
        reject(e);
      }

      this.ctx.decodeAudioData(abuf, (buf) => {
        this.buffer = buf;
        this.sourcePath = song.path;
        song.duration = buf.length / buf.sampleRate;
        this.playBuffer(this.buffer, time, rate);
        resolve();
      });
    });
  }

  /**
   * 新しいBufferSourceNodeを作成してthis.sourceに格納する
   * @param {Buffer} buffer - 音声データ
   * @param {number} at     - 再生を開始する時点
   * @param {number} rate   - 再生速度
   */
  playBuffer (buffer, at, rate) {
    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.playbackRate.value = rate;
    this.source.connect(this.gainNode);
    this.source.start(0, at);
    this.source.onended = this.callbackOnEnded;
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
