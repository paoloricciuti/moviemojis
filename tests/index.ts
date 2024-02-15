import { test as base } from '@playwright/test';
import { SEED_ENDPOINT } from '../constants';
import type { Db } from '../src/lib/db/utils.server';

export const test = base.extend<{ seed: (seed: Db) => Promise<void> }>({
	page: async ({ page, javaScriptEnabled }, use) => {
		// automatically wait for kit started event after navigation functions if js is enabled
		const page_navigation_functions = ['goto', 'goBack', 'reload'];
		page_navigation_functions.forEach((fn) => {
			const page_fn = (page as unknown as Record<string, (...args: unknown[]) => unknown>)[fn];
			if (!page_fn) {
				throw new Error(`function does not exist on page: ${fn}`);
			}
			(page as unknown as Record<string, unknown>)[fn] = async function (...args: unknown[]) {
				const res = await page_fn.call(page, ...args);
				if (javaScriptEnabled) {
					await page.waitForSelector('body[data-kit-started]', { timeout: 15000 });
				}
				return res;
			};
		});

		await use(page);
	},
	seed: async ({ baseURL }, use) => {
		await use(async (seed) => {
			await fetch(`${baseURL}${SEED_ENDPOINT}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(seed),
			});
		});
	},
});
