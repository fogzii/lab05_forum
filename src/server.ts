import express, { json, Request, Response } from 'express';
import cors from 'cors';

// OPTIONAL: Use middleware to log (print to terminal) incoming HTTP requests
import morgan from 'morgan';

// Importing the example implementation for echo in echo.js
import { echo } from './echo';

import { create } from './create';
import { comment } from './comment';
import { view } from './view';
import { list } from './list';
import { clear } from './clear';
import { port, url } from './config.json';

const PORT: number = parseInt(process.env.PORT || port);

const app = express();

// Use middleware that allows for access from other domains (needed for frontend to connect)
app.use(cors());
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// (OPTIONAL) Use middleware to log (print to terminal) incoming HTTP requests
app.use(morgan('dev'));

// Root URL
app.get('/', (req: Request, res: Response) => {
  console.log('Print to terminal: someone accessed our root url!');
  res.json(
    {
      message: "Welcome to Lab05 Forum Server's root URL!",
    }
  );
});

app.get('/echo/echo', (req: Request, res: Response) => {
  // For GET/DELETE requests, parameters are passed in a query string.
  // You will need to typecast for GET/DELETE requests.
  const message = req.query.message as string;

  // Logic of the echo function is abstracted away in a different
  // file called echo.py.
  res.json(echo(message));
});

app.post('/post/create', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body
  const { sender, title, content } = req.body;

  console.log('Post being created with the following information:', sender, title, content);
  res.json(create(sender, title, content));
});

app.post('/post/comment', (req: Request, res: Response) => {
  console.log('Comment being created with the following information:', req.body.postId, req.body.sender, req.body.comment);
  res.json(comment(req.body.postId, req.body.sender, req.body.comment));
});

app.get('/post/view', (req: Request, res: Response) => {
  const postId = parseInt(req.query.postId as string);

  console.log('Viewing the post with the following id:', postId);
  res.json(view(postId));
});

app.get('/posts/list', (req: Request, res: Response) => {
  console.log('Listing all posts');
  res.json(list());
});

app.delete('/clear', (req: Request, res: Response) => {
  console.log('Clearing all posts');
  res.json(clear());
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`Starting Express Server at the URL: '${url}:${PORT}'`);
});

/**
 * Handle Ctrl+C gracefully
 */
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
