import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import next from 'next';

// Initialize Firebase Admin
admin.initializeApp();

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Next.js app
const nextApp = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
  dir: join(__dirname, '..'),
});

const nextHandler = nextApp.getRequestHandler();

export const nextServer = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 120,
  })
  .https.onRequest(async (req, res) => {
    // Handle static files and assets
    if (req.path.startsWith('/_next') || req.path.startsWith('/static')) {
      const pathToStaticFile = join(__dirname, '..', 'public', req.path);
      return nextApp.serveStatic(req, res, pathToStaticFile);
    }
    
    // Handle all other requests with Next.js
    return nextHandler(req, res);
  });

// Export the function
export { nextServer };
