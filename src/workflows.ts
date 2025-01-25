import { proxyActivities, defineSignal, setHandler, condition,sleep } from '@temporalio/workflow';
import type * as activities from './activities';
import type { TextAnalysisResult } from './types';

// Define signals
export const startAnalysisSignal = defineSignal<[void]>('startAnalysis');
export const cancelAnalysisSignal = defineSignal<[void]>('cancelAnalysis');

// Configure activities
const { analyzeSentiment, generateSummary, extractTopics } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

export async function textAnalysisWorkflow(text: string): Promise<TextAnalysisResult> {
    let startAnalysis = false;
    let cancelled = false;

    // Set up signal handlers
    setHandler(startAnalysisSignal, () => {
        startAnalysis = true;
    });

    setHandler(cancelAnalysisSignal, () => {
        cancelled = true;
    });

    // Wait for start signal
    await condition(() => startAnalysis || cancelled);

    if (cancelled) {
        throw new Error('Analysis cancelled by user');
    }

    // Run analysis activities in parallel
    const [sentiment, summary, topics] = await Promise.all([
        analyzeSentiment(text),
        generateSummary(text),
        extractTopics(text)
    ]);

    await sleep(10000)

    // Compile and return results
    return {
        sentiment,
        summary,
        topics,
        originalText: text,
        processedAt: new Date().toISOString()
    };
}