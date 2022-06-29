import { blogsRouter } from 'routes/blogs-route';

export interface IBloggers {
  id: number;
  name: string | null;
  youtubeUrl: string | null;
}
const bloggers: IBloggers[] = [];

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
  deleteBlogger() {},
  upDateBlogger() {},
};

blogsRouter.post('/videos', (req, res) => {
  if (req.body.title !== null && req.body.title.length > 40) {
    // res.status(400).send(errorResponse('title length more than 40', 'title'));
  } else if (req.body.title === null) {
    // res.status(400).send(errorResponse('title length more than 40', 'title'));
  } else {
    const newVideo = {
      id: +new Date(),
      title: req.body.title,
      author: 'it-incubator.eu',
    };
    // videos.push(newVideo)
    res.status(201).send(newVideo);
  }
});

blogsRouter.get('/videos/:videoId', (req, res) => {
  const id = +req.params.videoId;
  // const elem = videos.find((el)=> el.id === id);
  // elem ? res.status(200).send(elem) : res.send(404)
});

blogsRouter.put('/videos/:id', (req, res) => {
  const id = +req.params.id;
  // const elem = videos.find((el)=> el.id === id);
  if (req.body.title !== null && req.body.title.length > 40) {
    // res.status(400).send(errorResponse('title length more than 40', 'title'));
  } else if (req.body.title === null) {
    // res.status(400).send(errorResponse('title length more than 40', 'title'));
  }
  // } else if(!elem) {
  //     res.send(404)
  // } else {
  //     videos = videos.map((el)=> {return(el.id === id ? {...el, title: req.body.title} : el)} );
  //     res.send(204)
  // }
});

blogsRouter.delete('/videos/:id', (req, res) => {
  const id = +req.params.id;
  // const elem = videos.find((el)=> el.id === id);
  //
  // if(elem) {
  //     const index = videos.indexOf(elem)
  //     videos.splice(index, 1)
  //     res.send(204)
  // } else {
  //     res.send(404)
  // }
});
