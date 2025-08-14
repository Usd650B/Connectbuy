import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { join } from 'path';
import next from 'next';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Next.js app
const nextApp = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
  dir: join(__dirname, '..'),
});

const nextHandler = nextApp.getRequestHandler();

// Create the server function
export const nextServer = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 120,
  })
  .https.onRequest(async (req, res) => {
    // Handle static files and assets
    if (req.path.startsWith('/_next') || req.path.startsWith('/static')) {
      const pathToStaticFile = join(__dirname, '..', '.next', 'static', req.path.replace(/^\/_next\//, ''));
      return res.sendFile(pathToStaticFile);
    }
    
    // Handle all other requests with Next.js
  
    // Prepare the Next.js app
    await nextApp.prepare();
    
    // Handle the request
    return nextHandler(req, res);
  });
