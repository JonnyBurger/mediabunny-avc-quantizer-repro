import {createReadStream} from 'node:fs';
import {createServer} from 'node:http';
import {resolve} from 'node:path';
import {chromium} from 'playwright';

const root = import.meta.dirname;
const server = createServer((request, response) => {
	const pathname = request.url === '/' ? '/index.html' : request.url;
	const path = resolve(root, `.${pathname}`);
	response.setHeader(
		'Content-Type',
		path.endsWith('.js') ? 'text/javascript' : 'text/html',
	);
	createReadStream(path).on('error', () => {
		response.statusCode = 404;
		response.end('Not found');
	}).pipe(response);
});

await new Promise((resolveListening) => server.listen(0, '127.0.0.1', resolveListening));
const address = server.address();
if (!address || typeof address === 'string') {
	throw new Error('Could not start HTTP server');
}

const launchOptions = process.env.CHROME_PATH
	? {executablePath: process.env.CHROME_PATH}
	: {channel: 'chrome'};
const browser = await chromium.launch({...launchOptions, headless: true});
console.log(`Browser: ${browser.version()}`);
const page = await browser.newPage();

try {
	await page.goto(`http://127.0.0.1:${address.port}`);
	await page.waitForFunction(() => window.__mediabunnyResult !== undefined);
	const result = await page.evaluate(() => window.__mediabunnyResult);
	console.log(JSON.stringify(result, null, 2));
	if (result.error) {
		process.exitCode = 1;
	}
} finally {
	await browser.close();
	server.close();
}
