const socket = io("http://localhost:5052", { path: "/real-time" });

const btn = document.getElementById("joinBtn");
btn.addEventListener("click", registerUser);
const register = document.getElementById("register");
const start = document.getElementById("start");
const results = document.getElementById("results");
const nameInput = document.getElementById("nameInput");

const nickname = document.getElementById("nickname");
const role = document.getElementById("role");
const wait = document.getElementById("wait");

let playerRole = "";
let idPlayer = 0;
let username = "";
let poloCounter = 0;

start.style.display = "none";
results.style.display = "none";

function registerUser() {
  register.style.display = "none";

  fetch("http://localhost:5052/join-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);

      idPlayer = data.player.id;
      username = data.player.name;
      playerRole = data.player.rol;
      const players = data.numberOfPlayers;

      start.style.display = "flex";

      nickname.innerHTML = username;
      role.innerHTML = `Tú eres ${playerRole}`;

      nameInput.style.display = "none";
      btn.style.display = "none";

      if (players === 3) {
        startGame();
      }
    })
    .catch((error) => console.error("Error:", error));
}

function startGame() {
  console.log("llegaste a StartGame!");

  fetch("http://localhost:5052/start-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "The Game Starts!",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => console.error("Error:", error));
}

socket.on("startGame", () => {
  console.log("Socket on running. Player role:", playerRole);
  const icon = document.getElementById("icon");
  icon.style.display = "none";

  if (playerRole === "Marco") {
    wait.style.display = "none";
    const btnScreamMarco = document.createElement("button");
    btnScreamMarco.innerHTML = "Gritar MARCO";
    btnScreamMarco.id = "btnScreamMarco";
    btnScreamMarco.addEventListener("click", notifyMarco);
    start.appendChild(btnScreamMarco);
    console.log("Botón Marco creado:", btnScreamMarco); // si muestra que el btn se creó en el DOOM
  } else {
    wait.innerHTML = "Espera a que Marco grite...";
    const btnScreamPolo = document.createElement("button");
    btnScreamPolo.innerHTML = "Gritar POLO";
    btnScreamPolo.id = "btnScreamPolo";
    btnScreamPolo.disabled = true;

    start.appendChild(btnScreamPolo);
  }
});

function notifyMarco() {
  console.log("llegaste a notifyMarco");

  fetch("http://localhost:5052/notify-marco", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idPlayer }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      console.log("player de la data:" + data.idPlayer); 
      socket.emit("notify-marco", data.idPlayer);
    })
    .catch((error) => console.error("Error:", error));
}

socket.on("notification", (data) => {
  console.log("Marco scream!");
  console.log(data.message); // bien
  console.log(data.userId); // bien

  if (playerRole === "Polo" || playerRole === "Polo Especial") {
    console.log("esperando cambios en el DOM para Polo"); // Ahora sí lo muestra

    if (data.message === "Marco!!!") {
      wait.innerHTML = `<h2>Marco ha gritado: ${data.message}</h2>`;

      // Espera un momento antes de buscar el botón para asegurarte de que ya se creó en el DOM
      setTimeout(() => {
        const btnScreamPolo = document.getElementById("btnScreamPolo");

        console.log("btnPolo", btnScreamPolo);

        if (btnScreamPolo) {
          btnScreamPolo.disabled = false;
          btnScreamPolo.addEventListener("click", notifyPolo);
        }
      }, 100); // Espera 100ms antes de buscar el botón
    }
  }

  if (playerRole === "Marco") {
    setTimeout(() => {
      const btnScreamMarco = document.getElementById("btnScreamMarco");
      console.log("btnMarco", btnScreamMarco);

      if (btnScreamMarco) {
        btnScreamMarco.style.display = "none";
      }
    }, 100); // Espera 100ms antes de buscar el botón

    console.log("esperando cambios en el DOM para Marco"); // Ahora sí lo muestra

    if (data.message === "Polo!!!") {
      wait.style.display = "block";
      wait.innerHTML = `<h2>Polo ha gritado: ${data.message}</h2>`;

      setTimeout(() => {
        const btnPolo = document.createElement("button");
        btnPolo.id = data.userId;
        btnPolo.classList.add("btnPolo");
        const idBtnPolo = btnPolo.id;
        btnPolo.innerHTML = `Un jugador gritó ${data.message}`;
        start.appendChild(btnPolo);
        btnPolo.addEventListener("click", () => selectPolo(idBtnPolo));
        console.log("este es el id del boton de polo " + idBtnPolo); //si lo hace
        console.log("btnPolo", btnPolo);
      }, 100);
    }
  }

  //Game Over
  if (data.message.includes("Game Over")) {
    results.style.display = "flex";
    const h1 = document.createElement("h1");
    h1.innerHTML = "Game over";
    const h3 = document.createElement("h3");
    const messageContent = data.message.split("Game Over: ")[1] || data.message;
    h3.innerHTML = messageContent;
    results.appendChild(h1);
    results.appendChild(h3);
    start.style.display = "none";
  }
});

function notifyPolo() {
  console.log("llegaste a notifyPolo");

  fetch("http://localhost:5052/notify-polo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idPlayer }), //paso el id del jugador
  })
    .then((response) => response.json())
    .then((data) => {
      setTimeout(() => {
        const btnScreamPolo = document.getElementById("btnScreamPolo");

        if (btnScreamPolo) {
          btnScreamPolo.style.display = "none";
        }
      }, 100); // Espera 100ms antes de buscar el botón
    })
    .catch((error) => console.error("Error:", error));
}

function selectPolo(idPoloSelected) {
  console.log(idPoloSelected); //si lo hace
  console.log("llegaste a selectPolo"); //si lo hace

  fetch("http://localhost:5052/select-polo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: idPlayer,
      username: username,
      poloSelected: idPoloSelected,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => console.error("Error:", error));
}
