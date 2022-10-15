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
const requestView = (postId: number) => requestHelper('GET', '/post/view', { postId });
const requestClear = () => requestHelper('DELETE', '/clear', {});

beforeEach(() => requestClear());

describe('(server) server', () => {
    describe('(route) /post/view', () => {
        test('returns error - postId does not refer to a valid post', () => {
            const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
            requestComment(forumPost.postId, 'Hiro', 'Hello');
            expect(requestView(forumPost.postId + 1)).toStrictEqual(ERROR);
        });
        test('successful return - no comments', () => {
            // testing timestamps for forum post creation
            const expectedTimePost = Math.floor(Date.now() / 1000);
            const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
            const timePost = requestView(forumPost.postId).post.timeSent;
            expect(timePost).toBeGreaterThanOrEqual(expectedTimePost);
            expect(timePost).toBeLessThanOrEqual(expectedTimePost + 2);
            
            expect(requestView(forumPost.postId)).toStrictEqual({
                post: {
                    postId: forumPost.postId,
                    sender: 'Zero Two',
                    title:  'Darling',
                    timeSent: expect.any(Number),
                    content: 'DARLING in the FRANXX',
                    comments: [],
                }
            });
        });
        test('successful return - 1 comment', () => {
            // testing timestamps for comment creation
            const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
            const expectedTimeC1 = Math.floor(Date.now() / 1000);
            const c1 = requestComment(forumPost.postId, 'Hiro', 'Hello');
            const timeC1 = requestView(forumPost.postId).post.comments[0].timeSent;
            expect(timeC1).toBeGreaterThanOrEqual(expectedTimeC1);
            expect(timeC1).toBeLessThanOrEqual(expectedTimeC1 + 2);

            expect(requestView(forumPost.postId)).toStrictEqual({
                post: {
                    postId: forumPost.postId,
                    sender: 'Zero Two',
                    title:  'Darling',
                    timeSent: expect.any(Number),
                    content: 'DARLING in the FRANXX',
                    comments: [
                        {
                            commentId: c1.commentId,
                            sender: 'Hiro',
                            comment: 'Hello',
                            timeSent: expect.any(Number),
                        },
                    ],
                }
            });
        });
        test('successful return - multiple comments', () => {
            const forumPost = requestCreate('Zero Two', 'Darling', 'DARLING in the FRANXX');
            const expectedTimeC1 = Math.floor(Date.now() / 1000);
            const c1 = requestComment(forumPost.postId, 'Hiro', 'Hello');
            const timeC1 = requestView(forumPost.postId).post.comments[0].timeSent;
            expect(timeC1).toBeGreaterThanOrEqual(expectedTimeC1);
            expect(timeC1).toBeLessThanOrEqual(expectedTimeC1 + 2);

            const c2 = requestComment(forumPost.postId, 'Zero Two', 'Hello');
            const timeC2 = requestView(forumPost.postId).post.comments[0].timeSent;
            const c3 = requestComment(forumPost.postId, 'Lemon', '???');
            const timeC3 = requestView(forumPost.postId).post.comments[0].timeSent;  
            expect(timeC3).toBeGreaterThanOrEqual(timeC2);
            expect(timeC2).toBeGreaterThanOrEqual(timeC1);

            expect(requestView(forumPost.postId)).toStrictEqual({
                post: {
                    postId: forumPost.postId,
                    sender: 'Zero Two',
                    title:  'Darling',
                    timeSent: expect.any(Number),
                    content: 'DARLING in the FRANXX',
                    comments: [
                        {
                            commentId: c3.commentId,
                            sender: 'Lemon',
                            comment: '???',
                            timeSent: expect.any(Number),
                        },
                        {
                            commentId: c2.commentId,
                            sender: 'Zero Two',
                            comment: 'Hello',
                            timeSent: expect.any(Number),
                        },
                        {
                            commentId: c1.commentId,
                            sender: 'Hiro',
                            comment: 'Hello',
                            timeSent: expect.any(Number),
                        },
                    ],
                }
            });
        });
    });
});
  