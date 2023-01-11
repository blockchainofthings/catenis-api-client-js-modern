/**
 * Created by claudio on 2022-12-02
 */
import { resolve } from 'path'
import { defineConfig } from 'vite';

export default defineConfig(({command, mode}) => {
    if (command === 'build') {
        const config = {
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
                outDir: 'dist/plain',
                sourcemap: false,
                minify: false
            }
        };

        if (mode === 'minified') {
            config.build.lib.fileName = 'catenis-api-client.min';
            config.build.outDir = 'dist/minified';
            config.build.minify = true;
        }

        return config;
    }
});
