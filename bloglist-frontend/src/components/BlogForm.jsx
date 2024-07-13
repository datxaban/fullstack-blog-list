import { useState } from 'react'
import blogService from '../services/blogs'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleAddBlog = (event) => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url
    })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return(
    <>
      <h2>create new</h2>
      <form onSubmit={handleAddBlog}>
        <div>
          title:
          <input
            type="text"
            data-testid="title"
            className='title-input'
            value={title}
            name="Title"
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            type='text'
            data-testid="author"
            className='author-input'
            value={author}
            name="Author"
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          url
          <input
            type='text'
            data-testid="url"
            className='url-input'
            value={url}
            name="Url"
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </>
  )
}

export default BlogForm