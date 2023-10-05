import { promisify } from 'util';

import { EventIterator } from 'event-iterator';
import { Entry, Options, ZipFile, fromBuffer as ZipFromBuffer } from 'yauzl';
import { Readable } from 'stream';

import { streamToBuffer } from './stream-to-buffer.js';

// Promisifying yauzl
Object.defineProperties(ZipFile.prototype, {
  [Symbol.asyncIterator]: {
    enumerable: true,
    writable: false,
    configurable: false,
    value() {
      return new EventIterator<Entry>(queue => {
        this.addListener('entry', queue.push);
        this.addListener('end', queue.stop);
        this.addListener('error', queue.fail);
      })[Symbol.asyncIterator]();
    },
  },
  openReadStreamAsync: {
    enumerable: true,
    writable: false,
    configurable: false,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    value: promisify(ZipFile.prototype.openReadStream),
  },
  getBuffer: {
    enumerable: true,
    writable: false,
    configurable: false,
    async value(entry: Entry) {
      const stream: Readable = await this.openReadStreamAsync(entry);
      return streamToBuffer(stream);
    },
  },
});
export const unzipBuffer = promisify(ZipFromBuffer) as unknown as (
  buffer: Buffer,
  options?: Options,
) => Promise<
  ZipFile & {
    openReadStreamAsync: (v: Entry) => Promise<import('stream').Readable>;
    getBuffer: (entry: Entry) => Promise<Buffer>;
    [Symbol.asyncIterator](): AsyncIterator<Entry>;
  }
>;
