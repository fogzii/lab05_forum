import request, { HttpVerb, Response } from 'sync-request';
import { port, url } from './src/config.json';

const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

// Helpers

function parseResponse(res: Response, path: string) {
  let caughtError = 'Unknown error';
  let comp1531Hint = 'No hint available for this error';
  try {
    return JSON.parse(res.getBody() as string);
  } catch (e) {
    caughtError = e.message;
    if (res.statusCode === 404) {
      comp1531Hint = `The route '${path}' does not exist on your server (i.e. in server.ts). Check that you do not have any typos and your routes begin with a '/'`;
      caughtError = `Missing route ${path}`;
    } else if (res.statusCode === 500) {
      comp1531Hint = 'Your server has crashed. Check the terminal running the server to see the error stack trace';
    } else {
      comp1531Hint = 'Your routes may not be returning a valid JSON response - for example, the clear route should still return an empty object, {}';
    }
  }
  const ret = {
    statusCode: res.statusCode,
    caughtError,
    comp1531Hint
  };
  console.log('Logging Error:', ret);
  return ret;
}

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
  return parseResponse(res, path);
}

function generateTimeStamp() {
  return Math.floor(Date.now() / 1000);
}

// ========================================================================= //

// Wrapper functions

function clear() {
  return requestHelper('DELETE', '/clear', {});
}

function root() {
  return requestHelper('GET', '/', {});
}

function echo(message: string) {
  return requestHelper('GET', '/echo/echo', { message });
}

function postCreate(sender: string, title: string, content: string) {
  return requestHelper('POST', '/post/create', { sender, title, content });
}

function postComment(postId: number, sender: string, comment: string) {
  return requestHelper('POST', '/post/comment', { postId, sender, comment });
}

function postView(postId: number) {
  return requestHelper('GET', '/post/view', { postId });
}

function postsList() {
  return requestHelper('GET', '/posts/list', {});
}

// ========================================================================= //

beforeEach(clear);
afterAll(clear);

function checkTimestamp(timestamp: number, expectedTimestamp: number) {
  /**
     * Allow for 3 seconds offset
     */
  expect(timestamp).toBeGreaterThanOrEqual(expectedTimestamp - 3);
  expect(timestamp).toBeLessThan(expectedTimestamp + 3);
}

describe('/', () => {
  test('success', () => {
    expect(root()).toStrictEqual({ message: expect.any(String) });
  });
});

