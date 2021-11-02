import { io } from 'socket.io-client'

class SocketIOService {
  socket

  setupSocketConnection () {
    this.socket = io(process.env.VUE_APP_SOCKET_ENDPOINT)
  }

  disconnect () {
    if (this.socket) this.socket.disconnect()
  }
}

export default new SocketIOService()
