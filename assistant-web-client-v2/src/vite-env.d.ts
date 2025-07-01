/// <reference types="vite/client" />
interface ImportMetaEnv {
	readonly VITE_BASE_PATH: string;
	readonly VITE_API_PATH: string;
	readonly VITE_ENVIRONMENT?: 'dev' | 'stage' | 'prod';
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}