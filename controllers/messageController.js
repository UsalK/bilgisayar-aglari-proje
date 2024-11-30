const Message = require("../models/Message");
const User = require("../models/newUser");

let io;

function setIO(ioInstance) {
  io = ioInstance;
}

const chat = (req, res) => {
  const message = {
    sender: res.locals.user.username,
    content: req.body.message.content,
    timestamp: new Date(),
  };

  saveMessage(
    req.body.message.content,
    res.locals.user.username,
    req.body.message.recieverName
  );

  io.emit("chat", message);

  res.status(200).send({ success: true });
};

async function getID(senderName, recieverName) {
  const sender = await User.findOne({ username: senderName });
  const reciever = await User.findOne({ username: recieverName });

  if (!sender || !reciever) {
    throw new Error("Gönderici veya alıcı bulunamadı.");
  }

  return { sender: sender._id, reciever: reciever._id };
}

const getChat = async (req, res) => {
  try {
    const ID = await getID(res.locals.user.username, req.body.senderName);

    const message = await Message.find({
      $or: [
        { sender_id: ID.sender, receiver_id: ID.reciever },
        { sender_id: ID.reciever, receiver_id: ID.sender },
      ],
    }).sort({ created_at: 1 })
    .select("content -_id")

    res.status(200).json({ success: true, message });
  } catch (err) {
    console.log(err);

    res.status(500).json({ success: false, message: "MESAJ HATASI" });
  }
};

async function saveMessage(content, senderName, recieverName) {
  const ID = await getID(senderName, recieverName);

  const message = new Message({
    sender_id: ID.sender,
    receiver_id: ID.reciever,
    content: content,
  });

  await message
    .save()
    .then(console.log("mesaj kaydedildi"))
    .catch((err) => {
      console.log(err);
    });
}

module.exports = { setIO, chat, getChat };
