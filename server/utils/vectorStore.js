// server/utils/vectorStore.js
const { Pool } = require('pg');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configure PostgreSQL connection for vector store
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize the vector store table if it doesn't exist
async function initVectorStore() {
  try {
    // Create extension if it doesn't exist
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
    `);

    // Create the documents table with vector support
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(1536)
      );
    `);

    // Create an index for vector search
    await pool.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents
      USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    `);

    console.log('Vector store initialized successfully');
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

// Create embedding for a document using an embedding API
async function createEmbedding(id, text, metadata = {}) {
  try {
    // Use OpenAI's embedding API (could be replaced with any embedding service)
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-ada-002'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const embedding = response.data.data[0].embedding;

    // Store the document and its embedding
    await pool.query(
      `INSERT INTO documents (id, content, metadata, embedding)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET content = $2, metadata = $3, embedding = $4`,
      [id, text, JSON.stringify(metadata), embedding]
    );

    return { id, embedding };
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

// Search for similar documents using vector similarity
async function searchVectorStore(query, limit = 5) {
  try {
    // Generate embedding for the query
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: query,
        model: 'text-embedding-ada-002'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const queryEmbedding = response.data.data[0].embedding;

    // Search for similar documents
    const result = await pool.query(
      `SELECT id, content, metadata, 
              1 - (embedding <=> $1) AS similarity
       FROM documents
       ORDER BY similarity DESC
       LIMIT $2`,
      [queryEmbedding, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      text: row.content,
      metadata: row.metadata,
      similarity: row.similarity
    }));
  } catch (error) {
    console.error('Error searching vector store:', error);
    throw error;
  }
}

module.exports = {
  initVectorStore,
  createEmbedding,
  searchVectorStore
};