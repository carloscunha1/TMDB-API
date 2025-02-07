import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createDatabaseAndTables } from './db/dbSetUp.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());

app.use('/', apiRoutes);

createDatabaseAndTables().then(() => {
    console.log("Banco de dados pronto!");
    
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}!`);
    });
}).catch((error) => {
    console.error("Erro ao configurar o banco de dados:", error);
});
