# Catenis API Client for (Modern) JavaScript

This JavaScript library works as a client for accessing the Catenis API services from both modern web browsers and
server-side applications running on the latest versions of Node.js.

This current release targets version 0.13 of the Catenis API.

## System requirements

### Web browsers

When used in web browsers, the web browser must support ES modules, and other modern JavaScript constructs and Web APIs.

As of this writing, this library is compatible with the most recent versions of all major web browsers. In particular,
it has been tested with the following web browsers:

- Safari ver. 16.2 (18614.3.7.1.5), on macOS
- Google Chrome ver. 108.0.5359.124 (arm64), on macOS
- Microsoft Edge ver. 108.0.1462.76 (arm64), on macOS
- Firefox ver. 108.0.2 (64-bits), on macOS

### Node.js

When using this library in a serve-side application, Node.js **version 18.0** or higher must be used.

> **NOTE** however that when Node.js **version 18.x** is used, the **--experimental-global-webcrypto** flag needs to be set, which can be done via
either the command line (e.g. `node --experimental-global-webcrypto <script>`) or the *NODE_OPTIONS* environment
variable (e.g. `NODE_OPTIONS='--experimental-global-webcrypto'`)

## Usage

### Loading the library

On a web browser:

```html
<script type="module">
    import { CatenisApiClient, CatenisApiError } from 'https://unpkg.com/catenis-api-client-modern/dist/catenis-api-client.min.js';
</script>
```

> **OPTIONALLY** a non-minified version of the library can be used instead. Just replace `catenis-api-client.min.js` with
`catenis-api-client.js`.

On Node.js, first install the `catenis-api-client-modern` module.

```shell
npm install catenis-api-client-modern
```

Then import it:

```javascript
import { CatenisApiClient, CatenisApiError } from 'catenis-api-client-modern';
```

### Instantiate the client

```javascript
const ctnApiClient = new CatenisApiClient(deviceId, apiAccessSecret, {
    environment: 'sandbox'
});
```

Optionally, the client can be instantiated without passing both the `deviceId` and the `apiAccessSecret` parameters as
shown below. In this case, the resulting client object should be used to call only **public** API methods.

```javascript
const ctnApiClient = new CatenisApiClient({
    environment: 'sandbox'
});
```

#### Constructor options

The following options can be used when instantiating the client:

- **host** \[String\] - (optional, default: <b>*'catenis.io'*</b>) Host name (with optional port) of target Catenis API server.
- **environment** \[String\] - (optional, default: <b>*'prod'*</b>) Environment of target Catenis API server. Valid values: *'prod'*, *'sandbox'*.
- **secure** \[Boolean\] - (optional, default: ***true***) Indicates whether a secure connection (HTTPS) should be used.
- **version** \[String\] - (optional, default: <b>*'0.13'*</b>) Version of Catenis API to target.
- **useCompression** \[Boolean\] - (optional, default: ***true***) Indicates whether request body should be compressed.
- **compressThreshold** \[Number\] - (optional, default: ***1024***) Minimum size, in bytes, of request body for it to be compressed.

> **Note**: modern web browsers will always accept compressed request responses.

### Returned data

On successful calls to the Catenis API, the data returned by the client's API methods correspond to just the `data`
property of the JSON originally returned in response to a Catenis API request.

For example, one should expect the following data object to be returned from a successful call to the `logMessage`
method:

```javascript
{
    messageId: "<message_id>"
}
```

### Logging (storing) a message to the blockchain

#### Passing the whole message's contents at once

```javascript
try {
    const data = await ctnApiClient.logMessage('My message', {
        encoding: 'utf8',
        encrypt: true,
        offChain: true,
        storage: 'auto'
    });
    
    // Process returned data
    console.log('ID of logged message:', data.messageId);
}
catch (err) {
    // Process error
}
```

#### Passing the message's contents in chunks

```javascript
const message = [
    'First part of message',
    'Second part of message',
    'Third and last part of message'
];

try {
    let continuationToken;
    
    for (const chunk of message) {
        const data = await ctnApiClient.logMessage({
            data: chunk,
            isFinal: false,
            continuationToken: continuationToken
        }, {
            encoding: 'utf8'
        });
        
        continuationToken = data.continuationToken;
    }

    // Signal that message has ended and get result
    const data = await ctnApiClient.logMessage({
        isFinal: true,
        continuationToken: continuationToken
    }, {
        encrypt: true,
        offChain: true,
        storage: 'auto'
    });
    
    console.log('ID of logged message:', data.messageId);
}
catch(err) {
    // Process error
}
```

#### Logging message asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    const data = await ctnApiClient.logMessage('My message', {
        encoding: 'utf8',
        encrypt: true,
        offChain: true,
        storage: 'auto',
        async: true
    });

    // Start polling for asynchronous processing progress
    let provisionalMessageId = data.provisionalMessageId;
    let done = false;
    let result;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveMessageProgress(provisionalMessageId);

        // Process returned data
        console.log('Number of bytes processed so far:', data.progress.bytesProcessed);

        if (data.progress.done) {
            if (data.progress.success) {
                // Get result
                result = data.result;
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing polling
            await wait(500);
        }
    }
    while (!done);
    
    if (result) {
        console.log('ID of logged message:', result.messageId);
    }
}
catch(err) {
    // Process error
}
```

### Sending a message to another device

#### Passing the whole message's contents at once

```javascript
try {
    const data = await ctnApiClient.sendMessage('My message', {
        id: targetDeviceId,
        isProdUniqueId: false
    }, {
        encoding: 'utf8',
        encrypt: true,
        offChain: true,
        storage: 'auto',
        readConfirmation: true
    });

    // Process returned data
    console.send('ID of sent message:', data.messageId);
}
catch (err) {
    // Process error
}
```

#### Passing the message's contents in chunks

```javascript
const message = [
    'First part of message',
    'Second part of message',
    'Third and last part of message'
];

