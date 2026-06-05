import io from "socket.io-client";
import { ensureHttpsUrl } from "./ensureHttpsUrl";

const socket = io.connect(
  ensureHttpsUrl(
    process.env.REACT_APP_SOCKET_URL || "https://amberspherebackend.mtc.com.na"
  ),
  {
    transports: ["websocket", "polling"],
    upgrade: false,
    debug: true,
  });

  export default socket;