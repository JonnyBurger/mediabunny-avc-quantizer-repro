# Mediabunny AVC quantizer repro

This reproduces a Mediabunny 1.55.1 AVC encoding failure on GitHub's
`macos-latest` runner. It creates an MP4 from 30 synthetic `VideoFrame`s using
`QUALITY_MEDIUM`.

```sh
bun install
bun run repro
```

To use a particular Chrome binary:

```sh
CHROME_PATH="/path/to/chrome" bun run repro
```

On the affected machine, `output.finalize()` rejects with
`EncodingError: Flushing error`.

The included GitHub Actions workflow runs the same case on `macos-latest`,
matching the environment where the Remotion suite fails.
