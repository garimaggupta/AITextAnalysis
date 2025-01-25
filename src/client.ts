import { Client, Connection } from '@temporalio/client';
import { textAnalysisWorkflow, startAnalysisSignal, cancelAnalysisSignal } from './workflows';
import { TextAnalysisResult } from './types';
import { getCertKeyBuffers } from './certificate_helpers';
import { getConfig } from './config';
import { resolve } from 'path';
import { config } from 'dotenv';

const path = resolve(__dirname, '../.env');
config({path});

const configObj = getConfig();


export class AIClient {
    private client: Client;

    //constructor(private connectionConfig?: any) {}

    async initialize() {

        const { cert, key } = await getCertKeyBuffers(configObj);
         let address = configObj.address;
        let namespace = configObj.namespace;

        let connectionOptions = {};

        // if cert and key are null
         if (cert === null && key === null) {
             console.log('No cert and key found in .env file');
            console.log(`Connecting to localhost`);
            connectionOptions = {
             address: `localhost:7233`
            };
        }
         else {
          connectionOptions = {
         address: address,
          tls: {
          clientCertPair: {
          crt: cert,
          key: key,
             },
             },
         };
         }

        const connection = await Connection.connect(connectionOptions);
  
        this.client = new Client({
          connection,
           namespace: namespace, // connects to 'default' namespace if not specified
        });
    }

    async analyzeText(text: string): Promise<TextAnalysisResult> {
        if (!text) {
            throw new Error('Text is required');
        }

        const workflowId = `text-analysis-${Date.now()}`;
        
        // Start the workflow
        const handle = await this.client.workflow.start(textAnalysisWorkflow, {
            args: [text],
            taskQueue: 'OpenAI-Demo',
            workflowId,
        });

        console.log(`Started analysis workflow: ${workflowId}`);

        // Signal to start analysis
        await handle.signal(startAnalysisSignal);

        try {
            // Wait for results with timeout
            const result = await Promise.race([
                handle.result(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Analysis timeout')), 60000)
                )
            ]) as TextAnalysisResult;

            return result;
        } catch (error) {
            // Cancel workflow if there's an error
            await handle.signal(cancelAnalysisSignal);
            throw error;
        }
    }

    async getAnalysisStatus(workflowId: string) {
        const handle = await this.client.workflow.getHandle(workflowId);
        const description = await handle.describe();
        return description.status.name;
    }
}

// Example usage
async function main() {
    const aiClient = new AIClient();
    await aiClient.initialize();

    try {
        const result = await aiClient.analyzeText(
            "Bursting with imagery, motion, interaction and distraction though it is, today's World Wide Web is still primarily a conduit for textual information. In HTML5, the focus on writing and authorship is more pronounced than ever. It’s evident in the very way that new elements such as article and aside are named. HTML5 asks us to treat the HTML document more as… well, a document.It’s not just the specifications that are changing, either. Much has been made of permutations to Google’s algorithms, which are beginning to favor better written, more authoritative content (and making work for the growing content strategy industry). Google’s bots are now charged with asking questions like, “Was the article edited well, or does it appear sloppy or hastily produced?” and “Does this article provide a complete or comprehensive description of the topic?,” the sorts of questions one might expect to be posed by an earnest college professor.This increased support for quality writing, allied with the book-like convenience and tactility of smartphones and tablets, means there has never been a better time for reading online. The remaining task is to make the writing itself a joy to read." );

        console.log('Analysis Results:');
        console.log('Sentiment:', result.sentiment);
        console.log('Summary:', result.summary);
        console.log('Topics:', result.topics);
    } catch (error) {
        console.error('Analysis failed:', error);
    }
}

if (require.main === module) {
    main().catch(console.error);
}