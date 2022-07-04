export interface IPosts {
  id: number;
  title: string | null;
  shortDescription: string;
  content: string | null;
  bloggerId: number;
  bloggerName: string | null;
}

let posts: IPosts[] = [];

export const postsRepository = {
  getAllPosts() {
    return posts;
  },
  createPost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>) {
    const newPost = {
      id: +new Date(),
      bloggerName: `blogger${posts.length + 1}`,
      ...bodyParams,
    };
    posts.push(newPost);
    return newPost;
  },
  getPostById(id: number) {
    return posts.find((el) => el.id === id);
  },
  upDatePost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>, id: number) {
    posts = posts.map((el) => {
      return el.id === id
        ? {
            ...el,
            title: bodyParams.title,
            shortDescription: bodyParams.shortDescription,
            content: bodyParams.content,
            bloggerId: bodyParams.bloggerId,
          }
        : el;
    });
  },
  deletePost(id: number) {
    const elem = posts.find((el) => el.id === id);
    if (elem) {
      const index = posts.indexOf(elem);
      posts.splice(index, 1);
    }
  },
};
