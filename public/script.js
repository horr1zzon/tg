let player = JSON.parse(localStorage.getItem("zombie_player")) || {
  shelter: false,
  food: 100,
  ammo: 30,
  defense: 0,
  survivors: 0,
  lastAttack: null,
  name: null
};

async function ensurePlayerHasName() {
  const tg = window.Telegram.WebApp;
  const telegram_id = tg?.initDataUnsafe?.user?.id?.toString();
  const first_name = tg?.initDataUnsafe?.user?.first_name?.trim();

  if (!telegram_id || !first_name) {
    alert("Ошибка: не удалось получить данные Telegram.");
    return;
  }

  const res = await fetch("/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegram_id })
  });

  const data = await res.json();

  if (data.status === "ok") {
    player.name = data.name;
  } else {
    const checkRes = await fetch("/check_nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: first_name })
    });

    const checkData = await checkRes.json();
    if (checkData.available) {
      await fetch("/register_nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_id, name: first_name })
      });
      player.name = first_name;
    } else {
      player.name = first_name + Math.floor(Math.random() * 1000); // добавим цифру, если имя занято
    }
  }

  save();
  renderName();
  renderStats();
}

function save() {
  localStorage.setItem("zombie_player", JSON.stringify(player));
}

function renderStats() {
  document.getElementById("stats").innerHTML = `
    🛖 Укрытие: ${player.shelter ? "✅" : "❌"}<br>
    🍖 Еда: ${player.food}<br>
    🔫 Патроны: ${player.ammo}<br>
    🛡 Оборона: ${player.defense}<br>
    🧍 Выжившие: ${player.survivors}
  `;
}

function renderName() {
  const nameElement = document.getElementById("main-name");
  const avatarElement = document.getElementById("main-avatar");

  if (nameElement && avatarElement) {
    nameElement.textContent = player.name || "Безымянный";
    avatarElement.src = player.avatar || "https://via.placeholder.com/60";
  }
}

window.addEventListener("DOMContentLoaded", ensurePlayerHasName);
