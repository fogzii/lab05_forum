import { getData, setData } from './dataStore';

type commentId = { commentId: number };
type error = { error: string }

export function comment(postId: number, sender: string, comment: string): commentId | error {
  const data = getData();

  const post = data.posts.find(p => p.postId === postId);
  if (post === undefined) {
    return { error: 'postId does not refer to a valid post' };
  }
  if (sender.length === 0) {
    return { error: 'sender is an empty string' };
  }
  if (comment.length === 0) {
    return { error: 'content is an empty string' };
  }

  const commentId = post.comments.length;
  post.comments.unshift(
    {
      commentId: commentId,
      sender: sender,
      comment: comment,
      timeSent: Math.floor(Date.now() / 1000),
    }
  );

  setData(data);
  return { commentId: commentId };
}
