export const indexHtml = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>LoopBack API Explorer</title>
		<link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
		<link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
		<link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
		<style>
			html {
				box-sizing: border-box;
				overflow: -moz-scrollbars-vertical;
				overflow-y: scroll;
			}

			*,
			*:before,
			*:after {
				box-sizing: inherit;
			}

			body {
				margin: 0;
				background: #fafafa;
			}
		</style>
	</head>

	<body>
		<div id="swagger-ui"></div>

		<script src="./swagger-ui-bundle.js"></script>
		<script src="./swagger-ui-standalone-preset.js"></script>
		<script>
			window.onload = function () {
							    // Build a system
							    const ui = SwaggerUIBundle({
							      url: window.location.origin + '/explorer/openapi.json',
							      dom_id: '#swagger-ui',
								  persistAuthorization: true,
							      deepLinking: true,
							      filter: true,
							      defaultModelsExpandDepth: 1,
							      defaultModelExpandDepth: 1,
								  tryItOutEnabled: true,
							      presets: [
							        SwaggerUIBundle.presets.apis,
							        // SwaggerUIStandalonePreset
							        SwaggerUIStandalonePreset.slice(1) // Disable the top bar
							      ],
							      plugins: [
							        SwaggerUIBundle.plugins.DownloadUrl
							      ],
							      layout: 'StandaloneLayout',
									onComplete: () => {
										ui.preauthorizeApiKey("jwt", localStorage.getItem('access_token'));
									}
							    });

							    window.ui = ui;
							  }
		</script>
	</body>
</html>
`;
