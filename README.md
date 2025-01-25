# AI Text Analysis with Temporal Workflow

A robust text analysis application leveraging OpenAI's capabilities through Temporal workflows. The application performs sentiment analysis, text summarization, and topic extraction with a modern web interface and reliable background processing.

## 🌟 Features

- **Text Analysis Capabilities**
  - Sentiment Analysis with confidence scores
  - Text Summarization
  - Key Topics Extraction
  - Real-time progress tracking

- **Technical Features**
  - Durable execution with Temporal workflows
  - Signal-based workflow control
  - Prometheus metrics integration
  - Responsive web interface
  - RESTful API endpoints

## 🏗️ Architecture

The application consists of several key components:

- **Frontend**: HTML5, CSS3, TypeScript
- **Backend**: Express.js server
- **Workflow Engine**: Temporal
- **AI Processing**: OpenAI API
- **Monitoring**: Prometheus & OpenTelemetry

### System Architecture Diagram
```
┌─────────────┐    ┌──────────┐    ┌─────────────┐
│   Frontend  │───▶│  Express │───▶│   Temporal  │
│    (UI)     │◀───│  Server  │◀───│  Workflow  │
└─────────────┘    └──────────┘    └─────────────┘
                                         │
                                         ▼
                                   ┌─────────────┐
                                   │  OpenAI API │
                                   └─────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Temporal server running locally or accessible
- OpenAI API key
- Docker (optional, for metrics)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-text-analysis.git
cd ai-text-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start the Temporal server:
```bash
temporal server start-dev
```

5. Run the worker:
```bash
npm run worker
```

6. Start the application:
```bash
npm run start
```

## 💻 Usage

### Using the Web Interface

1. Navigate to `http://localhost:3000`
2. Enter text in the analysis box
3. Click "Analyze Text"
4. Monitor real-time progress
5. View results in the dashboard

### Using the API

Start Analysis:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text for analysis"}'
```

Check Status:
```bash
curl http://localhost:3000/api/status/{workflowId}
```

Cancel Analysis:
```bash
curl -X POST http://localhost:3000/api/cancel/{workflowId}
```

## 📊 Metrics and Monitoring

The application exposes metrics at `/metrics` endpoint for Prometheus scraping. Available metrics include:

- Workflow execution counts and duration
- Activity performance metrics
- Task queue monitoring
- API latency and error rates

### Setting up Monitoring

1. Start Prometheus:
```bash
docker-compose up -d prometheus
```

2. Access Grafana dashboard:
```
http://localhost:3000/grafana
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run integration tests:
```bash
npm run test:integration
```

## 📁 Project Structure

```
├── src/
│   ├── activities/       # Temporal activities
│   ├── workflows/        # Temporal workflows
│   ├── client/          # Frontend application
│   ├── server/          # Express server
│   ├── metrics/         # Metrics collection
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── tests/               # Test files
└── docker/              # Docker configurations
```

## 🛠️ Development

### Adding New Features

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Implement changes
3. Add tests
4. Submit pull request

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🙏 Acknowledgments

- Temporal Team for the workflow engine
- OpenAI for the AI capabilities
- Contributors and maintainers

## 📞 Support

For support, please:
1. Check existing issues
2. Create a new issue
3. Join our Discord community

---
Made with ❤️ by Garima