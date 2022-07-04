export interface IBloggers {
  id: number;
  name: string | null;
  youtubeUrl: string | null;
}
let bloggers: IBloggers[] = [];

export const bloggersRepository = {
  getAllBloggers() {
    return bloggers;
  },
  createBlogger(name: string, youtubeUrl: string) {
    const newBlogger = {
      id: +new Date(),
      name,
      youtubeUrl,
    };
    bloggers.push(newBlogger);
    return newBlogger;
  },
  getBloggerById(id: number) {
    return bloggers.find((el) => el.id === id);
  },
  upDateBlogger(name: string, youtubeUrl: string, id: number) {
    bloggers = bloggers.map((el) => {
      return el.id === id ? { ...el, name, youtubeUrl } : el;
    });
  },
  deleteBlogger(id: number) {
    const elem = bloggers.find((el) => el.id === id);
    if (elem) {
      const index = bloggers.indexOf(elem);
      bloggers.splice(index, 1);
    }
  },
};
