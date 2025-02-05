require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const filmeController = require('./filmeController');
const { createDatabaseAndTables } = require('./dbSetUp');

const app = express();
const PORT = process.env.PORT; // Garante que tenha um valor padrão caso PORT não esteja no .env

app.use(cors());
app.use(express.json());

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas de filmes
app.post('/filme', filmeController.adicionarFilme);
app.get('/filme', filmeController.listarFilmes);
app.get('/filme/:id', filmeController.detalhesFilme);
app.put('/filme/:id/estado', filmeController.atualizarEstadoFilme);
app.post('/filme/:id/avaliar', filmeController.avaliarFilme);
app.get('/filme/:id/historico', filmeController.historicoFilme);

// Rota de logs
app.get('/logs', filmeController.listarLogs);

// Rota de teste que consome uma API externa
app.get('/dados', async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// Criar banco de dados e iniciar o servidor
createDatabaseAndTables().then(() => {
    console.log("Banco de dados pronto!");
    
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta 3000!`);
    });
}).catch((error) => {
    console.error("Erro ao configurar o banco de dados:", error);
});
