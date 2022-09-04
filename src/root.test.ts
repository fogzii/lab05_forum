import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

test('Remove this test and uncomment the test below', () => {
  expect(1 + 1).toStrictEqual(2);
});

/*

test('success root', () => {
  const res = request(
    'GET',
    SERVER_URL + '/',

    // Not necessary, since it's empty, though reminder that
    // GET/DELETE is `qs`, PUT/POST is `json`
    { qs: {} }
  );
  const data = JSON.parse(res.getBody() as string);
  expect(data).toStrictEqual({ message: expect.any(String) });
});

*/
