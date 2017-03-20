var fs = require('fs')
var mm = require('musicmetadata');

function findPaths (root) {
  var musicList = []
  var list = fs.readdirSync(root)
  for (var i = 0; i < list.length; i++) {
	if(list[i][0] != '.' ){
		if (fs.statSync(root + list[i]).isDirectory()) musicList = musicList.concat(findPaths(root + list[i] +'/'))
		else musicList.push( root + list[i] )
	}
  }
  return musicList
}

function parse (musicList) {
  var list = []
  var music;
  for (let i = 0; i < musicList.length; i++) {
    list.push(new Promise(function (resolve, reject) {
      var readableStream = fs.createReadStream(musicList[i]);
      mm(readableStream, function (err, metadata) {
          var musicObj = {
            additionalAudioUrl: musicList[i],
            songName: metadata.title,
            genre: metadata.genre,
            albumName: metadata.album,
            artistName: metadata.artist,
          }
          readableStream.close();
          resolve(musicObj)
      })
    }))
  }

  return Promise.all(list)
}

module.exports = { parse, findPaths }
