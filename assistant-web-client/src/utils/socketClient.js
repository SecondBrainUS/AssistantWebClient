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
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error("Connection already in progress"));
        return;
      }
      
      this.isConnecting = true;
      
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
          reject(err);
        });

        this.socket.on("connect_timeout", () => {
          console.error("Connection timeout");
        });

        this.socket.on("reconnect_attempt", (attemptNumber) => {
          console.log("Reconnection attempt:", attemptNumber);
        });

        this.socket.on("disconnect", (reason) => {
          console.warn("Disconnected from server:", reason);
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

  async joinRoom(roomId) {
    if (!this.isConnected) {
      await this.connect()
    }
    console.log("Joining room:", roomId)
    this.socket.emit("join_room", { room_id: roomId })
  }

  sendMessage(roomId, message) {
    if (!this.isConnected) {
      throw new Error("Socket is not connected. Call connect() first.")
    }
    console.log("Sending message:", { room_id: roomId, message })
    this.socket.emit("send_message", { room_id: roomId, message })
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

  async createRoom(roomId) {
    if (!this.isConnected) {
      await this.connect()
    }
    console.log("Creating room:", roomId)
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
      this.socket.emit("create_room", { room_id: roomId })
    })
  }

  onRoomError(callback) {
    this.socket.on("room_error", callback)
  }
}

export default SocketClient;
