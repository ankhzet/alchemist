
const path = require('path');
const webpack = require('webpack');

const WatchIgnorePlugin = require('watch-ignore-webpack-plugin');

const DEBUG = !process.argv.includes('--release');
const VERBOSE = process.argv.includes('--verbose');

const SCRIPTS_ROOT = './alchemist/scripts';

module.exports = {
	entry: {
		// popup: SCRIPTS_ROOT + '/src/popup.js',
		// content: SCRIPTS_ROOT + '/src/content.js',
		background: SCRIPTS_ROOT + '/src/background.js',
	},
	output: {
		publicPath: '/',
		sourcePrefix: '  ',

		path: SCRIPTS_ROOT,
		filename: DEBUG ? '[name].js?[hash]' : '[name].js',
	},

	// devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery"
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
			'process.env.BROWSER': true,
			__DEV__: DEBUG,
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: "commons",
			filename: "commons.js",
			// minChunks: 2,
			// (Modules must be shared between 3 entries)

			// chunks: ["background", "content", "popup"],
			// (Only use these entries)
		}),
		...(!DEBUG ? [
			new WatchIgnorePlugin([
				path.resolve(__dirname, './**/fonts/'),
			]),

			new webpack.optimize.OccurenceOrderPlugin(),
			// new webpack.optimize.UglifyJsPlugin({
			// 	compress: {
			// 		screw_ie8: true,
			// 		warnings: VERBOSE,
			// 	},
			// }),
			new webpack.optimize.AggressiveMergingPlugin(),
		] : []),
	],

	cache: DEBUG,
	debug: DEBUG,

	watchOptions: {
		aggregateTimeout: 400,
		poll: true,
	},

	stats: {
		colors: true,
		reasons: DEBUG,
		hash: VERBOSE,
		version: VERBOSE,
		timings: true,
		chunks: VERBOSE,
		chunkModules: VERBOSE,
		cached: VERBOSE,
		cachedAssets: VERBOSE,
	},

	resolve: {
		extensions: ['', '.js', '.jsx', '.json'],
		alias: {
			'react': 'react-lite',
			'react-dom': 'react-lite',
		},
	},

	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'style!css',
			}, {
				test: /\.json$/,
				loader: 'json',
			}, {
				test: /\.txt$/,
				loader: 'raw',
			}, {
				test: /\.(png|jpg|jpeg|gif)$/,
				loader: 'url?limit=10000',
			}, {
				test: /\.(wav|mp3|ogg)$/,
				loader: 'url?name=sounds/[name].[ext]',
			}, {
				test: /\.(eot|ttf|svg|woff|woff2)$/,
				loader: 'file?name=../styles/fonts/[name].[ext]',
			},
		],
	},

};
