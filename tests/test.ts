import { expect } from '@playwright/test';
import { test } from '.';

test('index page has expected h1', async ({ page, seed }) => {
	await seed({
		movies: [
			{
				id: '',
				emojis: '',
				title: '',
				tmdb_id: '',
				created_at: null,
				created_by: null,
				updated_at: null,
			},
		],
	});
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Welcome to SvelteKit' })).toBeVisible();
});

test('index page has expected', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Welcome to SvelteKit' })).toBeVisible();
});
