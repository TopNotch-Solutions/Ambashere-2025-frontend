import io from "socket.io-client";

const socket = io.connect(process.env.REACT_APP_SOCKET_URL || "http://172.19.50.12:4000", {
    transports: ["websocket", "polling"],
    upgrade: false,
    debug: true,
  });

  export default socket;