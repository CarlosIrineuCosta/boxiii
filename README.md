# Boxiii - AI-Powered Educational Content Platform

## Overview

Boxiii is a comprehensive educational content platform that combines AI-powered content generation with Netflix-style content discovery. The system consists of two main services:

- **Builder**: Admin/CMS interface for content creation and management
- **Viewer**: Public-facing PWA for content consumption

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Boxiii Platform                        │
├─────────────────────────┬───────────────────────────────────┤
│    Builder (Admin)      │        Viewer (Public)            │
├─────────────────────────┼───────────────────────────────────┤
│ • React + Tailwind      │ • React PWA                      │
│ • Python API Backend    │ • Tailwind CSS                   │
│ • Multi-LLM Support     │ • Netflix-style UI               │
│ • Authentication        │ • User Authentication            │
│ • Content Management    │ • Content Discovery              │
│ • Export to JSON/DB     │ • Import from JSON/DB            │
└─────────────────────────┴───────────────────────────────────┘
```

## Directory Structure

```
boxiii/
├── builder/               # Admin/CMS application
│   ├── frontend/         # React + Tailwind UI
│   ├── backend/          # Python API
│   └── Dockerfile
├── viewer/               # Public PWA
│   ├── src/             # React application
│   ├── public/          # Static assets
│   └── Dockerfile
├── shared/              # Shared utilities and types
│   ├── types/           # TypeScript interfaces
│   └── schemas/         # JSON schemas
├── docs/                # Documentation
├── .docker/             # Docker configurations
└── docker-compose.yml   # Multi-container setup
```

## Key Features

### Builder (Admin/CMS)
- Secure authentication for administrators
- Multi-provider LLM integration (Gemini, Claude, GPT-4)
- Content creation and management
- Creator profile management
- Export functionality to JSON/MongoDB
- Cost optimization for AI operations

### Viewer (Public PWA)
- Netflix-style content discovery
- Progressive Web App capabilities
- User authentication
- Multi-language support
- Offline functionality
- Future: Payment integration (Stripe, PayPal, Mercado Pago)

## Data Flow

```
Builder → Export → JSON/MongoDB → Import → Viewer
         (Async)                  (Async)
```

- No direct API communication between Builder and Viewer
- Content is published asynchronously
- Viewer consumes published content sets

## Technology Stack

### Frontend (Both Services)
- React 18.2+
- Tailwind CSS
- TypeScript
- React Router DOM

### Builder Backend
- Python 3.12+
- FastAPI
- Multi-provider LLM integration
- JSON/MongoDB support

### Infrastructure
- Docker containers
- Environment-based configuration
- JWT authentication
- HTTPS/TLS

## Getting Started

### Development

1. Clone the repository:
```bash
git clone https://github.com/[username]/boxiii.git
cd boxiii
```

2. Setup Builder:
```bash
cd builder
# Frontend
cd frontend && npm install
# Backend
cd ../backend && python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

3. Setup Viewer:
```bash
cd viewer
npm install
```

### Docker Deployment

```bash
docker-compose up -d
```

## Security

- JWT-based authentication for both services
- Environment variable management for secrets
- API rate limiting
- Input validation and sanitization
- CORS configuration

## Future Integrations

- OpenWebUI for centralized LLM access
- MongoDB for production scalability
- Payment gateways (Stripe, PayPal, Mercado Pago)
- Analytics and monitoring

## License

[To be determined]

## Contributing

[Guidelines to be added]