describe('/echo', () => {
  test('success', () => {
    expect(echo('helloworld')).toStrictEqual({ message: 'helloworld' });
  });

  test('failure', () => {
    expect(echo('echo')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('/clear', () => {
  test('Return empty', () => {
    expect(clear()).toStrictEqual({});
  });

  test('Clear post', () => {
    postCreate('Nick', 'COMP1531', 'Welcome to COMP1531!');
    expect(postsList().posts.length).toEqual(1);
    expect(clear()).toStrictEqual({});
    expect(postsList()).toStrictEqual({ posts: [] });
  });
});

describe('/post/create', () => {
  describe('errors', () => {
    test.each([
      { sender: '', title: 'valid', content: 'valid' },
      { sender: 'valid', title: '', content: 'valid' },
      { sender: 'valid', title: 'valid', content: '' },
    ])("('$sender', '$title', '$content')", ({ sender, title, content }) => {
      const errorPost = postCreate(sender, title, content);
      expect(errorPost).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('success', () => {
    test('Successful creation', () => {
      const post = postCreate('Emily', 'COMP1531 Post', 'Welcome to COMP1531!');
      expect(post).toStrictEqual({ postId: expect.any(Number) });
    });

    test('Unique IDs, same entries', () => {
      const post1 = postCreate('Emily', 'COMP1531 Post', 'Welcome to COMP1531!');
      const post2 = postCreate('Emily', 'COMP1531 Post', 'Welcome to COMP1531!');
      const post3 = postCreate('Emily', 'COMP1531 Post', 'Welcome to COMP1531!');
      const uniqueIds = Array.from(new Set([post1.postId, post2.postId, post3.postId]));
      expect(uniqueIds).toHaveLength(3);
    });
  });
});

describe('/post/comment', () => {
  describe('errors', () => {
    test('Invalid postId empty state', () => {
      const errorComment = postComment(999, 'sender', 'comment');
      expect(errorComment).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid postId wrong id', () => {
      const { postId } = postCreate('sender', 'title', 'content');
      const errorComment = postComment(postId + 1, 'sender', 'comment');
      expect(errorComment).toStrictEqual({ error: expect.any(String) });
    });

    test.each([
      { sender: '', comment: 'valid' },
      { sender: 'valid', comment: '' },
    ])("('$sender', '$comment')", ({ sender, comment }) => {
      const { postId } = postCreate('sender', 'title', 'content');
      const errorComment = postComment(postId, sender, comment);
      expect(errorComment).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('success', () => {
    test('Successful creation', () => {
      const { postId } = postCreate('Emily', 'COMP1531 Post', 'Welcome to COMP1531!');
      const comment = postComment(postId, 'Nick', 'Hello there!');
      expect(comment).toStrictEqual({ commentId: expect.any(Number) });
    });

    test('Unique IDs', () => {
      const { postId } = postCreate('Emily', 'COMP1531 Post', 'Welcome to COMP1531!');
      const comment1 = postComment(postId, 'Nick', 'Hello there!');
      const comment2 = postComment(postId, 'Nick', 'Hello there!');
      const comment3 = postComment(postId, 'Nick', 'Hello there!');
      const uniqueIds = Array.from(new Set([comment1.commentId, comment2.commentId, comment3.commentId]));
      expect(uniqueIds).toHaveLength(3);
    });
  });
});

describe('/post/view', () => {
  describe('errors', () => {
    test('Invalid postId empty state', () => {
      const errorPostView = postView(999);
      expect(errorPostView).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid postId wrong id', () => {
      const { postId } = postCreate('sender', 'title', 'content');
      const errorPostView = postComment(postId + 1, 'sender', 'comment');
      expect(errorPostView).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('success', () => {
    test('Single post, one comment', () => {
      const { postId } = postCreate('poster', 'comp1531', 'welcome');
      const { commentId } = postComment(postId, 'commenter', 'hello');
      const expectedTime = generateTimeStamp();
      const { post } = postView(postId);
      expect(post).toStrictEqual({
        postId,
        sender: 'poster',
        title: 'comp1531',
        content: 'welcome',
        timeSent: expect.any(Number),
        comments: [
          {
            commentId,
            sender: 'commenter',
            comment: 'hello',
            timeSent: expect.any(Number),
          },
        ],
      });
      checkTimestamp(post.timeSent, expectedTime);
    });

    test('Multiple posts', () => {
      const expectedTime1 = generateTimeStamp();
      const expectedTime2 = generateTimeStamp();
      const { postId: postId1 } = postCreate('1poster', '1comp1531', '1welcome');
      const { postId: postId2 } = postCreate('2poster', '2comp1531', '2welcome');

      const { post: post1 } = postView(postId1);
      expect(post1).toStrictEqual({
        postId: postId1,
        sender: '1poster',
        title: '1comp1531',
        content: '1welcome',
        timeSent: expect.any(Number),
        comments: [],
      });
      checkTimestamp(post1.timeSent, expectedTime1);

      const { commentId: commentId1 } = postComment(postId2, '1commenter', '1hello');
      const { commentId: commentId2 } = postComment(postId2, '2commenter', '2hello');
      const { commentId: commentId3 } = postComment(postId2, '3commenter', '3hello');
      const { post: post2 } = postView(postId2);
      expect(post2).toStrictEqual({
        postId: postId2,
        sender: '2poster',
        title: '2comp1531',
        content: '2welcome',
        timeSent: expect.any(Number),
        comments: [
          {
            commentId: commentId3,
            sender: '3commenter',
            comment: '3hello',
            timeSent: expect.any(Number),
          },
          {
            commentId: commentId2,
            sender: '2commenter',
            comment: '2hello',
            timeSent: expect.any(Number),
          },
          {
            commentId: commentId1,
            sender: '1commenter',
            comment: '1hello',
            timeSent: expect.any(Number),
          },
        ],
      });
      checkTimestamp(post2.timeSent, expectedTime2);
      for (const comment of post2.comments) {
        checkTimestamp(comment.timeSent, expectedTime2);
      }
    });
  });
});

describe('/posts/list', () => {
  test('empty state', () => {
    expect(postsList()).toStrictEqual({ posts: [] });
  });

  test('one post', () => {
    const title = 'title';
    const sender = 'sender';

    const timeSent = generateTimeStamp();
    const { postId } = postCreate(sender, title, 'content');
    const { posts } = postsList();

    expect(posts).toStrictEqual([{ postId, title, sender, timeSent: expect.any(Number) }]);

    // Checking timeSent separately
    checkTimestamp(posts[0].timeSent, timeSent);
  });

  test('multiple posts', () => {
    const expectedPosts = [];

    const baseTime = generateTimeStamp();
    for (let i = 0; i < 10; i++) {
      const sender = `sender ${i}`;
      const title = `title ${i}`;
      const content = `content ${i}`;
      const { postId } = postCreate(sender, title, content);
      expectedPosts.unshift({
        postId,
        sender,
        title,
      });
    }

    const posts = postsList().posts;
    expect(posts.length).toEqual(expectedPosts.length);

    const postsWithoutTimeStamp = [];
    for (const post of posts) {
      const { timeSent, ...otherDetails } = post;
      expect(expectedPosts).toContainEqual(otherDetails);
      checkTimestamp(post.timeSent, baseTime);
      postsWithoutTimeStamp.push(otherDetails);
    }
    expect(postsWithoutTimeStamp).toStrictEqual(expectedPosts);
  });
});
