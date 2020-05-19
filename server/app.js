const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const index = require("../routes/index");
const port = process.env.PORT || 4001;
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);
var faker = require('faker');

var count = 0;
var horses;

const getHorsesAndEmit = socket => {
   horses = getHorses(count);
    try {
      socket.emit("StartHorses", horses);
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }

    horses.forEach((data) => {
      const time = faker.random.number({min:10000, max:20000});
      const horse = {
        'event': 'finish',
        'horse': {
          'id': `${data.horse.id}`,
          'name': `${data.horse.name}`
        },
        'time': time,
      };
      setTimeout(function() {
        try {
          socket.emit("FinishHorses", horse);
        } catch (error) {
          console.error(`Error: ${error.code}`);
        }
      }, time);
    })

};

function getHorses(count) {
  count++;
  let horses = [];
  const horseLimit = 6;
  for(var i = 0; i < horseLimit;i++){
      const horse = {
          'event': 'start',
          'horse': {
            'id': count+i,
            'name': faker.name.findName(),
          },
          'time': 99999,
      }
      horses.push(horse);
  }
    return horses;
}

let interval;

io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getHorsesAndEmit(socket), 60000);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
