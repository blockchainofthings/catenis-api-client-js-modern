/**
 * Created by claudio on 2022-12-01
 */
import { CatenisApiError } from './CatenisApiError.js';
import { WsNotifyChannel } from './WsNotifyChannel.js';
import { deflate } from 'pako';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

const apiPath = '/api/',
      signVersionId = 'CTN1',
      signMethodId = 'CTN1-HMAC-SHA256',
      scopeRequest = 'ctn1_request',
      signValidDays = 7,
      notifyRootPath = 'notify',
      wsNtfyRootPath =  'ws';
export const timestampHdr = 'X-BCoT-Timestamp';

/**
 * Catenis API Client class
 */
export class CatenisApiClient {
    /**
     * @typedef {Object} APIClientOptions
     * @property {string} [host='catenis.io'] Host name (with optional port) of target Catenis API server.
     * @property {string} [environment='prod'] Environment of target Catenis API server. Valid values: 'prod', 'sandbox'
     *                                          (or 'beta').
     * @property {boolean} [secure=true] Indicates whether a secure connection (HTTPS) should be used.
     * @property {string} [version='0.13'] Version of Catenis API to target.
     * @property {boolean} [useCompression=true] Indicates whether request body should be compressed. Note: modern web
     *                                            browsers will always accept compressed request responses.
     * @property {number} [compressThreshold=1024] Minimum size, in bytes, of request body for it to be compressed.
     */

    /**
     * Class constructor.
     * @param {string} [deviceId] Catenis virtual device ID.
     * @param {string} [apiAccessSecret] Catenis virtual device API access secret.
     * @param {APIClientOptions} [options] API client options.
     */
    constructor(deviceId, apiAccessSecret, options) {
        if (typeof deviceId === 'object' && deviceId !== null) {
            // No device credentials, only options
            options = deviceId;
            deviceId = apiAccessSecret = undefined;
        }

        let _host = 'catenis.io';
        let _subdomain = '';
        let _secure = true;
        let _version = '0.13';

        this.useCompression = true;
        this.compressThreshold = 1024;

        if (typeof options === 'object' && options !== null) {
            _host = typeof options.host === 'string' && options.host.length > 0 ? options.host : _host;
            _subdomain = options.environment === 'sandbox' || options.environment === 'beta' ? 'sandbox.' : _subdomain;
            _secure = typeof options.secure === 'boolean' ? options.secure : _secure;
            _version = typeof options.version === 'string' && options.version.length > 0 ? options.version : _version;

            if (typeof options.useCompression === 'boolean' && !options.useCompression) {
                this.useCompression = false;
            }

            if (typeof options.compressThreshold == 'number' && options.compressThreshold >= 0) {
                this.compressThreshold = Math.floor(options.compressThreshold);
            }
        }

        this.host = _subdomain + _host;
        const uriPrefix = (_secure ? 'https://' : 'http://') + this.host;
        const apiBaseUriPath = apiPath + _version + '/';
        this.rootApiEndPoint = uriPrefix + apiBaseUriPath;
        this.deviceId = deviceId;
        this.lastSignDate = undefined;
        this.lastSignKey = undefined;
        const wsUriScheme = _secure ? 'wss://' : 'ws://';
        const wsUriPrefix = wsUriScheme + this.host;
        const wsNtfyBaseUriPath = apiBaseUriPath + notifyRootPath + (wsNtfyRootPath.length > 0 ? '/' : '') + wsNtfyRootPath;
        this.rootWsNtfyEndPoint = wsUriPrefix + wsNtfyBaseUriPath;

        this._genDateKey = typeof apiAccessSecret === 'string' && apiAccessSecret.length > 0
            ? getGenerateDateKeyFunction(apiAccessSecret)
            : undefined;
    }

    /**
     * @typedef {Object} InputMessageInfo
     * @property {string} [data] A message data chunk.
     * @property {boolean} [isFinal=true] Indicates whether this is the final (or the single) message data chunk.
     * @property {string} [continuationToken] Indicates that this is a continuation message data chunk. This should
     *                                         match the value returned from the last API method call.
     */

    /**
     * @typedef {('utf8'|'base64'|'hex')} DataTextEncoding
     */

    /**
     * @typedef {('auto'|'embedded'|'external')} MessageStorage
     */

    /**
     * @typedef {Object} LogMessageOptions
     * @property {DataTextEncoding} [encoding='utf8'] The text encoding of the message (data chunk).
     * @property {boolean} [encrypt=true] Indicates whether message should be encrypted before being stored.
     * @property {boolean} [offChain=true] Indicates whether the message should be processed as a Catenis off-chain
     *                                      message.
     * @property {MessageStorage} [storage='auto'] Identifies where the message should be stored.
     * @property {boolean} [async=false] Indicates whether processing (storage of message to the blockchain) should be
     *                                    done asynchronously.
     */

    /**
     * @typedef {Object} NonFinalChunkLogMessageResult
     * @property {string} continuationToken Token to be used when sending the following message data chunk.
     */

    /**
     * @typedef {Object} AsyncLogMessageResult
     * @property {string} provisionalMessageId ID of provisional message.
     */

    /**
     * @typedef {Object} RegularLogMessageResult
     * @property {string} messageId ID of the logged message.
     */

    /**
     * @typedef {(NonFinalChunkLogMessageResult|AsyncLogMessageResult|RegularLogMessageResult)} LogMessageResult
     */

    /**
     * Call the Log Message API method.
     * @param {(string|InputMessageInfo)} message The message to store. If a string is passed, it is assumed to be the
     *                                             whole message's contents. Otherwise, it is expected that the message
     *                                             be passed in chunks.
     * @param {LogMessageOptions} [options] Log message options.
     * @return {Promise<LogMessageResult>}
     */
    async logMessage(message, options) {
        const data = {
            message
        };

        if (options) {
            data.options = options;
        }

        return await this._postRequest('messages/log', undefined, data);
    }

    /**
     * @typedef {Object} VirtualDeviceID
     * @property {string} id ID of the virtual device. Should be Catenis device ID unless isProdUniqueId is true.
     * @property {boolean} [isProdUniqueId=false] Indicates whether the supplied ID is a product unique ID.
     */

    /**
     * @typedef {Object} SendMessageOptions
     * @property {DataTextEncoding} [encoding='utf8'] The text encoding of the message (data chunk).
     * @property {boolean} [encrypt=true] Indicates whether message should be encrypted before being stored.
     * @property {boolean} [offChain=true] Indicates whether the message should be processed as a Catenis off-chain
     *                                      message.
     * @property {MessageStorage} [storage='auto'] Identifies where the message should be stored.
     * @property {boolean} [readConfirmation=false] Indicates whether the message should be sent with read confirmation
     *                                               enabled.
     * @property {boolean} [async=false] Indicates whether processing (storage of message to the blockchain) should be
     *                                    done asynchronously.
     */

    /**
     * @typedef {Object} NonFinalChunkSendMessageResult
     * @property {string} [continuationToken] Token to be used when sending the following message data chunk.
     */

    /**
     * @typedef {Object} AsyncSendMessageResult
     * @property {string} [provisionalMessageId] ID of provisional message.
     */

    /**
     * @typedef {Object} RegularSendMessageResult
     * @property {string} [messageId] ID of the sent message.
     */

    /**
     * @typedef {(NonFinalChunkSendMessageResult|AsyncSendMessageResult|RegularSendMessageResult)} SendMessageResult
     */

    /**
     * Call the Send Message API method.
     * @param {(string|InputMessageInfo)} message The message to send. If a string is passed, it is assumed to be the
     *                                             whole message's contents. Otherwise, it is expected that the message
     *                                             be passed in chunks.
     * @param {VirtualDeviceID} [targetDevice] The virtual device to which the message is sent.
     * @param {SendMessageOptions} [options] Send message options.
     * @return {Promise<SendMessageResult>}
     */
    async sendMessage(message, targetDevice, options) {
        const data = {
            message,
            targetDevice
        };

        if (options) {
            data.options = options;
        }

        return await this._postRequest('messages/send', undefined, data);
    }

    /**
     * @typedef {Object} ReadMessageOptions
     * @property {DataTextEncoding} [encoding='utf8'] The text encoding that should be used for the returned message.
     * @property {string} [continuationToken] Indicates that this is a continuation call and that the following message
     *                                         data chunk should be returned.
     * @property {number} [dataChunkSize] Size, in bytes, of the largest message data chunk that should be returned.
     *                                     This is effectively used to signal that the message should be retrieved/read
     *                                     in chunks.
     * @property {boolean} [async=false] Indicates whether processing (retrieval of message from the blockchain) should
     *                                    be done asynchronously.
     */

    /**
     * @typedef {Object} VirtualDeviceInfo
     * @property {string} deviceId The device ID of the virtual device.
     * @property {string} [name] The name of the virtual device.
     * @property {string} [prodUniqueId] The product unique ID of the virtual device.
     */

    /**
     * @typedef {('log'|'send')} RecordMessageAction
     */

    /**
     * @typedef {Object} ReturnedMessageInfo
     * @property {RecordMessageAction} action Action originally performed on the message.
     * @property {VirtualDeviceInfo} [from] The virtual device that sent the message.
     */

    /**
     * @typedef {Object} AsyncReadMessageResult
     * @property {string} cachedMessageId ID of the cached message.
     */

    /**
     * @typedef {Object} RegularReadMessageResult
     * @property {ReturnedMessageInfo} [msgInfo] Info about the read message.
     * @property {string} msgData The contents of the message formatted using the specified text encoding.
     * @property {string} [continuationToken] Token to be used when requesting the following message data chunk.
     */

    /**
     * @typedef {(AsyncReadMessageResult|RegularReadMessageResult)} ReadMessageResult
     */

