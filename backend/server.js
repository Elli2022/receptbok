require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3001;

// Middleware för att tolka JSON i förfrågningar
app.use(express.json());

// Anslut till MongoDB med Mongoose
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

// En grundläggande route som skickar ett svar när den får en GET-förfrågan till root ('/')
app.get("/", (req, res) => {
  res.send("Välkommen till min receptbok backend!");
});

// Starta servern så att den lyssnar på den angivna porten
app.listen(port, () => {
  console.log(`Servern körs på port ${port}`);
});
