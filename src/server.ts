import OpenAI from 'openai';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import cors from 'cors';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NVIDIA_API_BASE_URL, NVIDIA_API_KEY } from './server.config';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: NVIDIA_API_BASE_URL,
});

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Enable CORS for browser clients on a different origin.
 */
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.options('*', cors());
app.use(express.json());

/**
 * API route for chatting with the NVIDIA model.
 */
app.post('/api/chat', async (req, res, next) => {
  const message = req.body?.message?.trim();
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'thinkingmachines/inkling',
      messages: [{ role: 'user', content: message }],
      temperature: 1,
      top_p: 0.95,
      max_tokens: 8192,
      stream: false,
    });

    const text = completion.choices?.[0]?.message?.content ?? '';

    if (!text) {
      throw new Error('No text was returned from the model.');
    }

    return res.json({ text });
  } catch (error) {
    console.error('Chat API error:', error);
    return next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
