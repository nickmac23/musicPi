var EventEmitter = require('events').EventEmitter;
var Omx = require('node-omxplayer')

class omx {
  constructor() {
    this.player = null
    this.volume = 3
    this.playing = null
    this.playList = []
    this.events = new EventEmitter()
  }

  setPlayList(playList){
    this.playList = playList
    this.playSong(playList[0])
  }

  playSong(song){
    var path = song.path ? song.path : song.additionalAudioUrl
    // this.playing = this.playList.indexOf(song)
    if (this.player) {
      this.player.quit()
      this.player = null
    }

    this.player = new Omx(path)
    var self = this
    this.player.on('close', () => self.events.emit('songEnd') )
    return song
  }

  next(){
    console.log('playing next');
    if (this.playing === null) this.playing = -1
    this.playing += 1
    this.playSong(this.playList[this.playing])
  }

}

module.exports = new omx()
