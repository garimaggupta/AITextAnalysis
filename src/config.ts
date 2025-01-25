
export interface ConfigObj {
    certPath: string,
    keyPath: string,
    certContent: string,
    keyContent: string,
    address: string,
    namespace: string,
    port: string
}


// function that returns a ConfigObj with input environment variables
export function getConfig(): ConfigObj {
    return {
        certPath: process.env.CERT_PATH || '',
        keyPath: process.env.KEY_PATH || '',
        certContent: process.env.CERT_CONTENT || '',
        keyContent: process.env.KEY_CONTENT || '',
        address: process.env.ADDRESS || 'localhost:7233',
        namespace: process.env.NAMESPACE || 'default',
        port: process.env.PORT || '3000'
    }
}

// function to print ConfigObj
export function printConfig(config: ConfigObj): void {
    console.log(`ConfigObj: {
        certPath: ${config.certPath},
        keyPath: ${config.keyPath},
        certContent: ${config.certContent},
        keyContent: ${config.keyContent},
        address: ${config.address},
        namespace: ${config.namespace},
        port: ${config.port}
    }`);
}