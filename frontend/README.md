# Prompt Mixer Extension Frontend

This is the frontend for the Prompt Mixer Chrome Extension, built with React, TypeScript, and Vite.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
# or
yarn
```

### Environment Variables

The frontend uses environment variables for configuration. Create a `.env` file in the frontend directory based on the `.env.example` file:

```bash
# Copy the example environment file
cp .env.example .env
```

Available environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Base URL for API requests | http://localhost:8000/api/v1 |

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

### Building

To build the extension:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/` - Source code
  - `assets/` - Static assets like images and icons
  - `chrome/` - Chrome extension specific code
    - `background/` - Background script
    - `content-scripts/` - Content scripts for different platforms
    - `sidepanel/` - Side panel UI components
  - `components/` - Reusable UI components
  - `context/` - React context providers
  - `services/` - API services and utilities
  - `styles/` - Global styles
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
