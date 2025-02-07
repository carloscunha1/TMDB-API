import { Router } from 'express';
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json' assert { type: 'json' };
import { adicionarFilme, listarFilmes, detalhesFilme, atualizarEstadoFilme, avaliarFilme, historicoFilme, listarLogs } from '../controller/filmeController.js';

const app = Router();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.post('/filme', adicionarFilme);
app.get('/filme', listarFilmes);
app.get('/filme/:id', detalhesFilme);
app.put('/filme/:id/estado', atualizarEstadoFilme);
app.post('/filme/:id/avaliar', avaliarFilme);
app.get('/filme/:id/historico', historicoFilme);


app.get('/logs', listarLogs);


app.get('/dados', async (req, res) => {
    try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

export default app;
