const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  let favorite = {}
  blogs.forEach(blog => {
    if (!favorite.likes || blog.likes > favorite.likes) {
      favorite = {
        title: blog.title,
        author: blog.author,
        likes: blog.likes,
      };
    }
  })
  return favorite
}

const mostBlogs = (blogs) => {
  let authors = {}
  blogs.forEach(blog => {
    if (authors[blog.author]) {
      authors[blog.author]++
    } else {
      authors[blog.author] = 1
    }
  })
  let max = { author: '', blogs: 0 }
  for (let author in authors) {
    if (authors[author] > max.blogs) {
      max.author = author
      max.blogs = authors[author]
    }
  }
  return max
}

const mostLikes = (blogs) => {
  let authors = {}
  blogs.forEach(blog => {
    if (authors[blog.author]) {
      authors[blog.author] += blog.likes
    } else {
      authors[blog.author] = blog.likes
    }
  })
  let max = { author: '', likes: 0 }
  for (let author in authors) {
    if (authors[author] > max.likes) {
      max.author = author
      max.likes = authors[author]
    }
  }
  return max
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}