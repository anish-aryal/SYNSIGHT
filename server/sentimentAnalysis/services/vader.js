import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VaderService {
  /**
   * Analyze sentiment of a single text
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Sentiment analysis result
   */
  static analyzeSingleText(text) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../python/sentiment_analyzer.py');
      const input = JSON.stringify({ text });

      const pythonProcess = spawn('python3', [pythonScript, input]);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script error: ${errorString}`));
        } else {
          try {
            const result = JSON.parse(dataString);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${error.message}`));
          }
        }
      });
    });
  }

  /**
   * Analyze sentiment of multiple texts (bulk analysis)
   * @param {Array<string>} texts - Array of texts to analyze
   * @returns {Promise<Object>} - Aggregated sentiment analysis result
   */
  static analyzeBulkTexts(texts) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../python/sentiment_analyzer.py');
      const input = JSON.stringify({ texts });

      const pythonProcess = spawn('python3', [pythonScript, input]);

      let dataString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script error: ${errorString}`));
        } else {
          try {
            const result = JSON.parse(dataString);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${error.message}`));
          }
        }
      });
    });
  }
}

export default VaderService;