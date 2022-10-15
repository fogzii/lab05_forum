import { getData } from './dataStore';

type post = {
    postId: number,
    sender: string,
    title: string,
    timeSent: number,
}

type error = { error: string }
type posts = { posts: post[] }

export function list(): posts | error {
  const data = getData();

  const posts: post[] = [];
  for (const post of data.posts) {
    posts.push(
      {
        postId: post.postId,
        sender: post.sender,
        title: post.title,
        timeSent: post.timeSent,
      }
    );
  }

  return { posts: posts };
}
