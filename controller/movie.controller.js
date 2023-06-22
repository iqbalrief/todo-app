const express = require('express')
const router = express.Router()
const db = require('./../models')
const Movie = db.Movie
const authenticateTokenMiddleware = require('../midlleware/authentication')
const movieService = require('../service/movie.service')

// Inject middleware as global middleware
router.use(authenticateTokenMiddleware)

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req,file,cb) {
    cb(null,'./asset/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage});

// GET /movies
router.get('/api/movies', async (request, response) => {
  const movies = await movieService.findAllMovies(request.query.page, request.query.size)
  const movieCount = await movieService.countMovies()

  return response.status(200).json({
    data: movies,
    meta: {
      page: request.query.page,
      count: movieCount,
      size: movies.length,
    }
  })
})

// GET /movies/:id
router.get('/api/movies/:id', async (request, response) => {
  try {
    const movie = await movieService.findByMovieId(request.params.id)
  
    if(!movie) return response.status(404).json({message: 'Movies not found'})
  
    return response.status(200).json({data: movie})
    
  } catch (error) {
    response.status(error);
  }
})

// POST /movies

router.post('/api/movies', upload.single('photo'), async (request, response) => {
  try {
    const movie = await Movie.create({
      title: request.body.title,
      genre: request.body.genre,
      year: request.body.year,
      photo: request.file.path
    })
  
    if(!movie) return response.status(422).json({message: 'Failed create movie. Please try again'})
    
    return response.status(200).json({data: movie})
    
  } catch (error) {
    response.status(error).json({message: "Failed create movie. Please Try Again"})
  }
  
})



// PUT /movies/:id

router.put('/api/movies/:id', upload.single('photo'), async (request, response) => {
  try {
    const movie = await Movie.findByPk(request.params.id)
  
    if(!movie) return response.status(404).json({message: 'Movies not found'})
  
   await  Movie.update({
    title: request.body.title,
    genre: request.body.genre,
    year: request.body.year,
    photo: request.file.path
   }, { where: {id: request.params.id }})
  
    return response.status(200).json({ message: 'Movie updated'})
    
  } catch (error) {
    return response.status(error).json({message: 'Movie Failed Updated'})
  }
})

// DELETE /movies/:id
router.delete('/api/movies/:id', async (request, response) => {
  const movie = await Movie.findByPk(request.params.id)

  if(!movie) return response.status(404).json({message: 'Movies not found'})

  Movie.destroy({where: { id: request.params.id }})

  return response.status(200).json({ data: movie })
})

module.exports = router
