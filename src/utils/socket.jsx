import io from "socket.io-client";
import { ensureHttpsUrl } from "./ensureHttpsUrl";

const SOCKET_URL = ensureHttpsUrl(
  process.env.REACT_APP_SOCKET_URL || "https://ambaspherebackend.mtc.com.na"
);

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  secure: SOCKET_URL.startsWith("https://"),
  upgrade: false,
});

export default socket;
