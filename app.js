const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middlewares/authMiddleWare");
const http = require("http");
const { Server } = require("socket.io");
const newUserController = require("./controllers/newUserController");
const messageController = require("./controllers/messageController");
const friendController = require("./controllers/friendController")

const app = express();

const dbURL =
  "mongodb+srv://asd:123@nodejs-database.guyh4.mongodb.net/?retryWrites=true&w=majority&appName=nodejs-database";

mongoose
  .connect(dbURL)
  .then((result) => console.log("Database bağlantısı başarılı"))
  .catch((err) => console.log(err));

// Socket.IO ile HTTP sunucusu oluşturma
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Kullanıcı bağlantısı sağlandı: " + socket.id);

  socket.on("chat", (data) => {
    io.emit("chat", data);
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " kullanıcısı ayrıldı");
  });
});

// Rotalar
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // JSON verilerini işlemek için gerekli
app.use(cookieParser());

server.listen(3000, () => {
  console.log("3000 portundan dinleniyor");
});

app.get("*", checkUser);

app.get("/", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.render("index", {
    title: "Ana Sayfa",
  });
});

app.get("/chat", requireAuth, (req, res) => {
  res.render("chat", { title: "Chat" });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Giriş Yap" });
});

app.get("/logout", newUserController.logOutUser);

app.post("/login", newUserController.loginUser);

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Kayıt Ol" });
});

app.post("/signup", newUserController.signupUser);

function setIO() {
  return io;
}

messageController.setIO(setIO());

// Yeni rota: Mesaj gönderme
app.post("/send-message",requireAuth,messageController.chat)

//?-----------------------------------------------------------------------------------------------

app.post('/find-friend', requireAuth,friendController.findFriend)

app.post('/disp-friend',requireAuth,friendController.getFriends)

//?-----------------------------------------------------------------------------------------------

app.post('/get-chat',requireAuth,messageController.getChat)

//! 404 sayfası
app.use((req, res) => {
  res.status(404).render("404", { title: "Sayfa Bulunamadı" });
});

module.exports = setIO();
