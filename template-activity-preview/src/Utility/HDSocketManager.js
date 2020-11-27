/**
 *
 * @type {{Reconnect: string, Disconnect: string, Message: string, Connect: string, Error: string}}
 * For More info : https://github.com/socketio/socket.io-client/blob/master/docs/API.md#socket
 *
 */

const SocketEvents = {
  Connect: "connect",
  Reconnect: "reconnect",
  Reconnecting: "reconnecting",
  Disconnect: "disconnect",
  Error: "error",
  Message: "message",
  EventTest: "Test",
};

const SocketManager = {
  socket: null,
  socketConfig: {},
  connect: function () {
    cc.log("URl -" + HDAppManager.getSocketURL());
    this.socket = io(HDAppManager.getSocketURL(), this.socketConfig);
    this.socket.on(SocketEvents.Connect, function () {
      console.log("====== socket connected sucessfully ======");
    });
    this.socket.on(SocketEvents.Error, function (error) {
      console.log("====== socket connection error ====== :" + error.toString());
    });
    this.socket.on(SocketEvents.Disconnect, function () {
      console.log("====== socket disconnected sucessfully======");
    });
    this.socket.on(SocketEvents.Reconnect, function () {
      console.log("====== socket reconnected sucessfully======");
    });
    this.socket.on(SocketEvents.Reconnecting, function (msg) {
      console.log("====== socket Reconnecting successfully====== :" + msg.toString());
    });
    this.socket.on(SocketEvents.Message, function (data) {
      console.log("====== socket message received ====== :" + data.toString());
    });
  },

  isSocketConnected: function () {
    return this.socket.connected;
  },

  emitCutomEvent: function (eventName, eventData, fn) {
    this.socket.emit(eventName, eventData, fn);
  },

  subscribeEvent: function (eventName, fn) {
    this.socket.on(eventName, fn);
  },

  removeSubscribedEvent: function (eventName, fn) {
    //   this.socket.removeListener(eventName,fn);
  },

  closeSocket: function () {
    if (this.socket) this.socket.close();
  },
};