    /**
     * Call the Read Message API method.
     * @param {string} messageId ID of the message to read.
     * @param {(DataTextEncoding|ReadMessageOptions)} [options] Read message options.
     * @return {Promise<ReadMessageResult>}
     */
    async readMessage(messageId, options) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                messageId
            }
        };

        if (options) {
            if (typeof options === 'string') {
                params.query = {
                    encoding: options
                };
            }
            else if (typeof options === 'object') {
                params.query = filterDefinedProperties(options);
            }
        }

        return await this._getRequest('messages/:messageId', params);
    }

    /**
     * @typedef {Object} OffChainMessageContainer
     * @property {string} cid IPFS CID of the Catenis off-chain message envelope data structure that holds the off-chain
     *                         message's contents.
     */

    /**
     * @typedef {Object} BlockchainMessageContainer
     * @property {string} txid The ID of the blockchain transaction where the message was recorded.
     * @property {boolean} isConfirmed Indicates whether the blockchain transaction has already been confirmed.
     */

    /**
     * @typedef {Object} ExternalStorageMessageContainer
     * @property {string} ipfs The IPFS CID used to reference the message on IPFS.
     */

    /**
     * @typedef {Object} OffChainRetrieveMessageContainerResult
     * @property {OffChainMessageContainer} offChain The off-chain message container info.
     * @property {BlockchainMessageContainer} [blockchain] The blockchain message container info.
     * @property {ExternalStorageMessageContainer} externalStorage The external storage message container info.
     */

    /**
     * @typedef {Object} RegularRetrieveMessageContainerResult
     * @property {BlockchainMessageContainer} blockchain The blockchain message container info.
     * @property {ExternalStorageMessageContainer} [externalStorage] The external storage message container info.
     */

    /**
     * @typedef {(
     *      OffChainRetrieveMessageContainerResult
     *      |RegularRetrieveMessageContainerResult
     * )} RetrieveMessageContainerResult
     */

    /**
     * Call the Retrieve Message Container API method.
     * @param {string} messageId ID of message to retrieve its container info.
     * @return {Promise<RetrieveMessageContainerResult>}
     */
    async retrieveMessageContainer(messageId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                messageId
            }
        };

        return await this._getRequest('messages/:messageId/container', params);
    }

    /**
     * @typedef {Object} OffChainSettlementBatchDocInfo
     * @property {string} cid Content ID (CID) of the batch document on IPFS.
     */

    /**
     * @typedef {Object} VirtualDeviceOwnerInfo
     * @property {string} [company] Name of company that owns the virtual device.
     * @property {string} [contact] Name of company's contact.
     * @property {string} [name] Name of the person who owns the virtual device, if not owned by a company.
     * @property {string[]} [domains] List of internet domains owned by this company or person.
     */

    /**
     * @typedef {Object} MessageOriginDeviceInfo
     * @property {string} address Virtual device's blockchain address used to generate the message blockchain
     *                             transaction.
     * @property {string} deviceId The device ID of the virtual device.
     * @property {string} [name] The name of the virtual device.
     * @property {string} [prodUniqueId] The product unique ID of the virtual device.
     * @property {VirtualDeviceOwnerInfo} ownedBy Virtual device owner info.
     */

    /**
     * @typedef {('Send Message'|'Log Message'|'Settle Off-Chain Messages')} MessageTransactionType
     */

    /**
     * @typedef {Object} MessageTransactionInfo
     * @property {string} txid ID of the message transaction.
     * @property {MessageTransactionType} type Type of the message blockchain transaction.
     * @property {OffChainSettlementBatchDocInfo} [batchDoc] Information about the batch document used to settle
     *                                                        off-chain messages on the blockchain.
     * @property {MessageOriginDeviceInfo} [originDevice] Information about the virtual device that recorded the
     *                                                     message: the origin device.
     */

    /**
     * @typedef {Object} OffChainMessageOriginDeviceInfo
     * @property {string} pubKeyHash Hex-encoded hash of virtual device's public key used to generate the off-chain
     *                                message envelope.
     * @property {string} deviceId The device ID of the virtual device.
     * @property {string} [name] The name of the virtual device.
     * @property {string} [prodUniqueId] The product unique ID of the virtual device.
     * @property {VirtualDeviceOwnerInfo} ownedBy Virtual device owner info.
     */

    /**
     * @typedef {('Send Message'|'Log Message')} OffChainMessageType
     */

    /**
     * @typedef {Object} OffChainMessageEnvelopeInfo
     * @property {string} cid Content ID (CID) of off-chain message envelope on IPFS.
     * @property {OffChainMessageType} type Type of the off-chain message.
     * @property {OffChainMessageOriginDeviceInfo} originDevice Information about the virtual device that recorded the
     *                                                           message: the origin device.
     */

    /**
     * @typedef {Object} MessageOriginProofInfo
     * @property {string} message Message for which the signature was generated.
     * @property {string} signature Base64-encoded message's signature generated using origin device's private key.
     */

    /**
     * @typedef {Object} OffChainRetrieveMessageOriginResult
     * @property {MessageTransactionInfo} [tx] Information about the blockchain transaction used to record the message
     *                                          to the blockchain.
     * @property {OffChainMessageEnvelopeInfo} offChainMsgEnvelope Information about the off-chain message envelope
     *                                                                data structure used to record the message on IPFS.
     * @property {MessageOriginProofInfo} [proof] Message origin proof.
     */

    /**
     * @typedef {Object} RegularRetrieveMessageOriginResult
     * @property {MessageTransactionInfo} tx Information about the blockchain transaction used to record the message
     *                                        to the blockchain.
     * @property {MessageOriginProofInfo} [proof] Message origin proof.
     */

    /**
     * @typedef {(OffChainRetrieveMessageOriginResult|RegularRetrieveMessageOriginResult)} RetrieveMessageOriginResult
     */

    /**
     * Call the Retrieve Message Origin public API method.
     * @param {string} messageId The ID of the message the origin info of which is to be retrieved.
     * @param {string} [msgToSign] A message (any text) to be signed using the message's origin device's private key.
     * @return {Promise<RetrieveMessageOriginResult>}
     */
    async retrieveMessageOrigin(messageId, msgToSign) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                messageId
            }
        };

        if (msgToSign) {
            params.query = {
                msgToSign
            };
        }

        return await this._getRequest('messages/:messageId/origin', params, false);
    }

    /**
     * @typedef {Object} ProcessingErrorInfo
     * @property {number} code Numeric code (equivalent to an HTML status code) of the error.
     * @property {string} message Text describing the error.
     */

    /**
     * @typedef {Object} AsyncMessageProgressInfo
     * @property {number} bytesProcessed Total number of bytes of message that had already been processed.
     * @property {boolean} done Indicates whether the asynchronous processing has been finished.
     * @property {boolean} [success] Indicates whether message has been successfully processed.
     * @property {ProcessingErrorInfo} [error] Information about the error that took place while doing the asynchronous
     *                                          processing.
     * @property {string} [finishDate] ISO 8601 formatted date and time when the asynchronous processing has been
     *                                  finalized.
     */

    /**
     * @typedef {Object} MessageProcessingResultData
     * @property {string} messageId ID of the message.
     * @property {string} [continuationToken] The token that should be used to complete the message read.
     */

    /**
     * @typedef {('log'|'send'|'read')} ProcessMessageAction
     */

    /**
     * @typedef {Object} RetrieveMessageProgressResult
     * @property {ProcessMessageAction} action The action that was performed on the message.
     * @property {AsyncMessageProgressInfo} progress Current message processing status.
     * @property {MessageProcessingResultData} [result] Result of message processing.
     */

    /**
     * Call the Retrieve Message Progress API method.
     * @param {string} messageId ID of the ephemeral message (either a provisional or a cached message) for which to
     *                            return the processing progress.
     * @return {Promise<RetrieveMessageProgressResult>}
     */
    async retrieveMessageProgress(messageId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                messageId
            }
        };

        return await this._getRequest('messages/:messageId/progress', params);
    }

    /**
     * @typedef {('log'|'send'|'any')} MessageActionSelectOption
     */

    /**
     * @typedef {('inbound'|'outbound'|'any')} SendMessageDirectionSelectOption
     */

    /**
     * @typedef {('unread'|'read'|'any')} MessageReadStateSelectOption
     */

    /**
     * @typedef {Object} ListMessageSelector
     * @property {MessageActionSelectOption} [action='any'] The action performed on the messages to be retrieved.
     * @property {SendMessageDirectionSelectOption} [direction='any'] The direction of the sent messages to be
     *                                                                 retrieved.
     * @property {VirtualDeviceID[]} [fromDevices] List of the virtual devices from which the messages to be retrieved
     *                                              had been sent.
     * @property {VirtualDeviceID[]} [toDevices] List of the virtual devices to which the messages to be retrieved had
     *                                            been sent.
     * @property {MessageReadStateSelectOption} [readState='any'] The current read state of the messages to be
     *                                                             retrieved.
     * @property {(Date|string)} [startDate] Date and time specifying the lower boundary of the time frame within which
     *                                        the messages to be retrieved had been logged/sent/read. If a string is
     *                                        passed, it should be an ISO 8601 formatted date/time.
     * @property {(Date|string)} [endDate] Date and time specifying the upper boundary of the time frame within which
     *                                      the messages to be retrieved had been logged/sent/read. If a string is
     *                                      passed, it should be an ISO 8601 formatted date/time.
     */

    /**
     * @typedef {('inbound'|'outbound')} SendMessageDirection
     */

    /**
     * @typedef {Object} ListMessageEntry
     * @property {string} messageId The ID of the message.
     * @property {RecordMessageAction} action Action originally performed on the message.
     * @property {SendMessageDirection} [direction] The direction of the sent message.
     * @property {VirtualDeviceInfo} [from] The virtual device that sent the message: the origin device.
     * @property {VirtualDeviceInfo} [to] The virtual device to which the message has been sent: the target device.
     * @property {boolean} [readConfirmationEnabled] Indicates whether the message has been sent with read confirmation
     *                                                enabled.
     * @property {boolean} [read] Indicates whether the message has already been read.
     * @property {string} [date] ISO 8601 formatted date and time when the message has been logged/sent/received.
     */

    /**
     * @typedef {Object} ListMessageResult
     * @property {ListMessageEntry[]} messages The returned list of message information entries including the messages
     *                                          that satisfy the search criteria.
     * @property {number} msgCount Number of messages for which information was returned.
     * @property {boolean} hasMore Indicates whether there are more messages that satisfy the search criteria yet to be
     *                              returned.
     */

    /**
     * Call the List Messages API method.
     * @param {ListMessageSelector} [selector] Search criteria used to select the messages to return.
     * @param {number} [limit=500] Maximum number of messages that should be returned.
     * @param {number} [skip=0] Number of messages that should be skipped (from beginning of list of matching messages)
     *                           and not returned.
     * @return {Promise<ListMessageResult>}
     */
    async listMessages(selector, limit, skip) {
        /**
         * @type {(undefined|URLReplaceParams)}
         */
        let params = undefined;

        if (selector) {
            params = {
                query: {}
            };

            if (selector.action) {
                params.query.action = selector.action;
            }

            if (selector.direction) {
                params.query.direction = selector.direction;
            }

            if (Array.isArray(selector.fromDevices)) {
                const fromDeviceIds = [];
                const fromDeviceProdUniqueIds = [];

                selector.fromDevices.forEach(device => {
                    if (typeof device === 'object' && device !== null && typeof device.id === 'string' && device.id.length > 0) {
                        if (device.isProdUniqueId) {
                            // This is actually a product unique ID. So add it to the proper list
                            fromDeviceProdUniqueIds.push(device.id);
                        }
                        else {
                            fromDeviceIds.push(device.id);
                        }
                    }
                });

                if (fromDeviceIds.length > 0) {
                    // Add list of from device IDs
                    params.query.fromDeviceIds = fromDeviceIds.join(',');
                }

                if (fromDeviceProdUniqueIds.length > 0) {
                    params.query.fromDeviceProdUniqueIds = fromDeviceProdUniqueIds.join(',');
                }
            }

            if (Array.isArray(selector.toDevices)) {
                const toDeviceIds = [];
                const toDeviceProdUniqueIds = [];

                selector.toDevices.forEach(device => {
                    if (typeof device === 'object' && device !== null && typeof device.id === 'string' && device.id.length > 0) {
                        if (device.isProdUniqueId) {
                            // This is actually a product unique ID. So add it to the proper list
                            toDeviceProdUniqueIds.push(device.id);
                        }
                        else {
                            toDeviceIds.push(device.id);
                        }
                    }
                });

                if (toDeviceIds.length > 0) {
                    // Add list of to device IDs
                    params.query.toDeviceIds = toDeviceIds.join(',');
                }

                if (toDeviceProdUniqueIds.length > 0) {
                    params.query.toDeviceProdUniqueIds = toDeviceProdUniqueIds.join(',');
                }
            }

            if (selector.readState) {
                params.query.readState = selector.readState;
            }

            if (selector.startDate) {
                if (typeof selector.startDate === 'string' && selector.startDate.length > 0) {
                    params.query.startDate = selector.startDate;
                }
                else if (selector.startDate instanceof Date) {
                    params.query.startDate = selector.startDate.toISOString();
                }
            }

            if (selector.endDate) {
                if (typeof selector.endDate === 'string' && selector.endDate.length > 0) {
                    params.query.endDate = selector.endDate;
                }
                else if (selector.endDate instanceof Date) {
                    params.query.endDate = selector.endDate.toISOString();
                }
            }
        }

        if (typeof limit === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.limit = limit.toString();
        }

        if (typeof skip === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('messages', params);
    }

    /**
     * @typedef {Object<string, string>} ListPermissionEventsResult
     */

    /**
     * Call the List Permission Events API method.
     * @return {Promise<ListPermissionEventsResult>}
     */
    async listPermissionEvents() {
        return await this._getRequest('permission/events');
    }

    /**
     * @typedef {('allow'|'deny')} PermissionRightValue
     */

    /**
     * @typedef {Object} CatenisNodePermissionRightState
     * @property {string[]} [allow] List of Catenis node indices identifying the Catenis nodes to which allow right has
     *                               been given.
     * @property {string[]} [deny] List of Catenis node indices identifying the Catenis nodes to which deny right has
     *                              been given.
     */

    /**
     * @typedef {Object} ClientPermissionRightState
     * @property {string[]} [allow] List of client IDs identifying the clients to which allow right has been given.
     * @property {string[]} [deny] List of client IDs identifying the clients to which deny right has been given.
     */

    /**
     * @typedef {Object} DevicePermissionRightState
     * @property {VirtualDeviceInfo[]} [allow] List of virtual device info objects identifying the devices to which
     *                                          allow right has been given.
     * @property {VirtualDeviceInfo[]} [deny] List of virtual device info objects identifying the virtual devices to
     *                                         which deny right has been given.
     */

    /**
     * @typedef {Object} RetrievePermissionRightsResult
     * @property {PermissionRightValue} system Permission right currently set at the system level.
     * @property {CatenisNodePermissionRightState} [catenisNode] Permission rights currently set at the Catenis node
     *                                                            level.
     * @property {ClientPermissionRightState} [client] Permission rights currently set at the client level.
     * @property {DevicePermissionRightState} [device] Permission rights currently set at the device level.
     */

    /**
     * Call the Retrieve Permission Rights API method.
     * @param {string} eventName The name of the permission event for which to retrieve the currently set permission
     *                            rights.
     * @return {Promise<RetrievePermissionRightsResult>}
     */
    async retrievePermissionRights(eventName) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                eventName
            }
        };

        return await this._getRequest('permission/events/:eventName/rights', params);
    }

    /**
     * @typedef {Object} CatenisNodePermissionRightUpdate
     * @property {(string|string[])} [allow] List of indices (or a single index) of Catenis nodes to give allow right.
     *                                        Can optionally include the value "self" to refer to the index of the
     *                                        Catenis node to which the device belongs.
     * @property {(string|string[])} [deny] List of indices (or a single index) of Catenis nodes to give deny right. Can
     *                                       optionally include the value "self" to refer to the index of the Catenis
     *                                       node to which the device belongs.
     * @property {(string|string[])} [none] List of indices (or a single index) of Catenis nodes the rights of which
     *                                       should be removed. Can optionally include the value "self" to refer to the
     *                                       index of the Catenis node to which the device belongs. The wildcard
     *                                       character ("*") can also be used to indicate that the rights for all
     *                                       Catenis nodes should be removed.
     */

    /**
     * @typedef {Object} ClientPermissionRightUpdate
     * @property {(string|string[])} [allow] List of IDs (or a single ID) of clients to give allow right. Can optionally
     *                                        include the value "self" to refer to the ID of the client to which the
     *                                        device belongs.
     * @property {(string|string[])} [deny] List of IDs (or a single ID) of clients to give deny right. Can optionally
     *                                       include the value "self" to refer to the ID of the client to which the
     *                                       device belongs.
     * @property {(string|string[])} [none] List of IDs (or a single ID) of clients the rights of which should be
     *                                       removed. Can optionally include the value "self" to refer to the ID of the
     *                                       client to which the device belongs. The wildcard character ("*") can also
     *                                       be used to indicate that the rights for all clients should be removed.
     */

    /**
     * @typedef {Object} DevicePermissionRightUpdate
     * @property {(VirtualDeviceID|VirtualDeviceID[])} [allow] List of virtual devices (or a virtual device) to give
     *                                                          allow right. The 'id' field can optionally be replaced
     *                                                          with value "self" to refer to the ID of the device
     *                                                          itself.
     * @property {(VirtualDeviceID|VirtualDeviceID[])} [deny] List of virtual devices (or a virtual device) to give deny
     *                                                         right. The 'id' field can optionally be replaced with
     *                                                          value "self" to refer to the ID of the device itself.
     * @property {(VirtualDeviceID|VirtualDeviceID[])} [none] List of virtual devices (or a virtual device) the rights
     *                                                         of which should be removed. The 'id' field can optionally
     *                                                         be replaced with value "self" to refer to the ID of the
     *                                                         device itself. The wildcard character ("*") can also be
     *                                                         used in the 'id' field to indicate that the rights for
     *                                                         all devices should be removed.
     */

    /**
     * @typedef {Object} PermissionRightUpdate
     * @property {PermissionRightValue} [system] Permission right to be attributed at system level for the specified
     *                                            event.
     * @property {CatenisNodePermissionRightUpdate} [catenisNode] Permission rights to be attributed at the Catenis node
     *                                                             level for the specified event.
     * @property {ClientPermissionRightUpdate} [client] Permission rights to be attributed at the client level for the
     *                                                   specified event.
     * @property {DevicePermissionRightUpdate} [device] Permission rights to be attributed at the device level for the
     *                                                   specified event.
     */

    /**
     * @typedef {Object} SetPermissionRightsResult
     * @property {true} success Indicates that the permission rights have been correctly set.
     */

    /**
     * Call the Set Permission Rights API method.
     * @param {string} eventName The name of the permission event for which to update the permission rights settings.
     * @param {PermissionRightUpdate} rights The permission rights settings to be updated.
     * @return {Promise<SetPermissionRightsResult>}
     */
    async setPermissionRights(eventName, rights) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                eventName
            }
        };

        return await this._postRequest('permission/events/:eventName/rights', params, rights);
    }

    /**
     * @typedef {Object<string, string>} CheckEffectivePermissionRightResult
     */

    /**
     * Call the Check Effective Permission Right API method.
     * @param {string} eventName The name of the permission event for which the permission right is to be checked.
     * @param {VirtualDeviceID} device The virtual device for which the permission right is to be checked.
     * @return {Promise<CheckEffectivePermissionRightResult>}
     */
    async checkEffectivePermissionRight(eventName, device) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                eventName,
                deviceId: device.id
            }
        };

        if (typeof device.isProdUniqueId === 'boolean') {
            params.query = {
                isProdUniqueId: device.isProdUniqueId.toString()
            };
        }

        return await this._getRequest('permission/events/:eventName/rights/:deviceId', params);
    }

    /**
     * @typedef {Object<string, string>} ListNotificationEventsResult
     */

    /**
     * Call the List Notification Events API method.
     * @return {Promise<ListNotificationEventsResult>}
     */
    async listNotificationEvents() {
        return await this._getRequest('notification/events');
    }

    /**
     * @typedef {Object} CatenisNodeInfo
     * @property {number} ctnNodeIndex The index of the Catenis node.
     * @property {string} [name] The name of the Catenis node.
     * @property {string} [description] A short description about the Catenis node.
     */

    /**
     * @typedef {Object} ClientInfo
     * @property {string} clientId The client ID of the client.
     * @property {string} [name] The name of the client.
     */

    /**
     * @typedef {Object} RetrieveDeviceIdentificationInfoResult
     * @property {CatenisNodeInfo} catenisNode Information about the Catenis node where the client to which the
     *                                          specified virtual device belongs is defined.
     * @property {ClientInfo} client Information about the client to which the specified virtual device belongs.
     * @property {VirtualDeviceInfo} device Information about the specified virtual device itself.
     */

    /**
     * Call the Retrieve Device Identification Info API method
     * @param {VirtualDeviceID} device The virtual device to retrieve its identification.
     * @return {Promise<RetrieveDeviceIdentificationInfoResult>}
     */
    async retrieveDeviceIdentificationInfo(device) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                deviceId: device.id
            }
        };

        if (typeof device.isProdUniqueId === 'boolean') {
            params.query = {
                isProdUniqueId: device.isProdUniqueId.toString()
            };
        }

        return await this._getRequest('devices/:deviceId', params);
    }

    /**
     * @typedef {Object} NewAssetInfo
     * @property {string} name The name of the asset to create.
     * @property {string} [description] A description of the asset to create.
     * @property {boolean} canReissue Indicates whether more units of this asset can be issued at another time.
     * @property {number} decimalPlaces The number of decimal places that can be used to specify a fractional amount of
     *                                   this asset.
     */

    /**
     * @typedef {Object} IssueAssetResult
     * @property {string} assetId ID of the newly issued asset.
     */

    /**
     * Call the Issue Asset API method.
     * @param {NewAssetInfo} assetInfo Information for creating a new asset.
     * @param {number} amount The asset amount to issue.
     * @param {VirtualDeviceID} [holdingDevice] The virtual device that will hold the issued asset amount.
     * @return {Promise<IssueAssetResult>}
     */
    async issueAsset(assetInfo, amount, holdingDevice) {
        const data = {
            assetInfo,
            amount
        };

        if (holdingDevice) {
            data.holdingDevice = holdingDevice;
        }

        return await this._postRequest('assets/issue', undefined, data);
    }

    /**
     * @typedef {Object} ReissueAssetResult
     * @property {number} totalExistentAmount Total balance of the asset in existence after the specified amount has
     *                                         been issued.
     */

    /**
     * Call the Reissue Asset API method.
     * @param {string} assetId ID of the asset to issue more units of it.
     * @param {number} amount The asset amount to issue.
     * @param {VirtualDeviceID} [holdingDevice] The virtual device that will hold the issued asset amount.
     * @return {Promise<ReissueAssetResult>}
     */
    async reissueAsset(assetId, amount, holdingDevice) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        const data = {
            amount
        };

        if (holdingDevice) {
            data.holdingDevice = holdingDevice;
        }

        return await this._postRequest('assets/:assetId/issue', params, data);
    }

    /**
     * @typedef {Object} TransferAssetResult
     * @property {number} remainingBalance Total balance of the asset still held by the device that issued the request
     *                                      after the transfer.
     */

    /**
     * Call the Transfer Asset API method.
     * @param {string} assetId ID of the asset to transfer an amount of it.
     * @param {number} amount The asset amount to transfer.
     * @param {VirtualDeviceID} receivingDevice The virtual device to which the asset amount is to be transferred.
     * @return {Promise<TransferAssetResult>}
     */
    async transferAsset(assetId, amount, receivingDevice) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        const data = {
            amount,
            receivingDevice
        };

        return await this._postRequest('assets/:assetId/transfer', params, data);
    }

    /**
     * @typedef {Object} RetrieveAssetInfoResult
     * @property {string} assetId The ID of the asset.
     * @property {string} name The name of the asset.
     * @property {string} description The description of the asset.
     * @property {boolean} isNonFungible Indicates whether this is a non-fungible asset.
     * @property {boolean} canReissue Indicates whether more units of this asset can be issued.
     * @property {number} decimalPlaces The maximum number of decimal places that can be used to specify a fractional
     *                                   amount of this asset.
     * @property {VirtualDeviceInfo} issuer The virtual device that originally issued this asset.
     * @property {number} totalExistentBalance The current total balance of the asset in existence.
     */

    /**
     * Call the Retrieve Asset Info API method.
     * @param {string} assetId ID of the asset to retrieve its information.
     * @return {Promise<RetrieveAssetInfoResult>}
     */
    async retrieveAssetInfo(assetId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        return await this._getRequest('assets/:assetId', params);
    }

    /**
     * @typedef {Object} AssetBalanceInfo
     * @property {number} total The current balance of that asset held by the device.
     * @property {number} unconfirmed The amount from the balance that is not yet confirmed.
     */

    /**
     * @typedef {AssetBalanceInfo} GetAssetBalanceResult
     */

    /**
     * Call the Get Asset Balance API method.
     * @param {string} assetId ID of the asset to get its balance.
     * @return {Promise<GetAssetBalanceResult>}
     */
    async getAssetBalance(assetId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        return await this._getRequest('assets/:assetId/balance', params);
    }

    /**
     * @typedef {Object} OwnedAssetEntry
     * @property {string} assetId The ID of the asset.
     * @property {AssetBalanceInfo} balance The current asset balance.
     */

    /**
     * @typedef {Object} ListOwnedAssetsResult
     * @property {OwnedAssetEntry[]} ownedAssets The returned list of owned asset entries.
     * @property {boolean} hasMore Indicates whether there are more entries yet to be returned.
     */

    /**
     * Call the List Owned Assets API method.
     * @param {number} [limit=500] Maximum number of list items that should be returned.
     * @param {number} [skip=0] Number of list items that should be skipped (from beginning of list) and not returned.
     * @return {Promise<ListOwnedAssetsResult>}
     */
    async listOwnedAssets(limit, skip) {
        /**
         * @type {(undefined|URLReplaceParams)}
         */
        let params = undefined;

        if (typeof limit === 'number') {
            params = {
                query: {
                    limit: limit.toString()
                }
            };
        }

        if (typeof skip === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/owned', params);
    }

    /**
     * @typedef {Object} IssuedAssetEntry
     * @property {string} assetId The ID of the asset.
     * @property {number} totalExistentBalance The current total balance of that asset in existence.
     */

    /**
     * @typedef {Object} ListIssuedAssetsResult
     * @property {IssuedAssetEntry[]} issuedAssets The returned list of issued asset entries.
     * @property {boolean} hasMore Indicates whether there are more entries yet to be returned.
     */

    /**
     * Call the List Issued Assets API method.
     * @param {number} [limit=500] Maximum number of list items that should be returned.
     * @param {number} [skip=0] Number of list items that should be skipped (from beginning of list) and not returned.
     * @return {Promise<ListIssuedAssetsResult>}
     */
    async listIssuedAssets(limit, skip) {
        /**
         * @type {(undefined|URLReplaceParams)}
         */
        let params = undefined;

        if (typeof limit === 'number') {
            params = {
                query: {
                    limit: limit.toString()
                }
            };
        }

        if (typeof skip === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/issued', params);
    }

    /**
     * @typedef {Object} RegularAssetIssuanceEntry
     * @property {number} amount The asset amount that has been issued.
     * @property {VirtualDeviceInfo} holdingDevice The virtual device to which the issued amount was assigned.
     * @property {string} data ISO 8601 formatted date and time when the asset has been issued.
     */

    /**
     * @typedef {Object} NonFungibleAssetIssuanceEntry
     * @property {string[]} nfTokenIds List of the IDs of the non-fungible tokens of the asset that have been issued.
     * @property {VirtualDeviceInfo[]} holdingDevices List of the virtual devices to which the issued non-fungible
     *                                                 tokens were assigned.
     * @property {string} data ISO 8601 formatted date and time when the asset has been issued.
     */

    /**
     * @typedef {(RegularAssetIssuanceEntry|NonFungibleAssetIssuanceEntry)} AssetIssuanceEntry
     */

    /**
     * @typedef {Object} RetrieveAssetIssuanceHistoryResult
     * @property {AssetIssuanceEntry[]} issuanceEvents The returned list of asset issuance events.
     * @property {boolean} hasMore Indicates whether there are more entries yet to be returned.
     */

    /**
     * Call the Retrieve Asset Issuance History API method.
     * @param {string} assetId ID of the asset to retrieve its issuance history.
     * @param {(Date|string)} [startDate] Date and time specifying the inclusive lower bound of the time frame within
     *                                     which amounts of the asset have been issued. If a string is passed, it should
     *                                     be an ISO 8601 formatted date/time.
     * @param {(Date|string)} [endDate] Date and time specifying the inclusive upper bound of the time frame within
     *                                   which amounts of the asset have been issued. If a string is passed, it should
     *                                   be an ISO 8601 formatted date/time.
     * @param {number} [limit=500] Maximum number of list items that should be returned.
     * @param {number} [skip=0] Number of list items that should be skipped (from beginning of list) and not returned.
     * @return {Promise<RetrieveAssetIssuanceHistoryResult>}
     */
    async retrieveAssetIssuanceHistory(assetId, startDate, endDate, limit, skip) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        if (startDate) {
            if (typeof startDate === 'string' && startDate.length > 0) {
                params.query = {
                    startDate
                };
            }
            else if (startDate instanceof Date) {
                params.query = {
                    startDate: startDate.toISOString()
                }
            }
        }

        if (endDate) {
            if (typeof endDate === 'string' && endDate.length > 0) {
                if (!params.query) {
                    params.query = {};
                }

                params.query.endDate = endDate;
            }
            else if (endDate instanceof Date) {
                if (!params.query) {
                    params.query = {};
                }

                params.query.endDate = endDate.toISOString();
            }
        }

        if (typeof limit === 'number') {
            if (!params.query) {
                params.query = {};
            }

            params.query.limit = limit.toString();
        }

        if (typeof skip === 'number') {
            if (!params.query) {
                params.query = {};
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/:assetId/issuance', params);
    }

    /**
     * @typedef {Object} RegularAssetHolderEntry
     * @property {VirtualDeviceInfo} holder The virtual device that holds an amount of the asset.
     * @property {AssetBalanceInfo} balance The current asset balance.
     */

    /**
     * @typedef {Object} MigratedAssetHolderEntry
     * @property {true} [migrated] Indicates that this is the special entry reporting the migrated asset amount.
     * @property {AssetBalanceInfo} balance The current migrated asset balance.
     */

    /**
     * @typedef {(RegularAssetHolderEntry|MigratedAssetHolderEntry)} AssetHolderEntry
     */

    /**
     * @typedef {Object} ListAssetHoldersResult
     * @property {AssetHolderEntry[]} assetHolders The returned list of asset holder entries.
     * @property {boolean} hasMore Indicates whether there are more entries yet to be returned.
     */

    /**
     * Call the List Asset Holders API method.
     * @param {string} assetId ID of the asset to get its holders.
     * @param {number} [limit=500] Maximum number of list items that should be returned.
     * @param {number} [skip=0] Number of list items that should be skipped (from beginning of list) and not returned.
     * @return {Promise<ListAssetHoldersResult>}
     */
    async listAssetHolders(assetId, limit, skip) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        if (typeof limit === 'number') {
            params.query = {
                limit: limit.toString()
            };
        }

        if (typeof skip === 'number') {
            if (!params.query) {
                params.query = {};
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/:assetId/holders', params);
    }

    /**
     * @typedef {('ethereum'|'binance'|'polygon')} ForeignBlockchainName
     */

    /**
     * @typedef {Object} NewForeignBlockchainTokenInfo
     * @property {string} name The name of the token to be created on the foreign blockchain.
     * @property {string} symbol The symbol of the token to be created on the foreign blockchain.
     */

    /**
     * @typedef {('fastest'|'fast'|'average'|'slow')} ForeignBlockchainConsumptionProfile
     */

    /**
     * @typedef {Object} ExportAssetOptions
     * @property {ForeignBlockchainConsumptionProfile} [consumptionProfile] Name of the foreign blockchain's native coin
     *                                                                       consumption profile to use.
     * @property {boolean} [estimateOnly=false] When set, indicates that no asset export should be executed but only the
     *                                           estimated price (in the foreign blockchain's native coin) to fulfill
     *                                           the operation should be returned.
     */

    /**
     * @typedef {Object} ForeignBlockchainTransaction
     * @property {string} txid The ID (or hash) of the foreign blockchain transaction.
     * @property {boolean} isPending Indicates whether the foreign blockchain transaction is yet to be executed.
     * @property {boolean} [success] Indicates whether the foreign blockchain transaction has been successfully executed
     *                                or not.
     * @property {string} [error] An error message describing what went wrong when executing the transaction.
     */

    /**
     * @typedef {Object} ForeignBlockchainTokenInfo
     * @property {string} name The name of the foreign blockchain token.
     * @property {string} symbol The symbol of the foreign blockchain token.
     * @property {string} [id] The ID (or address) of the token on the foreign blockchain.
     */

    /**
     * @typedef {('pending'|'success'|'error')} ForeignBlockchainExportState
     */

    /**
     * @typedef {Object} RegularExportAssetResult
     * @property {ForeignBlockchainTransaction} foreignTransaction Information about the transaction issued on the
     *                                                              foreign blockchain to create the resulting foreign
     *                                                              token.
     * @property {ForeignBlockchainTokenInfo} token Information about the resulting foreign token.
     * @property {ForeignBlockchainExportState} status The current state of the asset export.
     * @property {string} date ISO 8601 formatted date and time when the asset has been exported.
     */

    /**
     * @typedef {Object} EstimateExportAssetResult
     * @property {string} estimatedPrice A text value representing the price, in the foreign blockchain's native coin,
     *                                    required to execute the foreign blockchain transaction.
     */

    /**
     * @typedef {(RegularExportAssetResult|EstimateExportAssetResult)} ExportAssetResult
     */

    /**
     * Call the Export Asset API method.
     * @param {string} assetId ID of the asset to export.
     * @param {ForeignBlockchainName} foreignBlockchain The key identifying the foreign blockchain.
     * @param {NewForeignBlockchainTokenInfo} token Information about the new token to be created on the foreign
     *                                               blockchain.
     * @param {ExportAssetOptions} [options] Export asset options.
     * @return {Promise<ExportAssetResult>}
     */
    async exportAsset(assetId, foreignBlockchain, token, options) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId,
                foreignBlockchain
            }
        };

        const data = {
            token
        };

        if (options) {
            data.options = options;
        }

        return await this._postRequest('assets/:assetId/export/:foreignBlockchain', params, data);
    }

    /**
     * @typedef {('outward'|'inward')} AssetMigrationDirection
     */

    /**
     * @typedef {Object} AssetMigrationInfo
     * @property {AssetMigrationDirection} direction The direction of the migration.
     * @property {number} amount The amount of the asset to be migrated.
     * @property {string} [destAddress] The address of the account on the foreign blockchain that should be credited
     *                                   with the specified amount of the foreign token.
     */

    /**
     * @typedef {Object} MigrateAssetOptions
     * @property {ForeignBlockchainConsumptionProfile} [consumptionProfile] Name of the foreign blockchain's native coin
     *                                                                       consumption profile to use.
     * @property {boolean} [estimateOnly=false] When set, indicates that no asset migration should be executed but only
     *                                           the estimated price (in the foreign blockchain's native coin) to
     *                                           fulfill the operation should be returned.
     */

    /**
     * @typedef {('awaiting'|'failure'|'fulfilled')} MigrateAssetServiceState
     */

    /**
     * @typedef {Object} MigrateAssetServiceInfo
     * @property {MigrateAssetServiceState} status The current state of the service's execution.
     * @property {string} [txid] The ID of the Catenis transaction issued to fulfill the service.
     * @property {string} [error] An error message describing what went wrong when executing the service.
     */

    /**
     * @typedef {('pending'|'interrupted'|'success'|'error')} AssetMigrationState
     */

    /**
     * @typedef {Object} RegularMigrateAssetResult
     * @property {string} migrationId A unique ID used to identify this asset migration.
     * @property {MigrateAssetServiceInfo} catenisService Information about the execution of the migrate asset Catenis
     *                                                     service.
     * @property {ForeignBlockchainTransaction} foreignTransaction Information about the transaction issued on the
     *                                                              foreign blockchain to mint/burn the amount of the
     *                                                              foreign token.
     * @property {AssetMigrationState} status The current state of the asset migration.
     * @property {string} date ISO 8601 formatted date and time when the asset amount has been migrated.
     */

    /**
     * @typedef {Object} EstimateMigrateAssetResult
     * @property {string} estimatedPrice A text value representing the price, in the foreign blockchain's native coin,
     *                                    required to execute the foreign blockchain transaction.
     */

    /**
     * @typedef {(RegularMigrateAssetResult|EstimateMigrateAssetResult)} MigrateAssetResult
     */

    /**
     * Call the Migrate Asset API method.
     * @param {string} assetId ID of the asset to migrate an amount of it.
     * @param {ForeignBlockchainName} foreignBlockchain The key identifying the foreign blockchain.
     * @param {(AssetMigrationInfo|string)} migration Object describing a new asset migration, or the ID of the asset
     *                                                 migration to be reprocessed.
     * @param {MigrateAssetOptions} [options] Migrate asset options.
     * @return {Promise<MigrateAssetResult>}
     */
    async migrateAsset(assetId, foreignBlockchain, migration, options) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId,
                foreignBlockchain
            }
        };

        const data = {
            migration
        };

        if (options) {
            data.options = options;
        }

        return await this._postRequest('assets/:assetId/migrate/:foreignBlockchain', params, data);
    }

    /**
     * @typedef {RegularExportAssetResult} AssetExportOutcomeResult
     */

    /**
     * Call the Asset Export Outcome API method.
     * @param {string} assetId ID of the asset that was exported.
     * @param {ForeignBlockchainName} foreignBlockchain The key identifying the foreign blockchain.
     * @return {Promise<AssetExportOutcomeResult>}
     */
    async assetExportOutcome(assetId, foreignBlockchain) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId,
                foreignBlockchain
            }
        };

        return await this._getRequest('assets/:assetId/export/:foreignBlockchain', params);
    }

    /**
     * @typedef {Object} AssetMigrationOutcomeResult
     * @property {string} assetId ID of the asset the amount of which has been migrated.
     * @property {ForeignBlockchainName} foreignBlockchain The key identifying the foreign blockchain to/from where the
     *                                                      asset amount has been migrated.
     * @property {AssetMigrationDirection} direction The direction of the migration.
     * @property {number} amount The migrated asset amount.
     * @property {MigrateAssetServiceInfo} catenisService Information about the execution of the migrate asset Catenis
     *                                                     service.
     * @property {ForeignBlockchainTransaction} foreignTransaction Information about the transaction issued on the
     *                                                              foreign blockchain to mint/burn the amount of the
     *                                                              foreign token.
     * @property {AssetMigrationState} status The current state of the asset migration.
     * @property {string} date ISO 8601 formatted date and time when the asset amount has been migrated.
     */

    /**
     * Call the Asset Migration Outcome API method.
     * @param {string} migrationId ID of the asset migration.
     * @return {Promise<AssetMigrationOutcomeResult>}
     */
    async assetMigrationOutcome(migrationId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                migrationId
            }
        };

        return await this._getRequest('assets/migrations/:migrationId', params);
    }

    /**
     * @typedef {Object} ListExportedAssetsSelector
     * @property {string} [assetId] The ID of the exported asset.
     * @property {ForeignBlockchainName} [foreignBlockchain] The key identifying the foreign blockchain to where the
     *                                                        asset has been exported.
     * @property {string} [tokenSymbol] The symbol of the resulting foreign token.
     * @property {string} [status] A single status or a comma-separated list of statuses to include.
     * @property {boolean} [negateStatus=false] Indicates whether the specified statuses should be excluded instead.
     * @property {(Date|string)} [startDate] Date and time specifying the lower boundary of the time frame within which
     *                                        the asset has been exported. If a string is passed, it should be an ISO
     *                                        8601 formatted date/time.
     * @property {(Date|string)} [endDate] Date and time specifying the upper boundary of the time frame within which
     *                                      the asset has been exported. If a string is passed, it should be an ISO 8601
     *                                      formatted date/time.
     */

    /**
     * @typedef {Object} ExportedAssetEntry
     * @property {string} assetId ID of the exported asset.
     * @property {ForeignBlockchainName} foreignBlockchain The key identifying the foreign blockchain to where the asset
     *                                                      has been exported.
     * @property {ForeignBlockchainTransaction} foreignTransaction Information about the transaction issued on the
     *                                                              foreign blockchain to create the resulting foreign
     *                                                              token.
     * @property {ForeignBlockchainTokenInfo} token Information about the resulting foreign token.
     * @property {ForeignBlockchainExportState} status The current state of the asset export.
     * @property {string} date ISO 8601 formatted date and time when the asset has been exported.
     */

    /**
     * @typedef {Object} ListExportedAssetsResult
     * @property {ExportedAssetEntry[]} exportedAssets The returned list of issued asset exports that satisfy the search
     *                                                  criteria.
     * @property {boolean} hasMore Indicates whether there are more asset exports that satisfy the search criteria yet
     *                              to be returned.
     */

    /**
     * Call the List Exported Assets API method.
     * @param {ListExportedAssetsSelector} [selector] Search criteria used to select the asset exports to return.
     * @param {number} [limit=500] Maximum number of asset exports that should be returned.
     * @param {number} [skip=0] Number of asset exports that should be skipped (from beginning of list of matching asset
     *                           exports) and not returned.
     * @return {Promise<ListExportedAssetsResult>}
     */
    async listExportedAssets(selector, limit, skip) {
        /**
         * @type {(undefined|URLReplaceParams)}
         */
        let params = undefined;

        if (selector) {
            params = {
                query: {}
            };

            if (selector.assetId) {
                params.query.assetId = selector.assetId;
            }

            if (selector.foreignBlockchain) {
                params.query.foreignBlockchain = selector.foreignBlockchain;
            }

            if (selector.tokenSymbol) {
                params.query.tokenSymbol = selector.tokenSymbol;
            }

            if (selector.status) {
                params.query.status = selector.status;
            }

            if (typeof selector.negateStatus === 'boolean') {
                params.query.negateStatus = selector.negateStatus.toString();
            }

            if (selector.startDate) {
                if (typeof selector.startDate === 'string' && selector.startDate.length > 0) {
                    params.query.startDate = selector.startDate;
                }
                else if (selector.startDate instanceof Date) {
                    params.query.startDate = selector.startDate.toISOString();
                }
            }

            if (selector.endDate) {
                if (typeof selector.endDate === 'string' && selector.endDate.length > 0) {
                    params.query.endDate = selector.endDate;
                }
                else if (selector.endDate instanceof Date) {
                    params.query.endDate = selector.endDate.toISOString();
                }
            }
        }

        if (typeof limit === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.limit = limit.toString();
        }

        if (typeof skip === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/exported', params);
    }

    /**
     * @typedef {Object} ListAssetMigrationsSelector
     * @property {string} [assetId] The ID of the asset the amount of which has been migrated.
     * @property {ForeignBlockchainName} [foreignBlockchain] The key identifying the foreign blockchain to/from where
     *                                                        the asset amount has been migrated.
     * @property {AssetMigrationDirection} [direction] The direction of the migration.
     * @property {string} [status] A single status or a comma-separated list of statuses to include.
     * @property {boolean} [negateStatus=false] Indicates whether the specified statuses should be excluded instead.
     * @property {(Date|string)} [startDate] Date and time specifying the lower boundary of the time frame within which
     *                                        the asset amount has been migrated. If a string is passed, it should be an
     *                                        ISO 8601 formatted date/time.
     * @property {(Date|string)} [endDate] Date and time specifying the upper boundary of the time frame within which
     *                                      the asset amount has been migrated. If a string is passed, it should be an
     *                                      ISO 8601 formatted date/time.
     */

    /**
     * @typedef {Object} AssetMigrationEntry
     * @property {string} migrationId ID of the asset migration.
     * @property {string} assetId ID of the asset the amount of which has been migrated.
     * @property {ForeignBlockchainName} foreignBlockchain The key identifying the foreign blockchain to/from where the
     *                                                      asset amount has been migrated.
     * @property {AssetMigrationDirection} direction The direction of the migration.
     * @property {number} amount The migrated asset amount.
     * @property {MigrateAssetServiceInfo} catenisService Information about the execution of the migrate asset Catenis
     *                                                     service.
     * @property {ForeignBlockchainTransaction} foreignTransaction Information about the transaction issued on the
     *                                                              foreign blockchain to mint/burn the amount of the
     *                                                              foreign token.
     * @property {AssetMigrationState} status The current state of the asset migration.
     * @property {string} date ISO 8601 formatted date and time when the asset amount has been migrated.
     */

    /**
     * @typedef {Object} ListAssetMigrationsResult
     * @property {AssetMigrationEntry[]} assetMigrations The returned list of issued asset migrations that satisfy the
     *                                                    search criteria.
     * @property {boolean} hasMore Indicates whether there are more asset migrations that satisfy the search criteria
     *                              yet to be returned.
     */

    /**
     * Call the List Asset Migrations API method.
     * @param {ListAssetMigrationsSelector} [selector] Search criteria used to select the asset migrations to return.
     * @param {number} [limit=500] Maximum number of asset migrations that should be returned.
     * @param {number} [skip=0] Number of asset migrations that should be skipped (from beginning of list of matching
     *                           asset migrations) and not returned.
     * @return {Promise<ListAssetMigrationsResult>}
     */
    async listAssetMigrations(selector, limit, skip) {
        /**
         * @type {(undefined|URLReplaceParams)}
         */
        let params = undefined;

        if (selector) {
            params = {
                query: {}
            };

            if (selector.assetId) {
                params.query.assetId = selector.assetId;
            }

            if (selector.foreignBlockchain) {
                params.query.foreignBlockchain = selector.foreignBlockchain;
            }

            if (selector.direction) {
                params.query.direction = selector.direction;
            }

            if (selector.status) {
                params.query.status = selector.status;
            }

            if (typeof selector.negateStatus === 'boolean') {
                params.query.negateStatus = selector.negateStatus.toString();
            }

            if (selector.startDate) {
                if (typeof selector.startDate === 'string' && selector.startDate.length > 0) {
                    params.query.startDate = selector.startDate;
                }
                else if (selector.startDate instanceof Date) {
                    params.query.startDate = selector.startDate.toISOString();
                }
            }

            if (selector.endDate) {
                if (typeof selector.endDate === 'string' && selector.endDate.length > 0) {
                    params.query.endDate = selector.endDate;
                }
                else if (selector.endDate instanceof Date) {
                    params.query.endDate = selector.endDate.toISOString();
                }
            }
        }

        if (typeof limit === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.limit = limit.toString();
        }

        if (typeof skip === 'number') {
            if (!params) {
                params = {
                    query: {}
                };
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/migrations', params);
    }

    /**
     * @typedef {Object} NewNonFungibleAssetInfo
     * @property {string} name The name of the non-fungible asset.
     * @property {string} [description] A description of the non-fungible asset.
     * @property {boolean} canReissue Indicates whether more non-fungible tokens of that non-fungible asset can be
     *                                 issued at a later time.
     */

    /**
     * @typedef {Object} NonFungibleAssetIssuanceInfo
     * @property {NewNonFungibleAssetInfo} assetInfo The properties of the new non-fungible asset to create.
     * @property {boolean} [encryptNFTContents=true] Indicates whether the contents of the non-fungible tokens being
     *                                                issued should be encrypted before being stored.
     * @property {(VirtualDeviceID|VirtualDeviceID[])} [holdingDevices] A single virtual device or a list of virtual
     *                                                                   devices that will hold the issued non-fungible
     *                                                                   tokens.
     * @property {boolean} [async=false] Indicates whether processing should be done asynchronously.
     */

    /**
     * @typedef {(string|number|boolean|Object)} JSONTypes
     */

    /**
     * @typedef {Object<string, JSONTypes>} NFTMetadataCustomProps
     */

    /**
     * @typedef {Object} NewNFTMetadataProps
     * @property {string} name The name of the non-fungible token.
     * @property {string} [description] A description of the non-fungible token.
     * @property {NFTMetadataCustomProps} [custom] User defined, custom properties of the non-fungible token.
     */

    /**
     * @typedef {Object} NewNFTContentsInfo
     * @property {string} data An additional chunk of data of the non-fungible token's contents.
     * @property {DataTextEncoding} [encoding='base64'] The encoding of the contents data chunk.
     */

    /**
     * @typedef {Object} NewNonFungibleTokenInfo
     * @property {NewNFTMetadataProps} [metadata] The properties of the new non-fungible token to be issued.
     * @property {NewNFTContentsInfo} [contents] The contents of the new non-fungible token to issue.
     */

    /**
     * @typedef {Object} NonFinalIssueNonFungibleAssetResult
     * @property {string} continuationToken The continuation token to be used in the next continuation call.
     */

    /**
     * @typedef {Object} AsyncIssueNonFungibleAssetResult
     * @property {string} assetIssuanceId The asset issuance ID. Used for retrieving the progress of an asynchronous
     *                                     non-fungible asset issuance.
     */

    /**
     * @typedef {Object} RegularIssueNonFungibleAssetResult
     * @property {string} assetId The ID of the newly created non-fungible asset.
     * @property {string[]} nfTokenIds A list of the IDs of the issued non-fungible tokens.
     */

    /**
     * @typedef {(
     *      NonFinalIssueNonFungibleAssetResult
     *      |AsyncIssueNonFungibleAssetResult
     *      |RegularIssueNonFungibleAssetResult
     * )} IssueNonFungibleAssetResult
     */

    /**
     * Call the Issue Non-Fungible Asset API method.
     * @param {(NonFungibleAssetIssuanceInfo|string)} issuanceInfoOrContinuationToken An object with the required info
     *                                                      for issuing a new asset, or a string with an asset issuance
     *                                                      continuation token.
     * @param {NewNonFungibleTokenInfo[]} [nonFungibleTokens] List with the properties of the non-fungible tokens to be
     *                                                         issued.
     * @param {boolean} [isFinal=true] Indicates whether this is the final call of the asset issuance.
     * @return {Promise<IssueNonFungibleAssetResult>}
     */
    async issueNonFungibleAsset(issuanceInfoOrContinuationToken, nonFungibleTokens, isFinal) {
        const data = {};

        if (typeof issuanceInfoOrContinuationToken === 'object') {
            Object.assign(data, issuanceInfoOrContinuationToken);
        }
        else if (typeof issuanceInfoOrContinuationToken === 'string') {
            data.continuationToken = issuanceInfoOrContinuationToken;
        }

        if (Array.isArray(nonFungibleTokens)) {
            data.nonFungibleTokens = nonFungibleTokens;
        }

        if (typeof isFinal === 'boolean') {
            data.isFinal = isFinal;
        }

        return await this._postRequest('assets/non-fungible/issue', undefined, data);
    }

    /**
     * @typedef {Object} NonFungibleAssetReissuanceInfo
     * @property {boolean} [encryptNFTContents=true] Indicates whether the contents of the non-fungible tokens being
     *                                                issued should be encrypted before being stored.
     * @property {(VirtualDeviceID|VirtualDeviceID[])} [holdingDevices] A single virtual device or a list of virtual
     *                                                                   devices that will hold the issued non-fungible
     *                                                                   tokens.
     * @property {boolean} [async=false] Indicates whether processing should be done asynchronously.
     */

    /**
     * @typedef {IssueNonFungibleAssetResult} ReissueNonFungibleAssetResult
     */

    /**
     * Call the Reissue Non-Fungible Asset API method.
     * @param {string} assetId ID of the non-fungible asset for which more non-fungible tokens should be issued.
     * @param {NonFungibleAssetReissuanceInfo|string} issuanceInfoOrContinuationToken An object with the required info
     *                                                      for issuing more non-fungible tokens of an existing
     *                                                      non-fungible asset, or a string with an asset issuance
     *                                                      continuation token.
     * @param {NewNonFungibleTokenInfo[]} [nonFungibleTokens] List with the properties of the non-fungible tokens to be
     *                                                         issued.
     * @param {boolean} [isFinal=true] Indicates whether this is the final call of the asset issuance.
     * @return {Promise<ReissueNonFungibleAssetResult>}
     */
    async reissueNonFungibleAsset(assetId, issuanceInfoOrContinuationToken, nonFungibleTokens, isFinal) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        const data = {};

        if (typeof issuanceInfoOrContinuationToken === 'object') {
            Object.assign(data, issuanceInfoOrContinuationToken);
        }
        else if (typeof issuanceInfoOrContinuationToken === 'string') {
            data.continuationToken = issuanceInfoOrContinuationToken;
        }

        if (Array.isArray(nonFungibleTokens)) {
            data.nonFungibleTokens = nonFungibleTokens;
        }

        if (typeof isFinal === 'boolean') {
            data.isFinal = isFinal;
        }

        return await this._postRequest('assets/non-fungible/:assetId/issue', params, data);
    }

    /**
     * @typedef {Object} NFAssetIssuanceProgressInfo
     * @property {number} percentProcessed The percentage of the total processing that has been already completed.
     * @property {boolean} done Indicates whether the processing has been finished.
     * @property {boolean} [success] Indicates whether the asset issuance has been successfully completed.
     * @property {ProcessingErrorInfo} [error] Information about the error that took place while processing the asset
     *                                          issuance.
     * @property {string} [finishDate] ISO 8601 formatted date and time when processing has been finalized.
     */

    /**
     * @typedef {Object} NFAssetIssuanceResultData
     * @property {string} assetId ID of the newly created Catenis non-fungible asset.
     * @property {string[]} nfTokenIds List of the IDs of the newly issued non-fungible tokens.
     */

    /**
     * @typedef {Object} NFAssetReissuanceResultData
     * @property {string[]} nfTokenIds List of the IDs of the newly issued non-fungible tokens.
     */

    /**
     * @typedef {Object} RegularRetrieveNFAssetIssuanceProgressResult
     * @property {NFAssetIssuanceProgressInfo} progress Current processing status.
     * @property {NFAssetIssuanceResultData} [result] The result of the asset issuance.
     */

    /**
     * @typedef {Object} ReissuanceRetrieveNFAssetIssuanceProgressResult
     * @property {string} assetId ID of the non-fungible asset for which more non-fungible tokens are being issued.
     * @property {NFAssetIssuanceProgressInfo} progress Current processing status.
     * @property {NFAssetReissuanceResultData} [result] The result of the asset reissuance.
     */

    /**
     * @typedef {(
     *      RegularRetrieveNFAssetIssuanceProgressResult
     *      |ReissuanceRetrieveNFAssetIssuanceProgressResult
     * )} RetrieveNFAssetIssuanceProgressResult
     */

    /**
     * Call the Retrieve Non-Fungible Asset Issuance Progress API method.
     * @param {string} issuanceId
     * @return {Promise<RetrieveNFAssetIssuanceProgressResult>}
     */
    async retrieveNonFungibleAssetIssuanceProgress(issuanceId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                issuanceId
            }
        };

        return await this._getRequest('assets/non-fungible/issuance/:issuanceId', params);
    }

    /**
     * @typedef {Object} InitialCallRetrieveNonFungibleTokenOptions
     * @property {boolean} [retrieveContents=true] Indicates whether the contents of the non-fungible token should be
     *                                              retrieved or not.
     * @property {boolean} [contentsOnly=false] Indicates whether only the contents of the non-fungible token should be
     *                                           retrieved.
     * @property {DataTextEncoding} [contentsEncoding='base64'] The encoding with which the retrieved chunk of
     *                                                           non-fungible token contents data will be encoded.
     * @property {number} [dataChunkSize] Size, in bytes, of the largest chunk of non-fungible token contents data that
     *                                     should be returned.
     * @property {boolean} [async=false] Indicates whether the processing should be done asynchronously.
     */

    /**
     * @typedef {Object} ContinuationCallRetrieveNonFungibleTokenOptions
     * @property {string} continuationToken This signals a continuation call of the non-fungible token retrieval. It
     *                                       should be filled with the continuation token returned by the previous call.
     */

    /**
     * @typedef {(
     *      InitialCallRetrieveNonFungibleTokenOptions
     *      |ContinuationCallRetrieveNonFungibleTokenOptions
     * )} RetrieveNonFungibleTokenOptions
     */

    /**
     * @typedef {Object} NFTMetadataProps
     * @property {string} name The name of the non-fungible token.
     * @property {string} [description] A description of the non-fungible token.
     * @property {boolean} contentsEncrypted Indicates whether the stored contents is encrypted.
     * @property {string} contentsURL URL pointing to the non-fungible token's contents stored on IPFS.
     * @property {NFTMetadataCustomProps} [custom] User defined, custom properties of the non-fungible token.
     */

    /**
     * @typedef {Object} NFTContentsInfo
     * @property {string} data The text encoded non-fungible token contents data.
     */

    /**
     * @typedef {Object} NonFungibleTokenInfo
     * @property {string} [assetId] ID of the non-fungible asset to which the non-fungible token belongs.
     * @property {NFTMetadataProps} [metadata] The non-fungible token metadata.
     * @property {NFTContentsInfo} [contents] The retrieved non-fungible token contents data.
     */

    /**
     * @typedef {Object} AsyncRetrieveNonFungibleTokenResult
     * @property {string} tokenRetrievalId The token retrieval ID. Used for retrieving the progress of an asynchronous
     *                                      non-fungible token retrieval.
     */

    /**
     * @typedef {Object} RegularRetrieveNonFungibleTokenResult
     * @property {string} [continuationToken] The continuation token to be used in the next continuation call.
     * @property {NonFungibleTokenInfo} nonFungibleToken The retrieved non-fungible token data.
     */

    /**
     * @typedef {(
     *      AsyncRetrieveNonFungibleTokenResult
     *      |RegularRetrieveNonFungibleTokenResult
     * )} RetrieveNonFungibleTokenResult
     */

    /**
     * Call with Retrieve Non-Fungible Token API method.
     * @param {string} tokenId ID of the non-fungible token the data of which should be retrieved.
     * @param {RetrieveNonFungibleTokenOptions} [options] Retrieve non-fungible token options.
     * @return {Promise<RetrieveNonFungibleTokenResult>}
     */
    async retrieveNonFungibleToken(tokenId, options) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                tokenId
            }
        };

        if (options) {
            params.query = filterDefinedProperties(options);
        }

        return await this._getRequest('assets/non-fungible/tokens/:tokenId', params);
    }

    /**
     * @typedef {Object} NFTokenRetrievalProgressInfo
     * @property {number} bytesRetrieved Number of bytes of non-fungible token data that have been retrieved.
     * @property {boolean} done Indicates whether the processing has been finished.
     * @property {boolean} [success] Indicates whether all the non-fungible token data has been successfully retrieved.
     * @property {ProcessingErrorInfo} [error] Information about the error that took place while retrieving the
     *                                          non-fungible token data.
     * @property {string} [finishDate] ISO 8601 formatted date and time when the data retrieval has been finalized.
     */

    /**
     * @typedef {Object} RetrieveNFTokenRetrievalProgressResult
     * @property {NFTokenRetrievalProgressInfo} progress Current processing status.
     * @property {string} [continuationToken] The token that should be used to complete the retrieval of the
     *                                         non-fungible token.
     */

    /**
     * Call the Retrieve Non-Fungible Token Retrieval Progress API method.
     * @param {string} tokenId ID of the non-fungible token whose data is being retrieved.
     * @param {string} retrievalId ID of the non-fungible token retrieval the processing progress of which should be
     *                              retrieved.
     * @return {Promise<RetrieveNFTokenRetrievalProgressResult>}
     */
    async retrieveNonFungibleTokenRetrievalProgress(tokenId, retrievalId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                tokenId,
                retrievalId
            }
        };

        return await this._getRequest('assets/non-fungible/tokens/:tokenId/retrieval/:retrievalId', params);
    }

    /**
     * @typedef {Object} AsyncTransferNonFungibleTokenResult
     * @property {string} tokenTransferId The non-fungible token transfer ID. Used for retrieving the progress of an
     *                                     asynchronous non-fungible token transfer.
     */

    /**
     * @typedef {Object} RegularTransferNonFungibleTokenResult
     * @property {true} success Indicates that the non-fungible token has been successfully transferred.
     */

    /**
     * @typedef {(
     *      AsyncTransferNonFungibleTokenResult
     *      |RegularTransferNonFungibleTokenResult
     * )} TransferNonFungibleTokenResult
     */

    /**
     * Call the Transfer Non-Fungible Token API method.
     * @param {string} tokenId ID of the non-fungible token to transfer.
     * @param {VirtualDeviceID} receivingDevice Virtual device to which the non-fungible token is to be transferred.
     * @param {boolean} [asyncProc=false] Indicates whether processing should be done asynchronously.
     * @return {Promise<TransferNonFungibleTokenResult>}
     */
    async transferNonFungibleToken(tokenId, receivingDevice, asyncProc) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                tokenId
            }
        };

        const data = {
            receivingDevice: receivingDevice
        };

        if (typeof asyncProc === 'boolean') {
            data.async = asyncProc;
        }

        return await this._postRequest('assets/non-fungible/tokens/:tokenId/transfer', params, data);
    }

    /**
     * @typedef {Object} NFTDataManipulationInfo
     * @property {number} bytesRead Number of bytes of non-fungible token data that have been read.
     * @property {number} [bytesWritten] Number of bytes of non-fungible token data that have been written.
     */

    /**
     * @typedef {Object} NFTokenTransferProgressInfo
     * @property {NFTDataManipulationInfo} dataManipulation Progress of the non-fungible token data manipulation:
     *                                                       reading and rewriting it after re-encryption (if required).
     * @property {boolean} done Indicates whether the processing has been finished.
     * @property {boolean} [success]  Indicates whether the non-fungible token has been successfully transferred.
     * @property {ProcessingErrorInfo} [error] Information about the error that took place while transferring the
     *                                          non-fungible token.
     * @property {string} [finishDate] ISO 8601 formatted date and time when the non-fungible token transfer has been
     *                                  finalized.
     */

    /**
     * @typedef {Object} RetrieveNFTokenTransferProgressResult
     * @property {NFTokenTransferProgressInfo} progress Current processing status.
     */

    /**
     * Call the Retrieve Non-Fungible Token Transfer API method.
     * @param {string} tokenId ID of the non-fungible token that is being transferred.
     * @param {string} transferId ID of the non-fungible token transfer the processing progress of which should be
     *                             retrieved.
     * @return {Promise<RetrieveNFTokenTransferProgressResult>}
     */
    async retrieveNonFungibleTokenTransferProgress(tokenId, transferId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                tokenId,
                transferId
            }
        };

        return await this._getRequest('assets/non-fungible/tokens/:tokenId/transfer/:transferId', params);
    }

    /**
     * @typedef {Object} OwnedNFTokenEntry
     * @property {string} tokenId ID of the non-fungible token.
     * @property {boolean} isConfirmed Indicates whether the blockchain transaction used to transfer the non-fungible
     *                                  token has already been confirmed.
     */

    /**
     * @typedef {Object} ListOwnedNFTokensResult
     * @property {OwnedNFTokenEntry[]} ownedNFTokens The returned list of owned non-fungible tokens.
     * @property {boolean} hasMore Indicates whether there are more entries yet to be returned.
     */

    /**
     * Call the List Owned Non-Fungible Tokens API method.
     * @param {string} assetId ID of the non-fungible asset the non-fungible tokens of which that are currently owned by
     *                          the virtual device issuing the request should be retrieved.
     * @param {number} [limit=500] Maximum number of list items that should be returned.
     * @param {number} [skip=0] Number of list items that should be skipped (from beginning of list) and not returned.
     * @return {Promise<ListOwnedNFTokensResult>}
     */
    async listOwnedNonFungibleTokens(assetId, limit, skip) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                assetId
            }
        };

        if (typeof limit === 'number') {
            params.query = {
                limit: limit.toString()
            };
        }

        if (typeof skip === 'number') {
            if (!params.query) {
                params.query = {};
            }

            params.query.skip = skip.toString();
        }

        return await this._getRequest('assets/non-fungible/:assetId/tokens/owned', params);
    }

    /**
     * @typedef {Object} GetNFTokenOwnerResult
     * @property {VirtualDeviceInfo} owner The virtual device that currently owns the non-fungible token.
     * @property {boolean} isConfirmed Indicates whether the blockchain transaction used to transfer the non-fungible
     *                                  token has already been confirmed.
     */

    /**
     * Call the Get Non-Fungible Token Owner API method.
     * @param {string} tokenId ID of the non-fungible token the owner of which should be identified.
     * @return {Promise<GetNFTokenOwnerResult>}
     */
    async getNonFungibleTokenOwner(tokenId) {
        /**
         * @type {URLReplaceParams}
         */
        const params = {
            url: {
                tokenId
            }
        };

        return await this._getRequest('assets/non-fungible/tokens/:tokenId/owner', params);
    }

    /**
     * @typedef {Object} NonFungibleTokensID
     * @property {string} id Either the ID of a single non-fungible token, or the ID of the non-fungible asset the
     *                        non-fungible tokens of which should be used.
     * @property {boolean} [isAssetId=false] Indicates whether the specified ID is a non-fungible asset ID. Otherwise,
     *                                        it should be interpreted as a non-fungible token ID.
     */

    /**
     * @typedef {Object} CheckNFTokenOwnershipResult
     * @property {number} tokensOwned Number of non-fungible tokens, out of those that have been verified, that are
     *                                 owned by the specified virtual device.
     * @property {number} tokensUnconfirmed Number of non-fungible tokens, out of the owned ones, that are not yet
     *                                       confirmed.
     */

    /**
     * Call the Check Non-Fungible Token Ownership API method.
     * @param {VirtualDeviceID} device The virtual device to check if it has ownership.
     * @param {NonFungibleTokensID} nonFungibleTokens The non-fungible tokens to be verified.
     * @return {Promise<CheckNFTokenOwnershipResult>}
     */
    async checkNonFungibleTokenOwnership(device, nonFungibleTokens) {
        const data = {
            device,
            nonFungibleTokens
        };

        return await this._postRequest('assets/non-fungible/tokens/ownership', undefined, data);
    }

    /**
     * Create WebSocket Notification Channel.
     * @param {string} eventName Catenis notification event name.
     * @return {WsNotifyChannel}
     */
    createWsNotifyChannel(eventName) {
        return new WsNotifyChannel(this, eventName);
    }

    /**
     * @typedef {Object} URLReplaceParams
     * @property {Object<string, string>} [url] Dictionary of object of URL parameters and their respective values.
     * @property {Object<string, string>} [query] Dictionary of object of query string parameters and their respective
     *                                            values.
     */

    /**
     * Build and send a GET request to call an API method.
     * @param {string} methodPath The URL path of the API method.
     * @param {URLReplaceParams} [params] Parameters to be replaced/added to the URL path.
     * @param {boolean} [signIt=true] Indicates whether the request should be signed (for authentication).
     * @return {Promise<any>}
     * @private
     */
    async _getRequest(methodPath, params, signIt = true) {
        const req = new Request(this._assembleMethodEndPointUrl(methodPath, params), {
            method: 'GET',
            headers: new Headers()
        });

        if (signIt) {
            await this._signRequest(req);
        }

        return await processResponse(await fetch(req));
    }

    /**
     * Build and send a POST request to call an API method.
     * @param {string} methodPath The URL path of the API method.
     * @param {URLReplaceParams} [params] Parameters to be replaced/added to the URL path.
     * @param {Object} [data] JSON object to be used as the request body.
     * @param {boolean} [signIt=true] Indicates whether the request should be signed (for authentication).
     * @return {Promise<any>}
     * @private
     */
    async _postRequest(methodPath, params, data, signIt = true) {
        const reqOptions = {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };

        let body;

        if (data) {
            body = new TextEncoder().encode(JSON.stringify(data));

            // NOTE: modern web browsers will always set the 'Accept-Encoding' header of AJAX requests
            //        to accept compressed request responses and will not allow it to be overwritten
            if (this.useCompression && body.byteLength >= this.compressThreshold) {
                reqOptions.headers.append('Content-Encoding', 'deflate');

                body = deflate(body);
            }
        }

        if (body) {
            reqOptions.body = body;
        }

        const req = new Request(this._assembleMethodEndPointUrl(methodPath, params), reqOptions);

        if (signIt) {
            await this._signRequest(req, body ? body.buffer : undefined);
        }

        return await processResponse(await fetch(req));
    }

    /**
     * Generate the URL for calling a given API method.
     * @param {string} methodPath The URL path of the API method.
     * @param {URLReplaceParams} [params] Parameters to be replaced/added to the resulting URL.
     * @return {URL}
     * @private
     */
    _assembleMethodEndPointUrl(methodPath, params) {
        if (params && params.url) {
            methodPath = mergeUrlParams(methodPath, params.url);
        }

        const url = new URL(methodPath, this.rootApiEndPoint);

        if (params && params.query) {
            for (let key of Object.keys(params.query)) {
                url.searchParams.append(key, params.query[key]);
            }
        }

        return url;
    }

    /**
     * Sign an HTTP request and add the proper Authorization header.
     * @param {Request} req The HTTP request to be signed.
     * @param {ArrayBuffer} [body] The body of the request to sign. NOTE: we require the body to be passed separately
     *                              because, if we retrieve it from the request itself, it will render the request
     *                              already used, and it cannot be used (in a fetch command) anymore.
     * @return {Promise<void>}
     * @private
     */
    async _signRequest(req, body) {
        if (typeof this.deviceId !== 'string' || this.deviceId.length === 0 || !this._genDateKey) {
            throw new TypeError('Missing credentials for request authentication');
        }

        // Add timestamp header
        const now = dayjs();
        const timestamp = now.utc().format('YYYYMMDDTHHmmss[Z]');
        let useSameSignKey;

        if (this.lastSignDate && now.diff(this.lastSignDate, 'days') < signValidDays) {
            useSameSignKey = !!this.lastSignKey;
        }
        else {
            this.lastSignDate = now;
            useSameSignKey = false;
        }

        const signDate = this.lastSignDate.utc().format('YYYYMMDD');

        req.headers.append(timestampHdr, timestamp);

        // First step: compute conformed request
        let confReq = req.method + '\n';
        const url = new URL(req.url);
        confReq += url.pathname + url.search + '\n';

        let essentialHeaders = 'host:' + this.host + '\n';
        essentialHeaders += timestampHdr.toLowerCase() + ':' + req.headers.get(timestampHdr) + '\n';

        confReq += essentialHeaders + '\n';
        confReq += await hashData(body ? body : new Uint8Array().buffer) + '\n';

        // Second step: assemble string to sign
        let strToSign = signMethodId + '\n';
        strToSign += timestamp + '\n';

        const scope = signDate + '/' + scopeRequest;

        strToSign += scope + '\n';
        strToSign += await hashData(confReq) + '\n';

        // Third step: generate the signature
        let signKey;

        if (useSameSignKey) {
            signKey = this.lastSignKey;
        }
        else {
            const dateKey = await this._genDateKey(signDate);
            signKey = this.lastSignKey = await signData(scopeRequest, dateKey);
        }

        const credential = this.deviceId + '/' + scope;
        const signature = await signData(strToSign, signKey, true);

        // Step four: add authorization header
        req.headers.append('Authorization', `${signMethodId} Credential=${credential}, Signature=${signature}`);
    }

    /**
     * Get fabricated signed HTTP request to be used for WebSocket Notification connection authentication.
     * @param {string} eventName Catenis notification event name.
     * @return {Promise<Request>}
     */
    async getSignedWsConnectRequest(eventName) {
        const req = new Request(this.rootWsNtfyEndPoint + '/' + eventName, {
            method: 'GET',
            headers: new Headers()
        });

        await this._signRequest(req);

        return req;
    }
}

