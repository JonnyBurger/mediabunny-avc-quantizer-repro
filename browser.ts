import {
	BufferTarget,
	Mp4OutputFormat,
	Output,
	QUALITY_MEDIUM,
	VideoSample,
	VideoSampleSource,
} from 'mediabunny';

const run = async () => {
	const target = new BufferTarget();
	const output = new Output({format: new Mp4OutputFormat(), target});
	const source = new VideoSampleSource({
		codec: 'avc',
		bitrate: QUALITY_MEDIUM,
	});

	output.addVideoTrack(source);
	await output.start();

	const canvas = new OffscreenCanvas(100, 100);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('2D canvas is unavailable');
	}

	for (let frameIndex = 0; frameIndex < 1; frameIndex++) {
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

declare global {
	interface Window {
		__mediabunnyResult?: {bytes?: number; error?: string};
	}
}

run()
	.then((bytes) => {
		window.__mediabunnyResult = {bytes};
	})
	.catch((error) => {
		window.__mediabunnyResult = {
			error:
				error instanceof Error
					? `${error.name}: ${error.message}`
					: String(error),
		};
	});
