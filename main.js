var http = require('http').createServer( (request, response) => response.end('sup from the pi') )
var socket = require('socket.io-client')('https://fathomless-falls-33454.herokuapp.com/')
var {parse, findPaths} = require('./parseMusic.js')
var omx = require('./omx.js')
var Anesidora = require("anesidora");
var env = require('dotenv').config()

http.listen(8000, () => console.log('listening on port 8000') )

var path = '/home/pi/Desktop/usbstick/'
// var path = '/Users/nickmac/Desktop/music/'

var pandora = new Anesidora(process.env.EMAIL, process.env.PASSWORD);

pandora.login(function(err) { //get filed music and pandora stations
	if (err) throw err;
	parse(findPaths(path)).then( filedMusic => {
		omx.pandora = pandora
		omx.getPandoraStations()
	 	omx.getFiledMusic(filedMusic)
		console.log('server ready!');
	})
});

var socketOut = info =>  socket.emit('server', {to: 'Pi', room: 'raspberry', info}) //emits info to client

omx.events.on('requestFinished', () => socketOut(omx.requestData()) ) // triggers after song data loads

omx.events.on('songEnd', () => { // triggers on song end
	if (omx.playing == omx.playList.length - 2) dataStore.selectStation(dataStore.station)
	socketOut(omx.next())
})

socket.on('Piraspberry', ({obj, command, params}) => { // listens for client commands
	console.log('command ' + command + ' params ' + params);
	var info = omx[command](params)
	if ( info ) socketOut(info)
})
