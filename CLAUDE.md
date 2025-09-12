# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

The TypeScript build must pass (`tsc -b`) before Vite builds the application.

## Architecture Overview

This is a React-based chat analytics application for Kick.com streamers built with:

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4
- **Real-time data**: Pusher WebSocket connections
- **State management**: React Context (ThemeContext) + custom hooks
- **Data persistence**: localStorage for link analytics and user preferences

### Key Application Flow

1. **User Input**: Users enter a Kick.com username to connect to a streamer's chat
2. **Channel Fetching**: `KickAPIService` fetches channel data from Kick.com API (`/api/v1/channels/{username}`)
3. **Chat Connection**: `PusherService` subscribes to WebSocket events (`chatrooms.{chatroomId}.v2`)
4. **Message Processing**: Chat messages are parsed for links and stored with analytics
5. **Data Persistence**: Link statistics are stored in localStorage per streamer

### Core Services

- **PusherService** (`src/services/pusher.ts`): Manages WebSocket connection to Kick.com chat using Pusher client with cluster 'us2'
- **KickAPIService** (`src/services/api.ts`): HTTP client for Kick.com REST API
- **Link Storage** (`src/shared/utils/linkStorage.ts`): localStorage utilities for persisting link analytics per streamer

### Main Hooks

- **useChannel**: Manages username input, channel fetching, loading states, and connection lifecycle
- **useChatAndLinksWithPersistence**: Handles chat message streaming, URL extraction, link analytics, and localStorage persistence

### Feature Organization

The application is organized by feature domains:
- `features/channel/`: Channel information display
- `features/chat/`: Chat message rendering with emote parsing
- `features/links/`: Link analytics panels (individual and grouped views)
- `shared/`: Reusable components, hooks, utilities, and contexts

### Theme System

Dark/light theme toggle using React Context (`ThemeContext`) with CSS custom properties and TailwindCSS theme variants.

### Data Models

Key TypeScript interfaces are defined in `src/types/`:
- `KickChannel`: Channel data from API
- `ChatMessage`: Parsed chat messages with emote support  
- `LinkStat`: Analytics data for extracted URLs