/**
 * Get function used to generate date key for request authentication.
 * @param {string} apiAccessSecret Catenis virtual device API access secret.
 * @return {function(string): Promise<ArrayBuffer>}
 */
function getGenerateDateKeyFunction(apiAccessSecret) {
    const secret = signVersionId + apiAccessSecret;

    /**
     * @param {string} date UTC time in ISO 8601 format (YYYYMMDD'T'HHmmss'Z')
     * @return {Promise<ArrayBuffer>}
     */
    async function genDateKey (date) {
        return await signData(date, secret);
    }

    return genDateKey;
}

/**
 * Generates the SHA-256 hash of a data.
 * @param {(ArrayBuffer|string)} data The data to hash.
 * @return {Promise<String>}
 */
async function hashData(data) {
    if (typeof data === 'string') {
        data = new TextEncoder().encode(data).buffer;
    }

    return toHex(await crypto.subtle.digest('SHA-256', data));
}

/**
 * Generates the HMAC-SHA-256 signature of a data.
 * @param {(ArrayBuffer|string)} data The data to sign.
 * @param {(ArrayBuffer|string)} secret The secret to be used as the signing key.
 * @param {boolean} [hexEncode=false] Indicates whether the result should be returned as a hex-encoded string.
 * @return {Promise<(ArrayBuffer|string)>}
 */
