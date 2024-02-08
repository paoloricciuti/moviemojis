import type { Plugin } from 'vite';
import { mergeAlias } from 'vite';

export function mock_modules() {
	return {
		name: 'vite-plugin-mock-modules',
		enforce: 'post',
		config(config, { mode }) {
			if (mode === 'test') {
				if (!config.resolve?.alias) {
					if (!config.resolve) {
						config.resolve = {};
					}
					config.resolve.alias = {};
				}
				config.resolve.alias = mergeAlias(config.resolve.alias, {
					'$lib/db/queries/index.server.js': '/src/lib/db/queries/mocks/index.server.js',
					'$lib/auth/index.server': '/src/lib/auth/mocks/index.server.js',
				});
			}
		},
	} satisfies Plugin;
}
