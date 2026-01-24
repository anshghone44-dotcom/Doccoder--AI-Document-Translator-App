# Doccoder

Transform any document into beautiful, professional PDFs with AI-powered intelligence, and convert PDFs back to editable formats.

## Features

- **Multi-format support**: Word, Excel, images, screenshots, code files (HTML, CSS, JSON, Python, JS, TS, and 30+ languages)
- **Bi-directional conversion**: Convert TO PDF and FROM PDF to TXT, DOCX, or extract images
- **Voice-to-text prompts**: Use your voice to describe conversions with ElevenLabs speech-to-text
- **AI-enhanced titles**: OpenAI GPT-4 Turbo generates smart document titles based on your prompts
- **Professional templates**: Choose from Minimal, Professional, or Photo layouts
- **Flexible layouts**: Portrait or landscape orientation with customizable margins
- **Batch processing**: Convert multiple files at once, download as ZIP
- **Editable output**: Edit converted text files before downloading with built-in editor

## Setup

### Environment Variables

To enable all features, add the following environment variables to your Vercel project:

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add the following variables:

\`\`\`
OPENAI_API_KEY=your_actual_openai_key
ELEVENLABS_API_KEY=your_actual_elevenlabs_key
\`\`\`

**Required for:**
- `OPENAI_API_KEY`: AI-powered document analysis and title generation
- `ELEVENLABS_API_KEY`: Voice-to-text prompt feature

**Important**: Never commit API keys to your repository. Always use environment variables.

### Installation

\`\`\`bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
\`\`\`

## Usage

### Convert to PDF
1. Select a design template (Minimal, Professional, or Photo)
2. Choose orientation and margins
3. Add your transformation prompt (optional) - use the microphone button for voice input
4. Upload files via drag-and-drop or file picker
5. Click "Transform to PDF" to generate your documents

### Convert from PDF
1. Select target format (TXT, DOCX, or Images)
2. Add conversion instructions (optional) - use the microphone button for voice input
3. Upload PDF files
4. Click convert and edit the output before downloading

### Voice Input
- Click the microphone button next to the prompt field
- Speak your conversion instructions
- Click the stop button when finished
- Your speech will be transcribed and added to the prompt

### File Editing
- After conversion, click "Edit Before Download" on text files
- Make changes in the built-in editor
- Click "Save & Download" to download your edited version

## Tech Stack

- Next.js 14 with App Router
- OpenAI GPT-4 Turbo for AI features
- ElevenLabs API for speech-to-text
- pdf-lib for PDF generation and parsing
- Sharp for image processing
- Mammoth for DOCX processing
- Tailwind CSS v4
- Playfair Display font for elegant branding
