"use strict()";

const unirest = require('unirest');
const express = require('express');
const EventEmitter = require('events').EventEmitter;
const app = express();

app.use(express.static('public'));

let getFromApi = function(endpoint, args) {
    let emitter = new EventEmitter();
    unirest.get('https://api.spotify.com/v1' + endpoint)
        .qs(args)
        .end(function(response) {
            if (response.ok) {
                emitter.emit('end', response.body);
            } else {
                emitter.emit('error', response.code);
            }
        });
    return emitter;
};

app.get('/search/:name', function(req, res) {

    let searchReq = getFromApi('/search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });

    searchReq.on('end', function(item) {
        let completed = 0;
        let checkComplete = function() {
            if (completed === artist.related.length) {
                res.json(artist);
            }
        };

        let artist = item.artists.items[0];
        let id = artist.id;
        let getRelatedArtists = getFromApi('/artists/' + id +
            '/related-artists');
        getRelatedArtists.on('end', function(relatedArtists) {
            artist.related = relatedArtists.artists;
            artist.related.forEach(function(
                relatedArtist) {
                let relatedId = relatedArtist.id;
                console.log(`Related artist: ${relatedArtist.name} - ${relatedId}`);
                let topTracks = getFromApi(
                    `/artists/${relatedId}/top-tracks`, {
                        country: 'US'
                    }
                );
                topTracks.on('end', function(item) {
                    relatedArtist.tracks = item.tracks;
                    relatedArtist.tracks.forEach(function(track) {
                        console.log(track.name);
                    });
                    completed += 1;
                    console.log(`COMPLETED: ${ completed }`);
                    checkComplete(artist.related);
                });
                topTracks.on('error', function(code) {
                    res.sendStatus(code);
                });
            });

        });
        getRelatedArtists.on('error', function(code) {
            res.sendStatus(code);
        });
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });

});

app.listen(8888);