class AIAnalysisApp {
    constructor() {
        this.currentWorkflowId = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Input elements
        this.textInput = document.getElementById('text-input');
        this.analyzeBtn = document.getElementById('analyze-btn');
        
        // Analysis section elements
        this.analysisSection = document.getElementById('analysis-section');
        this.progressBar = document.querySelector('.progress-fill');
        this.statusText = document.getElementById('status-text');
        
        // Results elements
        this.resultsContainer = document.querySelector('.results-container');
        this.sentimentScore = document.querySelector('.sentiment-score');
        this.sentimentLabel = document.querySelector('.sentiment-label');
        this.summaryResult = document.getElementById('summary-result');
        this.topicsList = document.getElementById('topics-list');
        
        // Control buttons
        this.newAnalysisBtn = document.getElementById('new-analysis');
        this.cancelAnalysisBtn = document.getElementById('cancel-analysis');
    }

    attachEventListeners() {
        this.analyzeBtn.addEventListener('click', () => this.startAnalysis());
        this.newAnalysisBtn.addEventListener('click', () => this.resetUI());
        this.cancelAnalysisBtn.addEventListener('click', () => this.cancelAnalysis());
    }

    async startAnalysis() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze');
            return;
        }

        try {
            this.showAnalysisProgress();
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();
            console.log(data);
            if (data.success) {
                this.currentWorkflowId = data.workflowId;
                this.startStatusPolling();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async checkWorkflowStatus() {
        try {
            const response = await fetch(`/api/status/${this.currentWorkflowId}`);
            const data = await response.json();

            console.log(data.status)
            
            if (data.success) {
                this.updateProgress(data.status);
                if (data.status === 'COMPLETED') {
                    this.showResults(data.result);
                    return true;
                }
            }
            return false;
        } catch (error) {
            this.handleError(error);
            return true;
        }
    }

    startStatusPolling() {
        const pollInterval = setInterval(async () => {
            const isDone = await this.checkWorkflowStatus();
            if (isDone) {
                clearInterval(pollInterval);
            }
        }, 5000);
    }

    async cancelAnalysis() {
        if (!this.currentWorkflowId) return;

        try {
            await fetch(`/api/signal/${this.currentWorkflowId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ signalType: 'cancel' })
            });
            
            this.resetUI();
        } catch (error) {
            this.handleError(error);
        }
    }

    showAnalysisProgress() {
        this.analysisSection.classList.remove('hidden');
        this.resultsContainer.classList.add('hidden');
        this.cancelAnalysisBtn.classList.remove('hidden');
        this.newAnalysisBtn.classList.add('hidden');
        this.analyzeBtn.disabled = true;
        
        this.progressBar.style.width = '0%';
        this.statusText.textContent = 'Starting analysis...';
    }

    updateProgress(status) {
        let progress = 0;
        let statusMessage = '';

        switch (status) {
            case 'RUNNING':
                progress = 50;
                statusMessage = 'Analyzing text...';
                break;
            case 'COMPLETED':
                progress = 100;
                statusMessage = 'Analysis complete!';
                break;
            default:
                progress = 25;
                statusMessage = 'Processing...';
        }

        this.progressBar.style.width = `${progress}%`;
        this.statusText.textContent = statusMessage;
    }

    showResults(results) {
        this.resultsContainer.classList.remove('hidden');
        this.cancelAnalysisBtn.classList.add('hidden');
        this.newAnalysisBtn.classList.remove('hidden');

        // Update sentiment display
        this.sentimentScore.textContent = results.sentiment.confidence.toFixed(2);
        this.sentimentLabel.textContent = results.sentiment.sentiment.replace(',','');
        
        // Update summary
        this.summaryResult.textContent = results.summary.summary;
        
        // Update topics
        this.topicsList.innerHTML = results.topics
            .map(topic => `<li>${topic}</li>`)
            .join('');
    }

    resetUI() {
        this.textInput.value = '';
        this.analysisSection.classList.add('hidden');
        this.analyzeBtn.disabled = false;
        this.currentWorkflowId = null;
    }

    handleError(error) {
        console.error('Error:', error);
        alert('An error occurred during analysis. Please try again.');
        this.resetUI();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AIAnalysisApp();
});