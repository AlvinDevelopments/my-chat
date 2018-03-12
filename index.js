var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 4000;

var users = [];
var connections = [];
var messages = [];

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.sockets.on('connection', function(socket){

  io.emit('update users',users);
  socket.emit('update messages', messages);


  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  socket.on('add user',function(data){
    let user = data;
    socket.username = user;
    console.log('User added', data);

    if(checkUser(data)){
      console.log('checked');
      users.push(data);
      console.log(users);
      let m = generateMessage(user+' has connected.',users[users.indexOf(socket.username)],1,'black');
      io.emit('chat', m);
      messages.push(m);
      console.log(messages);
    }
    else{
      console.log('error, name exists');
    }
    io.emit('update users',users);

  });


  socket.on('request name',function(data){
    let username='User'+Math.floor((Math.random() * 100) + 1).toString();
    socket.username = username;
    socket.emit('username',username);
  });

  socket.on('update user',function(data){
    let user = data;
    let oldname = socket.username;
    console.log('User changed name to', data);
    console.log(users[users.indexOf(socket.username)]);
    if(checkUser(data)){
      users[users.indexOf(socket.username)]=data;
      socket.username = user;
    }
    else{
      console.log('error, name exists');
    }
    // io.emit('notice',generateMessage('User '+socket.username+' changed name to '+data,users[users.indexOf(socket.username)],1));
    io.emit('chat',generateMessage('User '+oldname+' changed name to '+data,users[users.indexOf(socket.username)],1,'black'));
    console.log(users[users.indexOf(socket.username)]);
    messages.push(generateMessage('User '+oldname+' changed name to '+data,users[users.indexOf(socket.username)],1,'black'));
    io.emit('update users',users);
  });

    socket.on('chat', function(msg){

      let m = generateMessage(msg.msg,users[users.indexOf(socket.username)],0,msg.clr);
      console.log('message: ' + msg.msg+' color is '+msg.clr);

      io.emit('chat',m);
      messages.push(m);
      io.emit('update users',users);
    });

    socket.on('debug',function(data){
      console.log(data);
    });

    // Disconnect
    socket.on('disconnect', function(data){
      connections.splice(connections.indexOf(socket),1);
      console.log('Disconnected: %s sockets connected', connections.length);
      let m = generateMessage(socket.username+' has disconnected.',users[users.indexOf(socket.username)],1,'black');
      // io.emit('notice',m);
      io.emit('chat',m);
      messages.push(m);
      users.splice(users.indexOf(socket.username), 1);
      io.emit('update users',users);

    });

  });








  function checkUser(name){
    for(i=0;i<users.length;i++){
      if(name==users[i]){
        return false;
      }
    }
    return true;
  }


  function generateMessage(msg,user,type,color){
    let date = new Date(Date.now());
    // let day = date.getDate();
    // let month = date.getMonth();
    // let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();

    let m = {
      user:user,
      message:msg,
      time:" ("+hour+":"+minute+":"+seconds+")",
      color:color,
      type: type
    };

    return m;
  }
