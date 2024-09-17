module.exports = function (config) {
	config.set({
		frameworks: ['jasmine'],

		files: [{ pattern: '../loopback/client/*.js', type: 'js' }, { pattern: '../loopback/client/index.html' }],
		reporters: ['dots'],

		browsers: ['ChromeHeadlessCI'],
		customLaunchers: {
			ChromeHeadlessCI: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox']
			}
		},
		singleRun: true,
		proxies: {
			'/assets/': '../src/assets/'
		}
	});
};
