var EventEmitter = require('events').EventEmitter;

class Data {
  constructor() {
    this.pandora = null
    this.filedMusic = []
    this.pandoraStations = []
    this.pandora = null
    this.stationPlayList = []
    this.station = null
    this.events = new EventEmitter()
  }

  addPandoraStations(){
    var self = this
    this.pandora.request("user.getStationList", function(err, stationList) {
      self.pandoraStations = stationList.stations
      self.events.emit('sendData')
    });
    return null
  }

  addFiledMusic(filedMusic){
    this.filedMusic = filedMusic
    return this.filedMusic
  }

  selectStation(stationInfo){
    let {stationId, stationName} = stationInfo
    this.station = {stationId, stationName}
    var self = this
    this.pandora.request("station.getPlaylist", {
       "stationToken": stationId,
       "additionalAudioUrl": "HTTP_128_MP3"
   }, function(err, playlist) {
       if (err) throw err;
       self.station = stationName
       self.stationPlayList = playlist.items
       self.events.emit('sendData', {command:'setPlayList', params: playlist.items})
   });
   return null
  }

  requestData(){
    return {filedMusic: this.filedMusic, pandoraStations: this.pandoraStations, station: this.station, stationPlayList: this.stationPlayList}
  }

}

module.exports = new Data()
