const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const OPENAI_KEY = "PASTE_YOUR_OPENAI_KEY";

app.post("/ai", async (req, res) => {
  try {
    const mood = req.body.mood;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You recommend video games." },
          { role: "user", content: `Suggest one ${mood} game with short reason` }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.json({ reply: "AI error. Check API key." });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.json({ reply: "Server error: " + err.message });
  }
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
