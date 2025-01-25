import { Context } from '@temporalio/activity';
import OpenAI from 'openai';
import { SentimentResult, SummaryResult } from './types';
import { resolve } from 'path';
import { config } from 'dotenv';

const path = resolve(__dirname, '../.env');
config({path});

const client = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
  });

    // Analyze text sentiment
    export async function analyzeSentiment(text: string): Promise<SentimentResult> {
        const { info } = Context.current();
        console.log(`Starting sentiment analysis: ${info.workflowExecution.workflowId}`);

        try {
            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a sentiment analyzer. Respond with only: POSITIVE, NEGATIVE, or NEUTRAL, followed by a confidence score between 0 and 1."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                model: "gpt-3.5-turbo",
            });
            
            const result = response.choices[0].message.content as string;
            const [sentiment, confidence] = result.split(' ');

            return {
                sentiment: sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
                confidence: parseFloat(confidence),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Sentiment analysis failed:', error);
            throw error;
        }
    }

    // Generate text summary
    export async function generateSummary(text: string): Promise<SummaryResult> {
        const { info } = Context.current();
        console.log(`Starting summary generation: ${info.workflowExecution.workflowId}`);

        try {
            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Generate a concise summary in 2-3 sentences."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                model: "gpt-3.5-turbo",
            });

            return {
                summary: response.choices[0].message.content as string,
                length: text.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Summary generation failed:', error);
            throw error;
        }
    }

    // Extract key topics
    export async function extractTopics(text: string): Promise<string[]> {
        const { info } = Context.current();
        console.log(`Starting topic extraction: ${info.workflowExecution.workflowId}`);

        try {
            const response = await client.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Extract 3-5 key topics from the text. Respond with only the topics, separated by commas."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                model: "gpt-3.5-turbo",
            });

            const result = response.choices[0].message.content as string
            return result.split(',').map(topic => topic.trim());
        } catch (error) {
            console.error('Topic extraction failed:', error);
            throw error;
        }

    }
