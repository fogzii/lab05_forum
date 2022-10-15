import { getData, setData } from './dataStore';

type postId = { postId: number };
type error = { error: string }

export function create(sender: string, title: string, content: string): postId | error {
  if (sender.length === 0) {
    return { error: 'sender is an empty string' };
  }
  if (title.length === 0) {
    return { error: 'title is an empty string' };
  }
  if (content.length === 0) {
    return { error: 'content is an empty string' };
  }

  const data = getData();

  const postId = data.posts.length;
  data.posts.unshift(
    {
      postId: postId,
      sender: sender,
      title: title,
      timeSent: Math.floor(Date.now() / 1000),
      content: content,
      comments: [],
    }
  );

  setData(data);

  return { postId: postId };
}
