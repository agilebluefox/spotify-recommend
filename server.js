"use strict";

const unirest = require('unirest');
const express = require('express');
const EventEmitter = require('events').EventEmitter;
const app = express();

app.use(express.static('public'));

let getFromApi = function (endpoint, args) {
    let emitter = new EventEmitter;
    unirest.get('https://api.spotify.com/v1' + endpoint)
        .qs(args)
        .end(function (response) {
            if (response.ok) {
                emitter.emit('end', response.body);
            } else {
                emitter.emit('error', response.code);
            }
        });
    return emitter;
};

app.get('/search/:name', function (req, res) {

    let searchReq = getFromApi('/search', {
        q: req.params.name,
        limit: 10,
        type: 'artist'
    });

    searchReq.on('end', function (item) {
        let artist = item.artists.items[0];
        let id = artist.id;
        let getRelatedArtists = getFromApi('/artists/' + id +
            '/related-artists');
        getRelatedArtists.on('end', function (similarArtists) {
            artist.related = similarArtists.artists;
            res.json(artist);
        });
        getRelatedArtists.on('error', function(code) {
            res.sendStatus(code);
        });
    });

    searchReq.on('error', function (code) {
        res.sendStatus(code);
    });

});

app.listen(8888);
