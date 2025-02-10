# 🎮 API de Filmes - TMDB

Esta API permite buscar filmes na API pública do **The Movie Database (TMDB)**, armazená-los em um banco de dados MySQL que atua como lista de desejos de filmes e gerenciar seu estado ("Para assistir", "Assistido", "Avaliado" etc.).

---

## 🚀 Tecnologias Utilizadas
- **Node.js**
- **Express.js**
- **MySQL**
- **Axios** (para requisições HTTP)
- **UUID** (para identificação única de filmes)
- **Swagger** (para documentação interativa da API)

---

## 🛠️ Configuração e Instalação

### 🔧 Pré-requisitos
Antes de iniciar, você precisa ter instalado:
- **Node.js** (versão LTS recomendada)
- **MySQL**

### 👅 Clonar o Repositório
```
  git clone https://github.com/carloscunha1/TMDB-API.git
  cd "TMDB API"
```

### 📦 Instalar Dependências
```
  npm install
```

### 🔑 Configurar Variáveis de Ambiente
Altere o arquivo **.env** na raiz do projeto com as seguintes informações:
```
PORT=3000
TMDB_API_KEY=SUA_CHAVE_DA_API
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco
```

### ▶️ Rodar a Aplicação
```
  npm start
```
OU
```
  npm run dev
```

---

## 📂 Documentação da API
A documentação interativa do Swagger pode ser acessada em:

[**Swagger UI**](http://localhost:3000/api-docs/#/)

---

## 📏 Rotas da API

### ⚠️ Atenção!
Antes de testar as rotas que exigem **UUID**, você precisa adicionar um filme à lista utilizando a rota **POST /filme**. O UUID do filme será armazenado no banco de dados e pode ser recuperado com a rota **GET /filmes**.

### 🎥 Filmes
| Método | Rota             | Descrição |
|--------|-----------------|------------|
| `POST` | `/filme`        | Adiciona um novo filme a partir do nome do mesmo |
| `GET`  | `/filmes`       | Lista todos os filmes já adicionados à lista de desejos |
| `GET`  | `/filme/:id`    | Busca detalhes de um filme utilizando **UUID** |
| `PUT`  | `/filme/estado/:id` | Atualiza o estado do filme utilizando **UUID** |
| `PUT`  | `/filme/avaliar/:id` | Avalia um filme com uma nota de 0 à 5 utilizando **UUID** |
| `GET`  | `/filme/historico/:id` | Mostra o histórico de um filme utilizando **UUID** |

### 📜 Logs
| Método | Rota  | Descrição |
|--------|------|------------|
| `GET`  | `/logs` | Lista os logs de requisições |

---

## 📝 Observações
- Certifique-se de possuir uma **chave de API válida do TMDB**.
- O banco de dados será criado automaticamente no MySQL ao iniciar o projeto.
- Os logs armazenam todas as requisições para auditoria e monitoramento.

---


📌 **Criado por Carlos Eduardo Cunha Rubim** 🚀

