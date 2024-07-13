import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs.sort((a, b) => b.likes - a.likes))
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const addBlog = (blogObject) => {
    blogService
      .create(blogObject)
      .then(response => {
        setBlogs(blogs.concat(response))
        blogFormRef.current.toggleVisibility()
        setErrorMessage(`a new blog ${response.title} by ${response.author} added`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
      .catch(error => {
        setErrorMessage('error adding blog')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const handleRemove = (blog) => (event) => {
    event.preventDefault()
    if(window.confirm(`Remove blog ${blog.title} by ${blog.author}`)){
      blogService.deleteBlog(blog.id)
        .then(response => {
          setBlogs(blogs.filter(b => b.id !== blog.id))
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  const handleLike  = (blog) => (event) =>  {
    const newBlog = { ...blog, likes: blog.likes + 1 }
    const tmpUsername = blog.user.username
    const tmpName = blog.user.name
    const tmpId = blog.user.id
    blogService.update(blog.id, newBlog)
      .then(response => {
        setBlogs(blogs.map(b => b.id !== blog.id ? b : {
          ...response,
          user: {
            username: tmpUsername,
            name: tmpName,
            id: tmpId
          }
        }).sort((a, b) => b.likes - a.likes))
      })
  }

  const loginForm = () => (
    <>
      <h2>log in to application</h2>
      <Notification message={errorMessage} type={'error'} />
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            data-testid="username"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            data-testid="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </>
  )

  const blogForm = () => (
    <>
      <h2>blogs</h2>
      <Notification message={errorMessage} type={'noti'}/>
      <p>{user.name} logged in
        <button
          onClick={() => {
            window.localStorage.removeItem('loggedBlogappUser')
            setUser(null)
          }}
        >
          logout
        </button>
      </p>
      <Togglable buttonLabel='create new blog' ref={blogFormRef}>
        <BlogForm
          createBlog={addBlog}
        />
      </Togglable>
      {/* {blogs.sort().map(blog =>
        <Blog key={blog.id} blog={blog} handleRemove={handleRemove(blog)} handleLike={handleLike(blog)}/>
      )} */}
      {blogs.map(blog => <Blog key={blog.id} blog={blog} handleRemove={handleRemove(blog)} handleLike={handleLike(blog)}/>)}
    </>
  )

  return (
    <div>
      {!user ?
        <>
          {loginForm()}
        </> :
        <>
          {blogForm()}
        </>
      }
    </div>
  )
}

export default App