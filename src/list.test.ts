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
const requestList = () => requestHelper('GET', '/posts/list', {});
const requestClear = () => requestHelper('DELETE', '/clear', {});

beforeEach(() => requestClear());

describe('(server) server', () => {
    describe('(route) /posts/list', () => {
        test('successful return - no posts', () => {
             expect(requestList()).toStrictEqual({ posts: [] });
        });
        test('successful return - 1 post', () => {
            const expectedTimeP1 = Math.floor(Date.now() / 1000);
            const p1 = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
            const timeP1 = requestList().posts[0].timeSent;
            expect(timeP1).toBeGreaterThanOrEqual(expectedTimeP1);
            expect(timeP1).toBeLessThanOrEqual(expectedTimeP1 + 2);
            
            expect(requestList()).toStrictEqual({
                posts: [
                    {
                        postId: p1.postId,
                        sender: 'Zero Two',
                        title: 'Darling',
                        timeSent: expect.any(Number),
                    },
                ],
            });
        });
        test('successful return - multiple posts', () => {
            const expectedTimeP1 = Math.floor(Date.now() / 1000);
            const p1 = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
            const timeP1 = requestList().posts[0].timeSent;
            expect(timeP1).toBeGreaterThanOrEqual(expectedTimeP1);
            expect(timeP1).toBeLessThanOrEqual(expectedTimeP1 + 2);

            const p2 = requestCreate('Kaguya', 'President', 'Love is War');
            const timeP2 = requestList().posts[0].timeSent;
            const p3 = requestCreate('Megumin', 'Chunchunmaru', 'Konosuba');
            const timeP3 = requestList().posts[0].timeSent; 
            expect(timeP3).toBeGreaterThanOrEqual(timeP2);
            expect(timeP2).toBeGreaterThanOrEqual(timeP1);

            expect(requestList()).toStrictEqual({
                posts: [
                    {
                        postId: p3.postId,
                        sender: 'Megumin',
                        title: 'Chunchunmaru',
                        timeSent: expect.any(Number),
                    },
                    {
                        postId: p2.postId,
                        sender: 'Kaguya',
                        title: 'President',
                        timeSent: expect.any(Number),
                    },
                    {
                        postId: p1.postId,
                        sender: 'Zero Two',
                        title: 'Darling',
                        timeSent: expect.any(Number),
                    },
                ],
            });
        });
    });
});
  