/**
 * Created by claudio on 2022-12-01
 */
import {
    CatenisApiClient,
    timestampHdr
} from './CatenisApiClient.js';
import './global/WebSocket.js';

const notifyWsSubprotocol = 'notify.catenis.io',
      notifyChannelOpenMsg = 'NOTIFICATION_CHANNEL_OPEN';

/**
 * WebSocket Notification Channel Close event.
 */
class CloseEvent extends Event {
    /**
     * Class constructor.
     * @param {number} code The underlying WebSocket connection close status code.
     * @param {string} [reason] The underlying WebSocket connection close reason.
     */
    constructor(code, reason) {
        super('close');

        this.code = code;
        this.reason = reason;
    }
}

/**
 * WebSocket Notification Channel Notification event.
 */
class NotifyEvent extends Event {
    /**
     * Class constructor.
     * @param {Object} data Catenis notification event data.
     */
    constructor(data) {
        super('notify');

        this.data = data;
    }
}

/**
 * WebSocket Notification Channel class.
 */
export class WsNotifyChannel extends EventTarget {
    /**
     * Class constructor.
     * @param {CatenisApiClient} apiClient Catenis API client instance.
     * @param {string} eventName Catenis notification event name.
     */
    constructor(apiClient, eventName) {
        super();

        this.apiClient = apiClient;
        this.eventName = eventName;
        /**
         * @type {(undefined|WebSocket)}
         */
        this.ws = undefined;
        this.isOpen = false;
    }

    /**
     * Open the WebSocket notification channel.
     * @return {Promise<void>}
     */
    async open() {
        // Make sure that WebSocket has not been instantiated yet
        if (this.ws === undefined) {
            // NOTE: this request is only used to retrieve that data used for authentication,
            //        which is done by sending ta message right after the connection is open.
            //        The actual request used to establish the WebSocket connection is (which
            //        has no authentication info) is created and sent by the WebSocket object
            const wsReq = await this.apiClient.getSignedWsConnectRequest(this.eventName);

            this.ws = new WebSocket(wsReq.url, notifyWsSubprotocol);

            const self = this;

            this.ws.onopen = function (event) {
                // Send authentication message
                const authMsgData = {};

                authMsgData[timestampHdr.toLocaleLowerCase()] = wsReq.headers.get(timestampHdr);
                authMsgData.authorization = wsReq.headers.get('Authorization');

                this.send(JSON.stringify(authMsgData));
            };

            this.ws.onerror = function (event) {
                // Emit error event indicating that there was a WebSocket connection error
                self.dispatchEvent(new Event('error'));
            };

            this.ws.onclose = function (event) {
                // Emit close event passing the WebSocket close status code and reason
                self.dispatchEvent(new CloseEvent(event.code, event.reason));

                // Terminate instantiated WebSocket
                self.isOpen = false;
                self.ws = undefined;
            };

            this.ws.onmessage = function (event) {
                let isInvalidMessage = false;

                if (!self.isOpen) {
                    // Expect notification channel open message
                    if (event.data === notifyChannelOpenMsg) {
                        self.isOpen = true;
                        // Emit open event indicating that notification channel is successfully
                        //  open and ready to send notifications
                        self.dispatchEvent(new Event('open'));
                    }
                    else {
                        isInvalidMessage = true;
                    }
                }
                else {
                    // Try to parse message data
                    let data;

                    try {
                        data = JSON.parse(event.data);
                    }
                    catch (err) {}

                    if (typeof data === 'object' && data !== null) {
                        // Emit notify event passing the received data (as a deserialized JSON object)
                        self.dispatchEvent(new NotifyEvent(data));
                    }
                    else {
                        isInvalidMessage = true;
                    }

                    if (isInvalidMessage) {
                        // noinspection JSPotentiallyInvalidUsageOfClassThis
                        this.close(4001, 'Invalid or unexpected received message data');
                    }
                }
            };
        }
    }

    /**
     * Close the WebSocket notification channel.
     */
    close() {
        // Make sure that WebSocket is instantiated and open
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            // Close the WebSocket connection
            this.ws.close(1000, 'Closing Catenis WebSocket notification channel');
        }
    }
}
