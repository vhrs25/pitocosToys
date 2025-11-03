// server.js
import express, { json } from "express";
import mongoose, { Schema, model } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import itemsRouter from "./routes/items.js";

dotenv.config();
const app = express();
app.use(json());
app.use(cors());

let MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/produtos_DB";

// Se a MONGODB_URI não apontar o nome do DB, forçamos para produtos_DB
// (ex: mongodb://host:port -> mongodb://host:port/produtos_DB)
try {
  const hasDB = /\/[a-zA-Z0-9_\-]+(\?|$)/.test(MONGO_URI);
  if (!hasDB) {
    // remove trailling slashes e query
    MONGO_URI = MONGO_URI.replace(/\/*(\?.*)?$/, "") + "/produtos_DB";
  }
} catch (e) {
  // ignore
}

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB conectado em", MONGO_URI))
  .catch((err) => {
    console.error("Erro ao conectar MongoDB:", err.message);
    process.exit(1);
  });

// rota básica
app.get("/", (req, res) =>
  res.json({ ok: true, msg: "API pitocosToys backend" })
);

// rotas de items
app.use("/api/items", itemsRouter);

// erro padrão
app.use((err, req, res, next) => {
  console.error("Erro global:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(process.env.PORT || 3003, () =>
  console.log(`API rodando em http://localhost:${process.env.PORT || 3003}`)
);
