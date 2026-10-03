/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		GSSound?: {
			whoosh: () => void;
			pop: () => void;
		};
		GSShell?: any;
		GSIDB?: {
			open: () => Promise<any>;
		};
		ort?: any;
	}
}

declare module 'lucide-react' {
	const content: any;
	export default content;
	export * from 'lucide-react';
}

declare module 'piexifjs';

export {};
