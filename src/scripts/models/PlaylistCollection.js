const playlistDB           = PouchDB('playlist');
const PlaylistCollectionDB = PouchDB('playlistCollection');
import Playlist from './Playlist';

class PlaylistCollection {

  constructor (_opts) {
    const opts = _opts || {};
    const now = new Date().getTime().toString();

    this._id        = opts._id || now;
    this.playlists  = opts.playlists || [];
    this.created_at = opts.created_at || now;
    this.updated_at = opts.updated_at || now;
    this._rev       = opts._rev || null;
  }

  save () {
    const playlistIDs = this.playlists.map((playlist) => playlist._id);

    const opts = {
      _id         : this._id,
      playlistIDs : playlistIDs,
      created_at  : this.created_at,
      updated_at  : this.updated_at,
    };

    if (this._rev != null)  {
      opts._rev = this._rev;
    }

    return PlaylistCollectionDB.put(opts)
      .then((doc) => this._rev = doc.rev)
      .catch((err) => {
        console.error('playlistCollection save error');
        console.error(err);
      })
      .then(() => this);
  }

  saveAll () {
    return Promise.all(this.playlists.map((playlist) => playlist.saveAll()))
      .then(() => this.save());
  }

  at (i) {
    return this.playlists[i];
  }

  remove (i) {
    this.playlists = this.playlists.splice(i, 1);
  }

  push (playlist) {
    this.playlists.push(playlist);
  }

  size () {
    return this.playlists.length;
  }

  removeAll (_indexes) {
    const indexes = _indexes.map((s) => +s);
    this.playlists = this.playlists.filter((x, i) =>
      indexes.indexOf(+i) === -1
    );
  }

  movePlaylists (operands, pos) {
    var tmp = [];

    operands.forEach((i) => {
      tmp.push(this.playlists[i]);
    });

    this.removeAll(operands);
    const head = this.playlists.slice(0, pos);
    const tail = this.playlists.slice(pos);
    this.playlists = head.concat(tmp, tail);
  }
}

// factory
PlaylistCollection.load = (id) => {
  return PlaylistCollectionDB
    .get(id)
    .catch((err) => {
      if (err.status !== 404) { throw err; }
      return {
        _id         : id,
        playlistIDs : [],
      };
    })
    .then((doc) => {
      // Load all playlists
      return Promise
        .all(doc.playlistIDs.map((playlistID) => Playlist.load(playlistID)))
        .then((playlists) => {
          doc.playlists = playlists;
          return new PlaylistCollection(doc);
        });
    });
};

export default PlaylistCollection;
