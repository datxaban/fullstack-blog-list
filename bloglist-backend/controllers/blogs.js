const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}


blogsRouter.get('/', async(request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  if(!!blogs) {
    response.json(blogs)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async(request, response, next) => {
  const body = request.body
  const token = request.token

  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken || !decodedToken.id) {
    return response.status(401).json({ error: 'token invalid)' })
  }
  
  if(!body.title || !body.url) {
    return  response.status(400).json({ error: 'title or url missing' })
  }
  const user = await User.findById(decodedToken.id)
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user
  })


  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat({
    title: body.title,
    url: body.url,
    author: body.author,
    id: savedBlog._id
  })
  // user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async(request, response, next) => {
  const token = request.token
  if(!token) {
    return response.status(401).json({ error: 'token missing' })
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken || !decodedToken.id) {
    return response.status(401).json({ error: 'token invalid)' })
  }
  const blog = await Blog.findById(request.params.id)
  if(!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }
  if(blog.user.toString() !== decodedToken.id) {
    return response.status(401).json({ error: 'unauthorized' })
  }
  
  const user = await User.findById(decodedToken.id)
  user.blogs = user.blogs.filter(blog => blog.id !== request.params.id)
  await user.save()

  await Blog.findByIdAndDelete(request.params.id)
  
  response.status(204).end()
})

blogsRouter.put('/:id', async(request, response, next) => {
  const body = request.body

  const blog = {
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes
  }
  
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  if(!!updatedBlog){
    response.json(updatedBlog)
  }
  else {
    response.status(404).end()
  }
})

module.exports = blogsRouter