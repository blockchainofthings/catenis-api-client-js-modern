/**
 * Created by claudio on 2022-12-02
 */
import { resolve } from 'path'
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'modules',
        modulePreload: false,
        lib: {
            entry: resolve(__dirname, 'main.js'),
            formats: [
                'es'
            ],
            fileName: 'catenis-api-client'
        },
        sourcemap: false,
        minify: false
    }
});
