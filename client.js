import { io as socketIOClient } from "socket.io-client";

const socket = socketIOClient("http://localhost:3000");

socket.on("company_name", (data) => {
  console.log("Received stock price:", data);
});

socket.on("error", (message) => {
  console.error("Error:", message);
});

// Emit stock request
socket.emit("stock", "tesla");
