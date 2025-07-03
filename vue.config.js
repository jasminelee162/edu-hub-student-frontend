const path = require('path');
module.exports = {
	transpileDependencies: true,
	publicPath: '/',
	outputDir: 'dist',
	assetsDir: 'assets',

	devServer: {
		host: '127.0.0.1',
		port: 3001,
		open: true,
		client: {
			overlay: false,
		},
		// 添加热更新配置
		hot: true,
		// 解决 API 代理问题（如果需要）
		proxy: {
			'/api': {
				target: 'http://your-api-server.com',
				changeOrigin: true,
				pathRewrite: {
					'^/api': ''
				}
			}
		}
	},

	// 合并 chainWebpack 配置
	chainWebpack: config => {
		config.module
			.rule('pdf-worker')
			.test(/pdf\.worker\.min\.js$/)
			.use('file-loader')
			.loader('file-loader')
			.options({
				name: '[name].[hash:8].[ext]'
			})
			.end()
	},

	// 优化 Webpack 配置
	configureWebpack: {
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"os": false,
				"net": false,
				"tls": false,

			}
		},
		module: {
			rules: [
				{
					test: /pdf\.worker\.min\.js$/,
					type: "javascript/auto",
					use: {
						loader: 'file-loader',
						options: {
							name: '[name].[hash:8].[ext]'
						}
					}
				}
			]
		},
		// 优化性能配置
		performance: {
			hints: false,
			maxEntrypointSize: 512000,
			maxAssetSize: 512000
		}
	}
}