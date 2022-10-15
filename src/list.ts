import { getData } from './dataStore'

type error = { error: string }
type posts = { posts: post[] }

type post = {
    postId: number,
    sender: string,
    title: string,
    timeSent: number,
}

export function list(): posts | error {
    let data = getData();

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
