const socket = io(); // Socket.IO bağlantısını başlat

document.getElementById("send-button").addEventListener("click", async () => {
  

  
  
  const messageContent = {

    content: document.getElementById("text-box").value,
    recieverName :document.getElementById('info-box').innerText

  }

  if (messageContent.content.trim() === "") {
    alert("Boş mesaj gönderilemez.");
    return;
  }

  try {
    const response = await fetch("/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageContent }),
    });

    const data = await response.json();
    if (data.success) {
      console.log("Mesaj başarıyla gönderildi");
      document.getElementById("text-box").value = ""; // Mesaj kutusunu temizle
    } else {
      console.error("Mesaj gönderim hatası:", data.error);
    }
  } catch (error) {
    console.error("Mesaj gönderim hatası:", error);
  }
});

// Sunucudan gelen mesajları dinle
socket.on("chat", (data) => {
  const display = document.getElementById("display");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat");

  // Mesaj içeriği
  messageElement.innerHTML = `<b>${data.sender}:</b> ${data.content}`;
  display.appendChild(messageElement);

  // Otomatik olarak en yeni mesaja kaydır
  display.scrollTop = display.scrollHeight;
});
