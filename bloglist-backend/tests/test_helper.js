const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
  {
    title: 'First Blog',
    author: 'Author 1',
    url: 'http://example.com/1',
    likes: 1
  },
  {
    title: 'Second Blog',
    author: 'Author 2',
    url: 'http://example.com/2',
    likes: 2
  }
]

const nonExistingId = async () => {
  const note = new Blog({
    title: 'Dummy Blog',
    author: 'Dummy Author',
    url: 'http://example.com/dummy',
    likes: 10
  })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
}