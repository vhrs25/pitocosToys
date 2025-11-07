// backend/routes/items.js
import express from "express";
import Item from "../models/Item.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/items  -> lista com filtros / paginação / busca
router.get("/", async (req, res) => {
  try {
    const {
      q,
      categoria,
      disponivel,
      page = 1,
      limit = 50,
      sortBy = "data_cadastro",
      sortDir = "desc",
      ativo
    } = req.query;

    const filter = {};
    // filtrar por ativo se informado (true/false)
    if (typeof ativo !== "undefined") filter.ativo = ativo === "true";
    else filter.ativo = true; // por padrão só traz ativos

    if (categoria) filter.categoria = categoria;
    if (disponivel !== undefined) filter.disponivel = disponivel === "true";

    if (q) {
      filter.$text = { $search: q };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortDir === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      Item.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Item.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar produtos" });
  }
});

router.get("/items", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
    const q = (req.query.q || "").trim();
    const ativo = req.query.ativo; // 'true' / 'false' ou undefined

    const filter = {};

    if (typeof ativo !== "undefined") {
      // interpretar 'true' -> somente ativos; 'false' -> somente inativos
      if (ativo === "true") filter.ativo = true;
      else if (ativo === "false") filter.ativo = false;
    }

    if (q) {
      // busca text (usa índice text)
      filter.$text = { $search: q };
    }

    // contar total
    const total = await Item.countDocuments(filter);

    // projeção: se usar $text e quiser relevância ordene por score
    let query = Item.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    if (q) {
      // incluir score e ordenar por score desc
      query = Item.find(filter, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      // ordem padrão (data cadastro desc)
      query = query.sort({ data_cadastro: -1 });
    }

    const items = await query.lean();
    return res.json({ items, total, page, limit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: "Item não encontrado" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar item" });
  }
});

// POST /api/items  -> criar item
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    // permitir que o front envie 'ativo' ao criar (produto ainda não chegou)
    const item = new Item(payload);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao criar item", details: err.message });
  }
});

// PATCH /api/items/:id -> atualiza campos parciais
router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });
    const update = req.body;
    delete update._id;
    const item = await Item.findByIdAndUpdate(id, update, { new: true });
    if (!item) return res.status(404).json({ error: "Item não encontrado" });
    res.json(item);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: "Erro ao atualizar item", details: err.message });
  }
});

// PATCH /api/items/:id/mark-sold -> marcar vendido (garante disponivel=false e ativo=true)
router.patch("/:id/mark-sold", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });

    const { valor_vendido, data_venda } = req.body;
    const upd = { disponivel: false, ativo: true }; // vendido mantém ativo = true

    if (typeof valor_vendido !== "undefined" && valor_vendido !== null) {
      // garantir número
      const valorNum = Number(valor_vendido);
      if (Number.isFinite(valorNum)) upd.valor_vendido = valorNum;
    }

    if (data_venda) upd.data_venda = new Date(data_venda);

    const item = await Item.findByIdAndUpdate(id, { $set: upd }, { new: true });
    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    res.json(item);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: "Erro ao marcar vendido", details: err.message });
  }
});

// PATCH /api/items/:id/toggle-active -> alterna ativo true/false (soft delete / reativar)
router.patch("/:id/toggle-active", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ error: "Item não encontrado" });
    item.ativo = !item.ativo;
    // se reativando, torna disponível por padrão
    if (item.ativo) item.disponivel = true;
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Erro ao alternar ativo", details: err.message });
  }
});

// DELETE /api/items/:id -> hard delete (remove do banco)
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID inválido" });
    const item = await Item.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ error: "Item não encontrado" });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar item" });
  }
});

export default router;
