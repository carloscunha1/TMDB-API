import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const createDatabaseAndTables = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS filmes (
        uuid VARCHAR(36) PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_tmdb INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        sinopse TEXT,
        ano_lancamento INT,
        genero JSON,
        estado ENUM('a assistir', 'assistido', 'avaliado', 'recomendado', 'nao recomendado') NOT NULL DEFAULT 'a assistir',
        nota INT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS historico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid_filme VARCHAR(36) NOT NULL,
        id_usuario INT NOT NULL,
        acao ENUM('criado', 'estado alterado') NOT NULL,
        estado_anterior ENUM('a assistir', 'assistido', 'avaliado', 'recomendado', 'nao recomendado') NULL,
        estado_novo ENUM('a assistir', 'assistido', 'avaliado', 'recomendado', 'nao recomendado') NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uuid_filme) REFERENCES filmes(uuid) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metodo VARCHAR(10) NOT NULL,
        url VARCHAR(255) NOT NULL,
        status INT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uuid_filme VARCHAR(36) NULL,
        FOREIGN KEY (uuid_filme) REFERENCES filmes(uuid) ON DELETE SET NULL
      )
    `);

    console.log("Banco de dados e tabelas configurados!");
    await connection.end();
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
  }
};

export { pool, createDatabaseAndTables };
