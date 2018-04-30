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

function requestData() {
  setTimeout(() => {
    tic = new Date()
    IMU.getValue(getSensorsData)
  }, TIMEOUT - (new Date() - tic))
}

function getSensorsData(e, data) {
  if (e) {
    return
  }
  const measure = createPayload(data)
  console.log(measure)
  //emitToSocket(measure)
  //requestData()
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

requestData()

let getCpuTemp = function(socket) {
  'use strict';
  exec('cat /sys/class/thermal/thermal_zone*/temp', (err, stdout) => {
    if (err) throw err;
    let data = {
      t: parseFloat(stdout) / 1000
    };
    socket.emit('temperature', data);
  });
};

io.on('connection', function(socket) {
  'use strict';
  console.log('a user connected');
  let dataLoop = setInterval(function() {
    getCpuTemp(socket);
  }, 1000);
	socket.on('disconnect', function() {
      console.log('a user disconnected');
			clearInterval(dataLoop);
   });
});
