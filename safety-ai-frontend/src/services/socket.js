import { io } from "socket.io-client";

export const socket = io("/", {
  path: "/socket.io",

  autoConnect: false,

  transports: [
    "websocket",
    "polling",
  ],
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

// -----------------------------
// CAMERA FRAME
// -----------------------------

export function sendCameraFrame(cameraId, frame) {
  if (!socket.connected) {
    connectSocket();
  }

  socket.emit("camera_frame", {
    cameraId,
    frame,
  });
}

// -----------------------------
// CHAT MESSAGE
// -----------------------------

export function sendChatMessage(message, sessionId = null) {
  if (!socket.connected) {
    connectSocket();
  }

  socket.emit("chat_message", {
    message,
    sessionId,
  });
}