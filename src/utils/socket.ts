import { io } from "socket.io-client";

// ✅ Hardcode for now, then switch to env variable
export const socket = io(`${import.meta.env.VITE_BASE_API_URL || "https://dashng-server.fly.dev"}`, {
	transports: ["websocket"],
	autoConnect: false,
	// Evaluated on every (re)connect: staff join the staff room and users their own room server-side
	auth: (cb) => cb({ token: localStorage.getItem("dashngshop-token") || undefined }),
});

export default socket;
