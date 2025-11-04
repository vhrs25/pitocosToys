// server.js
import express, { json } from "express";
import mongoose, { Schema, model } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import itemsRouter from "./routes/items.js";

dotenv.config();
const app = express();
app.use(json());

let MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/produtos_DB";

// /**
//  * ALLOWED_ORIGINS: string com origens separadas por vírgula,
//  * ex: "https://pitocos-toys.vercel.app,http://localhost:5173"
//  * Configure essa variável no painel do Render (Environment).
//  */
// const raw = (process.env.ALLOWED_ORIGINS || "").trim();
// const allowedOrigins = raw
//   ? raw
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean)
//   : [];

// /**
//  * CORS middleware seguro:
//  * - permite requests sem origin (postman, curl) => cb(null,true)
//  * - permite explicitamente as origens listadas
//  * - se quiser permitir tudo temporariamente: set ALLOWED_ORIGINS="*"
//  */
// const corsOptions = {
//   origin: function (origin, callback) {
//     // origin === undefined -> requests server-to-server, Postman, curl
//     if (!origin) return callback(null, true);

//     // if '*' present in ALLOWED_ORIGINS, allow all origins (use only em dev)
//     if (allowedOrigins.includes("*")) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     // not allowed
//     return callback(new Error("Not allowed by CORS"));
//   },
//   methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Accept"],
//   optionsSuccessStatus: 204
// };

// app.use(cors(corsOptions));

// // IMPORTANT: allow preflight for all routes
// app.options("*", cors(corsOptions));

app.use(cors());
app.options("*", cors());

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
