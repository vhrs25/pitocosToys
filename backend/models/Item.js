// backend/models/Item.js
import { Schema, model } from "mongoose";

const itemSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true, index: true },
    valor_pago: { type: Number, default: 0 },
    valor_vendido: { type: Number, default: null },
    disponivel: { type: Boolean, default: true, index: true },
    descricao: { type: String, default: "" },
    tags: { type: [String], default: [] },
    data_cadastro: { type: Date, default: Date.now },
    data_venda: { type: Date, default: null },
    ativo: { type: Boolean, default: true } // soft delete support
  },
  {
    collection: "produtos" // força o nome da coleção para "produtos"
  }
);

// Texto simples em campos úteis para buscas
itemSchema.index(
  { nome: "text", descricao: "text", tags: "text" },
  { default_language: "portuguese" }
);

// Evita a redefinição do modelo se ele já existir
export default model("produtos", itemSchema);