try {
    let continuationToken;
    
    for (const chunk of message) {
        const data = await ctnApiClient.sendMessage({
            data: chunk,
            isFinal: false,
            continuationToken: continuationToken
        }, {
            id: targetDeviceId,
            isProdUniqueId: false
        }, {
            encoding: 'utf8'
        });
        
        continuationToken = data.continuationToken;
    }

    // Signal that message has ended and get result
    const data = await ctnApiClient.sendMessage({
        isFinal: true,
        continuationToken: continuationToken
    }, {
        id: targetDeviceId,
        isProdUniqueId: false
    }, {
        encrypt: true,
        offChain: true,
        storage: 'auto',
        readConfirmation: true
    });

    console.log('ID of sent message:', data.messageId);
}
catch (err) {
    // Process error
}
```

#### Sending message asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    const data = await ctnApiClient.sendMessage('My message', {
        id: targetDeviceId,
        isProdUniqueId: false
    }, {
        encoding: 'utf8',
        encrypt: true,
        offChain: true,
        storage: 'auto',
        readConfirmation: true,
        async: true
    });

    // Start polling for asynchronous processing progress
    let provisionalMessageId = data.provisionalMessageId;
    let done = false;
    let result;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveMessageProgress(provisionalMessageId);

        // Process returned data
        console.log('Number of bytes processed so far:', data.progress.bytesProcessed);

        if (data.progress.done) {
            if (data.progress.success) {
                // Get result
                result = data.result;
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing polling
            await wait(500);
        }
    }
    while (!done);
    
    if (result) {
        console.log('ID of logged message:', result.messageId);
    }
}
catch (err) {
    // Process error
}
```

### Reading a message

#### Retrieving the whole read message's contents at once

```javascript
try {
    const data = await ctnApiClient.readMessage(messageId, 'utf8');
    
    // Process returned data
    if (data.msgInfo.action === 'send') {
        console.log('Message sent from:', data.msgInfo.from);
    }

    console.log('Read message:', data.msgData);
}
catch (err) {
    // Process error
}
```

#### Retrieving the read message's contents in chunks

```javascript
try {
    let continuationToken;
    let chunkCount = 1;
    
    do {
        const data = await ctnApiClient.readMessage(messageId, {
            encoding: 'utf8',
            continuationToken: continuationToken,
            dataChunkSize: 1024
        });

        // Process returned data
        if (data.msgInfo && data.msgInfo.action === 'send') {
            console.log('Message sent from:', data.msgInfo.from);
        }

        console.log(`Read message (part ${chunkCount}):`, data.msgData);

        if (data.continuationToken) {
            // Get continuation token to continue reading message
            continuationToken = data.continuationToken;
            chunkCount++;
        }
        else {
            continuationToken = undefined;
        }
    }
    while (continuationToken);
}
catch (err) {
    // Process error
}
```

