// socketClient.js
import { io } from "socket.io-client";

class SocketClient {
  constructor(serverUrl, options = {}) {
    this.serverUrl = serverUrl;
    this.options = options;
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.namespace = options.namespace || '/';
    this.statusCallback = null;
  }

  onStatusChange(callback) {
    this.statusCallback = callback;
  }

  updateStatus(status) {
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error("Connection already in progress"));
        return;
      }
      
      this.isConnecting = true;
      this.updateStatus('connecting');
      
      if (!this.socket) {
        console.log(`Attempting to connect to ${this.serverUrl} namespace ${this.namespace}`);
        this.socket = io(this.serverUrl + this.namespace, {
          ...this.options,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ['websocket', 'polling'],
          upgrade: true,
          path: '/socket.io/',
          forceNew: true,
          multiplex: false,
        });

        this.socket.connect();

        this.socket.on("connect", () => {
          console.log("Connected to the server with ID:", this.socket.id);
          this.isConnected = true;
          this.isConnecting = false;
          this.updateStatus('connected');
          resolve();
        });

        this.socket.on("connect_error", (err) => {
          console.error("Connection error details:", {
            message: err.message,
            description: err.description,
            type: err.type,
            transport: this.socket.io?.engine?.transport?.name
          });
          this.isConnecting = false;
          this.updateStatus('disconnected');
          reject(err);
        });

        this.socket.on("connect_timeout", () => {
          console.error("Connection timeout");
        });

        this.socket.on("reconnect_attempt", (attemptNumber) => {
          console.log("Reconnection attempt:", attemptNumber);
          this.updateStatus('reconnecting');
        });

        this.socket.on("disconnect", (reason) => {
          console.warn("Disconnected from server:", reason);
          this.isConnected = false;
          this.updateStatus('disconnected');
        });
      } else if (this.isConnected) {
        this.isConnecting = false;
        resolve();
      } else {
        this.isConnecting = false;
        reject(new Error("Socket exists but not connected"));
      }
    });
  }

  async joinRoom(roomid) {
    if (!this.isConnected) {
      await this.connect()
    }
    console.log("Joining room:", roomid)
    this.socket.emit("join_room", { room_id: roomid })
  }

  sendMessage(roomid, message, userid, model) {
    if (!this.isConnected) {
      throw new Error("Socket is not connected. Call connect() first.")
    }
    console.log("Sending message:", { room_id: roomid, message: message, userid: userid, model: model })
    this.socket.emit("send_message", { room_id: roomid, message: message, userid: userid, model: model })
  }

  onMessage(callback) {
    if (!this.isConnected) {
      throw new Error("Socket is not connected. Call connect() first.");
    }
    this.socket.on("receive_message", (data) => {
      callback(data);
    });
  }

  onRoomCreated(callback) {
    this.socket.on("room_created", callback);
  }

  onRoomJoined(callback) {
    this.socket.on("room_joined", callback);
  }

  onRoomLeft(callback) {
    this.socket.on("room_left", callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  async createRoom(roomid) {
    if (!this.isConnected) {
      await this.connect()
    }
    console.log("Creating room:", roomid)
    return new Promise((resolve, reject) => {
      // Set up one-time listener for room creation confirmation
      this.socket.once("room_created", (data) => {
        console.log("Room creation confirmed:", data)
        resolve(data)
      })

      // Set up one-time listener for room creation error
      this.socket.once("room_error", (error) => {
        console.error("Room creation failed:", error)
        reject(error)
      })

      // Emit room creation request
      this.socket.emit("create_room", { room_id: roomid })
    })
  }

  onRoomError(callback) {
    this.socket.on("room_error", callback)
  }

  onMessageError(callback) {
    this.socket.on("message_error", (data) => {
      console.error("Socket message error:", data)
      callback(data);
    });
  }
}

export default SocketClient;
