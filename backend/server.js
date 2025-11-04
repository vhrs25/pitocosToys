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

/* parse allowed origins from env (ex: "https://pitocos-toys.vercel.app,http://localhost:5173") */
const raw = (process.env.ALLOWED_ORIGINS || "").trim();
const allowedOrigins = raw
  ? raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

/* cors options */
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman/curl/no-origin
    if (allowedOrigins.includes("*")) return callback(null, true); // dev-only
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  optionsSuccessStatus: 204
};

/* Apply CORS middleware globally */
app.use(cors(corsOptions));

/* Handle preflight OPTIONS requests in a way that doesn't use app.options('*') */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    // Let CORS middleware set appropriate headers, then end preflight
    cors(corsOptions)(req, res, () => {
      res.sendStatus(corsOptions.optionsSuccessStatus || 204);
    });
    return;
  }
  next();
});

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
