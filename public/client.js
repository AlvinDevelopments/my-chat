// shorthand for $(document).ready(...)
$(function() {

    $('#userList').html('');

    var username = getCookie('cname');
    var socket = io.connect();
    var color = 'black';

    if(username!=''){
      socket.emit('add user',username);
    }
    else{
      socket.emit('request name',1);
    }

    socket.on('username', function(name){
      username = name;
      setCookie('cname',username,100);
      socket.emit('add user',username);
    });


    $('form#message').submit(function(){
      var m = $('#m').val();
      if(m.startsWith('/nick ')){
        username = m.substr(m.indexOf(" ") + 1);
        setCookie('cname',username,100);
        socket.emit('update user',username);
         $('#m').val('');
      }
      else if(m.startsWith('/nickcolor ')){
         color = m.substr(m.indexOf(" ") + 1);
         $('#m').val('');
      }
      else{
	     socket.emit('chat', {msg:$('#m').val(),clr:color});
	      $('#m').val('');
      }
        $("#whole").scrollTop($("#whole")[0].scrollHeight);
	      return false;
    });

    socket.on('chat', function(m){
      if(m.user==username){

        if(m.type==0){
          $('#messages').append($('<li style="font-weight:bold; color:'+m.color+'">').text(m.time+" "+m.user+": "+m.message));
        }
        else{
          $('#messages').append($('<li style="font-weight:bold; font-style:italic; color:'+m.color+'">').text(m.time+" "+m.message));
        }
      }
      else{
        if(m.type==0){
	        $('#messages').append($(('<li style="color:'+m.color+'">')).text(m.time+" "+m.user+": "+m.message));
        }
        else{
          $('#messages').append($('<li style="font-style:italic; color:'+m.color+'">').text(m.time+" "+m.user+" "+m.message));
        }

      }

      // $("#messages").scrollTop($("#messages")[0].scrollHeight);
      $("#whole").scrollTop($("#whole")[0].scrollHeight);

    });

    socket.on('update messages',function(msg){
      let html = '';
      for(i = 0; i < msg.length && i < 200; i++){
        if(msg[i].type==0){
          html+='<li style="color:'+msg[i].color+'">'+msg[i].time+" "+msg[i].user+": "+msg[i].message+'</l>';
        }
        else{
          html+='<li style="font-style:italic; color:'+msg[i].color+'">'+msg[i].time+" "+msg[i].message+'</l>';
        }
      }
      $('#messages').html(html);
      $("#whole").scrollTop($("#whole")[0].scrollHeight);
    });


    socket.on('update users',function(users){
      html='';
      for(i = 0; i < users.length; i++){
        if(users[i]==username){
          html+='<li style="color: green">'+users[i]+'</l>';
        }
        else{
          html+='<li>'+users[i]+'</l>';
        }
      }
      $('#userList').html(html);
    });

  });

// from w3
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// from w3
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
