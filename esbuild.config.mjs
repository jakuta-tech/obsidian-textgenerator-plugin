import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import path from "path";
import fs from "fs";
import obsidianAliasPlugin from "./obsidian-alias/index.js";
import processFallback from './obsidian-alias/process.js';
import { exec } from 'child_process';
import { definePlugin } from 'esbuild-plugin-define';

const banner =
	`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
repo: https://github.com/nhaouari/obsidian-textgenerator-plugin
*/
`;

const wasmPlugin = (config) => {
	return {
		name: "wasm",
		setup(build) {
			build.onResolve({
				filter: /\.wasm$/
			}, (args) => {
				if (args.resolveDir === "") {
					return;
				}
				return {
					path: path.isAbsolute(args.path) ?
						args.path : path.join(args.resolveDir, args.path),
					namespace: `wasm-${config.mode}`,
				};
			});
			build.onLoad({
				filter: /.*/,
				namespace: "wasm-deferred"
			},
				async (args) => ({
					contents: await fs.promises.readFile(args.path),
					loader: "file",
				})
			);
			build.onLoad({
				filter: /.*/,
				namespace: "wasm-embed"
			},
				async (args) => ({
					contents: await fs.promises.readFile(args.path),
					loader: "binary",
				})
			);
		},
	};
};

const prod = (process.argv[2] === 'production');

console.log({ prod })

const esbuildConfig = {
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.ts'],
	bundle: true,
	plugins: [
		wasmPlugin({
			mode: "embed",
		}),
		obsidianAliasPlugin()
	],

	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/closebrackets',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/comment',
		'@codemirror/fold',
		'@codemirror/gutter',
		'@codemirror/highlight',
		'@codemirror/history',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/matchbrackets',
		'@codemirror/panel',
		'@codemirror/rangeset',
		'@codemirror/rectangular-selection',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/stream-parser',
		'@codemirror/text',
		'@codemirror/tooltip',
		'@codemirror/view',
		"node:url",
		...builtins,
	],

	format: 'cjs',
	target: 'es2023',
	minify: prod,
	logLevel: "info",
	sourcemap: prod ? false : 'both',
	treeShaking: true,
	outfile: 'main.js',
};

if (prod) {
	esbuild.build(esbuildConfig);
} else {
	const context = await esbuild.context(esbuildConfig);
	try {
		await context.watch();
	} catch (error) {
		if (error) console.error('watch build failed:', error)
		else {
			// after the main.js is built, run the postcss command
			console.log('build:css')
			exec('postcss ./src/css/global.css -o styles.css')
		}
	}
}