async function signData(data, secret, hexEncode = false) {
    if (typeof data === 'string') {
        data = new TextEncoder().encode(data).buffer;
    }

    if (typeof secret === 'string') {
        secret = new TextEncoder().encode(secret).buffer;
    }

    const key = await crypto.subtle.importKey('raw', secret, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);

    const signature = await crypto.subtle.sign('HMAC', key, data);

    return hexEncode ? toHex(signature) : signature;
}

/**
 * Converts data into a hex-encoded string.
 * @param {ArrayBuffer} buffer Buffer containing the data to be converted.
 * @return {string}
 */
function toHex(buffer) {
    return new Uint8Array(buffer).reduce((s, v) => s + v.toString(16).padStart(2, "0"), '');
}

/**
 * Merge URL parameters into URL path.
 * @param {string} urlPath The URL path containing parameter placeholders (of the form :<param_name>) to be replaced.
 * @param {Object<string, string>} urlParams A dictionary object with the parameter names and the corresponding value
 *                                            to be replaced.
 */
function mergeUrlParams(urlPath, urlParams) {
    let mergedPath = '';
    let lastIndex = 0;

    for (let match of urlPath.matchAll(/:(\w+)/g)) {
        if (match[1] in urlParams) {
            mergedPath += urlPath.substring(lastIndex, match.index) + encodeURIComponent(urlParams[match[1]]);
            lastIndex = match.index + match[0].length;
        }
    }

    mergedPath += urlPath.substring(lastIndex);

    // Make sure that duplicate slashes that might occur in the URL path (due to empty URL parameters)
    //  are reduced to a single slash so the resulting URL used for signing is not different from the
    //  actual URL of the sent request
    return mergedPath.replace(/\/{2,}/g,'/');
}

/**
 * Process the HTTP response received from calling an API method.
 * @param {Response} resp The HTTP response to process.
 * @return {Promise<any>}
 */
async function processResponse(resp) {
    if (resp.ok) {
        const body = await resp.json();

        return typeof body === 'object' && body !== null && body.data ? body.data : body;
    }
    else {
        let ctnErrorMessage;
        let body;

        try {
            body = await resp.json();
        }
        catch (err) {}

        if (typeof body === 'object' && body !== null && body.message) {
            ctnErrorMessage = body.message;
        }

        throw new CatenisApiError(resp.statusText, resp.status, ctnErrorMessage);
    }
}

/**
 * Take an object and return a shallow copy of that object with any undefined property removed.
 * @param {Object} obj The object to be filtered.
 * @return {Object}
 */
function filterDefinedProperties(obj) {
    if (obj !== null) {
        const filteredObj = {};

        Object.keys(obj).forEach(key => {
            if (obj[key] !== undefined) {
                filteredObj[key] = obj[key];
            }
        });

        obj = filteredObj;
    }

    return obj;
}
