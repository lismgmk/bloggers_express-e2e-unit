import { Router } from 'express';

export const blogsRouter = Router({});

const errorResponse = (explanation: string, fieldError: string) => {
  return {
    errorsMessages: [
      {
        message: explanation,
        field: fieldError,
      },
    ],
  };
};

blogsRouter.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});
blogsRouter.get('/videos', (req, res) => {
  res.status(200).send();
});

blogsRouter.post('/videos', (req, res) => {
  if (req.body.title !== null && req.body.title.length > 40) {
    res.status(400).send(errorResponse('title length more than 40', 'title'));
  } else if (req.body.title === null) {
    res.status(400).send(errorResponse('title length more than 40', 'title'));
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
    res.status(400).send(errorResponse('title length more than 40', 'title'));
  } else if (req.body.title === null) {
    res.status(400).send(errorResponse('title length more than 40', 'title'));
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
