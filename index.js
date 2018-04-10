const express = require('express'),
server = express(),
cors = require('cors'),
state = {multiplayer: 0, value: 0},
bodyParser = require('body-parser');

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: true
  }));
server.use(express.static('static'));

server.get('/api/state', (req, res) => {
    res.status(200).send({state: state});
});

server.post('/api/state/startTime/:time', (req, res) => {
    const time = req.params.time.split(':'),
    hours = Number(time[0])*60,
    minutes = Number(time[1]),
    currentTime = new Date(),
    currentHour = currentTime.getHours()*60,
    currentMinutes = currentTime.getMinutes();

    state.value = (currentHour+currentMinutes-hours-minutes)*state.multiplayer;

    res.status(200).send(state);
});

server.post('/api/state/multiplayer/:value', (req, res) => {
    const multiplayer = req.params.value;
    state.multiplayer = Number(multiplayer);

    res.status(200).send(state);
});

server.listen(7777, () => {
    console.log('Salary App server started at port 7777');
});

setInterval(() => {
    state.value = state.value + state.multiplayer;
}, 60*1000);