#### Reading message asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    // Request to read message asynchronously
    const data = await ctnApiClient.readMessage(messageId, {
        async: true
    });

    // Start polling for asynchronous processing progress
    let cachedMessageId = data.cachedMessageId;
    let done = false;
    let result;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveMessageProgress(cachedMessageId);

        // Process returned data
        console.log('Number of bytes processed so far:', data.progress.bytesProcessed);

        if (data.progress.done) {
            if (data.progress.success) {
                // Get result
                result = data.result;
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing polling
            await wait(500);
        }
    }
    while (!done);
    
    if (result) {
        // Retrieve read message
        const data = await ctnApiClient.readMessage(messageId, {
            encoding: 'utf8',
            continuationToken: result.continuationToken
        });

        if (data.msgInfo.action === 'send') {
            console.log('Message sent from:', data.msgInfo.from);
        }

        console.log('Read message:', data.msgData);
    }
}
catch (err) {
    // Process error
}
```

### Retrieving information about a message's container

```javascript
try {
    const data = await ctnApiClient.retrieveMessageContainer(messageId);

    // Process returned data
    if (data.offChain) {
        console.log('IPFS CID of Catenis off-chain message envelope:', data.offChain.cid);
    }

    if (data.blockchain) {
        console.log('ID of blockchain transaction containing the message:', data.blockchain.txid);
    }

    if (data.externalStorage) {
        console.log('IPFS reference to message:', data.externalStorage.ipfs);
    }
}
catch (err) {
    // Process error
}
```

### Retrieving information about a message's origin

```javascript
try {
    const data = await ctnApiClient.retrieveMessageOrigin(messageId, 'Any text to be signed');

    // Process returned data
    if (data.tx) {
        console.log('Catenis message transaction info:', data.tx);
    }

    if (data.offChainMsgEnvelope) {
        console.log('Off-chain message envelope info:', data.offChainMsgEnvelope);
    }

    if (data.proof) {
        console.log('Origin proof info:', data.proof);
    }
}
catch (err) {
    // Process error
}
```

### Retrieving asynchronous message processing progress

```javascript
try {
    const data = await ctnApiClient.retrieveMessageProgress(provisionalMessageId);

    // Process returned data
    console.log('Number of bytes processed so far:', data.progress.bytesProcessed);

    if (data.progress.done) {
        if (data.progress.success) {
            // Get result
            console.log('Asynchronous processing result:', data.result);
        }
        else {
            // Process error
            console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
        }
    }
    else {
        // Asynchronous processing not done yet. Continue polling
    }
}
catch (err) {
    // Process error
}
```

> **Note**: see the *Logging message asynchronously*, *Sending message asynchronously* and *Reading message
>asynchronously* sections above for more complete examples.

### Listing messages

```javascript
try {
    const data = await ctnApiClient.listMessages({
        action: 'send',
        direction: 'inbound',
        readState: 'unread',
        startDate: '20170101T000000Z'
    }, 200, 0);

    // Process returned data
    if (data.msgCount > 0) {
        console.log('Returned messages:', data.messages);

        if (data.hasMore) {
            console.log('Not all messages have been returned');
        }
    }
}
catch (err) {
    // Process error
}
```

> **Note**: the parameters taken by the *listMessages* method do not exactly match the parameters taken by the List
Messages Catenis API method. Most of the parameters, except for the last two (`limit` and `skip`), are
mapped to fields of the first parameter (`selector`) of the *listMessages* method with a few singularities: parameters
`fromDeviceIds` and `fromDeviceProdUniqueIds` and parameters `toDeviceIds` and `toDeviceProdUniqueIds` are replaced with
fields `fromDevices` and `toDevices`, respectively. Those fields take an array of device ID objects, which is the same
type of object taken by the first parameter (`targetDevice`) of the *sendMessage* method. Also, the date fields,
`startDate` and `endDate`, accept not only strings containing ISO 8601 formatted dates/times but also *Date* objects.

### Issuing an amount of a new asset

```javascript
try {
    const data = await ctnApiClient.issueAsset({
        name: 'XYZ001',
        description: 'My first test asset',
        canReissue: true,
        decimalPlaces: 2
    }, 1500.00);

    // Process returned data
    console.log('ID of newly issued asset:', data.assetId);
}
catch (err) {
    // Process error
}
```

### Issuing an additional amount of an existing asset

```javascript
try {
    const data = await ctnApiClient.reissueAsset(assetId, 650.25, {
        id: otherDeviceId,
        isProdUniqueId: false
    });

    // Process returned data
    console.log('Total existent asset balance (after issuance):', data.totalExistentBalance);
}
catch (err) {
    // Process error
}
```

### Transferring an amount of an asset to another device

```javascript
try {
    const data = await ctnApiClient.transferAsset(assetId, 50.75, {
        id: otherDeviceId,
        isProdUniqueId: false
    });

    // Process returned data
    console.log('Remaining asset balance:', data.remainingBalance);
}
catch (err) {
    // Process error
}
```

### Creating a new non-fungible asset and issuing its (initial) non-fungible tokens

#### Passing non-fungible token contents in a single call

```javascript
try {
    const data = await ctnApiClient.issueNonFungibleAsset({
        assetInfo: {
            name: 'Catenis NFA 1',
            description: 'Non-fungible asset #1 for testing',
            canReissue: true
        }
    }, [{
        metadata: {
            name: 'NFA1 NFT 1',
            description: 'First token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of first token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }, {
        metadata: {
            name: 'NFA1 NFT 2',
            description: 'Second token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of second token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }]);

    // Process returned data
    console.log('ID of newly created non-fungible asset:', data.assetId);
    console.log('IDs of newly issued non-fungible tokens:', data.nfTokenIds);
}
catch (err) {
    // Process error
}
```

#### Passing non-fungible token contents in multiple calls

```javascript
const issuanceInfo = {
    assetInfo: {
        name: 'Catenis NFA 1',
        description: 'Non-fungible asset #1 for testing',
        canReissue: true
    }
};
const nftMetadata = [{
    name: 'NFA1 NFT 1',
    description: 'First token of Catenis non-fungible asset #1'
}, {
    name: 'NFA1 NFT 2',
    description: 'Second token of Catenis non-fungible asset #1'
}];
const nftContents = [
    [{
        data: 'Contents of first token of Catenis non-fungible asset #1',
        encoding: 'utf8'
    }],
    [{
        data: 'Here is the contents of the second token of Catenis non-fungible asset #1 (part #1)',
        encoding: 'utf8'
    }, {
        data: '; and here is the last part of the contents of the second token of Catenis non-fungible asset #1.',
        encoding: 'utf8'
    }]
];

try {
    let continuationToken;
    let data;
    let nfTokens;
    let callIdx = -1;
    
    do {
        nfTokens = undefined;
        callIdx++;
        
        if (!continuationToken) {
            nfTokens = nftMetadata.map(function (metadata, tokenIdx) {
                var nfToken = {
                    metdata: metadata
                };

                var contents = nftContents[tokenIdx];

                if (contents) {
                    nfToken.contents = contents[callIdx];
                }

                return nfToken;
            });
        }
        else {  // Continuation call
            nfTokens = nftContents.map(function (contents, tokenIdx) {
                return contents && callIdx < contents.length
                    ? {contents: contents[callIdx]}
                    : null;
            });

            if (nfTokens.every(function (nfToken) {return nfToken === null})) {
                nfTokens = undefined;
            }
        }
        
        data = await ctnApiClient.issueNonFungibleAsset(
            continuationToken || issuanceInfo,
            nfTokens,
            nfTokens === undefined
        );
        
        continuationToken = data.continuationToken;
    }
    while (continuationToken);

    // Process returned data
    console.log('ID of newly created non-fungible asset:', data.assetId);
    console.log('IDs of newly issued non-fungible tokens:', data.nfTokenIds);
}
catch (err) {
    // Process error
}
```

#### Doing issuance asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    const data = await ctnApiClient.issueNonFungibleAsset({
        assetInfo: {
            name: 'Catenis NFA 1',
            description: 'Non-fungible asset #1 for testing',
            canReissue: true
        },
        async: true
    }, [{
        metadata: {
            name: 'NFA1 NFT 1',
            description: 'First token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of first token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }, {
        metadata: {
            name: 'NFA1 NFT 2',
            description: 'Second token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of second token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }]);

    // Start polling for asynchronous processing progress
    let assetIssuanceId = data.assetIssuanceId;
    let done = false;
    let result;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveNonFungibleAssetIssuanceProgress(assetIssuanceId);

        // Process returned data
        console.log('Percent processed:', data.progress.percentProcessed);

        if (data.progress.done) {
            if (data.progress.success) {
                // Get result
                result = data.result;
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing polling
            await wait(500);
        }
    }
    while (!done);

    if (result) {
        console.log('ID of newly created non-fungible asset:', result.assetId);
        console.log('IDs of newly issued non-fungible tokens:', result.nfTokenIds);
    }
}
catch (err) {
    // Process error
}
```

### Issuing more non-fungible tokens for a previously created non-fungible asset

#### Passing non-fungible token contents in a single call

```javascript
try {
    const data = await ctnApiClient.reissueNonFungibleAsset(assetId, [{
        metadata: {
            name: 'NFA1 NFT 3',
            description: 'Third token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of third token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }, {
        metadata: {
            name: 'NFA1 NFT 4',
            description: 'Forth token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of forth token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }]);

    // Process returned data
    console.log('IDs of newly issued non-fungible tokens:', data.nfTokenIds);
}
catch (err) {
    // Process error
}
```

#### Passing non-fungible token contents in multiple calls

```javascript
const nftMetadata = [{
    name: 'NFA1 NFT 3',
    description: 'Third token of Catenis non-fungible asset #1'
}, {
    name: 'NFA1 NFT 4',
    description: 'Forth token of Catenis non-fungible asset #1'
}];
const nftContents = [
    [{
        data: 'Contents of third token of Catenis non-fungible asset #1',
        encoding: 'utf8'
    }],
    [{
        data: 'Here is the contents of the forth token of Catenis non-fungible asset #1 (part #1)',
        encoding: 'utf8'
    }, {
        data: '; and here is the last part of the contents of the forth token of Catenis non-fungible asset #1.',
        encoding: 'utf8'
    }]
];

try {
    let continuationToken;
    let data;
    let nfTokens;
    let callIdx = -1;
    
    do {
        nfTokens = undefined;
        callIdx++;
        
        if (!continuationToken) {
            nfTokens = nftMetadata.map(function (metadata, tokenIdx) {
                var nfToken = {
                    metdata: metadata
                };

                var contents = nftContents[tokenIdx];

                if (contents) {
                    nfToken.contents = contents[callIdx];
                }

                return nfToken;
            });
        }
        else {  // Continuation call
            nfTokens = nftContents.map(function (contents, tokenIdx) {
                return contents && callIdx < contents.length
                    ? {contents: contents[callIdx]}
                    : null;
            });

            if (nfTokens.every(function (nfToken) {return nfToken === null})) {
                nfTokens = undefined;
            }
        }
        
        data = await ctnApiClient.reissueNonFungibleAsset(
            assetId,
            continuationToken,
            nfTokens,
            nfTokens === undefined
        );
        
        continuationToken = data.continuationToken;
    }
    while (continuationToken);

    // Process returned data
    console.log('IDs of newly issued non-fungible tokens:', data.nfTokenIds);
}
catch (err) {
    // Process error
}
```

#### Doing issuance asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    const data = await ctnApiClient.reissueNonFungibleAsset(assetId, {
        async: true
    }, [{
        metadata: {
            name: 'NFA1 NFT 3',
            description: 'Third token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of third token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }, {
        metadata: {
            name: 'NFA1 NFT 4',
            description: 'Forth token of Catenis non-fungible asset #1'
        },
        contents: {
            data: 'Contents of forth token of Catenis non-fungible asset #1',
            encoding: 'utf8'
        }
    }]);

    // Start polling for asynchronous processing progress
    let assetIssuanceId = data.assetIssuanceId;
    let done = false;
    let result;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveNonFungibleAssetIssuanceProgress(assetIssuanceId);

        // Process returned data
        console.log('Percent processed:', data.progress.percentProcessed);

        if (data.progress.done) {
            if (data.progress.success) {
                // Get result
                result = data.result;
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing polling
            await wait(500);
        }
    }
    while (!done);

    if (result) {
        console.log('IDs of newly issued non-fungible tokens:', data.result.nfTokenIds);
    }
}
catch (err) {
    // Process error
}
```

### Retrieving the data associated with a non-fungible token

#### Doing retrieval synchronously

```javascript
try {
    let continuationToken;
    let nfTokenData;
    
    do {
        const data = await ctnApiClient.retrieveNonFungibleToken(
            tokenId,
            continuationToken ? {continuationToken} : undefined
        );

        if (!nfTokenData) {
            // Get token data
            nfTokenData = {
                assetId: data.nonFungibleToken.assetId,
                metadata: data.nonFungibleToken.metadata,
                contents: [data.nonFungibleToken.contents.data]
            };
        }
        else {
            // Add next contents part to token data
            nfTokenData.contents.push(data.nonFungibleToken.contents.data);
        }

        continuationToken = data.continuationToken;
    }
    while (continuationToken);

    // Process returned data
    console.log('Non-fungible token data:', nfTokenData);
}
catch (err) {
    // Process error
}
```

#### Doing retrieval asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    const data = await ctnApiClient.retrieveNonFungibleToken(tokenId, {
        async: true
    });

    // Start polling for asynchronous processing progress
    let tokenRetrievalId = data.tokenRetrievalId;
    let done = false;
    let continuationToken;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveNonFungibleTokenRetrievalProgress(tokenId, tokenRetrievalId);

        // Process returned data
        console.log('Bytes already retrieved:', data.progress.bytesRetrieved);

        if (data.progress.done) {
            if (data.progress.success) {
                // Prepare to finish retrieving the non-fungible token data
                continuationToken = data.continuationToken;
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing polling
            await wait(500);
        }
    }
    while (!done);
    
    if (continuationToken) {
        // Finish retrieving the non-fungible token data
        let nfTokenData = undefined;
        
        do {
            const data = await ctnApiClient.retrieveNonFungibleToken(tokenId, continuationToken);

            if (!nfTokenData) {
                // Get token data
                nfTokenData = {
                    assetId: data.nonFungibleToken.assetId,
                    metadata: data.nonFungibleToken.metadata,
                    contents: [data.nonFungibleToken.contents.data]
                };
            }
            else {
                // Add next contents part to token data
                nfTokenData.contents.push(data.nonFungibleToken.contents.data);
            }
            
            continuationToken = data.continuationToken;
        }
        while (continuationToken);

        // Process returned data
        console.log('Non-fungible token data:', nfTokenData);
    }
}
catch (err) {
    // Process error
}
```

### Transferring a non-fungible token to another device

#### Doing transfer synchronously

```javascript
try {
    const data = await ctnApiClient.transferNonFungibleToken(tokenId, {
        id: otherDeviceId,
        isProdUniqueId: false
    });

    // Process returned data
    console.log('Non-fungible token successfully transferred');
}
catch (err) {
    // Process error
}
```

#### Doing transfer asynchronously

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    const data = await ctnApiClient.transferNonFungibleToken(tokenId, {
        id: otherDeviceId,
        isProdUniqueId: false
    }, true);

    // Start polling for asynchronous processing progress
    let tokenTransferId = data.tokenTransferId;
    done = false;
    await wait(500);
    
    do {
        const data = await ctnApiClient.retrieveNonFungibleTokenTransferProgress(tokenId, tokenTransferId);

        // Process returned data
        console.log('Current data manipulation:', data.progress.dataManipulation);

        if (data.progress.done) {
            if (data.progress.success) {
                // Display result
                console.log('Non-fungible token successfully transferred');
            }
            else {
                // Process error
                console.error(`Asynchronous processing error: [${data.progress.error.code}] -`, data.progress.error.message);
            }
            
            done = true;
        }
        else {
            // Asynchronous processing not done yet. Wait before continuing pooling
            await wait(500);
        }
    }
    while (!done);
}
catch (err) {
    // Process error
}
```

### Retrieving information about a given asset

```javascript
try {
    const data = await ctnApiClient.retrieveAssetInfo(assetId);

    // Process returned data
    console.log('Asset info:', data);
}
catch (err) {
    // Process error
}
```

### Getting the current balance of a given asset held by the device

```javascript
try {
    const data = await ctnApiClient.getAssetBalance(assetId);

    // Process returned data
    console.log('Current asset balance:', data.balance.total);
    console.log('Amount not yet confirmed:', data.balance.unconfirmed);
}
catch (err) {
    // Process error
}
```

### Listing assets owned by the device

```javascript
try {
    const data = await ctnApiClient.listOwnedAssets(200, 0);

    // Process returned data
    data.ownedAssets.forEach((ownedAsset, idx) => {
        console.log('Owned asset #', idx + 1, ':');
        console.log('  - asset ID:', ownedAsset.assetId);
        console.log('  - current asset balance:', ownedAsset.balance.total);
        console.log('  - amount not yet confirmed:', ownedAsset.balance.unconfirmed);
    });

    if (data.hasMore) {
        console.log('Not all owned assets have been returned');
    }
}
catch (err) {
    // Process error
}
```

### Listing assets issued by the device

```javascript
try {
    const data = await ctnApiClient.listIssuedAssets(200, 0);

    // Process returned data
    data.issuedAssets.forEach((issuedAsset, idx) => {
        console.log('Issued asset #', idx + 1, ':');
        console.log('  - asset ID:', issuedAsset.assetId);
        console.log('  - total existent balance:', issuedAsset.totalExistentBalance);
    });

    if (data.hasMore) {
        console.log('Not all issued assets have been returned');
    }
}
catch (err) {
    // Process error
}
```

### Retrieving issuance history for a given asset

```javascript
try {
    const data = await ctnApiClient.retrieveAssetIssuanceHistory(assetId, '20170101T000000Z', null, 200, 0);

    // Process returned data
    data.issuanceEvents.forEach((issuanceEvent, idx) => {
        console.log('Issuance event #', idx + 1, ':');

        if (!issuanceEvent.nfTokenIds) {
            console.log('  - issued amount:', issuanceEvent.amount);
        }
        else {
            console.log('  - IDs of issued non-fungible tokens:', issuanceEvent.nfTokenIds);
        }

        if (!issuanceEvent.holdingDevices) {
            console.log('  - device to which issued amount has been assigned:', issuanceEvent.holdingDevice);
        }
        else {
            console.log('  - devices to which issued non-fungible tokens have been assigned:', issuanceEvent.holdingDevices);
        }

        console.log('  - date of issuance:', issuanceEvent.date);
    });

    if (data.hasMore) {
        console.log('Not all asset issuance events have been returned');
    }
}
catch (err) {
    // Process error
}
```

> **Note**: the parameters of the *retrieveAssetIssuanceHistory* method are slightly different from the ones taken by
>the Retrieve Asset Issuance History Catenis API method. In particular, the date parameters, `startDate` and `endDate`,
>accept not only strings containing ISO 8601 formatted dates/times but also *Date* objects.

### Listing devices that currently hold any amount of a given asset

```javascript
try {
    const data = await ctnApiClient.listAssetHolders(assetId, 200, 0);

    // Process returned data
    data.assetHolders.forEach((assetHolder, idx) => {
        if (assetHolder.holder) {
            console.log('Asset holder #', idx + 1, ':');
            console.log('  - device holding an amount of the asset:', assetHolder.holder);
            console.log('  - amount of asset currently held by device:', assetHolder.balance.total);
            console.log('  - amount not yet confirmed:', assetHolder.balance.unconfirmed);
        }
        else {
            console.log('Migrated asset:');
            console.log('  - total migrated amount:', assetHolder.balance.total);
            console.log('  - amount not yet confirmed:', assetHolder.balance.unconfirmed);
        }
    });

    if (data.hasMore) {
        console.log('Not all asset holders have been returned');
    }
}
catch (err) {
    // Process error
}
```

### Listing the non-fungible tokens of a given non-fungible asset that the device currently owns

```javascript
try {
    const data = await ctnApiClient.listOwnedNonFungibleTokens(assetId, 200, 0);

    // Process returned data
    console.log('Owned non-fungible tokens:', data.ownedNFTokens);

    if (data.hasMore) {
        console.log('Not all owned non-fungible tokens have been returned');
    }
}
catch (err) {
    // Process error
}
```

### Identifying the device that currently owns a non-fungible token

```javascript
try {
    const data = await ctnApiClient.getNonFungibleTokenOwner(tokenId);

    // Process returned data
    console.log('Owning device:', data.owner);
    console.log('Is confirmed:', data.isConfirmed);
}
catch (err) {
    // Process error
}
```

### Checking if a device currently owns one or more non-fungible tokens

```javascript
try {
    const data = await ctnApiClient.checkNonFungibleTokenOwnership({
        id: checkDeviceId,
        isProdUniqueId: false
    }, {
        id: assetId,
        isAssetId: true
    });

    // Process returned data
    console.log('Non-fungible tokens owned:', data.tokensOwned);
    console.log('Non-fungible tokens not yet confirmed:', data.tokensUnconfirmed);
}
catch (err) {
    // Process error
}
```

### Exporting an asset to a foreign blockchain

#### Estimating the export cost in the foreign blockchain's native coin

```javascript
const foreignBlockchain = 'ethereum';

try {
    const data = await ctnApiClient.exportAsset(assetId, foreignBlockchain, {
        name: 'Test Catenis token #01',
        symbol: 'CTK01'
    }, {
        estimateOnly: true
    });

    // Process returned data
    console.log('Estimated foreign blockchain transaction execution price:', data.estimatedPrice);
}
catch (err) {
    // Process error
}
```

#### Doing the export

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const foreignBlockchain = 'ethereum';

try {
    const data = await ctnApiClient.exportAsset(assetId, foreignBlockchain, {
        name: 'Test Catenis token #01',
        symbol: 'CTK01'
    });

    // Process returned data
    console.log('Foreign blockchain transaction ID (hash):', data.foreignTransaction.id);

    // Start polling for asset export outcome
    let done = false;
    let tokenId;
    await wait(500);
    
    do {
        const data = await ctnApiClient.assetExportOutcome(assetId, foreignBlockchain);

        // Process returned data
        if (data.status === 'success') {
            // Asset successfully exported
            tokeId = data.token.id;
            done = true;
        }
        else if (data.status === 'pending') {
            // Final asset export state not yet reached. Wait before continuing polling
            await wait(500);
        }
        else {
            // Asset export has failed. Process error
            console.error('Error executing foreign blockchain transaction:', data.foreignTransaction.error);
            done = true;
        }
    }
    while (!done);
    
    if (tokenId) {
        console.log('Foreign token ID (address):', tokenId);
    }
}
catch (err) {
    // Process error
}
```

### Migrating an asset amount to a foreign blockchain

#### Estimating the migration cost in the foreign blockchain's native coin

```javascript
const foreignBlockchain = 'ethereum';

try {
    const data = await ctnApiClient.migrateAsset(assetId, foreignBlockchain, {
        direction: 'outward',
        amount: 50,
        destAddress: '0xe247c9BfDb17e7D8Ae60a744843ffAd19C784943'
    }, {
        estimateOnly: true
    });

    // Process returned data
    console.log('Estimated foreign blockchain transaction execution price:', data.estimatedPrice);
}
catch (err) {
    // Process error
}
```

#### Doing the migration

```javascript
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const foreignBlockchain = 'ethereum';

try {
    const data = await ctnApiClient.migrateAsset(assetId, foreignBlockchain, {
        direction: 'outward',
        amount: 50,
        destAddress: '0xe247c9BfDb17e7D8Ae60a744843ffAd19C784943'
    });

    // Process returned data
    let migrationId = data.migrationId;
    console.log('Asset migration ID:', migrationId);

    // Start polling for asset migration outcome
    let done = false;
    await wait(500);
    
    do {
        const data = await ctnApiClient.assetMigrationOutcome(migrationId);

        // Process returned data
        if (data.status === 'success') {
            // Asset amount successfully migrated
            console.log('Asset amount successfully migrated');
            done = true;
        }
        else if (data.status === 'pending') {
            // Final asset migration state not yet reached. Wait before continuing polling
            await wait(500);
        }
        else {
            // Asset migration has failed. Process error
            if (data.catenisService.error) {
                console.error('Error executing Catenis service:', data.catenisService.error);
            }

            if (data.foreignTransaction.error) {
                console.error('Error executing foreign blockchain transaction:', data.foreignTransaction.error);
            }
            
            done = true;
        }
    }
    while (!done);
}
catch (err) {
    // Process error
}
```

#### Reprocessing a (failed) migration

```javascript
const foreignBlockchain = 'ethereum';

try {
    const data = await ctnApiClient.migrateAsset(assetId, foreignBlockchain, migrationId);

    // Start polling for asset migration outcome
}
catch (err) {
    // Process error
}
```

### Getting asset export outcome

```javascript
const foreignBlockchain = 'ethereum';

try {
    const data = await ctnApiClient.assetExportOutcome(assetId, foreignBlockchain);

    // Process returned data
    if (data.status === 'success') {
        // Asset successfully exported
        console.log('Foreign token ID (address):', data.token.id);
    }
    else if (data.status === 'pending') {
        // Final asset export state not yet reached
    }
    else {
        // Asset export has failed. Process error
        console.error('Error executing foreign blockchain transaction:', data.foreignTransaction.error);
    }
}
catch (err) {
    // Process error
}
```

### Getting asset migration outcome

```javascript
try {
    const data = await ctnApiClient.assetMigrationOutcome(migrationId);

    // Process returned data
    if (data.status === 'success') {
        // Asset amount successfully migrated
        console.log('Asset amount successfully migrated');
    }
    else if (data.status === 'pending') {
        // Final asset migration state not yet reached
    }
    else {
        // Asset migration has failed. Process error
        if (data.catenisService.error) {
            console.error('Error executing Catenis service:', data.catenisService.error);
        }

        if (data.foreignTransaction.error) {
            console.error('Error executing foreign blockchain transaction:', data.foreignTransaction.error);
        }
    }
}
catch (err) {
    // Process error
}
```

### Listing exported assets

```javascript
try {
    const data = await ctnApiClient.listExportedAssets({
        foreignBlockchain: 'ethereum',
        status: 'success',
        startDate: new Date('2021-08-01')
    }, 200, 0);

    // Process returned data
    if (data.exportedAssets.length > 0) {
        console.log('Returned asset exports:', data.exportedAssets);

        if (data.hasMore) {
            console.log('Not all asset exports have been returned');
        }
    }
}
catch (err) {
    // Process error
}
```

> **Note**: the parameters taken by the *listExportedAssets* method do not exactly match the parameters taken by the
List Exported Assets Catenis API method. Most of the parameters, except for the last two (`limit` and `skip`), are
mapped to fields of the first parameter (`selector`) of the *listExportedAssets* method with a few singularities: the
date fields, `startDate` and `endDate`, accept not only strings containing ISO 8601 formatted dates/times but also
*Date* objects.

### Listing asset migrations

```javascript
try {
    const data = await ctnApiClient.listAssetMigrations({
        foreignBlockchain: 'ethereum',
        direction: 'outward',
        status: 'success',
        startDate: new Date('2021-08-01')
    }, 200, 0);

    // Process returned data
    if (data.assetMigrations.length > 0) {
        console.log('Returned asset migrations:', data.assetMigrations);

        if (data.hasMore) {
            console.log('Not all asset migrations have been returned');
        }
    }
}
catch (err) {
    // Process error
}
```

> **Note**: the parameters taken by the *listAssetMigrations* method do not exactly match the parameters taken by the
List Asset Migrations Catenis API method. Most of the parameters, except for the last two (`limit` and `skip`), are
mapped to fields of the first parameter (`selector`) of the *listAssetMigrations* method with a few singularities: the
date fields, `startDate` and `endDate`, accept not only strings containing ISO 8601 formatted dates/times but also
*Date* objects.

### Listing system defined permission events

```javascript
try {
    const data = await ctnApiClient.listPermissionEvents();

    // Process returned data
    Object.keys(data).forEach(eventName => {
        console.log('Event name:', eventName, '; event description:', data[eventName]);
    });
}
catch (err) {
    // Process error
}
```

### Retrieving permission rights currently set for a specified permission event

```javascript
try {
    const data = await ctnApiClient.retrievePermissionRights('receive-msg');

    // Process returned data
    console.log('Default (system) permission right:', data.system);

    if (data.catenisNode) {
        if (data.catenisNode.allow) {
            console.log('Index of Catenis nodes with \'allow\' permission right:', data.catenisNode.allow);
        }

        if (data.catenisNode.deny) {
            console.log('Index of Catenis nodes with \'deny\' permission right:', data.catenisNode.deny);
        }
    }

    if (data.client) {
        if (data.client.allow) {
            console.log('ID of clients with \'allow\' permission right:', data.client.allow);
        }

        if (data.client.deny) {
            console.log('ID of clients with \'deny\' permission right:', data.client.deny);
        }
    }

    if (data.device) {
        if (data.device.allow) {
            console.log('Devices with \'allow\' permission right:', data.device.allow);
        }

        if (data.device.deny) {
            console.log('Devices with \'deny\' permission right:', data.device.deny);
        }
    }
}
catch (err) {
    // Process error
}
```

### Setting permission rights at different levels for a specified permission event

```javascript
try {
    await ctnApiClient.setPermissionRights('receive-msg', {
        system: 'deny',
        catenisNode: {
            allow: 'self'
        },
        client: {
            allow: [
                'self',
                clientId
            ]
        },
        device: {
            deny: [{
                id: deviceId1
            }, {
                id: 'ABCD001',
                isProdUniqueId: true
            }]
        }
    });

    console.log('Permission rights successfully set');
}
catch (err) {
    // Process error
}
```

### Checking effective permission right applied to a given device for a specified permission event

```javascript
try {
    const data = await ctnApiClient.checkEffectivePermissionRight('receive-msg', {
        id: deviceProdUniqueId,
        isProdUniqueId: true
    });

    // Process returned data
    const deviceId = Object.keys(data)[0];

    console.log(`Effective right for device ${deviceId}:`, data[deviceId]);
}
catch (err) {
    // Process error
}
```

### Retrieving identification information of a given device

```javascript
try {
    const data = await ctnApiClient.retrieveDeviceIdentificationInfo({
        id: deviceId,
        isProdUniqueId: false
    });

    // Process returned data
    console.log('Device\'s Catenis node ID info:', data.catenisNode);
    console.log('Device\'s client ID info:', data.client);
    console.log('Device\'s own ID info:', data.device);
}
catch (err) {
    // Process error
}
```

### Listing system defined notification events

```javascript
try {
    const data = await ctnApiClient.listNotificationEvents();

    // Process returned data
    Object.keys(data).forEach(eventName => {
        console.log('Event name:', eventName, '; event description:', data[eventName]);
    });
}
catch (err) {
    // Process error
}
```

## Notifications

The Catenis API Client for JavaScript makes it easy for receiving notifications from the Catenis system by embedding a
WebSocket client. All the end user needs to do is open a WebSocket notification channel for the desired Catenis
notification event, and monitor the activity on that channel.

### Receiving notifications

Instantiate a WebSocket notification channel object.

```javascript
const wsNtfyChannel = ctnApiClient.createWsNotifyChannel(eventName);
```

Add listeners.

```javascript
wsNtfyChannel.addEventListener('error', () => {
    // An error took place in the underlying WebSocket connection
});

wsNtfyChannel.addEventListener('open', () => {
    // The notification channel is successfully open and ready to receive notifications
});

wsNtfyChannel.addEventListener('close', event => {
    // The underlying WebSocket connection has been closed; the associated 'close code' and
    //  'close reason' can be retrieved
    console.log(`WebSocket notification channel has been closed: [${event.code}] -`,  event.reason);
});

wsNtfyChannel.addEventListener('notify', event => {
    // A new notification has been received
    console.log('Received notification:', event.data);
});
```

> **Note**: the `data` property of the `event` argument of the *notify* event handler contains the deserialized JSON
notification message (an object) of the corresponding notification event.

Open notification channel.

```javascript
await wsNtfyChannel.open();
```

Close notification channel.

```javascript
wsNtfyChannel.close();
```

## Error handling

Two types of error can take place when calling the API methods of the Catenis API client: client or API error.

Client errors return generic error data.

API errors, on the other hand, return a custom **CatenisApiError** object.

**CatenisApiError** objects are extended from the standard *Error* object, and include the following custom properties:

- `httpStatusCode` The status code of the received HTTP response. 
- `httpStatusMessage` The status message of the received HTTP response.
- `ctnErrorMessage` The Catenis error message contained in the body of the received HTTP response.

> **Note**: there might be cases where the `ctnErrorMessage` property is *undefined*.

Usage example:

```javascript
try {
    await ctnApiClient.readMessage('INVALID_MSG_ID');
}
catch (err) {
    if (err instanceof CatenisApiError) {
        // Catenis API error
        console.log('HTTP status code:', err.httpStatusCode);
        console.log('HTTP status message:', err.httpStatusMessage);
        console.log('Catenis error message:', err.ctnErrorMessage);
        console.log('Compiled error message:', err.message);
    }
    else {
        // Client error
        console.error(err);
    }
}
```

Expected result:

```text
HTTP status code: 400
HTTP status message: Bad Request
Catenis error message: Invalid message ID
Compiled error message: Error returned from Catenis API endpoint: [400] Invalid message ID
```

## Catenis API Documentation

For further information on the Catenis API, please reference the [Catenis API Documentation](https://catenis.com/docs/api).

## License

This JavaScript library is released under the [MIT License](LICENSE). Feel free to fork, and modify!

Copyright © 2023, Blockchain of Things Inc.
