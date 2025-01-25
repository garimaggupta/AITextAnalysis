export interface SentimentResult {
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    confidence: number;
    timestamp: string;
}

export interface SummaryResult {
    summary: string;
    length: number;
    timestamp: string;
}

export interface TextAnalysisResult {
    sentiment: SentimentResult;
    summary: SummaryResult;
    topics: string[];
    originalText: string;
    processedAt: string;
}