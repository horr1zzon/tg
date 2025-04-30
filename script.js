// Загружаем игрока
let player = JSON.parse(localStorage.getItem("zombie_player")) || {
  shelter: false,
  food: 100,
  ammo: 30,
  defense: 0,
  survivors: 0,
  lastAttack: null,
};

if (!player.name) {
  promptUniqueName().then((name) => {
    player.name = name;
    save();
    renderName();
  });
}

async function promptUniqueName() {
  let name;
  while (true) {
    name = prompt("Введите уникальное имя выжившего:");
    if (!name) {
      name = "Безымянный";
      break;
    }

    const res = await fetch("http://localhost:5000/check_nickname", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await res.json();

    if (data.available) {
      await fetch("http://localhost:5000/register_nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      break;
    } else {
      alert("⛔ Имя уже занято. Попробуйте другое.");
    }
  }
  return name;
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

function buildBase() {
  if (!player.shelter) {
    player.shelter = true;
    alert("✅ Укрытие построено!");
  } else {
    alert("🏚 У тебя уже есть укрытие.");
  }
  save();
  renderStats();
}

function scavenge() {
  const food = Math.floor(Math.random() * 20 + 10);
  const ammo = Math.floor(Math.random() * 10 + 5);
  player.food += food;
  player.ammo += ammo;
  player.survivors += 1;
  alert(`🔍 Найдено: ${food} еды, ${ammo} патронов, 1 выживший`);
  save();
  renderStats();
}

function defend() {
  player.defense += 1;
  alert("🛡 Оборона усилена!");
  save();
  renderStats();
}

function zombieWave() {
  const now = Date.now();
  const cooldown = 3 * 60 * 60 * 1000; // 3 часа

  if (player.lastAttack && now - new Date(player.lastAttack) < cooldown) {
    alert("❌ Ещё не время следующей волны.");
    return;
  }

  player.lastAttack = now;
  if (player.defense > 0) {
    player.defense -= 1;
    alert("🛡 База выдержала волну зомби!");
  } else {
    const lostFood = Math.min(30, player.food);
    const lostAmmo = Math.min(20, player.ammo);
    player.food -= lostFood;
    player.ammo -= lostAmmo;
    alert(`🧟 База атакована! Потери: -${lostFood} еды, -${lostAmmo} патронов.`);
  }

  save();
  renderStats();
}

function openShop() {
  const existing = document.querySelector(".shop");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.classList.add("shop");
  div.innerHTML = `
    <h2>🏪 Магазин</h2>
    <button id="buy-food">🍖 Купить еду (+100)</button>
    <button id="buy-ammo">🔫 Купить патроны (+50)</button>
    <button id="buy-vip">👑 Купить VIP-защиту (12ч)</button>
    <button id="close-shop">❌ Закрыть</button>
  `;
  document.body.appendChild(div);

  document.getElementById("buy-food").addEventListener("click", buyFood);
  document.getElementById("buy-ammo").addEventListener("click", buyAmmo);
  document.getElementById("buy-vip").addEventListener("click", buyVip);
  document.getElementById("close-shop").addEventListener("click", closeShop);
}

function buyFood() {
  player.food += 100;
  alert("✅ Куплено 100 еды!");
  save();
  renderStats();
}

function buyAmmo() {
  player.ammo += 50;
  alert("✅ Куплено 50 патронов!");
  save();
  renderStats();
}

function buyVip() {
  player.defense += 5;
  alert("👑 VIP защита активирована! +5 к обороне");
  save();
  renderStats();
}

function closeShop() {
  const shop = document.querySelector(".shop");
  if (shop) shop.remove();
}

function openProfile() {
  const existing = document.querySelector(".modal");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.classList.add("modal");
  div.innerHTML = `
  <h2>👤 Профиль игрока</h2>
  <div style="text-align: center;">
    <img id="avatar-preview" src="${player.avatar || "https://via.placeholder.com/100"}" alt="Аватар"><br>
    <div class="custom-upload" onclick="document.getElementById('file-input').click()">📷 Обновить аватар</div>
    <input type="file" id="file-input" accept="image/*">
  </div>
  <p><b>Имя:</b> ${player.name}</p>
  <button class="close-btn" onclick="closeModal()">❌ Закрыть</button>
`;

  document.body.appendChild(div);

  document.getElementById("file-input").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const base64 = event.target.result;
      document.getElementById("avatar-preview").src = base64;
      player.avatar = base64;
      save();
      renderName();
    };
    reader.readAsDataURL(file);
  });
}

function closeModal() {
  const modal = document.querySelector(".modal");
  if (modal) modal.remove();
}

window.addEventListener("DOMContentLoaded", () => {
  renderName();
  renderStats();
});
