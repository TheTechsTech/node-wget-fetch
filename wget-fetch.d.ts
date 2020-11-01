/**
 * Retrieval of resources or remote files over http or https by way of `node-fetch`
 *
 * @param {String} url Absolute url of source
 * @param {Mixed} action Save to `destination` or body `action` on `response type` or use for `options`
 * @param {Object} options Fetch/Request options
 *
 * @return {Promise} Promise of response type
 */
declare const fetching: {
    (url: string, action?: string | object, options?: object): Promise<any>;

    /**
     * Retrieve remote file over http or http
     *
     * @param {String} url Absolute url of source
     * @param {Mixed} folderFilename Save to destination or use for options
     * @param {Object} options Fetch/Request options
     *
     * @return {Promise} `Promise` info of completed file transfer:
     * - { filepath: string, fileSize: number, retrievedSizeMatch: boolean, headers: object}
     */
    wget: (url: string, folderFilename?: string | object, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'get'}`.
    @param url - URL string.
    @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    -'stream' for NodeJs.readableStream()
    @param options optional `Fetch` options.
    @returns A promise response body of given response action type.
    */
    get: (url: string, responseType?: string, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'post'}`.
    @param url - URL string.
    @param body - Data to send.
    @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
    @param options optional `Fetch` options.
    @returns A promise response body of given response action type.
    */
    post: (url: string, body: mixed, responseType?: string, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'put'}`.
    @param url - URL string.
    @param body - Data to send.
    @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
    @param options optional `Fetch` options.
    @returns A promise response body of given response action type.
    */
    put: (url: string, body: mixed, responseType?: string, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'delete'}`.
    @param url - URL string.
    @param body - Data to send.
    @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
    @param options optional `Fetch` options.
    @returns A promise response body of given response action type.
    */
    delete: (url: string, body: mixed, responseType?: string, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'patch'}`.
    @param url - URL string.
    @param body - Data to send.
    @param responseType Response action type:
    - 'header' for all response headers - raw()
    - 'object' for the response object - no post/pre processing
    - 'array' for arrayBuffer()
    - 'buffer' for buffer()
    - 'blob' for blob()
    - 'json' for json()
    - 'text' for text()
    - 'converted' for textConverted()
    - 'stream' for NodeJs.readableStream()
    @param options optional `Fetch` options.
    @returns A promise response body of given response action type.
    */
    patch: (url: string, body: mixed, responseType?: string, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'head'}`.
    @param url - URL string.
    @param options optional `Fetch` options.
    @returns A promise response of headers.
    */
    head: (url: string, options?: object) => Promise<any>;

    /**
    Fetch the given `url` using the option `{method: 'options'}`.
    @param url - URL string.
    @param options optional `Fetch` options.
    @returns A promise response of headers.
    */
    options: (url: string, options?: object) => Promise<any>;
};

declare namespace fetching { };

export default fetching;
