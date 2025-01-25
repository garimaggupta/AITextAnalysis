import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from'./activities';
import { getConfig, printConfig } from './config';
import { resolve } from 'path';
import { getCertKeyBuffers } from './certificate_helpers';
import { config } from 'dotenv';

const path = resolve(__dirname, '../.env');
config({path});

const configObj = getConfig();

async function run() {

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

  const connection = await NativeConnection.connect(connectionOptions);
  
  const worker = await Worker.create({
    connection,
    namespace: namespace,
    taskQueue:'OpenAI-Demo',
    workflowsPath: require.resolve('./workflows'),
    activities
  });

 
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
