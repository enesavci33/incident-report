import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Bağlandı:", socket.id);
  socket.emit("join_room");
});

socket.on("new_incident", data => {
  console.log("Yeni incident geldi:", data);
});

socket.on("incident_resolved", data => {
  console.log("Incident çözüldü:", data);
});