import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/dbSetUp.js';
import 'dotenv/config';

const ID_USUARIO = 1;

const registrarLog = async (metodo, url, status, uuid_filme = null) => {
  try {
    await pool.query(
      'INSERT INTO logs (metodo, url, status, timestamp, uuid_filme) VALUES (?, ?, ?, ?, ?)',
      [metodo, url, status, new Date(), uuid_filme]
    );
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};

export const adicionarFilme = async (req, res) => {
  const { nome } = req.body;

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: { api_key: process.env.TMDB_API_KEY, language: 'pt-BR', query: nome },
    });

    if (!response.data.results.length) {
      await registrarLog('POST', '/filme', 404);
      return res.status(404).json({ error: 'Filme não encontrado na API externa' });
    }

    const filme = response.data.results[0];
    const { id, title, overview, release_date } = filme;

    const genresResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'pt-BR' },
    });
    const genres = genresResponse.data.genres;

    const movieUUID = uuidv4();

    await pool.query(
      'INSERT INTO filmes (uuid, id_usuario, id_tmdb, titulo, sinopse, ano_lancamento, genero, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [movieUUID, ID_USUARIO, id, title, overview, release_date.split('-')[0], JSON.stringify(genres), 'a assistir']
    );

    await registrarLog('POST', '/filme', 201, movieUUID);
    res.json({ uuid: movieUUID, id_usuario: ID_USUARIO, title, overview, release_date, genres });
  } catch (error) {
    console.error('Erro ao adicionar filme:', error);
    await registrarLog('POST', '/filme', 500);
    res.status(500).json({ error: 'Erro ao adicionar filme', details: error.message });
  }
};

export const listarFilmes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM filmes');
    await registrarLog('GET', '/filmes', 200);
    res.json(rows);
  } catch (error) {
    await registrarLog('GET', '/filmes', 500);
    res.status(500).json({ error: 'Erro ao listar filmes' });
  }
};

export const detalhesFilme = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM filmes WHERE id_tmdb = ?', [id]);
    if (rows.length === 0) {
      await registrarLog('GET', `/filme/${id}`, 404);
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    await registrarLog('GET', `/filme/${id}`, 200);
    res.json(rows[0]);
  } catch (error) {
    await registrarLog('GET', `/filme/${id}`, 500);
    res.status(500).json({ error: 'Erro ao buscar detalhes do filme' });
  }
};

export const atualizarEstadoFilme = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ['a assistir', 'assistido', 'avaliado', 'recomendado', 'nao recomendado'];
  if (!estadosPermitidos.includes(estado.toLowerCase())) {
    await registrarLog('PUT', `/filme/estado/${id}`, 400);
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const [filme] = await pool.query('SELECT estado FROM filmes WHERE uuid = ?', [id]);
    if (filme.length === 0) {
      await registrarLog('PUT', `/filme/estado/${id}`, 404);
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    const estadoAnterior = filme[0].estado;

    await pool.query('UPDATE filmes SET estado = ? WHERE uuid = ?', [estado, id]);

    await pool.query(
      'INSERT INTO historico (uuid_filme, id_usuario, acao, estado_anterior, estado_novo, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [id, ID_USUARIO, 'estado alterado', estadoAnterior, estado, new Date()]
    );

    await registrarLog('PUT', `/filme/estado/${id}`, 200);
    res.json({ message: `Filme movido para '${estado}'` });
  } catch (error) {
    await registrarLog('PUT', `/filme/estado/${id}`, 500);
    res.status(500).json({ error: 'Erro ao atualizar estado do filme' });
  }
};

export const avaliarFilme = async (req, res) => {
  const { id } = req.params;
  const { nota } = req.body;

  if (nota < 0 || nota > 5) {
    await registrarLog('PUT', `/filme/avaliar/${id}`, 400);
    return res.status(400).json({ error: 'Nota deve ser entre 0 e 5' });
  }

  try {
    const [filme] = await pool.query('SELECT estado FROM filmes WHERE uuid = ?', [id]);

    if (filme.length === 0) {
      await registrarLog('PUT', `/filme/avaliar/${id}`, 404);
      return res.status(404).json({ error: 'Filme não encontrado' });
    }

    const estadoAnterior = filme[0].estado;

    await pool.query('UPDATE filmes SET nota = ?, estado = ? WHERE uuid = ?', [nota, 'avaliado', id]);

    await pool.query(
      'INSERT INTO historico (uuid_filme, id_usuario, acao, estado_anterior, estado_novo, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [id, ID_USUARIO, 'estado alterado', estadoAnterior, 'avaliado', new Date()]
    );

    await registrarLog('PUT', `/filme/avaliar/${id}`, 200);

    res.json({ message: `Filme avaliado com nota ${nota}` });
  } catch (error) {
    await registrarLog('PUT', `/filme/avaliar/${id}`, 500);
    res.status(500).json({ error: 'Erro ao avaliar o filme' });
    console.error(error);
  }
};

export const historicoFilme = async (req, res) => {
  const { id } = req.params;

  try {
    const [filme] = await pool.query('SELECT uuid FROM filmes WHERE uuid = ?', [id]);
    
    if (filme.length === 0) {
      await registrarLog('GET', `/filme/historico/${id}`, 404);
      return res.status(404).json({ error: 'Filme não está cadastrado' });
    }

    const [rows] = await pool.query('SELECT * FROM historico WHERE uuid_filme = ?', [id]);
    await registrarLog('GET', `/filme/historico/${id}`, 200);

    res.json(rows);
  } catch (error) {
    await registrarLog('GET', `/filme/historico/${id}`, 500);
    res.status(500).json({ error: 'Erro ao buscar histórico do filme' });
  }
};

export const listarLogs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC');
    await registrarLog('GET', '/logs', 200);
    res.json(rows);
  } catch (error) {
    await registrarLog('GET', '/logs', 500);
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
};
