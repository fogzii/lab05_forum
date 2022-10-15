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
const requestClear = () => requestHelper('DELETE', '/clear', {});

beforeEach(() => requestClear());

describe('(server) server', () => {
  describe('(route) /post/create', () => {
    test('returns error - sender is an empty string', () => {
      expect(requestCreate('', 'Darling', 'DARLING in the FRANXX')).toStrictEqual(ERROR);
    });
    test('returns error - title is an empty string', () => {
      expect(requestCreate('Zero Two', '', 'DARLING in the FRANXX')).toStrictEqual(ERROR);
    });
    test('returns error - content is an empty string', () => {
      expect(requestCreate('Zero Two', 'Darling', '')).toStrictEqual(ERROR);
    });
    test('successful return', () => {
      expect(requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX')).toStrictEqual({ postId: expect.any(Number) });
    });
  });
});
