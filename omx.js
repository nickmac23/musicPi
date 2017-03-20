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
    this.next()
    return null
  }

  playSong(song){
    var path = song.path ? song.path : song.additionalAudioUrl
    if (this.player) {
      if(this.player.running) this.player.quit()
      this.player = null
    }

    this.player = new Omx(path)
    var self = this
    this.player.on('close', () => self.events.emit('songEnd') )
    return {playing: song}
  }

  next(){
    console.log('playing next');
    if (this.playing === null) this.playing = -1
    this.playing += 1
    return this.playSong(this.playList[this.playing])
  }

}

module.exports = new omx()
