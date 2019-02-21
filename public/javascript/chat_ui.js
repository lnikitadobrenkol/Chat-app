let socket = io.content();

$(document).ready(function () {
   let chatApp = new Chat(socket);

   socket.on('nameResult', function (result) {
       let massage;

       if (result.success) {
           message = 'You are now known as ' + result.name + '.';
       } else {
           message = result.message;
       }
       $('#messages').append(divSystemContentElement(message));
   });

   socket.on('joinResult', function (result) {
       $('#room').text(result.room);
       $('#messages').append(divSystemContentElement('Room changed.'));
   });

   socket.on('message', function (message) {
       let newElement = $('<div></div>').text(message.text);
       $('#messages').append(newElement);
   });

   socket.on('rooms', function (rooms) {
       $('#room-list').empty();
       for(let room in rooms) {
           room = room.substring(1, room.length);
           if (room !== '') {
               $('#room-list').append(divEscapedContentElement(room));
           }
       }

       $('#room-list div').click(function () {
           chatApp.processCommand('/join ' + $(this).text());
           $('#send-message').focus();
       });
   });

   setInterval(function () {
       socket.emit('rooms');
   }, 1000);
   $('#used-message').focus();
   $('#send-form').submit(function () {
       processUserInput(chatApp, socket);
       return false;
   });
});

function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
    let message = $('#send-message').val();
    let systemMassage;
    if (message.charAt(0) === '/') {
        systemMassage = chatApp.processCommand(message);
        if (systemMassage) {
            $('#messages').append(divSystemContentElement(systemMassage));
        }
    } else {
        chat.app.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}
