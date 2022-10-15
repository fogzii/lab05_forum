import request, { HttpVerb } from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

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
const requestClear = () => requestHelper('DELETE', '/clear', {});

beforeEach(() => requestClear());

describe('(server) server', () => {
  describe('(route) /post/comment', () => {
    test('returns error - postId does not refer to a valid post', () => {
      const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      expect(requestComment(forumPost.postId + 1, 'Hiro', 'Hello')).toStrictEqual(ERROR);
    });
    test('returns error - sender is an empty string', () => {
      const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      expect(requestComment(forumPost.postId, '', 'Hello')).toStrictEqual(ERROR);
    });
    test('returns error - comment  is an empty string', () => {
      const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      expect(requestComment(forumPost.postId, 'Hiro', '')).toStrictEqual(ERROR);
    });
    test('successful return', () => {
      const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
      expect(requestComment(forumPost.postId, 'Hiro', 'Hello')).toStrictEqual({ commentId: expect.any(Number) });
    });
  });
});
