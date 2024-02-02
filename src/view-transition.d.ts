declare global {
	interface ViewTransition {
		updateCallbackDone: Promise<void>;
		ready: Promise<void>;
		finished: Promise<void>;
		skipTransition: () => void;
	}
	interface Document {
		startViewTransition?: (starter: (...props: unknown[]) => unknown) => ViewTransition;
	}
}

export {};
