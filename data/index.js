const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const nodeimu = require('nodeimu');
const {
  exec
} = require('child_process');

const TIMEOUT = 1000

var IMU = new nodeimu.IMU()
let tic = new Date()

server.listen(8080);

function getSensorsData(data) {
  const measure = createPayload(data)
  return measure
}

function createPayload(data) {
  const { timestamp, temperature, pressure, humidity } = data
  return {
    date: timestamp.toISOString(),
    temperature,
    pressure,
    humidity
  }
}

io.on('connection', function(socket) {
  'use strict';
  console.log('a user connected');
  let dataLoop = setInterval(function() {
    setTimeout(() => {
      tic = new Date()
      IMU.getValue((e, data) => {
        if (e) {
          return
        }
        var measure = getSensorsData(data)
        socket.emit('measure', measure)
      }, TIMEOUT - (new Date() - tic))
    })
  }, 2000);
	socket.on('disconnect', function() {
      console.log('a user disconnected');
			clearInterval(dataLoop);
   });
});
