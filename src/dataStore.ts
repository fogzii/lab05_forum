export type dataBase = {
    posts: post[],
}

export type post = {
    postId: number,
    sender: string,
    title: string,
    timeSent: number,
    content: string,
    comments: comment[],
}

type comment = {
    commentId: number,
    sender: string,
    comment: string,
    timeSent: number,
}

let data: dataBase = {
    posts: [],
};
  
// Use get() to access the data
function getData(): dataBase {
    return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataBase) {
    data = newData;
}

export { getData, setData };

// example of a filled dataStore
/*
let data = {
    posts: [
        {
            postId: 1,
            sender: 'Zero Two',
            title: 'Darling',
            timeSent: 123456789,
            content: 'Darling in the FRANZXX',
            comments: [
                {
                    commentId: 1,
                    sender: 'Hiro',
                    comment: 'Hello',
                    timeSent: 1234566789,
                }
            ],
        },
    ],
};
*/