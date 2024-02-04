const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

// Middleware för att tolka JSON i förfrågningar
app.use(express.json());

// En grundläggande route som skickar ett svar när den får en GET-förfrågan till root ('/')
app.get("/", (req, res) => {
  res.send("Välkommen till min receptbok backend!");
});

// Starta servern så att den lyssnar på den angivna porten
app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
