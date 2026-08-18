# Mediabunny AVC quantizer repro

This reproduces the encoding path isolated from Remotion: an MP4 output, an AVC
`VideoSampleSource`, and 30 synthetic `VideoFrame`s. It compares the Mediabunny
1.55.1 default for `QUALITY_MEDIUM` (quantizer mode) with the old bitrate-based
behavior requested through `preferBitrate: true`.

```sh
bun install
bun run repro
```

To use a particular Chrome binary:

```sh
CHROME_PATH="/path/to/chrome" bun run repro
```

On the affected machine, the expected distinguishing result is an
`EncodingError: Flushing error` for `automatic-quantizer`, while
`forced-bitrate` succeeds.

The included GitHub Actions workflow runs the same case on `macos-latest`,
matching the environment where the Remotion suite fails.
