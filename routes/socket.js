/*
 * Serve content over a socket
 */



module.exports = function (socket, tick) {
  socket.emit('send:name', {
    name: 'Shaun'
  });

  setInterval(function(){
    if (tick !== last) {
      socket.emit('send:time', tick);
      last = tick;
    }
  }, 0.001);


};
