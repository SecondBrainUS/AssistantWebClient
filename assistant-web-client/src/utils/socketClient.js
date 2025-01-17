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
    this.pendingItems = new Map();
    this.chatCreatedCallback = null;
    this.messageCallback = null;
    this.debug = true;
    this.messageHandlerSet = false;
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
          this.setupMessageHandler();
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
    return new Promise((resolve, reject) => {
      // Set up one-time listener for room join confirmation
      this.socket.once(`room_joined ${roomid}`, (data) => {
        console.log("[SOCKET] [JOIN ROOM] Room join confirmed:", data)
        resolve(data)
      })

      // Set up one-time listener for room join error
      this.socket.once(`room_join_error ${roomid}`, (error) => {
        console.error("[SOCKET] [JOIN ROOM] Room join failed:", error)
        reject(error)
      })

      // Emit room join request
      this.socket.emit("join_room", { room_id: roomid })
    })
  }

  sendMessage(roomid, message, modelid) {
    if (!this.isConnected) {
      throw new Error("Socket is not connected. Call connect() first.")
    }
    console.log("Sending message:", { room_id: roomid, message: message, model_id: modelid })
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Message send timed out"));
      }, 30000); // 30 second timeout

      const messageid = new Date().getTime().toString()
      message.id = messageid
      // Set up one-time listener for message confirmation
      this.socket.once(`message_sent ${messageid}`, (data) => {
        clearTimeout(timeoutId);
        console.log("[SOCKET] [SEND MESSAGE] Message sent:", data);
        resolve(data);
      });

      // Set up one-time listener for message error
      this.socket.once(`message_error ${messageid}`, (error) => {
        clearTimeout(timeoutId);
        console.error("[SOCKET] [SEND MESSAGE] Message send failed:", error);
        reject(error);
      });

      // Emit the message
      this.socket.emit("send_message", { 
        room_id: roomid, 
        message: message, 
        model_id: modelid 
      });
    });
  }

  onRoomMessage(roomid, callback) {
    console.log("Setting up room message listener for room:", roomid)
    if (!this.socket || !this.isConnected) {
      throw new Error("Socket is not connected. Call connect() first.")
    }
    this.socket.off(`receive_message ${roomid}`);
    this.socket.on(`receive_message ${roomid}`, callback);
  }

  onRoomCreated(callback) {
    this.socket.off("room_created");
    this.socket.on("room_created", callback);
  }

  onRoomJoined(roomid, callback) {
    const eventName = `room_joined ${roomid}`;
    this.socket.off(eventName);
    this.socket.on(eventName, callback);
  }

  onRoomLeft(callback) {
    this.socket.off("room_left");
    this.socket.on("room_left", callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  async createRoom(chatid, modelid) {
    if (!this.isConnected) {
      await this.connect()
    }
    console.log("Creating room for chat:", chatid)
    return new Promise((resolve, reject) => {
      // Set up one-time listener for room creation confirmation
      this.socket.once(`room_created ${chatid}`, (data) => {
        console.log("[SOCKET] [CREATE ROOM] Room creation confirmed:", data)
        resolve({roomid: data.room_id, chatid: chatid, model_id: data.model_id})
      })

      // Set up one-time listener for room creation error
      this.socket.once(`room_error ${chatid}`, (error) => {
        console.error("[SOCKET] [CREATE ROOM] Room creation failed:", error)
        reject(error)
      })

      // Emit room creation request
      this.socket.emit("create_room", { chat_id: chatid, model_id: modelid })
    })
  }

  async findChat(chatid) {
    if (!this.isConnected) {
      await this.connect()
    }
    console.log("[SOCKET] [FIND CHAT] Finding chat:", chatid)
    return new Promise((resolve, reject) => {
      // Set up one-time listener for room not found
      this.socket.once(`room_not_found ${chatid}`, (data) => {
        console.log("[SOCKET] [FIND CHAT] Room not found for chat:", data)
        resolve({roomid: null, chatid: chatid})
      })

      // Set up one-time listener for room found
      this.socket.once(`room_found ${chatid}`, (data) => {
        console.log("[SOCKET] [FIND CHAT] Room found for chat:", data)
        resolve({roomid: data.room_id, chatid: chatid})
      })

      // Emit find chat request
      this.socket.emit("find_chat", { chat_id: chatid })
    })
  }

  onRoomError(callback) {
    this.socket.off("room_error");
    this.socket.on("room_error", callback);
  }

  onMessageError(callback) {
    this.socket.on("message_error", (data) => {
      console.error("Socket message error:", data)
      callback(data);
    });
  }

  onChatCreated(callback) {
    this.chatCreatedCallback = callback;
  }

  setupMessageHandler() {
    if (this.messageHandlerSet) {
      this.socket.off("receive_message");
    }

    this.socket.on("receive_message", (data) => {
      if (this.debug) {
        console.log("Received socket message:", data);
      }

      try {
        // Handle chat_created events
        if (data.event_type === "chat_created") {
          if (this.debug) {
            console.log("Chat created event received:", data);
          }
          if (this.chatCreatedCallback) {
            this.chatCreatedCallback(data.data.chat_id);
          }
          return;
        }
        // Handle all other messages
        if (this.messageCallback) {
          this.messageCallback(data);
        }
      } catch (error) {
        console.error("Error in message handler:", error);
      }
    });

    this.messageHandlerSet = true;
  }
}

export default SocketClient;
