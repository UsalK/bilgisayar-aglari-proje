const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middlewares/authMiddleWare");
const http = require("http");
const { Server } = require("socket.io");
const newUserController = require("./controllers/newUserController");
const messageController = require("./controllers/messageController");
const friendController = require("./controllers/friendController");

const app = express();

const dbURL =
  "mongodb+srv://asd:123@nodejs-database.guyh4.mongodb.net/?retryWrites=true&w=majority&appName=nodejs-database";

mongoose
  .connect(dbURL)
  .then(() => console.log("Database bağlantısı başarılı"))
  .catch((err) => console.log("DATABASE BAĞLANTISI SAĞLANAMADI: " + err));

// Socket.IO ile HTTP sunucusu oluşturma
const server = http.createServer(app);
const io = new Server(server);



//!YENİ SOCKET AYARLARI

const userSockets = {}; // Kullanıcı adı -> socket.id eşleşmesini tutacak

io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı: " + socket.id);

  // Kullanıcının adını oturumdan al ve socket ile eşleştir
  socket.on("register", (username) => {
    userSockets[username] = socket.id;
    console.log(`${username} socket ID ile eşleştirildi: ${socket.id}`);
  });

  // Kullanıcı bağlantıyı kapattığında socket eşleştirmesini kaldır
  socket.on("disconnect", () => {
    for (const [username, id] of Object.entries(userSockets)) {
      if (id === socket.id) {
        delete userSockets[username];
        console.log(`${username} bağlantıyı kesti.`);
        break;
      }
    }
  });

  // Özel mesajlaşma
  socket.on("private_message", (data) => {
    const { recipient, message } = data;
    const recipientSocketId = userSockets[recipient];

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("private_message", {
        sender: data.sender,
        message,
      });
    } else {
      console.log("Alıcı şu anda çevrimdışı.");
    }
  });
});


//!YENİ SOCKET AYARLARI

// Rotalar
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

server.listen(3000, () => {
  console.log("3000 portundan dinleniyor");
});

app.get("*", checkUser);

app.get("/", (req, res) => {
  //res.cookie("jwt", "", { maxAge: 1 });
  res.render("index", {
    title: "Ana Sayfa",
  });
});

app.get("/chat", requireAuth, (req, res) => {
  res.render("chat", { title: "Chat",loggedUser:res.locals.user });
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
app.post("/send-message", requireAuth, messageController.chat);

//?-----------------------------------------------------------------------------------------------

app.post("/find-friend", requireAuth, friendController.findFriend);

app.post("/disp-friend", requireAuth, friendController.getFriends);

//?-----------------------------------------------------------------------------------------------

app.post("/get-chat", requireAuth, messageController.getChat);

app.post("/unread-messages",requireAuth,messageController.getUnreadMessages)

app.post("/mark-as-read",requireAuth,messageController.markAsRead)

//! 404 sayfası
app.use((req, res) => {
  res.status(404).render("404", { title: "Sayfa Bulunamadı" });
});

module.exports = setIO();
