// server/utils/documentLoader.js
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

// Load documents from a directory
async function loadDocuments(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const documents = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const extension = path.extname(file).toLowerCase();
        let content;
        
        // Process based on file type
        if (extension === '.pdf') {
          content = await processPdf(filePath);
        } else if (extension === '.docx') {
          content = await processDocx(filePath);
        } else if (extension === '.txt') {
          content = await processTxt(filePath);
        } else if (extension === '.json') {
          content = await processJson(filePath);
        } else {
          console.log(`Skipping unsupported file: ${file}`);
          continue;
        }

        // Chunk the content if it's too large
        const chunks = chunkContent(content, 1000);
        
        for (let i = 0; i < chunks.length; i++) {
          documents.push({
            id: `${path.basename(file, extension)}_${i}_${uuidv4()}`,
            text: chunks[i],
            metadata: {
              source: file,
              chunkIndex: i,
              totalChunks: chunks.length,
              type: extension.substring(1),
              created: stats.birthtime,
              modified: stats.mtime
            }
          });
        }
      }
    }

    return documents;
  } catch (error) {
    console.error('Error loading documents:', error);
    throw error;
  }
}

// Process PDF file
async function processPdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error processing PDF file ${filePath}:`, error);
    throw error;
  }
}

// Process DOCX file
async function processDocx(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error(`Error processing DOCX file ${filePath}:`, error);
    throw error;
  }
}

// Process TXT file
async function processTxt(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error processing TXT file ${filePath}:`, error);
    throw error;
  }
}

// Process JSON file
async function processJson(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error(`Error processing JSON file ${filePath}:`, error);
    throw error;
  }
}

// Chunk content into smaller pieces for better embedding
function chunkContent(text, maxChunkSize = 1000, overlap = 200) {
  if (!text || text.length <= maxChunkSize) {
    return [text];
  }

  const chunks = [];
  let i = 0;

  while (i < text.length) {
    // If we're not at the beginning, include some overlap
    const start = i > 0 ? i - overlap : i;
    
    // Find a good breaking point (end of a sentence or paragraph)
    let end = Math.min(start + maxChunkSize, text.length);
    if (end < text.length) {
      // Try to find the end of a sentence
      const possibleEnd = text.lastIndexOf('.', end);
      if (possibleEnd > start + maxChunkSize / 2) {
        end = possibleEnd + 1;
      }
    }

    chunks.push(text.substring(start, end));
    i = end;
  }

  return chunks;
}

module.exports = {
  loadDocuments
};