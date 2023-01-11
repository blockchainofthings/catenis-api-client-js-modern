/**
 * Created by claudio on 2022-12-01
 */

/**
 * Catenis API Error class.
 */
export class CatenisApiError extends Error {
    /**
     * Class constructor.
     * @param {string} httpStatusMessage HTTP status message.
     * @param {number} httpStatusCode HTTP status code.
     * @param {string} [ctnErrorMessage] Catenis specific error message.
     */
    constructor(httpStatusMessage, httpStatusCode, ctnErrorMessage) {
        super(`Error returned from Catenis API endpoint: [${httpStatusCode}] ${ctnErrorMessage ? ctnErrorMessage : httpStatusMessage}`);
        
        this.name = 'CatenisApiError';
        this.httpStatusMessage = httpStatusMessage;
        this.httpStatusCode = httpStatusCode;
        this.ctnErrorMessage = ctnErrorMessage;
    }
}
