#!/usr/bin/env python3
"""Prepare the user's completed water-entry movie for the existing scroll section."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/brand/water-entry'
FRAME_COUNT = 171


def run(*args):
    subprocess.run(list(args), check=True)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    probe = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,duration:format=duration,size',
        '-of', 'json', str(source)
    ]))
    duration = float(probe['format']['duration'])
    assert duration > 1, 'The source must contain a complete video sequence'
    assert source != OUT / 'water-entry.mp4', 'Keep the original separate from derivatives'
    frames = OUT / 'frames'
    frames.mkdir(parents=True, exist_ok=True)
    mobile_frames = OUT / 'frames-mobile'
    mobile_frames.mkdir(parents=True, exist_ok=True)
    # Timestamp sampling supports variable-frame-rate sources. Include the stable final frame.
    sample_end = duration - 1 / 24
    sample_fps = (FRAME_COUNT - 1) / sample_end
    # Preserve the source's 720p detail on every device. The former 360p mobile
    # sequence was enlarged to screen height, visibly softening the bottle.
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
        '-an', '-vf', f'setpts=PTS-STARTPTS,fps={sample_fps:.9f}:start_time=0:round=near,tpad=stop_mode=clone:stop_duration=1,scale=1280:720:flags=lanczos',
        '-frames:v', str(FRAME_COUNT), '-start_number', '0', '-q:v', '2',
        str(frames / 'se34-%04d.jpg'))
    for frame in sorted(frames.glob('se34-*.jpg')):
        (mobile_frames / frame.name).write_bytes(frame.read_bytes())
    run('ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
        '-map', '0:v:0', '-an', '-vf', 'fps=24,scale=1280:720:flags=lanczos,setsar=1',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p',
        '-g', '48', '-movflags', '+faststart', str(OUT / 'water-entry.mp4'))
    # Poster shares the exact first frame with the desktop scroll sequence.
    (OUT / 'poster.jpg').write_bytes((frames / 'se34-0000.jpg').read_bytes())
    sequence = sorted(frames.glob('se34-*.jpg'))
    assert len(sequence) == FRAME_COUNT
    mobile_sequence = sorted(mobile_frames.glob('se34-*.jpg'))
    assert len(mobile_sequence) == FRAME_COUNT
    files = [OUT / 'water-entry.mp4', OUT / 'poster.jpg', *sequence, *mobile_sequence]
    record = {
        'source': {'fileName': source.name, 'bytes': source.stat().st_size,
                   'sha256': digest(source), 'durationSeconds': duration,
                   'width': probe['streams'][0]['width'], 'height': probe['streams'][0]['height'],
                   'provenance': 'Completed video supplied by the brand owner on 2026-10-04'},
        'desktop': {'frameCount': FRAME_COUNT, 'width': 1280, 'height': 720,
                    'jpegQuality': 2, 'sampleBy': 'timestamp',
                    'sampleEndSeconds': sample_end, 'sampleFps': sample_fps,
                    'playback': 'Scroll-driven frame sequence, not wall-clock playback'},
        'mobile': {'frameCount': FRAME_COUNT, 'width': 1280, 'height': 720,
                   'jpegQuality': 2, 'source': 'Byte-identical copy of desktop frames; no 360p downscale',
                   'playback': 'Same blackout and scroll-driven sequence; no embedded video player'},
        'rendering': {'canvasDevicePixelRatioCap': 2, 'imageSmoothingQuality': 'high',
                      'assetVersion': '20261004-water-hd1',
                      'note': 'Preserves source detail; no AI upscaling or invented product lettering'},
        'timing': {'sectionHeightVh': 420, 'blackHoldEnd': 0.05,
                   'revealStart': 0.05, 'revealEnd': 0.13,
                   'motionStart': 0.10, 'motionEnd': 0.87, 'motionEase': 'power2.out',
                   'tailHoldEnd': 0.94, 'fadeOutEnd': 1.0},
        'archivedWebVideo': {'file': 'water-entry.mp4', 'fps': 24,
                             'note': 'Optimized reference copy; not rendered as a video element in the page'},
        'files': [{'path': p.relative_to(OUT).as_posix(), 'bytes': p.stat().st_size,
                   'sha256': digest(p)} for p in files]
    }
    (ROOT / 'docs/water-video-manifest.json').write_text(
        json.dumps(record, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'frames': len(sequence), 'totalBytes': sum(p.stat().st_size for p in files),
                      'sourceDurationSeconds': duration}, ensure_ascii=False))


if __name__ == '__main__':
    main()
