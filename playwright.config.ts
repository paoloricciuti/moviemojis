import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'pnpm build --mode test && pnpm preview --mode test',
		port: 4173,
		stdout: 'pipe',
		stderr: 'pipe',
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	reporter: 'html',
};

export default config;
