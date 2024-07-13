const {test, after, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app') 
const api = supertest(app)
const jwt = require('jsonwebtoken')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

let token = ''

describe('when there is initially some blogs saved', () => {

  beforeEach(async () => {
    // await Blog.deleteMany({})
    // await Blog.insertMany(helper.initialBlogs)
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);

    await User.deleteMany({});
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'password1234',
    };

    await api.post('/api/users').send(newUser);

    const loginResponse = await api.post('/api/login').send({
      username: newUser.username,
      password: newUser.password
    })

    token = loginResponse.body.token
  })

  test('blog list return correct amount of blogs in JSON format', async () => {
    const response = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    assert(response.body.length === helper.initialBlogs.length)
  })
  
  test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.id)
  
    assert(contents.length > 0)
  
    const blog = response.body[0]
    assert(blog.id)
    assert(!blog._id)
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'New Author',
      url: 'http://example.com/new',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert(blogsAtEnd.length === helper.initialBlogs.length + 1)
    const contents = blogsAtEnd.map(r => r.title)
    assert(contents.includes('New Blog'))
  })

  test('if the likes property is missing from the request, it will default to 0', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'New Author',
      url: 'http://example.com/new'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    assert(response.body.likes === 0)
  })

  test('if the title properties are missing from the request data, the backend responds to the request with status code 400 Bad Request', async () => {
    const newBlog = {
      author: "New Author",
      url: "http://example.com/new",
      likes: 0
    }
    await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
    .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('if the url properties are missing from the request data, the backend responds to the request with status code 400 Bad Request', async () => {
    const newBlog = {
      title: "New Blog",
      author: "New Author",
      likes: 0
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('deletion of a blog', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'New Author',
      url: 'http://example.com/new',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert(blogsAtEnd.length === helper.initialBlogs.length + 1)
    const contents = blogsAtEnd.map(r => r.title)
    assert(contents.includes('New Blog'))

    const deleteBlog = blogsAtEnd.find(b => b.title === 'New Blog')
    await api
      .delete(`/api/blogs/${deleteBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const deleteAtEnd = await helper.blogsInDb()
    const titleListAtEnd = deleteAtEnd.map(r => r.title)
    assert(!titleListAtEnd.includes(deleteBlog.title))
  })

  test('updating a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {
      title: 'Updated Blog',
      author: 'Updated Author',
      url: 'http://example.com/updated',
      likes: 10
    }
    const response = await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200).expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlogFromDb = blogsAtEnd.find(b => b.id === blogToUpdate.id)
    assert.strictEqual(updatedBlogFromDb.title, updatedBlog.title)
    assert.strictEqual(updatedBlogFromDb.author, updatedBlog.author)
    assert.strictEqual(updatedBlogFromDb.url, updatedBlog.url)
    assert.strictEqual(updatedBlogFromDb.likes, updatedBlog.likes)
  })

})

after(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({});
  await mongoose.connection.close()
})