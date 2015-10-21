const playlistDB = PouchDB('playlist');
import Song from './Song';

class Playlist {

  constructor (_opts) {
    const opts = _opts || {};
    const now  = new Date().getTime().toString();

    this._id        = opts._id || now;
    this.name       = opts.name || now;
    this.tracks     = opts.tracks || [];
    this.created_at = opts.created_at || now;
    this.updated_at = opts.updated_at || now;
    this._rev       = opts._rev || null;
  }

  saveIfChanged () {
    if (this.changed) {
      this.changed = false;
      return this.save();
    }
    return Promise.resolve(this);
  }

  save () {
    const tracks = this.tracks.map((track) => ({
      songID : track.song._id,
      rate   : track.rate,
    }));

    const opts = {
      _id        : this._id,
      name       : this.name,
      tracks     : tracks,
      created_at : this.created_at,
      updated_at : this.updated_at,
    };
    if (this._rev != null)  {
      opts._rev = this._rev;
    }

    return playlistDB
      .put(opts)
      .then((doc) => {
        this._rev = doc.rev;
      })
      .catch((err) => {
        console.error('playlist save error');
        console.error(err);
      })
      .then(() => this);
  }

  saveAll () {
    return Promise
      .all(this.tracks.map((track) => {
        track.song.save();
      }))
      .then(() => {
        this.save();
      });
  }

  at (i) {
    return this.tracks[i];
  }

  remove (i) {
    this.tracks = this.tracks.splice(i, 1);
  }

  push (track) {
    this.tracks.push(track);
  }

  size () {
    return this.tracks.length;
  }

  removeAll (_indexes) {
    const indexes = _indexes.map((s) => +s);
    this.tracks = this.tracks.filter((x, i) => {
      return indexes.indexOf(+i) === -1;
    });
  }

  moveTracks (operands, pos) {
    var tmp = [];

    operands.forEach((i) => {
      tmp.push(this.tracks[i]);
    });

    this.removeAll(operands);
    const head = this.tracks.slice(0, pos);
    const tail = this.tracks.slice(pos);
    this.tracks = head.concat(tmp, tail);
  }

}

// factory
Playlist.load = (id) => {
  return playlistDB
    .get(id)
    .catch((err) => {
      if (err.status !== 404) { throw err; }
      return new Playlist();
    })
    .then((doc) => {
      // Load all tracks
      return Promise
        .all(doc.tracks.map((track) => {
          return Song.load(track.songID)
            .then((song) => ({
              song,
              rate : track.rate,
            }));
        }))
        .then((tracks) => {
          doc.tracks = (tracks.length > 0) ? tracks : [];
          return new Playlist(doc);
        });
    });
};

Playlist.getRecent = () => {
  return playlistDB.allDocs()
    .then((docs) =>
      Promise.all(docs.rows.map((row) => Playlist.load(row.id)))
    )
    .catch((err) => {
      console.error('playlists load error');
      console.error(err);
      return [new Playlist()];
    });
};

export default Playlist;
