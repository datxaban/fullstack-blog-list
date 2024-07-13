import { useState } from 'react'
import blogService from '../services/blogs'
const Blog = ({ blog, handleRemove, handleLike }) => {
  const [showDetails, setShowDetails] = useState(false)
  const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
  const username = loggedUserJSON ? JSON.parse(loggedUserJSON).username : null
  const blogStyle = {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const removeButtonStyle = {
    backgroundColor: 'blue',
    color: 'white'
  }
  return (
    <>
      {
        showDetails?
          <div style={blogStyle} className='blog'>
            <div className='blog-post'>{blog.title} {blog.author} <button onClick={() => {setShowDetails(!showDetails)}}>hide</button></div>
            <div>{blog.url}</div>
            <div className='blog-like'>{blog.likes} <button onClick={handleLike}>like</button></div>
            <div>{blog.user.name}</div>
            { username === blog.user.username &&
              <div>
                <button className='blog-remove' style={removeButtonStyle} onClick={handleRemove}>remove</button>
              </div>
            }
          </div>
          :
          <div style={blogStyle}>
            <div className='blog-post'>{blog.title} {blog.author} <button onClick={() => {setShowDetails(!showDetails)}}>show</button></div>
          </div>
      }
    </>
  )
}

export default Blog