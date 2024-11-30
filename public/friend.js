// Arkadaş ekleme ile ilgili öğeleri tanımlıyoruz
const friendInput = document.getElementById("add-friend-text");
const addButton = document.getElementById("add-friend-button");
const friendsListContainer = document.getElementById("friends-list");
const infoName = document.getElementById("info-box");

// Arkadaş ekleme butonuna tıklama olayı
addButton.addEventListener("click", async () => {
  const username = friendInput.value;

  if (username) {
    // Sunucuya arkadaş ekleme isteği gönder
    const response = await fetch("/find-friend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const data = await response.json();

    // Sunucudan gelen yanıta göre işlem yap
    if (data.success) {
      alert(`${username} arkadaş olarak eklendi`);

      // Yeni arkadaş UI'ye eklenir
      const friendDiv = document.createElement("div");
      friendDiv.classList.add("user");
      friendDiv.textContent = username;
      friendsListContainer.appendChild(friendDiv);
    } else {
      alert(data.message);
    }
  } else {
    alert("Lütfen bir kullanıcı adı girin.");
  }
});

// Sayfa yüklendiğinde arkadaşları listele
window.addEventListener("DOMContentLoaded", displayFriends);

// Arkadaşları listeleme fonksiyonu
// displayFriends fonksiyonu
async function displayFriends() {
  console.log("Arkadaşlar listesi yükleniyor...");
  try {
    const response = await fetch("/disp-friend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      friendsListContainer.innerHTML = ""; // Önceki arkadaşları temizle

      const friendsList = data.friends; // Sunucudan alınan arkadaşlar
      friendsList.forEach((friend) => {
        const friendButton = document.createElement("button");
        friendButton.classList.add("user");
        friendButton.innerHTML = `<p><b>${friend}</b></p>`;
        friendButton.onclick = () => openChat(friend);

        friendsListContainer.appendChild(friendButton);
      });
    } else {
      alert("Arkadaş listesi alınamadı.");
    }
  } catch (error) {
    console.error("Arkadaş listesi yüklenirken hata oluştu:", error);
    alert("Arkadaş listesi yüklenirken bir hata oluştu.");
  }
}

async function openChat(friend) {
  //console.log(friend);

  infoName.innerHTML = `<p><b>${friend}</b></p>`;
  try {
    const response = await fetch("/get-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ senderName: friend }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("MESAJLAR: ", data.message);
    } else {
      console.log(" erroor "+data.message);
    }
  } catch (err) {
    console.log("Bir Şeyler Ters Gitti " + err);
  }
}
