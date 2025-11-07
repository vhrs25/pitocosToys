// backend/seed.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import path from "path";
import fs from "fs/promises"; // ESM
import Item from "./models/Item.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/produtos_DB";
const SEED_FILE = path.resolve(
  new URL(".", import.meta.url).pathname,
  "seed.json"
);

// opcional: node seed.js --drop
const args = process.argv.slice(2);
const DO_DROP = args.includes("--drop") || process.env.SEED_DROP === "1";

function asNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeItem(raw) {
  // Remove _id if present so Mongo gere um novo
  const {
    _id, // eslint-disable-line no-unused-vars
    id, // eslint-disable-line no-unused-vars
    __v, // eslint-disable-line no-unused-vars
    data_cadastro,
    ...rest
  } = raw;

  return {
    nome: rest.nome ? String(rest.nome).trim() : undefined,
    categoria: rest.categoria ? String(rest.categoria).trim() : "",
    valor_pago: asNumber(rest.valor_pago ?? rest.valorPago) ?? 0,
    valor_vendido: asNumber(rest.valor_vendido ?? rest.valorVendido),
    valor_pedido: asNumber(rest.valor_pedido ?? rest.valorPedido),
    disponivel:
      typeof rest.disponivel === "boolean"
        ? rest.disponivel
        : rest.valor_vendido == null && rest.valorVendido == null,
    descricao: rest.descricao ? String(rest.descricao) : "",
    tags: Array.isArray(rest.tags)
      ? rest.tags.map((t) => String(t).trim())
      : typeof rest.tags === "string"
      ? rest.tags
          .split(/[;,|/]+/)
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    data_venda:
      rest.data_venda || rest.dataVenda
        ? new Date(rest.data_venda ?? rest.dataVenda)
        : null,
    ativo: typeof rest.ativo === "boolean" ? rest.ativo : true,
    data_cadastro: data_cadastro || new Date().toISOString()
  };
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Conectado ao Mongo para seed:", MONGO_URI);

  let raw;
  try {
    raw = await fs.readFile(SEED_FILE, "utf8");
  } catch (e) {
    console.error("Não foi possível ler seed.json em", SEED_FILE, e);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("seed.json tem formato inválido (JSON).", e);
    process.exit(1);
  }

  // aceita { items: [...] } ou [...] diretamente
  const itemsArray = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.items)
    ? parsed.items
    : null;
  if (!itemsArray) {
    console.error("seed.json deve ser um array ou { items: [] }");
    process.exit(1);
  }

  if (DO_DROP) {
    console.log("Dropando coleção produtos (deleteMany) — cuidado!");
    await Item.deleteMany({});
  }

  // sincroniza índices antes (opcional)
  await Item.syncIndexes();

  let inserted = 0;
  for (const rawItem of itemsArray) {
    const doc = normalizeItem(rawItem);
    if (!doc.nome) {
      console.log("Pulando item sem nome:", rawItem);
      continue;
    }

    // evita duplicar pelo nome (mesmo comportamento do seed antigo)
    const exists = await Item.findOne({ nome: doc.nome }).lean();
    if (exists) {
      console.log("Já existe (pulando):", doc.nome);
      continue;
    }

    try {
      await new Item(doc).save();
      inserted++;
      console.log("Inserido:", doc.nome);
    } catch (e) {
      console.error("Erro ao inserir", doc.nome, e.message || e);
    }
  }

  console.log("Seed finalizado — total inseridos:", inserted);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Erro no seed:", err);
  mongoose.disconnect().finally(() => process.exit(2));
});
