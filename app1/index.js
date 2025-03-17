const socket = io("http://localhost:5052", { path: "/rea-time" });

const registro = document.getElementById("pantalla-login");
const start = document.getElementById("pantalla-juego");
const nameInput = document.getElementById("input-login")
document.getElementById("button-login").addEventListener("click",registroUsuarios);


start.style.display = "none";


// document.getElementById("get-btn").addEventListener("click", getUsers);

function registroUsuarios () 
{
    fetch ("http://localhost:5052/registro/" ,{
        method: "POST",
        headers: {  "Content-Type": "application/json"},
        body: JSON.stringify({
          name: nameInput.value, })
        })
         .then((response)=> response.json())
         .then((data) => {
            alert(data.message);
          })
          .catch((error) => console.error("Error:", error));

}

function getUsers() {
  fetch("http://localhost:5052/users")
    .then((response) => response.json())
    .then((data) => console.log("get response", data))
    .catch((error) => console.error("Error:", error));
}

const sendCoordenates = () => {
  socket.emit("coordenadas", { x: 123, y: 432 });
};

// document.getElementById("event-btn").addEventListener("click", sendCoordenates);
