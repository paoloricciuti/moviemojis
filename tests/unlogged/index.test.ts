import { test } from '../index';
import { expect } from '@playwright/test';

test.describe('unlogged homepage', () => {
	test('it calls open-ai to generate the emojis if the movie is not present in the db', async ({
		page,
		seed,
	}) => {
		await seed({
			movies: [],
		});
		await page.goto('/');
		// we are mocking the openai response so we know that this
		// will be returned as emojis
		const open_ai_generated_emojis = page.getByText('🧙🏻🕸️🧡🪱');
		await expect(open_ai_generated_emojis).toBeVisible();
	});

	test("it returns the movie from the db if it's present", async ({ page, seed }) => {
		const emojis = '✉️☠️🧡';
		await seed({
			movies: [
				{
					emojis,
					created_by: null,
					title: 'The Postcard Killings',
					tmdb_id: '1233',
				},
			],
		});
		await page.goto('/');
		const db_emojis = page.getByText(emojis);
		await expect(db_emojis).toBeVisible();
	});
});
