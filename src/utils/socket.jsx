import io from "socket.io-client";

const socket = io.connect(process.env.REACT_APP_SOCKET_URL || "https://amberspharebackend.mtc.com.na", {
    transports: ["websocket", "polling"],
    upgrade: false,
    debug: true,
  });

  export default socket;