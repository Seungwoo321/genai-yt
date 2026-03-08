# genai-yt

AI-powered YouTube transcript extractor and analyzer using Claude Code or Cursor CLI.

[![npm version](https://badge.fury.io/js/genai-yt.svg)](https://www.npmjs.com/package/genai-yt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/Seungwoo321/genai-yt?style=social)](https://github.com/Seungwoo321/genai-yt)

## Features

- **Transcript extraction** - Extract raw transcripts from YouTube videos
- **Speech-to-text fallback** - Automatically falls back to yt-dlp + whisper-cpp when subtitles are unavailable
- **AI-powered analysis** - Summarize, extract insights, translate, or take notes using AI
- **Multi-provider support** - Claude Code CLI and Cursor CLI
- **Custom prompts** - Ask any question about a video with `ask` command
- **Multi-language** - Specify transcript language and translation target

## How It Works

```mermaid
flowchart TD
    A[Start: genai-yt] --> B{Command?}
    B -->|transcript| C[Fetch YouTube Transcript]
    B -->|summary/insights/translate/memo/ask| D[Fetch YouTube Transcript]
    C --> E{Subtitles available?}
    D --> F{Subtitles available?}
    E -->|Yes| G[Output raw text or timestamped]
    E -->|No| H[yt-dlp + whisper-cpp]
    H --> G
    F -->|Yes| I[Build AI Prompt]
    F -->|No| J[yt-dlp + whisper-cpp]
    J --> I
    I --> K{Provider}
    K -->|Claude Code| L[Claude Code CLI]
    K -->|Cursor CLI| M[Cursor CLI]
    L --> N[Display AI Response]
    M --> N
```

## Prerequisites

For AI commands, you need at least one of:

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) - Anthropic's official CLI
- [Cursor Agent CLI](https://www.cursor.com/) - Cursor's agent CLI (command: `agent`)

### Speech-to-Text (optional)

For videos without subtitles, install these tools for automatic fallback:

```bash
brew install yt-dlp whisper-cpp ffmpeg
```

Download a Whisper model (one-time setup):

```bash
mkdir -p ~/.local/share/whisper-cpp
cd ~/.local/share/whisper-cpp

# Base model (~142MB, fastest)
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin

# Or large-v3-turbo (~809MB, most accurate)
curl -LO https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
```

## Installation

```bash
# Global installation
npm install -g genai-yt

# Or use directly with npx (no installation required)
npx genai-yt transcript "<url>"
```

## Usage

### Extract Transcript (No AI)

```bash
# Raw transcript text
genai-yt transcript "<url>"

# With timestamps
genai-yt transcript "<url>" --timestamps

# Specify language
genai-yt transcript "<url>" --lang ko
```

### AI-Powered Commands

All AI commands require `-p, --provider` option.

```bash
# Summarize a video
genai-yt summary "<url>" -p claude-code

# Extract key insights
genai-yt insights "<url>" -p cursor-cli

# Translate transcript
genai-yt translate "<url>" -p claude-code --lang en

# Convert to organized notes
genai-yt memo "<url>" -p claude-code

# Ask a custom question
genai-yt ask "<url>" -p claude-code --prompt "Extract all investment advice from this video"
```

### Common Options

```bash
# Specify AI model
genai-yt summary "<url>" -p cursor-cli --model claude-4.5-sonnet

# Specify transcript language
genai-yt summary "<url>" -p claude-code --transcript-lang ja
```

## Commands

| Command | Description | AI Required |
|---------|-------------|-------------|
| `transcript <url>` | Extract raw transcript | No |
| `summary <url>` | Summarize video content | Yes |
| `insights <url>` | Extract key insights and action items | Yes |
| `translate <url>` | Translate transcript to target language | Yes |
| `memo <url>` | Convert to organized notes | Yes |
| `ask <url>` | Custom prompt-based analysis | Yes |

## Options

### transcript

| Option | Description | Default |
|--------|-------------|---------|
| `--lang <lang>` | Transcript language (e.g., ko, en, ja) | auto |
| `--timestamps` | Include timestamps | `false` |

### AI Commands (summary, insights, translate, memo, ask)

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --provider <provider>` | AI provider (claude-code or cursor-cli) | required |
| `--model <model>` | Model to use | provider default |
| `--transcript-lang <lang>` | Transcript language | auto |

### translate (additional)

| Option | Description | Default |
|--------|-------------|---------|
| `--lang <lang>` | Target language | `en` |

### ask (additional)

| Option | Description | Default |
|--------|-------------|---------|
| `--prompt <prompt>` | Custom prompt | required |

## Transcript Fallback

When YouTube subtitles are not available, genai-yt automatically falls back to local speech-to-text:

1. Downloads audio using `yt-dlp` (converted to 16kHz WAV)
2. Transcribes locally using `whisper-cpp` (no API key required)
3. Returns the transcribed text in the same format

The model is searched in these locations (first match wins):

| Priority | Path |
|----------|------|
| 1 | `WHISPER_MODEL` environment variable |
| 2 | `~/.local/share/whisper-cpp/ggml-large-v3-turbo.bin` |
| 3 | `~/.local/share/whisper-cpp/ggml-base.bin` |
| 4 | `~/.local/share/whisper-cpp/ggml-small.bin` |
| 5 | `~/.local/share/whisper-cpp/ggml-medium.bin` |
| 6 | `~/.local/share/whisper-cpp/ggml-large-v3.bin` |

## Examples

```bash
# Get Korean transcript with timestamps
genai-yt transcript "https://youtu.be/dQw4w9WgXcQ" --lang ko --timestamps

# Summarize a tech talk
genai-yt summary "https://www.youtube.com/watch?v=VIDEO_ID" -p claude-code

# Translate Japanese video to English
genai-yt translate "https://youtu.be/VIDEO_ID" -p claude-code --transcript-lang ja --lang en

# Extract investment tips
genai-yt ask "https://youtu.be/VIDEO_ID" -p cursor-cli --prompt "List all actionable investment tips"

# Video without subtitles (auto STT fallback)
genai-yt transcript "https://www.youtube.com/watch?v=VIDEO_ID"
```

## Requirements

- Node.js >= 18.0.0
- Claude Code CLI or Cursor CLI installed and authenticated (for AI commands)
- yt-dlp + whisper-cpp + ffmpeg (optional, for videos without subtitles)

## License

MIT
