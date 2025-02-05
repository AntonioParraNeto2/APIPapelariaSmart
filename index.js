const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nome único para evitar conflitos
  },
});
const upload = multer({ storage });

// Verifica se o arquivo JSON já existe
const DATA_FILE = "database.json";
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([])); // Cria um JSON inicial vazio
}

// Função para ler o banco de dados JSON
const readDatabase = () => {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Função para salvar os dados no JSON
const writeDatabase = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Rota para listar os dados
app.get("/data", (req, res) => {
  const data = readDatabase();
  res.json(data);
});

// Rota para adicionar novos dados
app.post("/data", (req, res) => {
  const data = readDatabase();
  const newItem = { id: Date.now(), ...req.body };
  data.push(newItem);
  writeDatabase(data);
  res.status(201).json(newItem);
});

// Rota para deletar um item por ID
app.delete("/data/:id", (req, res) => {
  let data = readDatabase();
  data = data.filter((item) => item.id != req.params.id);
  writeDatabase(data);
  res.json({ message: "Item removido" });
});

// Rota para fazer upload de arquivos
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

  res.json({ message: "Arquivo salvo", filename: req.file.filename });
});

// Servir arquivos da pasta "uploads"
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
