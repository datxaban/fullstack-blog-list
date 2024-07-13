// @ts-check
const { test, expect, describe, beforeEach } = require('@playwright/test');
const { loginWith, createBlog, logout } = require('./helper');
const { log } = require('console');

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Dat Doan',
        username: 'datdoan',
        password: 'password1234'
      }
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Fake User',
        username: 'fakeuser',
        password: 'password1234'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const usernameInput = page.locator('input[data-testid="username"]');
    await expect(usernameInput).toBeVisible();
    const passwordInput = page.locator('input[data-testid="password"]');
    await expect(passwordInput).toBeVisible();
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'datdoan', 'password1234')
      await expect(page.getByText('Dat Doan logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('datdoan')
      await page.getByTestId('password').fill('wrongpassword')
      await page.getByRole('button', { name: 'login' }).click()
      
      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('datdoan logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'datdoan', 'password1234')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'New title', 'New author', 'http://newurl.com')
      await expect(page.locator('.blog-post')).toContainText('New title New author')
    })  
    test('a new blog can be liked', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'http://newurl.com')
      await page.getByRole('button', { name: 'show' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.locator('.blog-like')).toContainText('2')
    })
    test('user who added the blog can delete', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'http://newurl.com')
      await page.getByRole('button', { name: 'show' }).click()
      await expect(page.locator('.blog-remove')).toContainText('remove')
      await page.evaluate(() => {
        window.confirm = () => true;
      });
      await page.getByRole('button', { name: 'remove' }).click()
      await expect(page.getByText('Test title Test author')).not.toBeVisible()
    })
    test('only ther user who created the blog can delete it', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'http://newurl.com')
      await page.getByRole('button', { name: 'show' }).click()
      await expect(page.locator('.blog-remove')).toContainText('remove')
      await logout(page)
      await loginWith(page, 'fakeuser', 'password1234')
      await page.getByRole('button', { name: 'show' }).click()
      await expect(page.locator('.blog-remove')).toBeHidden()
    })
    test('blogs are ordered by likes', async ({ page }) => {
      await createBlog(page, 'Blog with 1 like', 'Author 1', 'http://example1.com', 1);
      await createBlog(page, 'Blog with 3 likes', 'Author 3', 'http://example3.com', 3);
      await createBlog(page, 'Blog with 2 likes', 'Author 2', 'http://example2.com', 2);

      await page.reload();
      const blogs = await page.locator('.blog').all();

      const likes = await Promise.all(blogs.map(async (blog) => {
        const likesText = await blog.locator('.blog-like').innerText();
        return parseInt(likesText.split(' ')[0]);
      }));

      for (let i = 0; i < likes.length - 1; i++) {
        expect(likes[i]).toBeGreaterThanOrEqual(likes[i + 1]);
      }
    })
  })
})
