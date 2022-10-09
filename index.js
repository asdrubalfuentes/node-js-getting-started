const express = require('express')
const Server = require("socket.io");
const io = new Server(express);
const mqtt = require('mqtt');
const pub_sub = mqtt.connect('mqtt://emqx.aysafi.com/:1883');
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db',(req,res) => res.render('pages/db'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  pub_sub.on('connect', () => {
    pub_sub.subscribe('T_ESP');
    pub_sub.subscribe('mqtt command');
    pub_sub.subscribe('testTopic');
    console.log("Conectado a mqtt en la nube");
    
  });
  
  pub_sub.on('message', (topic, message) =>{
    //console.log(topic.toString(), message.toString())
    if (topic.toString() == 'T_ESP'){
      io.emit('measure', message.toString());
    }
  });
    
  io.on('connection', (socket) => {
      socket.on('chat message', (msg) => {
          io.emit('chat message', msg);
        });
        socket.on('mqtt command', (data) => {
          io.emit('mqtt command', data);
          pub_sub.publish('mqtt command', data);
        });
  });
  
  io.on('chat message', (data) =>{
      console.log(data);
  });
  
  io.on('mqtt command', (data) => {
    console.log(data);
  })