import {
	BufferTarget,
	Mp4OutputFormat,
	Output,
	Quality,
	QUALITY_MEDIUM,
	VideoSample,
	VideoSampleSource,
} from 'mediabunny';

type Mode = 'automatic-quantizer' | 'forced-bitrate';

const encode = async (mode: Mode) => {
	const quality =
		mode === 'automatic-quantizer'
			? QUALITY_MEDIUM
			: new Quality({quality: 'medium', preferBitrate: true});
	const target = new BufferTarget();
	const output = new Output({format: new Mp4OutputFormat(), target});
	const source = new VideoSampleSource({codec: 'avc', bitrate: quality});

	output.addVideoTrack(source);
	await output.start();

	const canvas = new OffscreenCanvas(100, 100);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('2D canvas is unavailable');
	}

	for (let frameIndex = 0; frameIndex < 30; frameIndex++) {
		context.fillStyle = frameIndex % 2 === 0 ? 'red' : 'blue';
		context.fillRect(0, 0, canvas.width, canvas.height);

		const frame = new VideoFrame(canvas, {
			timestamp: Math.round((frameIndex / 30) * 1_000_000),
			duration: Math.round((1 / 30) * 1_000_000),
		});
		const sample = new VideoSample(frame);

		try {
			await source.add(sample);
		} finally {
			sample.close();
			frame.close();
		}
	}

	source.close();
	await output.finalize();
	return target.buffer?.byteLength ?? 0;
};

const run = async () => {
	const results = [];

	for (const mode of ['automatic-quantizer', 'forced-bitrate'] as const) {
		try {
			results.push({mode, ok: true, bytes: await encode(mode)});
		} catch (error) {
			results.push({
				mode,
				ok: false,
				error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
			});
		}
	}

	window.__mediabunnyResults = results;
	document.body.textContent = JSON.stringify(results, null, 2);
};

declare global {
	interface Window {
		__mediabunnyResults?: unknown;
	}
}

void run();
