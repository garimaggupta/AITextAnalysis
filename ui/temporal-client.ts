import { Client, Connection } from '@temporalio/client';
import { getCertKeyBuffers } from '../src/certificate_helpers';
import { getConfig } from '../src/config';
import { resolve } from 'path';
import { config } from 'dotenv';

const path = resolve(__dirname, '../.env');
config({path});

const configObj = getConfig();



   export async function createClient() {

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
        
        const TemporalClient = new Client({
          connection,
          namespace: namespace, // connects to 'default' namespace if not specified
       });

       return TemporalClient;
    }