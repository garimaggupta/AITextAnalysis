import express from 'express';
import path from 'path';
import { createClient } from './temporal-client';
import { textAnalysisWorkflow, startAnalysisSignal } from '../src/workflows';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

       // console.log(text)
         const temporalClient = await createClient();
        const workflowId = `text-analysis-${Date.now()}`;
        const handle = await temporalClient.workflow.start(textAnalysisWorkflow, {
            taskQueue: 'OpenAI-Demo',
            args: [text],
            workflowId
        });

        // Signal to start analysis
        await handle.signal(startAnalysisSignal);

        res.json({ 
            success:true,
            workflowId: handle.workflowId,
            message: 'Analysis started' 
        });
    } catch (error) {
        console.error('Analysis request failed:', error);
        res.status(500).json({ error: 'Failed to start analysis' });
    }
});

app.get('/api/status/:workflowId', async (req, res) => {
    try {
        const temporalClient = await createClient();
        const handle = await temporalClient.workflow.getHandle(req.params.workflowId);
        //console.log(handle)
        const wf_status = await handle.describe();
        //console.log(result)
        //const status = result.status
        if (wf_status.status.name == 'COMPLETED') {
            const results = await handle.result();
            res.json({ success:true, status:wf_status.status.name, result:results});
        }
         else {
            res.json({ success:true, status:wf_status.status.name}); 
         }

        //res.json({ success:true, status:wf_status.status.name, result:results});
    } catch (error) {
        res.status(500).json({ error: 'Failed to get status' });
    }
}); 

app.post('/api/cancel/:workflowId', async (req, res) => {
    try {
        const temporalClient = await createClient();
        const handle = await temporalClient.workflow.getHandle(req.params.workflowId);
        const result = await handle.cancel();
        res.json({ message: 'Analysis cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel analysis' });
    }
}); 

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});