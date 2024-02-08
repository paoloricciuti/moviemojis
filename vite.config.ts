import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { mock_modules } from './plugins/mock-modules';

export default defineConfig({
	plugins: [sveltekit(), mock_modules()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
