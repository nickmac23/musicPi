var http = require('http').createServer( (request, response) => response.end('sup from the pi') )
var socket = require('socket.io-client')('https://fathomless-falls-33454.herokuapp.com/')
var {parse, findPaths} = require('./parseMusic.js')
var omx = require('./omx.js')
var dataStore = require('./dataStore.js')
var Anesidora = require("anesidora");
var env = require('dotenv').config()

http.listen(8000, () => console.log('listening on port 8000') )

// var path = '/home/pi/Desktop/usbstick/'
var path = '/Users/nickmac/Desktop/music/'

var pandora = new Anesidora(process.env.EMAIL, process.env.PASSWORD);

pandora.login(function(err) {
	if (err) throw err;
	parse(findPaths(path)).then( filedMusic => {
		dataStore.pandora = pandora
		dataStore.addPandoraStations()
	 	dataStore.addFiledMusic(filedMusic)
		console.log('server ready!');
	})
});

dataStore.events.on('sendData', data => {
	if (data) omx[data.command](data.params)
	socketOut(dataStore.requestData())
})

omx.events.on('songEnd', () => socketOut(omx.next()))

socket.on('Piraspberry', ({obj, command, params}) => {
	console.log('obj ' + obj + ' command ' + command + ' params ' + params);
	var info;
	if (obj == 'dataStore') info = dataStore[command](params)
	else info = omx[command](params)
	if (info) socket.emit('server', {to: 'Pi', room: 'raspberry', info})
})

function socketOut(info){
	socket.emit('server', {to: 'Pi', room: 'raspberry', info})
}
