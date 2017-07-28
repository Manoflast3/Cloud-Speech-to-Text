'use strict';

const Speech = require('@google-cloud/speech');
const Storage = require('@google-cloud/storage');
const gcm = require('node-gcm');
const firebase = require('firebase-admin');
const Lang = require('./lang');

const gcmServerKey = process.env.GCM_SERVER_KEY;
const port = process.env.PORT || 5000;

var speech = null;
var storage = null;
var lang = new Lang();

if (process.env.GAE_INSTANCE) {
  console.log("Running on Google Cloud Platform");
  // running on GAE - authentication handled out of the box
  speech = Speech();
  storage = Storage();
  firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`
  });
} else {
  console.log("Running locally");
  console.log(`Using GCLOUD_PROJECT => ${process.env.GCLOUD_PROJECT}`);
  console.log(`Using GOOGLE_APPLICATION_CREDENTIALS => ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  speech = Speech({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
  storage = Storage({
    projectId: process.env.GCLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
  const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`
  });
}

const rootRef = firebase.database().ref();

const sender = new gcm.Sender(gcmServerKey);

// The encoding of the audio file, e.g. 'LINEAR16'
const encoding = 'LINEAR16';
// The sample rate of the audio file, e.g. 16000
const sampleRate = 16000;

const streamingRequest = {
  config: {
    encoding: encoding,
    sampleRate: sampleRate,
    speechContext: {
      phrases: null
    }
  },
  interimResults: false,
  verbose: true
};

var bucket = storage.bucket(process.env.GCLOUD_PROJECT + '.appspot.com');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.post('/recognize', jsonParser, function (req, res) {
  if (!req.body || !req.body.uid || !req.body.aid) {
    return res.sendStatus(400);
  }

  var languageCode = 'en-US';
  if (req.body.lang) {
    languageCode = req.body.lang;
  }

  streamingRequest.config.speechContext.phrases = lang.getDirections(languageCode);
  streamingRequest.config.languageCode = languageCode;

  var settings = rootRef.child(`users/${req.body.uid}/settings`);
  settings.once('value', function(snapshot) {
    const value = snapshot.val();

    const filename = `users/${req.body.uid}/audio/${req.body.aid}.raw`;

    var downloadStream = bucket.file(filename).createReadStream();
    downloadStream
      .on('error', console.error)
      .pipe(speech.createRecognizeStream(streamingRequest))
      .on('error', console.error)
      .on('data', function(data) {
        if (data.endpointerType == Speech.endpointerTypes.ENDPOINTER_EVENT_UNSPECIFIED && data.results.length > 0) {
          var transcript = null;
          if (typeof(data.results) == 'string') {
            transcript = data.results.trim();
          } else {
            transcript = data.results[0].transcript.trim();
          }
          var directionCode = lang.directionToCode(languageCode, transcript);
          if (directionCode == -1) {
            console.log(`Transcript ${transcript} not recognized`);
          } else {
            console.log(`Transcript ${transcript} has code => ${directionCode}`);
            var message = new gcm.Message({
              data: {
                code: directionCode
              }
            });
            sender.send(message, {
              registrationTokens: [value.registrationToken]
            }, function (err, data) {
                if (err) {
                  console.error(err);
                } else {
                  console.log(data);
                }
            });
            }
          }
        });
        res.status(201).send({ status: 'accepted' });
  });
});

var server = app.listen(port, function () {
   console.log("App ready & listening!");
})
