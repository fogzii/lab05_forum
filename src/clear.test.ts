import request, { HttpVerb } from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// provided boilerplate function from tutorials
function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json });
  return JSON.parse(res.getBody('utf-8'));
}

const requestCreate = (sender: string, title: string, content: string) => requestHelper('POST', '/post/create', { sender, title, content });
const requestComment = (postId: number, sender: string, comment: string) => requestHelper('POST', '/post/comment', { postId, sender, comment });
const requestList = () => requestHelper('GET', '/posts/list', {});
const requestClear = () => requestHelper('DELETE', '/clear', {});

describe('(server) server', () => {
  describe('(route) /clear', () => {
    test('successful return - no data', () => {
      requestClear();
      expect(requestList()).toStrictEqual({ posts: [] });
    });
    test('successful return - 1 post', () => {
      requestClear();
      expect(requestList()).toStrictEqual({ posts: [] });
    });
    test('successful return - 1 post 1 comment', () => {
      const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      requestComment(forumPost.postId, 'Hiro', 'Hello');
      requestClear();
      expect(requestList()).toStrictEqual({ posts: [] });
    });
    test('successful return - multiple posts multiple comments', () => {
      const p1 = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      requestComment(p1.postId, 'Hiro', 'Hello');
      requestComment(p1.postId, 'Hiro', 'wyd');
      const p2 = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      requestComment(p2.postId, 'Hiro', 'Hello');
      requestComment(p2.postId, 'Hiro', 'wow theres a duplicate post');
      requestComment(p2.postId, 'Zero Two', 'oops');

      requestClear();
      expect(requestList()).toStrictEqual({ posts: [] });
    });
  });
});
