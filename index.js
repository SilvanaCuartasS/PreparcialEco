const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: "/real-time",
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use("/app1", express.static(path.join(__dirname, "app1")));

let users = [];
const roles = ["Marco", "Polo", "Polo Especial"];
let availableRoles = [...roles];

app.get("/users", (req, res) => {
  res.send(users);
});

app.post("/join-game", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Ops, data missing" });
  }

  if (availableRoles.length === 0) {
    return res
      .status(400)
      .json({ message: "No more players, There are 3 players now" });
  }

  const assignRole = () => {
    const i = Math.floor(Math.random() * availableRoles.length);
    return availableRoles.splice(i, 1)[0];
  };

  const user = {
    id: users.length + 1,
    name,
    rol: assignRole(),
  };

  users.push(user);

  console.log("Super el registro:", users);

  res.status(201).json({
    message: "Usuario registrado",
    player: user,
    numberOfPlayers: users.length,
  });
});

app.post("/start-game", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Ops, data missing" });
  }

  console.log(text);

  res.status(200).json({ message: "Juego iniciado" });
  io.emit("startGame");
});

app.post("/notify-marco", (req, res) => {
  const { idPlayer } = req.body;

  if (!idPlayer) {
    return res.status(400).json({ message: "Ops, data missing" });
  }
  console.log("Grito recibido de:", idPlayer); //si lo muestra
  res.status(200).json({ message: "Grito publicado", idPlayer: idPlayer }); //si lo muestra
});

app.post("/notify-polo", (req, res) => {
  const { idPlayer } = req.body;

  if (!idPlayer) {
    return res.status(400).json({ message: "Ops, data missing" });
  }
  console.log("Grito recibido de:", idPlayer);
  res.status(200).json({ message: "Grito publicado", idPlayer: idPlayer });
  io.emit("notification", { userId: idPlayer, message: "Polo!!!" });
});

app.post("/select-polo", (req, res) => {
  const { userId, username, poloSelected } = req.body;
  console.log("llegaron completicos: "+ userId,username,poloSelected);
  
  const playerChoosen = users.find(player => player.id === parseInt(poloSelected));
  console.log(playerChoosen); 
  
  if (!userId || !poloSelected || !username ) {
    return res.status(400).json({ message: "Ops, data missing" });
  } else if (!playerChoosen) {
    return res.status(400).json({ message: "Who are u player?" });
  }
  
  if (playerChoosen.rol === "Polo Especial") {
    io.emit("notification", { userId: userId, message: `Game Over: El marco ${username} es el ganador`});
  } else {
    io.emit("notification", { userId: userId, message: `Game Over: El marco ${username} es el perdedor`}); 
  }
  res.status(200).json({ message: "Game Over, check out the results"});
});

io.on("connection", (socket) => {
  socket.on("notify-marco", (data) => {
    console.log("Entró a notify-marco!!!!");
    io.emit("notification", { userId: data, message: "Marco!!!" });
  });
});

httpServer.listen(5052);
console.log("Server on: http://localhost:5052");
