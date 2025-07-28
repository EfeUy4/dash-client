import { io } from "socket.io-client";

// ✅ Hardcode for now, then switch to env variable
export const socket = io(`${import.meta.env.VITE_BASE_API_URL || "https://dashng-server.fly.dev"}`, {
  transports: ["websocket"],
  autoConnect: false, // Preven
});

export default socket;
