var EventEmitter = require('events').EventEmitter;
var Omx = require('node-omxplayer')

class omx {
  constructor() {
    this.pandora = null
    this.pandoraStations = []
    this.pandoraSelectedStation = null
    this.pandoraStationPlayList = []
    this.player = null
    this.playList = []
    this.playing = null
    this.nowPlaying = null
    this.filedMusic = []
    this.events = new EventEmitter()
  }

  onRequestFinished(){ this.events.emit('requestFinished') }

  getPandoraStations(){
    var self = this
    this.pandora.request("user.getStationList", function(err, stationList) {
      self.pandoraStations = stationList.stations
      self.events.emit('requestFinished')
    });
  }

  getFiledMusic(filedMusic){
    this.filedMusic = filedMusic
    return this.filedMusic
  }

  getPandoraStationPlaylist(stationInfo){
    let {stationId, stationName} = stationInfo
    this.pandoraSelectedStation = {stationId, stationName}
    var self = this
    this.pandora.request("station.getPlaylist", {
       "stationToken": stationId,
       "additionalAudioUrl": "HTTP_128_MP3"
   }, function(err, playlist) {
       if (err) throw err;
       self.station = stationName
       var songs = playlist.items
       var adToken = songs.pop().adToken
       self.requestPandoraAdd(adToken)
       self.playList = self.playList.concat( songs )
       if(!self.player) self.next()
       else self.onRequestFinished()
   });
  }

  requestPandoraAdd(adToken){
    var self = this
    self.pandora.request("ad.getAdMetadata", {
      "adToken": adToken,
      "returnAdTrackingTokens": true,
      "supportAudioAds": true,
      "includeBannerAd":true
    }, function(err, ads) {
      if (err) throw err
      if (ads.adTrackingTokens && ads.adTrackingTokens.length > 0) {
        self.pandora.request("ad.registerAd", {
          "stationId": self.pandoraSelectedStation.stationId,
          "adTrackingTokens": ads.adTrackingTokens
        }, function (err, stat) {
          if (err) throw err
          console.log('add status?', stat);
        })
      }
    })
  }

  requestData(){
    return {filedMusic: this.filedMusic, pandoraStations: this.pandoraStations, pandoraSelectedStation: this.pandoraSelectedStation, playList: this.playList, nowPlayig: this.nowPlaying}
  }

  playSong(song){
    console.log('nowPlaying', song.songName);
    this.nowPlaying = song
    var path = song.additionalAudioUrl

    if (this.player) this.player.newSource(path)
    else {
      this.player = new Omx(path)
      this.player.on('close', () => self.events.emit('songEnd') )
    }
    this.onRequestFinished()
  }

  next(){
    if (this.playing === null) this.playing = -1
    this.playing += 1
    console.log('should i get more', this.playing == this.playList.length - 2);
    if (this.playing == this.playList.length - 2) this.getPandoraStationPlaylist(this.pandoraSelectedStation)
    this.playSong(this.playList[this.playing])
  }

}

module.exports = new omx()
