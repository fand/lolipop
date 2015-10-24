/* global PouchDB */

import mime from 'mime';
const songDB = PouchDB('song');

const checker = document.createElement('audio');
const isLoadable = (path) => {
  try {
    var type = mime.lookup(path);
    return !!(checker.canPlayType(type).replace('no', ''));
  }
  catch (e) {
    throw e;
  }
  return false;
};

class Song {

  constructor (opts) {
    this.name     = opts.name;
    this.path     = opts.path;
    this.rate     = opts.rate;
    this.duration = opts.duration;
    this._id      = this.path;

    if (opts._rev) {
      this._rev = opts._rev;
    }
  }

  save () {
    var opts = {
      _id      : this._id,
      name     : this.name,
      path     : this.path,
      rate     : this.rate,
      duration : this.duration,
    };

    return songDB.get(opts._id)
      .then((doc) => {
        opts._rev = doc._rev;
      })
      .catch((err) => {
        if (err.status !== 404) { throw err; }
        opts._rev = self._rev;
      })
      .then(() => songDB.put(opts))
      .catch((err) => {
        if (err.status !== 404) {
          console.error('song save error');
          console.error(err);
        }
      })
      .then(() => this);
  }

}

// Factory
Song.create = function (file) {
  if (!isLoadable(file.path)) { return; }
  return new Song({
    name     : file.name,
    path     : file.path,
    rate     : 1.0,
    duration : null,
  });
};

Song.load = (id) => {
  return songDB.get(id)
    .then((opts) => new Song(opts));
};

export default Song;
