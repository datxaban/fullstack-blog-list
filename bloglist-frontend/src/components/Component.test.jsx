import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import BlogForm from './BlogForm'
import Togglable from './Togglable'
import { expect } from 'vitest'
import userEvent from '@testing-library/user-event'


test('checks that the component displaying a blog renders the blog title and author, but does not render its URL or number of likes by default', () => {
  const blog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.testurl.com',
    likes: 0,
    user: {
      name: 'Test User',
      username: 'testuser',
      id: '1234'
    }
  }

  const { container, queryByText } = render(<Blog blog={blog} />)

  expect(container).toHaveTextContent('Test Title')
  expect(container).toHaveTextContent('Test Author')
  expect(queryByText('www.testurl.com')).toBeNull()
  expect(queryByText('0 likes')).toBeNull()
})


test('checks that the blog URL and number of likes are shown when the button controlling the shown details has been clicked', async() => {
  const blog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.testurl.com',
    likes: 101,
    user: {
      name: 'Test User',
      username: 'testuser',
      id: '1234'
    }
  }

  const { container } = render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const showButton = screen.getByText('show')
  await user.click(showButton)
  expect(container).toHaveTextContent('www.testurl.com')
  expect(container).toHaveTextContent('101')
})

test('ensures that if the like button is clicked twice, the event handler the component received as props is called twice.', async() => {
  const blog = {
    title: 'Test Title',
    author: 'Test Author',
    url: 'www.testurl.com',
    likes: 101,
    user: {
      name: 'Test User',
      username: 'testuser',
      id: '1234'
    }
  }

  const mockHandler = vi.fn()

  render(
    <Blog blog={blog} handleLike={mockHandler}/>
  )

  const user = userEvent.setup()
  const showButton = screen.getByText('show')
  await user.click(showButton)
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})

test('form calls the event handler it received as props with the right details when a new blog is created', async() => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  const { container }= render(<BlogForm createBlog={createBlog} />)

  const title = container.querySelector('.title-input')
  const author = container.querySelector('.author-input')
  const url = container.querySelector('.url-input')
  const createButton = screen.getByText('create')

  await user.type(title, 'Test Title')
  await user.type(author, 'Test Author')
  await user.type(url, 'www.testurl.com')
  await user.click(createButton)

  expect(createBlog.mock.calls[0][0].title).toBe('Test Title')
  expect(createBlog.mock.calls[0][0].author).toBe('Test Author')
  expect(createBlog.mock.calls[0][0].url).toBe('www.testurl.com')
  expect(createBlog.mock.calls).toHaveLength(1)
})