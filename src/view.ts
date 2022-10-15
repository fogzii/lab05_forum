import { post, getData } from './dataStore'

type error = { error: string }
type postObj = { post: post };

export function view(postId: number): postObj | error {
    let data = getData();

    const post = data.posts.find(p => p.postId === postId);
    if (post === undefined) {
        return { error: 'postId does not refer to a valid post' };
    }

    return { post: post };
}
