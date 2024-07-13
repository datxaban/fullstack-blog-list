const loginWith = async (page, username, password)  => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const logout = async (page) => {
  await page.getByRole('button', { name: 'logout' }).click()
}

const createBlog = async (page, title, author, url, likes) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByTestId('title').fill(title)
  await page.getByTestId('author').fill(author)
  await page.getByTestId('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()

  if (!!likes) {
    await page.waitForSelector('.blog-post', { state: 'visible' });
    const blogPostLocator = await page.locator('.blog-post', { hasText: title });
    await blogPostLocator.waitFor();
    const blog = blogPostLocator.locator('..');

    await blog.locator('button', { hasText: 'show' }).click();

    const likeButton = blog.locator('.blog-like', { hasText: 'like' });
    for (let i = 0; i < likes; i++) {
      await likeButton.click();
    }
  } 
}

export { loginWith, createBlog, logout }