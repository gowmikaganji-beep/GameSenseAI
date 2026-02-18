/* =========================
   LOGIN
========================= */
function login() {
  const user = document.getElementById("username").value.trim();
  if (!user) {
    alert("Enter username");
    return;
  }
  localStorage.setItem("user", user);
  window.location.href = "dashboard.html";
}

/* =========================
   THEME TOGGLE
========================= */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

(function loadTheme() {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
  }
})();

/* =========================
   VOICE INPUT 🎙️
========================= */
function startVoice() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice not supported in this browser");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";

  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    getRecommendation(text);
  };

  recognition.start();
}

/* =========================
   MOOD HISTORY
========================= */
function saveMood(mood, game) {
  const history = JSON.parse(localStorage.getItem("moods")) || [];
  history.push({
    mood,
    game,
    time: new Date().toLocaleString()
  });
  localStorage.setItem("moods", JSON.stringify(history));
}

/* =========================
   AI RECOMMENDATION
========================= */
async function getRecommendation(mood) {
  const output = document.getElementById("ai-output");
  output.innerText = "🤖 AI is thinking...";

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    const res = await fetch("/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
      signal: controller.signal
    });

    const data = await res.json();
    if (!data.reply) throw new Error("AI error");

    output.innerText = data.reply;

    const game = extractGameName(data.reply);
    saveMood(mood, game);
    loadTrailer(game);

  } catch (err) {
    const game = fallbackGame(mood);
    output.innerText = `🎮 Recommended Game: ${game} (offline AI)`;
    saveMood(mood, game);
    loadTrailer(game);
  }
}

/* =========================
   FALLBACK AI
========================= */
function fallbackGame(mood) {
  mood = mood.toLowerCase();
  if (mood.includes("relax")) return "Stardew Valley";
  if (mood.includes("competitive")) return "Valorant";
  if (mood.includes("story")) return "Red Dead Redemption 2";
  return "Minecraft";
}

/* =========================
   EXTRACT GAME NAME
========================= */
function extractGameName(text) {
  const games = [
    "Valorant",
    "Minecraft",
    "Stardew Valley",
    "Red Dead Redemption 2",
    "GTA V",
    "The Last of Us",
    "League of Legends"
  ];

  for (let g of games) {
    if (text.toLowerCase().includes(g.toLowerCase())) {
      return g;
    }
  }
  return "Minecraft";
}

/* =========================
   SAFE YOUTUBE TRAILERS
========================= */
function loadTrailer(game) {
  const trailer = document.getElementById("trailer");

  // ✅ Embed-safe official trailers
  const trailers = {
    "Valorant": "e_E9W2vsRbQ",
    "Minecraft": "MmB9b5njVbA",
    "Stardew Valley": "ot7uXNQskhs",
    "Red Dead Redemption 2": "eaW0tYpxyp0",
    "GTA V": "QkkoHAzjnUs",
    "The Last of Us": "W01L70IGBgE",
    "League of Legends": "IzMnCv_lPxI"
  };

  const videoId = trailers[game];

  if (!videoId) {
    trailer.innerHTML = `
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
        game + " official gameplay trailer"
      )}" target="_blank" style="color:#38bdf8">
        ▶ Watch ${game} trailer on YouTube
      </a>
    `;
    return;
  }

  trailer.innerHTML = `
    <iframe
      width="420"
      height="250"
      src="https://www.youtube.com/embed/${videoId}?rel=0"
      frameborder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>

    <p style="margin-top:8px">
      <a href="https://www.youtube.com/watch?v=${videoId}"
         target="_blank"
         style="color:#38bdf8; text-decoration:none;">
         🔗 Open on YouTube
      </a>
    </p>
  `;
}
