import express from "express";
import cors from "cors";
import { scrapeAmazon } from "./scrapeAmazon.ts";

// Inicializa o Express
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Habilita o CORS (segurança) e JSON no corpo das requests e responses
app.use(cors());
app.use(express.json());

// Endpoint GET para realizar a busca na Amazon
app.get("/api/scrape", async (req, res) => {
  // Valida a palavra de busca
  const keyword = String(req.query.keyword || "");
  if (!keyword.trim()) return res.status(400).json({ error: "Busca incompleta" });

  try {
    // Busca os produtos na Amazon
    const productDataList = await scrapeAmazon(keyword)

    res.json({ keyword, results: productDataList, count: productDataList.length });
  } catch (err: any) {
    res.status(err?.response?.status || 500).json({ error: "Erro na busca de dados", details: err?.message });
  }
});

app.listen(PORT, () => console.log(`API em http://localhost:${PORT}`));