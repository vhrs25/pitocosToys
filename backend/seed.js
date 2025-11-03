// backend/seed.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Item from "./models/Item.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/produtos_DB";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Conectado ao Mongo para seed:", MONGO_URI);

  // limpa apenas em ambiente dev — cuidado!
  // await Item.deleteMany({});

  const exemplos = [
    {
      nome: "Boneca Aurora",
      categoria: "Princesas",
      valor_pago: 20.5,
      valor_vendido: null,
      disponivel: true,
      descricao: "Boneca de vinil 30cm, cabelo loiro",
      tags: ["princesa", "vinil"]
    },
    {
      nome: "Boneca Retro 80s",
      categoria: "Vintage",
      valor_pago: 40,
      valor_vendido: 80,
      disponivel: false,
      descricao: "Edição limitada - vendida em bazar",
      data_venda: new Date(),
      tags: ["vintage", "colecionador"]
    },
    {
      nome: "Casinha Rosa",
      categoria: "Acessórios",
      valor_pago: 15,
      valor_vendido: null,
      disponivel: true,
      descricao: "Casinha plástica para bonecas pequenas",
      tags: ["casa", "acessorio"]
    }
  ];

  for (const doc of exemplos) {
    const exists = await Item.findOne({ nome: doc.nome });
    if (!exists) {
      await new Item(doc).save();
      console.log("Inserido:", doc.nome);
    } else {
      console.log("Já existe:", doc.nome);
    }
  }

  // cria índices text se não existirem (o mongoose já os declarou, mas garantimos)
  await Item.syncIndexes();

  console.log("Seed finalizado");
  mongoose.disconnect();
}

run().catch((err) => {
  console.error("Erro no seed:", err);
  mongoose.disconnect();
});
