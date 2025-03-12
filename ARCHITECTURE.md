# Prompt Mixer Extension Architecture

## Project Overview

Prompt Mixer Extension is a Chrome browser extension that helps users work with prompts for AI models like GPT and Claude. The extension provides a library of prompts with variables and a feature to improve existing prompts.

## Technology Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **Extension Type**: Chrome Side Panel

### Backend
- **Framework**: FastAPI (Python)
- **Cloud Services**: Google Cloud for authentication and database

## Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── assets/                # Static resources (images, fonts)
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Basic UI components (buttons, inputs, modals)
│   │   ├── layout/            # Page structure components
│   │   ├── features/          # Feature-specific components
│   │   │   ├── prompt-editor/ # Components for prompt editing
│   │   │   ├── prompt-list/   # Components for prompt listing
│   │   │   └── ...
│   ├── pages/                 # Extension pages
│   │   ├── home/
│   │   ├── library/
│   │   ├── settings/
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── usePrompts.js      # Hook for working with prompts
│   │   ├── useAuth.js         # Hook for authentication
│   │   └── ...
│   ├── services/              # Services for external interactions
│   │   ├── api/               # API clients
│   │   │   ├── promptsApi.js  # API for prompt operations
│   │   │   ├── authApi.js     # API for authentication
│   │   │   └── ...
│   │   ├── storage/           # Storage services
│   │   └── ...
│   ├── utils/                 # Utilities and helpers
│   │   ├── formatters.js      # Data formatting
│   │   ├── validators.js      # Data validation
│   │   └── ...
│   ├── constants/             # Constants and configuration
│   │   ├── apiEndpoints.js    # API endpoints
│   │   ├── config.js          # General configuration
│   │   └── ...
│   ├── types/                 # TypeScript types (if using TS)
│   ├── context/               # React contexts
│   │   ├── AuthContext.jsx    # Authentication context
│   │   ├── PromptContext.jsx  # Prompts context
│   │   └── ...
│   ├── chrome/                # Chrome-specific code
│   │   ├── content-scripts/   # Content scripts
│   │   │   ├── gpt-injector.js    # Injection for GPT pages
│   │   │   ├── claude-injector.js # Injection for Claude pages
│   │   │   └── ...
│   │   ├── background/        # Background scripts
│   │   │   ├── messageHandler.js  # Message handler
│   │   │   ├── apiProxy.js        # API request proxy
│   │   │   └── ...
│   │   ├── sidepanel/         # Side panel code
│   │   └── ...
│   ├── App.jsx                # Main application component
│   └── main.jsx               # Entry point
```

### Backend Structure

```
backend/
├── app/
│   ├── api/                   # API endpoints
│   │   ├── routes/            # API routes
│   │   │   ├── prompts.py     # Endpoints for prompts
│   │   │   ├── auth.py        # Endpoints for authentication
│   │   │   └── ...
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   └── ...
│   ├── core/                  # Application core
│   │   ├── config.py          # Configuration
│   │   ├── security.py        # Security and authentication
│   │   └── ...
│   ├── db/                    # Database operations
│   │   ├── repositories/      # Data repositories
│   │   │   ├── prompt_repo.py # Prompt repository
│   │   │   ├── user_repo.py   # User repository
│   │   │   └── ...
│   │   ├── models/            # Database models
│   │   │   ├── prompt.py      # Prompt model
│   │   │   ├── user.py        # User model
│   │   │   └── ...
│   │   ├── session.py         # DB session management
│   │   └── ...
│   ├── services/              # Business logic
│   │   ├── prompt_service.py  # Prompt service
│   │   ├── auth_service.py    # Authentication service
│   │   ├── ai_service.py      # AI prompt improvement service
│   │   └── ...
│   ├── schemas/               # Pydantic schemas
│   │   ├── prompt.py          # Prompt schemas
│   │   ├── user.py            # User schemas
│   │   └── ...
│   ├── utils/                 # Utilities
│   │   ├── validators.py      # Validators
│   │   ├── formatters.py      # Data formatters
│   │   └── ...
│   ├── exceptions/            # Custom exceptions
│   │   ├── base.py            # Base exceptions
│   │   ├── auth.py            # Authentication exceptions
│   │   └── ...
│   ├── middleware/            # Middleware
│   │   ├── logging.py         # Logging
│   │   ├── error_handler.py   # Error handling
│   │   └── ...
│   └── main.py                # FastAPI entry point
```

## Responsibility Separation Principles

1. **Single Responsibility**: Each module, class, or function should have only one reason to change.

2. **Layered Architecture**:
   - UI layer (React components)
   - Application layer (hooks, contexts)
   - Domain layer (business logic)
   - Infrastructure layer (API, storage)

3. **Pure Functions**: Maximize the use of pure functions without side effects.

4. **Dependency Inversion**: High-level modules should not depend on low-level modules.

5. **Interface Segregation**: Separate interfaces for different client requirements.

## Key Features

1. **User Prompt Library with Variables**:
   - Storage and management of user-created prompts
   - Support for variables within prompts
   - CRUD operations for prompts

2. **Shared Prompt Library**:
   - Access to a common library of prompts
   - Ability to copy and customize shared prompts

3. **Prompt Improvement**:
   - Button injection next to input fields on GPT/Claude websites
   - Sending user-written prompts to backend for improvement
   - Returning improved prompts to the input field

## Data Flow

1. **Prompt Improvement Flow**:
   - User writes a prompt in GPT/Claude
   - User clicks the "Improve Prompt" button
   - Content script captures the prompt text
   - Background script sends the prompt to the backend
   - Backend processes and improves the prompt
   - Improved prompt is returned to the content script
   - Content script updates the input field with the improved prompt

2. **Prompt Management Flow**:
   - User creates/edits prompts in the side panel
   - Prompts are stored locally and/or synced with the backend
   - User can apply prompts directly to GPT/Claude input fields

## Authentication and Data Storage

- Google Cloud services for authentication and data storage
- User data synchronization between devices
- Secure API communication

## Development Guidelines

1. **File Size**: Limit file size (no more than 200-300 lines).

2. **Naming**: Clear and consistent file and component naming.

3. **Documentation**: Comments for complex code parts and JSDoc/TypeDoc for public APIs.

4. **Testing**: Structure that facilitates testing (pure functions, dependency injection).
