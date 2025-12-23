#!/usr/bin/env node
import{createRequire}from'module';const require=createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@msgpack/msgpack/dist.cjs/utils/utf8.cjs
var require_utf8 = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/utils/utf8.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.utf8Count = utf8Count;
    exports2.utf8EncodeJs = utf8EncodeJs;
    exports2.utf8EncodeTE = utf8EncodeTE;
    exports2.utf8Encode = utf8Encode;
    exports2.utf8DecodeJs = utf8DecodeJs;
    exports2.utf8DecodeTD = utf8DecodeTD;
    exports2.utf8Decode = utf8Decode;
    function utf8Count(str2) {
      const strLength = str2.length;
      let byteLength = 0;
      let pos = 0;
      while (pos < strLength) {
        let value = str2.charCodeAt(pos++);
        if ((value & 4294967168) === 0) {
          byteLength++;
          continue;
        } else if ((value & 4294965248) === 0) {
          byteLength += 2;
        } else {
          if (value >= 55296 && value <= 56319) {
            if (pos < strLength) {
              const extra = str2.charCodeAt(pos);
              if ((extra & 64512) === 56320) {
                ++pos;
                value = ((value & 1023) << 10) + (extra & 1023) + 65536;
              }
            }
          }
          if ((value & 4294901760) === 0) {
            byteLength += 3;
          } else {
            byteLength += 4;
          }
        }
      }
      return byteLength;
    }
    function utf8EncodeJs(str2, output, outputOffset) {
      const strLength = str2.length;
      let offset = outputOffset;
      let pos = 0;
      while (pos < strLength) {
        let value = str2.charCodeAt(pos++);
        if ((value & 4294967168) === 0) {
          output[offset++] = value;
          continue;
        } else if ((value & 4294965248) === 0) {
          output[offset++] = value >> 6 & 31 | 192;
        } else {
          if (value >= 55296 && value <= 56319) {
            if (pos < strLength) {
              const extra = str2.charCodeAt(pos);
              if ((extra & 64512) === 56320) {
                ++pos;
                value = ((value & 1023) << 10) + (extra & 1023) + 65536;
              }
            }
          }
          if ((value & 4294901760) === 0) {
            output[offset++] = value >> 12 & 15 | 224;
            output[offset++] = value >> 6 & 63 | 128;
          } else {
            output[offset++] = value >> 18 & 7 | 240;
            output[offset++] = value >> 12 & 63 | 128;
            output[offset++] = value >> 6 & 63 | 128;
          }
        }
        output[offset++] = value & 63 | 128;
      }
    }
    var sharedTextEncoder = new TextEncoder();
    var TEXT_ENCODER_THRESHOLD = 50;
    function utf8EncodeTE(str2, output, outputOffset) {
      sharedTextEncoder.encodeInto(str2, output.subarray(outputOffset));
    }
    function utf8Encode(str2, output, outputOffset) {
      if (str2.length > TEXT_ENCODER_THRESHOLD) {
        utf8EncodeTE(str2, output, outputOffset);
      } else {
        utf8EncodeJs(str2, output, outputOffset);
      }
    }
    var CHUNK_SIZE = 4096;
    function utf8DecodeJs(bytes, inputOffset, byteLength) {
      let offset = inputOffset;
      const end = offset + byteLength;
      const units = [];
      let result = "";
      while (offset < end) {
        const byte1 = bytes[offset++];
        if ((byte1 & 128) === 0) {
          units.push(byte1);
        } else if ((byte1 & 224) === 192) {
          const byte2 = bytes[offset++] & 63;
          units.push((byte1 & 31) << 6 | byte2);
        } else if ((byte1 & 240) === 224) {
          const byte2 = bytes[offset++] & 63;
          const byte3 = bytes[offset++] & 63;
          units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
        } else if ((byte1 & 248) === 240) {
          const byte2 = bytes[offset++] & 63;
          const byte3 = bytes[offset++] & 63;
          const byte4 = bytes[offset++] & 63;
          let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
          if (unit > 65535) {
            unit -= 65536;
            units.push(unit >>> 10 & 1023 | 55296);
            unit = 56320 | unit & 1023;
          }
          units.push(unit);
        } else {
          units.push(byte1);
        }
        if (units.length >= CHUNK_SIZE) {
          result += String.fromCharCode(...units);
          units.length = 0;
        }
      }
      if (units.length > 0) {
        result += String.fromCharCode(...units);
      }
      return result;
    }
    var sharedTextDecoder = new TextDecoder();
    var TEXT_DECODER_THRESHOLD = 200;
    function utf8DecodeTD(bytes, inputOffset, byteLength) {
      const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
      return sharedTextDecoder.decode(stringBytes);
    }
    function utf8Decode(bytes, inputOffset, byteLength) {
      if (byteLength > TEXT_DECODER_THRESHOLD) {
        return utf8DecodeTD(bytes, inputOffset, byteLength);
      } else {
        return utf8DecodeJs(bytes, inputOffset, byteLength);
      }
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/ExtData.cjs
var require_ExtData = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/ExtData.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExtData = void 0;
    var ExtData = class {
      constructor(type, data) {
        this.type = type;
        this.data = data;
      }
    };
    exports2.ExtData = ExtData;
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/DecodeError.cjs
var require_DecodeError = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/DecodeError.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DecodeError = void 0;
    var DecodeError = class _DecodeError extends Error {
      constructor(message) {
        super(message);
        const proto = Object.create(_DecodeError.prototype);
        Object.setPrototypeOf(this, proto);
        Object.defineProperty(this, "name", {
          configurable: true,
          enumerable: false,
          value: _DecodeError.name
        });
      }
    };
    exports2.DecodeError = DecodeError;
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/utils/int.cjs
var require_int = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/utils/int.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UINT32_MAX = void 0;
    exports2.setUint64 = setUint64;
    exports2.setInt64 = setInt64;
    exports2.getInt64 = getInt64;
    exports2.getUint64 = getUint64;
    exports2.UINT32_MAX = 4294967295;
    function setUint64(view, offset, value) {
      const high = value / 4294967296;
      const low = value;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
    function setInt64(view, offset, value) {
      const high = Math.floor(value / 4294967296);
      const low = value;
      view.setUint32(offset, high);
      view.setUint32(offset + 4, low);
    }
    function getInt64(view, offset) {
      const high = view.getInt32(offset);
      const low = view.getUint32(offset + 4);
      return high * 4294967296 + low;
    }
    function getUint64(view, offset) {
      const high = view.getUint32(offset);
      const low = view.getUint32(offset + 4);
      return high * 4294967296 + low;
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/timestamp.cjs
var require_timestamp = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/timestamp.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.timestampExtension = exports2.EXT_TIMESTAMP = void 0;
    exports2.encodeTimeSpecToTimestamp = encodeTimeSpecToTimestamp;
    exports2.encodeDateToTimeSpec = encodeDateToTimeSpec;
    exports2.encodeTimestampExtension = encodeTimestampExtension;
    exports2.decodeTimestampToTimeSpec = decodeTimestampToTimeSpec;
    exports2.decodeTimestampExtension = decodeTimestampExtension;
    var DecodeError_ts_1 = require_DecodeError();
    var int_ts_1 = require_int();
    exports2.EXT_TIMESTAMP = -1;
    var TIMESTAMP32_MAX_SEC = 4294967296 - 1;
    var TIMESTAMP64_MAX_SEC = 17179869184 - 1;
    function encodeTimeSpecToTimestamp({ sec, nsec }) {
      if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
        if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
          const rv = new Uint8Array(4);
          const view = new DataView(rv.buffer);
          view.setUint32(0, sec);
          return rv;
        } else {
          const secHigh = sec / 4294967296;
          const secLow = sec & 4294967295;
          const rv = new Uint8Array(8);
          const view = new DataView(rv.buffer);
          view.setUint32(0, nsec << 2 | secHigh & 3);
          view.setUint32(4, secLow);
          return rv;
        }
      } else {
        const rv = new Uint8Array(12);
        const view = new DataView(rv.buffer);
        view.setUint32(0, nsec);
        (0, int_ts_1.setInt64)(view, 4, sec);
        return rv;
      }
    }
    function encodeDateToTimeSpec(date) {
      const msec = date.getTime();
      const sec = Math.floor(msec / 1e3);
      const nsec = (msec - sec * 1e3) * 1e6;
      const nsecInSec = Math.floor(nsec / 1e9);
      return {
        sec: sec + nsecInSec,
        nsec: nsec - nsecInSec * 1e9
      };
    }
    function encodeTimestampExtension(object) {
      if (object instanceof Date) {
        const timeSpec = encodeDateToTimeSpec(object);
        return encodeTimeSpecToTimestamp(timeSpec);
      } else {
        return null;
      }
    }
    function decodeTimestampToTimeSpec(data) {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      switch (data.byteLength) {
        case 4: {
          const sec = view.getUint32(0);
          const nsec = 0;
          return { sec, nsec };
        }
        case 8: {
          const nsec30AndSecHigh2 = view.getUint32(0);
          const secLow32 = view.getUint32(4);
          const sec = (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32;
          const nsec = nsec30AndSecHigh2 >>> 2;
          return { sec, nsec };
        }
        case 12: {
          const sec = (0, int_ts_1.getInt64)(view, 4);
          const nsec = view.getUint32(0);
          return { sec, nsec };
        }
        default:
          throw new DecodeError_ts_1.DecodeError(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${data.length}`);
      }
    }
    function decodeTimestampExtension(data) {
      const timeSpec = decodeTimestampToTimeSpec(data);
      return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
    }
    exports2.timestampExtension = {
      type: exports2.EXT_TIMESTAMP,
      encode: encodeTimestampExtension,
      decode: decodeTimestampExtension
    };
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/ExtensionCodec.cjs
var require_ExtensionCodec = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/ExtensionCodec.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExtensionCodec = void 0;
    var ExtData_ts_1 = require_ExtData();
    var timestamp_ts_1 = require_timestamp();
    var ExtensionCodec = class {
      constructor() {
        this.builtInEncoders = [];
        this.builtInDecoders = [];
        this.encoders = [];
        this.decoders = [];
        this.register(timestamp_ts_1.timestampExtension);
      }
      register({ type, encode: encode2, decode: decode2 }) {
        if (type >= 0) {
          this.encoders[type] = encode2;
          this.decoders[type] = decode2;
        } else {
          const index = -1 - type;
          this.builtInEncoders[index] = encode2;
          this.builtInDecoders[index] = decode2;
        }
      }
      tryToEncode(object, context) {
        for (let i = 0; i < this.builtInEncoders.length; i++) {
          const encodeExt = this.builtInEncoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type = -1 - i;
              return new ExtData_ts_1.ExtData(type, data);
            }
          }
        }
        for (let i = 0; i < this.encoders.length; i++) {
          const encodeExt = this.encoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type = i;
              return new ExtData_ts_1.ExtData(type, data);
            }
          }
        }
        if (object instanceof ExtData_ts_1.ExtData) {
          return object;
        }
        return null;
      }
      decode(data, type, context) {
        const decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
        if (decodeExt) {
          return decodeExt(data, type, context);
        } else {
          return new ExtData_ts_1.ExtData(type, data);
        }
      }
    };
    exports2.ExtensionCodec = ExtensionCodec;
    ExtensionCodec.defaultCodec = new ExtensionCodec();
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/utils/typedArrays.cjs
var require_typedArrays = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/utils/typedArrays.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ensureUint8Array = ensureUint8Array;
    function isArrayBufferLike(buffer) {
      return buffer instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer;
    }
    function ensureUint8Array(buffer) {
      if (buffer instanceof Uint8Array) {
        return buffer;
      } else if (ArrayBuffer.isView(buffer)) {
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      } else if (isArrayBufferLike(buffer)) {
        return new Uint8Array(buffer);
      } else {
        return Uint8Array.from(buffer);
      }
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/Encoder.cjs
var require_Encoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/Encoder.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Encoder = exports2.DEFAULT_INITIAL_BUFFER_SIZE = exports2.DEFAULT_MAX_DEPTH = void 0;
    var utf8_ts_1 = require_utf8();
    var ExtensionCodec_ts_1 = require_ExtensionCodec();
    var int_ts_1 = require_int();
    var typedArrays_ts_1 = require_typedArrays();
    exports2.DEFAULT_MAX_DEPTH = 100;
    exports2.DEFAULT_INITIAL_BUFFER_SIZE = 2048;
    var Encoder = class _Encoder {
      constructor(options2) {
        this.entered = false;
        this.extensionCodec = options2?.extensionCodec ?? ExtensionCodec_ts_1.ExtensionCodec.defaultCodec;
        this.context = options2?.context;
        this.useBigInt64 = options2?.useBigInt64 ?? false;
        this.maxDepth = options2?.maxDepth ?? exports2.DEFAULT_MAX_DEPTH;
        this.initialBufferSize = options2?.initialBufferSize ?? exports2.DEFAULT_INITIAL_BUFFER_SIZE;
        this.sortKeys = options2?.sortKeys ?? false;
        this.forceFloat32 = options2?.forceFloat32 ?? false;
        this.ignoreUndefined = options2?.ignoreUndefined ?? false;
        this.forceIntegerToFloat = options2?.forceIntegerToFloat ?? false;
        this.pos = 0;
        this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
        this.bytes = new Uint8Array(this.view.buffer);
      }
      clone() {
        return new _Encoder({
          extensionCodec: this.extensionCodec,
          context: this.context,
          useBigInt64: this.useBigInt64,
          maxDepth: this.maxDepth,
          initialBufferSize: this.initialBufferSize,
          sortKeys: this.sortKeys,
          forceFloat32: this.forceFloat32,
          ignoreUndefined: this.ignoreUndefined,
          forceIntegerToFloat: this.forceIntegerToFloat
        });
      }
      reinitializeState() {
        this.pos = 0;
      }
      /**
       * This is almost equivalent to {@link Encoder#encode}, but it returns an reference of the encoder's internal buffer and thus much faster than {@link Encoder#encode}.
       *
       * @returns Encodes the object and returns a shared reference the encoder's internal buffer.
       */
      encodeSharedRef(object) {
        if (this.entered) {
          const instance = this.clone();
          return instance.encodeSharedRef(object);
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.doEncode(object, 1);
          return this.bytes.subarray(0, this.pos);
        } finally {
          this.entered = false;
        }
      }
      /**
       * @returns Encodes the object and returns a copy of the encoder's internal buffer.
       */
      encode(object) {
        if (this.entered) {
          const instance = this.clone();
          return instance.encode(object);
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.doEncode(object, 1);
          return this.bytes.slice(0, this.pos);
        } finally {
          this.entered = false;
        }
      }
      doEncode(object, depth) {
        if (depth > this.maxDepth) {
          throw new Error(`Too deep objects in depth ${depth}`);
        }
        if (object == null) {
          this.encodeNil();
        } else if (typeof object === "boolean") {
          this.encodeBoolean(object);
        } else if (typeof object === "number") {
          if (!this.forceIntegerToFloat) {
            this.encodeNumber(object);
          } else {
            this.encodeNumberAsFloat(object);
          }
        } else if (typeof object === "string") {
          this.encodeString(object);
        } else if (this.useBigInt64 && typeof object === "bigint") {
          this.encodeBigInt64(object);
        } else {
          this.encodeObject(object, depth);
        }
      }
      ensureBufferSizeToWrite(sizeToWrite) {
        const requiredSize = this.pos + sizeToWrite;
        if (this.view.byteLength < requiredSize) {
          this.resizeBuffer(requiredSize * 2);
        }
      }
      resizeBuffer(newSize) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this.bytes);
        this.view = newView;
        this.bytes = newBytes;
      }
      encodeNil() {
        this.writeU8(192);
      }
      encodeBoolean(object) {
        if (object === false) {
          this.writeU8(194);
        } else {
          this.writeU8(195);
        }
      }
      encodeNumber(object) {
        if (!this.forceIntegerToFloat && Number.isSafeInteger(object)) {
          if (object >= 0) {
            if (object < 128) {
              this.writeU8(object);
            } else if (object < 256) {
              this.writeU8(204);
              this.writeU8(object);
            } else if (object < 65536) {
              this.writeU8(205);
              this.writeU16(object);
            } else if (object < 4294967296) {
              this.writeU8(206);
              this.writeU32(object);
            } else if (!this.useBigInt64) {
              this.writeU8(207);
              this.writeU64(object);
            } else {
              this.encodeNumberAsFloat(object);
            }
          } else {
            if (object >= -32) {
              this.writeU8(224 | object + 32);
            } else if (object >= -128) {
              this.writeU8(208);
              this.writeI8(object);
            } else if (object >= -32768) {
              this.writeU8(209);
              this.writeI16(object);
            } else if (object >= -2147483648) {
              this.writeU8(210);
              this.writeI32(object);
            } else if (!this.useBigInt64) {
              this.writeU8(211);
              this.writeI64(object);
            } else {
              this.encodeNumberAsFloat(object);
            }
          }
        } else {
          this.encodeNumberAsFloat(object);
        }
      }
      encodeNumberAsFloat(object) {
        if (this.forceFloat32) {
          this.writeU8(202);
          this.writeF32(object);
        } else {
          this.writeU8(203);
          this.writeF64(object);
        }
      }
      encodeBigInt64(object) {
        if (object >= BigInt(0)) {
          this.writeU8(207);
          this.writeBigUint64(object);
        } else {
          this.writeU8(211);
          this.writeBigInt64(object);
        }
      }
      writeStringHeader(byteLength) {
        if (byteLength < 32) {
          this.writeU8(160 + byteLength);
        } else if (byteLength < 256) {
          this.writeU8(217);
          this.writeU8(byteLength);
        } else if (byteLength < 65536) {
          this.writeU8(218);
          this.writeU16(byteLength);
        } else if (byteLength < 4294967296) {
          this.writeU8(219);
          this.writeU32(byteLength);
        } else {
          throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
      }
      encodeString(object) {
        const maxHeaderSize = 1 + 4;
        const byteLength = (0, utf8_ts_1.utf8Count)(object);
        this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
        this.writeStringHeader(byteLength);
        (0, utf8_ts_1.utf8Encode)(object, this.bytes, this.pos);
        this.pos += byteLength;
      }
      encodeObject(object, depth) {
        const ext = this.extensionCodec.tryToEncode(object, this.context);
        if (ext != null) {
          this.encodeExtension(ext);
        } else if (Array.isArray(object)) {
          this.encodeArray(object, depth);
        } else if (ArrayBuffer.isView(object)) {
          this.encodeBinary(object);
        } else if (typeof object === "object") {
          this.encodeMap(object, depth);
        } else {
          throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
        }
      }
      encodeBinary(object) {
        const size = object.byteLength;
        if (size < 256) {
          this.writeU8(196);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(197);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(198);
          this.writeU32(size);
        } else {
          throw new Error(`Too large binary: ${size}`);
        }
        const bytes = (0, typedArrays_ts_1.ensureUint8Array)(object);
        this.writeU8a(bytes);
      }
      encodeArray(object, depth) {
        const size = object.length;
        if (size < 16) {
          this.writeU8(144 + size);
        } else if (size < 65536) {
          this.writeU8(220);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(221);
          this.writeU32(size);
        } else {
          throw new Error(`Too large array: ${size}`);
        }
        for (const item of object) {
          this.doEncode(item, depth + 1);
        }
      }
      countWithoutUndefined(object, keys) {
        let count3 = 0;
        for (const key of keys) {
          if (object[key] !== void 0) {
            count3++;
          }
        }
        return count3;
      }
      encodeMap(object, depth) {
        const keys = Object.keys(object);
        if (this.sortKeys) {
          keys.sort();
        }
        const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
        if (size < 16) {
          this.writeU8(128 + size);
        } else if (size < 65536) {
          this.writeU8(222);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(223);
          this.writeU32(size);
        } else {
          throw new Error(`Too large map object: ${size}`);
        }
        for (const key of keys) {
          const value = object[key];
          if (!(this.ignoreUndefined && value === void 0)) {
            this.encodeString(key);
            this.doEncode(value, depth + 1);
          }
        }
      }
      encodeExtension(ext) {
        if (typeof ext.data === "function") {
          const data = ext.data(this.pos + 6);
          const size2 = data.length;
          if (size2 >= 4294967296) {
            throw new Error(`Too large extension object: ${size2}`);
          }
          this.writeU8(201);
          this.writeU32(size2);
          this.writeI8(ext.type);
          this.writeU8a(data);
          return;
        }
        const size = ext.data.length;
        if (size === 1) {
          this.writeU8(212);
        } else if (size === 2) {
          this.writeU8(213);
        } else if (size === 4) {
          this.writeU8(214);
        } else if (size === 8) {
          this.writeU8(215);
        } else if (size === 16) {
          this.writeU8(216);
        } else if (size < 256) {
          this.writeU8(199);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(200);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(201);
          this.writeU32(size);
        } else {
          throw new Error(`Too large extension object: ${size}`);
        }
        this.writeI8(ext.type);
        this.writeU8a(ext.data);
      }
      writeU8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setUint8(this.pos, value);
        this.pos++;
      }
      writeU8a(values) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this.bytes.set(values, this.pos);
        this.pos += size;
      }
      writeI8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setInt8(this.pos, value);
        this.pos++;
      }
      writeU16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setUint16(this.pos, value);
        this.pos += 2;
      }
      writeI16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setInt16(this.pos, value);
        this.pos += 2;
      }
      writeU32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setUint32(this.pos, value);
        this.pos += 4;
      }
      writeI32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setInt32(this.pos, value);
        this.pos += 4;
      }
      writeF32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setFloat32(this.pos, value);
        this.pos += 4;
      }
      writeF64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setFloat64(this.pos, value);
        this.pos += 8;
      }
      writeU64(value) {
        this.ensureBufferSizeToWrite(8);
        (0, int_ts_1.setUint64)(this.view, this.pos, value);
        this.pos += 8;
      }
      writeI64(value) {
        this.ensureBufferSizeToWrite(8);
        (0, int_ts_1.setInt64)(this.view, this.pos, value);
        this.pos += 8;
      }
      writeBigUint64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setBigUint64(this.pos, value);
        this.pos += 8;
      }
      writeBigInt64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setBigInt64(this.pos, value);
        this.pos += 8;
      }
    };
    exports2.Encoder = Encoder;
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/encode.cjs
var require_encode = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/encode.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encode = encode2;
    var Encoder_ts_1 = require_Encoder();
    function encode2(value, options2) {
      const encoder = new Encoder_ts_1.Encoder(options2);
      return encoder.encodeSharedRef(value);
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/utils/prettyByte.cjs
var require_prettyByte = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/utils/prettyByte.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.prettyByte = prettyByte;
    function prettyByte(byte) {
      return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/CachedKeyDecoder.cjs
var require_CachedKeyDecoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/CachedKeyDecoder.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CachedKeyDecoder = void 0;
    var utf8_ts_1 = require_utf8();
    var DEFAULT_MAX_KEY_LENGTH = 16;
    var DEFAULT_MAX_LENGTH_PER_KEY = 16;
    var CachedKeyDecoder = class {
      constructor(maxKeyLength = DEFAULT_MAX_KEY_LENGTH, maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
        this.hit = 0;
        this.miss = 0;
        this.maxKeyLength = maxKeyLength;
        this.maxLengthPerKey = maxLengthPerKey;
        this.caches = [];
        for (let i = 0; i < this.maxKeyLength; i++) {
          this.caches.push([]);
        }
      }
      canBeCached(byteLength) {
        return byteLength > 0 && byteLength <= this.maxKeyLength;
      }
      find(bytes, inputOffset, byteLength) {
        const records = this.caches[byteLength - 1];
        FIND_CHUNK: for (const record of records) {
          const recordBytes = record.bytes;
          for (let j = 0; j < byteLength; j++) {
            if (recordBytes[j] !== bytes[inputOffset + j]) {
              continue FIND_CHUNK;
            }
          }
          return record.str;
        }
        return null;
      }
      store(bytes, value) {
        const records = this.caches[bytes.length - 1];
        const record = { bytes, str: value };
        if (records.length >= this.maxLengthPerKey) {
          records[Math.random() * records.length | 0] = record;
        } else {
          records.push(record);
        }
      }
      decode(bytes, inputOffset, byteLength) {
        const cachedValue = this.find(bytes, inputOffset, byteLength);
        if (cachedValue != null) {
          this.hit++;
          return cachedValue;
        }
        this.miss++;
        const str2 = (0, utf8_ts_1.utf8DecodeJs)(bytes, inputOffset, byteLength);
        const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
        this.store(slicedCopyOfBytes, str2);
        return str2;
      }
    };
    exports2.CachedKeyDecoder = CachedKeyDecoder;
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/Decoder.cjs
var require_Decoder = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/Decoder.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Decoder = void 0;
    var prettyByte_ts_1 = require_prettyByte();
    var ExtensionCodec_ts_1 = require_ExtensionCodec();
    var int_ts_1 = require_int();
    var utf8_ts_1 = require_utf8();
    var typedArrays_ts_1 = require_typedArrays();
    var CachedKeyDecoder_ts_1 = require_CachedKeyDecoder();
    var DecodeError_ts_1 = require_DecodeError();
    var STATE_ARRAY = "array";
    var STATE_MAP_KEY = "map_key";
    var STATE_MAP_VALUE = "map_value";
    var mapKeyConverter = (key) => {
      if (typeof key === "string" || typeof key === "number") {
        return key;
      }
      throw new DecodeError_ts_1.DecodeError("The type of key must be string or number but " + typeof key);
    };
    var StackPool = class {
      constructor() {
        this.stack = [];
        this.stackHeadPosition = -1;
      }
      get length() {
        return this.stackHeadPosition + 1;
      }
      top() {
        return this.stack[this.stackHeadPosition];
      }
      pushArrayState(size) {
        const state = this.getUninitializedStateFromPool();
        state.type = STATE_ARRAY;
        state.position = 0;
        state.size = size;
        state.array = new Array(size);
      }
      pushMapState(size) {
        const state = this.getUninitializedStateFromPool();
        state.type = STATE_MAP_KEY;
        state.readCount = 0;
        state.size = size;
        state.map = {};
      }
      getUninitializedStateFromPool() {
        this.stackHeadPosition++;
        if (this.stackHeadPosition === this.stack.length) {
          const partialState = {
            type: void 0,
            size: 0,
            array: void 0,
            position: 0,
            readCount: 0,
            map: void 0,
            key: null
          };
          this.stack.push(partialState);
        }
        return this.stack[this.stackHeadPosition];
      }
      release(state) {
        const topStackState = this.stack[this.stackHeadPosition];
        if (topStackState !== state) {
          throw new Error("Invalid stack state. Released state is not on top of the stack.");
        }
        if (state.type === STATE_ARRAY) {
          const partialState = state;
          partialState.size = 0;
          partialState.array = void 0;
          partialState.position = 0;
          partialState.type = void 0;
        }
        if (state.type === STATE_MAP_KEY || state.type === STATE_MAP_VALUE) {
          const partialState = state;
          partialState.size = 0;
          partialState.map = void 0;
          partialState.readCount = 0;
          partialState.type = void 0;
        }
        this.stackHeadPosition--;
      }
      reset() {
        this.stack.length = 0;
        this.stackHeadPosition = -1;
      }
    };
    var HEAD_BYTE_REQUIRED = -1;
    var EMPTY_VIEW = new DataView(new ArrayBuffer(0));
    var EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
    try {
      EMPTY_VIEW.getInt8(0);
    } catch (e) {
      if (!(e instanceof RangeError)) {
        throw new Error("This module is not supported in the current JavaScript engine because DataView does not throw RangeError on out-of-bounds access");
      }
    }
    var MORE_DATA = new RangeError("Insufficient data");
    var sharedCachedKeyDecoder = new CachedKeyDecoder_ts_1.CachedKeyDecoder();
    var Decoder = class _Decoder {
      constructor(options2) {
        this.totalPos = 0;
        this.pos = 0;
        this.view = EMPTY_VIEW;
        this.bytes = EMPTY_BYTES;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack = new StackPool();
        this.entered = false;
        this.extensionCodec = options2?.extensionCodec ?? ExtensionCodec_ts_1.ExtensionCodec.defaultCodec;
        this.context = options2?.context;
        this.useBigInt64 = options2?.useBigInt64 ?? false;
        this.rawStrings = options2?.rawStrings ?? false;
        this.maxStrLength = options2?.maxStrLength ?? int_ts_1.UINT32_MAX;
        this.maxBinLength = options2?.maxBinLength ?? int_ts_1.UINT32_MAX;
        this.maxArrayLength = options2?.maxArrayLength ?? int_ts_1.UINT32_MAX;
        this.maxMapLength = options2?.maxMapLength ?? int_ts_1.UINT32_MAX;
        this.maxExtLength = options2?.maxExtLength ?? int_ts_1.UINT32_MAX;
        this.keyDecoder = options2?.keyDecoder !== void 0 ? options2.keyDecoder : sharedCachedKeyDecoder;
        this.mapKeyConverter = options2?.mapKeyConverter ?? mapKeyConverter;
      }
      clone() {
        return new _Decoder({
          extensionCodec: this.extensionCodec,
          context: this.context,
          useBigInt64: this.useBigInt64,
          rawStrings: this.rawStrings,
          maxStrLength: this.maxStrLength,
          maxBinLength: this.maxBinLength,
          maxArrayLength: this.maxArrayLength,
          maxMapLength: this.maxMapLength,
          maxExtLength: this.maxExtLength,
          keyDecoder: this.keyDecoder
        });
      }
      reinitializeState() {
        this.totalPos = 0;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack.reset();
      }
      setBuffer(buffer) {
        const bytes = (0, typedArrays_ts_1.ensureUint8Array)(buffer);
        this.bytes = bytes;
        this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        this.pos = 0;
      }
      appendBuffer(buffer) {
        if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) {
          this.setBuffer(buffer);
        } else {
          const remainingData = this.bytes.subarray(this.pos);
          const newData = (0, typedArrays_ts_1.ensureUint8Array)(buffer);
          const newBuffer = new Uint8Array(remainingData.length + newData.length);
          newBuffer.set(remainingData);
          newBuffer.set(newData, remainingData.length);
          this.setBuffer(newBuffer);
        }
      }
      hasRemaining(size) {
        return this.view.byteLength - this.pos >= size;
      }
      createExtraByteError(posToShow) {
        const { view, pos } = this;
        return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
      }
      /**
       * @throws {@link DecodeError}
       * @throws {@link RangeError}
       */
      decode(buffer) {
        if (this.entered) {
          const instance = this.clone();
          return instance.decode(buffer);
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.setBuffer(buffer);
          const object = this.doDecodeSync();
          if (this.hasRemaining(1)) {
            throw this.createExtraByteError(this.pos);
          }
          return object;
        } finally {
          this.entered = false;
        }
      }
      *decodeMulti(buffer) {
        if (this.entered) {
          const instance = this.clone();
          yield* instance.decodeMulti(buffer);
          return;
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.setBuffer(buffer);
          while (this.hasRemaining(1)) {
            yield this.doDecodeSync();
          }
        } finally {
          this.entered = false;
        }
      }
      async decodeAsync(stream) {
        if (this.entered) {
          const instance = this.clone();
          return instance.decodeAsync(stream);
        }
        try {
          this.entered = true;
          let decoded = false;
          let object;
          for await (const buffer of stream) {
            if (decoded) {
              this.entered = false;
              throw this.createExtraByteError(this.totalPos);
            }
            this.appendBuffer(buffer);
            try {
              object = this.doDecodeSync();
              decoded = true;
            } catch (e) {
              if (!(e instanceof RangeError)) {
                throw e;
              }
            }
            this.totalPos += this.pos;
          }
          if (decoded) {
            if (this.hasRemaining(1)) {
              throw this.createExtraByteError(this.totalPos);
            }
            return object;
          }
          const { headByte, pos, totalPos } = this;
          throw new RangeError(`Insufficient data in parsing ${(0, prettyByte_ts_1.prettyByte)(headByte)} at ${totalPos} (${pos} in the current buffer)`);
        } finally {
          this.entered = false;
        }
      }
      decodeArrayStream(stream) {
        return this.decodeMultiAsync(stream, true);
      }
      decodeStream(stream) {
        return this.decodeMultiAsync(stream, false);
      }
      async *decodeMultiAsync(stream, isArray) {
        if (this.entered) {
          const instance = this.clone();
          yield* instance.decodeMultiAsync(stream, isArray);
          return;
        }
        try {
          this.entered = true;
          let isArrayHeaderRequired = isArray;
          let arrayItemsLeft = -1;
          for await (const buffer of stream) {
            if (isArray && arrayItemsLeft === 0) {
              throw this.createExtraByteError(this.totalPos);
            }
            this.appendBuffer(buffer);
            if (isArrayHeaderRequired) {
              arrayItemsLeft = this.readArraySize();
              isArrayHeaderRequired = false;
              this.complete();
            }
            try {
              while (true) {
                yield this.doDecodeSync();
                if (--arrayItemsLeft === 0) {
                  break;
                }
              }
            } catch (e) {
              if (!(e instanceof RangeError)) {
                throw e;
              }
            }
            this.totalPos += this.pos;
          }
        } finally {
          this.entered = false;
        }
      }
      doDecodeSync() {
        DECODE: while (true) {
          const headByte = this.readHeadByte();
          let object;
          if (headByte >= 224) {
            object = headByte - 256;
          } else if (headByte < 192) {
            if (headByte < 128) {
              object = headByte;
            } else if (headByte < 144) {
              const size = headByte - 128;
              if (size !== 0) {
                this.pushMapState(size);
                this.complete();
                continue DECODE;
              } else {
                object = {};
              }
            } else if (headByte < 160) {
              const size = headByte - 144;
              if (size !== 0) {
                this.pushArrayState(size);
                this.complete();
                continue DECODE;
              } else {
                object = [];
              }
            } else {
              const byteLength = headByte - 160;
              object = this.decodeString(byteLength, 0);
            }
          } else if (headByte === 192) {
            object = null;
          } else if (headByte === 194) {
            object = false;
          } else if (headByte === 195) {
            object = true;
          } else if (headByte === 202) {
            object = this.readF32();
          } else if (headByte === 203) {
            object = this.readF64();
          } else if (headByte === 204) {
            object = this.readU8();
          } else if (headByte === 205) {
            object = this.readU16();
          } else if (headByte === 206) {
            object = this.readU32();
          } else if (headByte === 207) {
            if (this.useBigInt64) {
              object = this.readU64AsBigInt();
            } else {
              object = this.readU64();
            }
          } else if (headByte === 208) {
            object = this.readI8();
          } else if (headByte === 209) {
            object = this.readI16();
          } else if (headByte === 210) {
            object = this.readI32();
          } else if (headByte === 211) {
            if (this.useBigInt64) {
              object = this.readI64AsBigInt();
            } else {
              object = this.readI64();
            }
          } else if (headByte === 217) {
            const byteLength = this.lookU8();
            object = this.decodeString(byteLength, 1);
          } else if (headByte === 218) {
            const byteLength = this.lookU16();
            object = this.decodeString(byteLength, 2);
          } else if (headByte === 219) {
            const byteLength = this.lookU32();
            object = this.decodeString(byteLength, 4);
          } else if (headByte === 220) {
            const size = this.readU16();
            if (size !== 0) {
              this.pushArrayState(size);
              this.complete();
              continue DECODE;
            } else {
              object = [];
            }
          } else if (headByte === 221) {
            const size = this.readU32();
            if (size !== 0) {
              this.pushArrayState(size);
              this.complete();
              continue DECODE;
            } else {
              object = [];
            }
          } else if (headByte === 222) {
            const size = this.readU16();
            if (size !== 0) {
              this.pushMapState(size);
              this.complete();
              continue DECODE;
            } else {
              object = {};
            }
          } else if (headByte === 223) {
            const size = this.readU32();
            if (size !== 0) {
              this.pushMapState(size);
              this.complete();
              continue DECODE;
            } else {
              object = {};
            }
          } else if (headByte === 196) {
            const size = this.lookU8();
            object = this.decodeBinary(size, 1);
          } else if (headByte === 197) {
            const size = this.lookU16();
            object = this.decodeBinary(size, 2);
          } else if (headByte === 198) {
            const size = this.lookU32();
            object = this.decodeBinary(size, 4);
          } else if (headByte === 212) {
            object = this.decodeExtension(1, 0);
          } else if (headByte === 213) {
            object = this.decodeExtension(2, 0);
          } else if (headByte === 214) {
            object = this.decodeExtension(4, 0);
          } else if (headByte === 215) {
            object = this.decodeExtension(8, 0);
          } else if (headByte === 216) {
            object = this.decodeExtension(16, 0);
          } else if (headByte === 199) {
            const size = this.lookU8();
            object = this.decodeExtension(size, 1);
          } else if (headByte === 200) {
            const size = this.lookU16();
            object = this.decodeExtension(size, 2);
          } else if (headByte === 201) {
            const size = this.lookU32();
            object = this.decodeExtension(size, 4);
          } else {
            throw new DecodeError_ts_1.DecodeError(`Unrecognized type byte: ${(0, prettyByte_ts_1.prettyByte)(headByte)}`);
          }
          this.complete();
          const stack = this.stack;
          while (stack.length > 0) {
            const state = stack.top();
            if (state.type === STATE_ARRAY) {
              state.array[state.position] = object;
              state.position++;
              if (state.position === state.size) {
                object = state.array;
                stack.release(state);
              } else {
                continue DECODE;
              }
            } else if (state.type === STATE_MAP_KEY) {
              if (object === "__proto__") {
                throw new DecodeError_ts_1.DecodeError("The key __proto__ is not allowed");
              }
              state.key = this.mapKeyConverter(object);
              state.type = STATE_MAP_VALUE;
              continue DECODE;
            } else {
              state.map[state.key] = object;
              state.readCount++;
              if (state.readCount === state.size) {
                object = state.map;
                stack.release(state);
              } else {
                state.key = null;
                state.type = STATE_MAP_KEY;
                continue DECODE;
              }
            }
          }
          return object;
        }
      }
      readHeadByte() {
        if (this.headByte === HEAD_BYTE_REQUIRED) {
          this.headByte = this.readU8();
        }
        return this.headByte;
      }
      complete() {
        this.headByte = HEAD_BYTE_REQUIRED;
      }
      readArraySize() {
        const headByte = this.readHeadByte();
        switch (headByte) {
          case 220:
            return this.readU16();
          case 221:
            return this.readU32();
          default: {
            if (headByte < 160) {
              return headByte - 144;
            } else {
              throw new DecodeError_ts_1.DecodeError(`Unrecognized array type byte: ${(0, prettyByte_ts_1.prettyByte)(headByte)}`);
            }
          }
        }
      }
      pushMapState(size) {
        if (size > this.maxMapLength) {
          throw new DecodeError_ts_1.DecodeError(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
        }
        this.stack.pushMapState(size);
      }
      pushArrayState(size) {
        if (size > this.maxArrayLength) {
          throw new DecodeError_ts_1.DecodeError(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
        }
        this.stack.pushArrayState(size);
      }
      decodeString(byteLength, headerOffset) {
        if (!this.rawStrings || this.stateIsMapKey()) {
          return this.decodeUtf8String(byteLength, headerOffset);
        }
        return this.decodeBinary(byteLength, headerOffset);
      }
      /**
       * @throws {@link RangeError}
       */
      decodeUtf8String(byteLength, headerOffset) {
        if (byteLength > this.maxStrLength) {
          throw new DecodeError_ts_1.DecodeError(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
        }
        if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
          throw MORE_DATA;
        }
        const offset = this.pos + headerOffset;
        let object;
        if (this.stateIsMapKey() && this.keyDecoder?.canBeCached(byteLength)) {
          object = this.keyDecoder.decode(this.bytes, offset, byteLength);
        } else {
          object = (0, utf8_ts_1.utf8Decode)(this.bytes, offset, byteLength);
        }
        this.pos += headerOffset + byteLength;
        return object;
      }
      stateIsMapKey() {
        if (this.stack.length > 0) {
          const state = this.stack.top();
          return state.type === STATE_MAP_KEY;
        }
        return false;
      }
      /**
       * @throws {@link RangeError}
       */
      decodeBinary(byteLength, headOffset) {
        if (byteLength > this.maxBinLength) {
          throw new DecodeError_ts_1.DecodeError(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
        }
        if (!this.hasRemaining(byteLength + headOffset)) {
          throw MORE_DATA;
        }
        const offset = this.pos + headOffset;
        const object = this.bytes.subarray(offset, offset + byteLength);
        this.pos += headOffset + byteLength;
        return object;
      }
      decodeExtension(size, headOffset) {
        if (size > this.maxExtLength) {
          throw new DecodeError_ts_1.DecodeError(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
        }
        const extType = this.view.getInt8(this.pos + headOffset);
        const data = this.decodeBinary(
          size,
          headOffset + 1
          /* extType */
        );
        return this.extensionCodec.decode(data, extType, this.context);
      }
      lookU8() {
        return this.view.getUint8(this.pos);
      }
      lookU16() {
        return this.view.getUint16(this.pos);
      }
      lookU32() {
        return this.view.getUint32(this.pos);
      }
      readU8() {
        const value = this.view.getUint8(this.pos);
        this.pos++;
        return value;
      }
      readI8() {
        const value = this.view.getInt8(this.pos);
        this.pos++;
        return value;
      }
      readU16() {
        const value = this.view.getUint16(this.pos);
        this.pos += 2;
        return value;
      }
      readI16() {
        const value = this.view.getInt16(this.pos);
        this.pos += 2;
        return value;
      }
      readU32() {
        const value = this.view.getUint32(this.pos);
        this.pos += 4;
        return value;
      }
      readI32() {
        const value = this.view.getInt32(this.pos);
        this.pos += 4;
        return value;
      }
      readU64() {
        const value = (0, int_ts_1.getUint64)(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readI64() {
        const value = (0, int_ts_1.getInt64)(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readU64AsBigInt() {
        const value = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return value;
      }
      readI64AsBigInt() {
        const value = this.view.getBigInt64(this.pos);
        this.pos += 8;
        return value;
      }
      readF32() {
        const value = this.view.getFloat32(this.pos);
        this.pos += 4;
        return value;
      }
      readF64() {
        const value = this.view.getFloat64(this.pos);
        this.pos += 8;
        return value;
      }
    };
    exports2.Decoder = Decoder;
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/decode.cjs
var require_decode = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/decode.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.decode = decode2;
    exports2.decodeMulti = decodeMulti;
    var Decoder_ts_1 = require_Decoder();
    function decode2(buffer, options2) {
      const decoder = new Decoder_ts_1.Decoder(options2);
      return decoder.decode(buffer);
    }
    function decodeMulti(buffer, options2) {
      const decoder = new Decoder_ts_1.Decoder(options2);
      return decoder.decodeMulti(buffer);
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/utils/stream.cjs
var require_stream = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/utils/stream.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAsyncIterable = isAsyncIterable;
    exports2.asyncIterableFromStream = asyncIterableFromStream;
    exports2.ensureAsyncIterable = ensureAsyncIterable;
    function isAsyncIterable(object) {
      return object[Symbol.asyncIterator] != null;
    }
    async function* asyncIterableFromStream(stream) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
    function ensureAsyncIterable(streamLike) {
      if (isAsyncIterable(streamLike)) {
        return streamLike;
      } else {
        return asyncIterableFromStream(streamLike);
      }
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/decodeAsync.cjs
var require_decodeAsync = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/decodeAsync.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.decodeAsync = decodeAsync;
    exports2.decodeArrayStream = decodeArrayStream;
    exports2.decodeMultiStream = decodeMultiStream;
    var Decoder_ts_1 = require_Decoder();
    var stream_ts_1 = require_stream();
    async function decodeAsync(streamLike, options2) {
      const stream = (0, stream_ts_1.ensureAsyncIterable)(streamLike);
      const decoder = new Decoder_ts_1.Decoder(options2);
      return decoder.decodeAsync(stream);
    }
    function decodeArrayStream(streamLike, options2) {
      const stream = (0, stream_ts_1.ensureAsyncIterable)(streamLike);
      const decoder = new Decoder_ts_1.Decoder(options2);
      return decoder.decodeArrayStream(stream);
    }
    function decodeMultiStream(streamLike, options2) {
      const stream = (0, stream_ts_1.ensureAsyncIterable)(streamLike);
      const decoder = new Decoder_ts_1.Decoder(options2);
      return decoder.decodeStream(stream);
    }
  }
});

// node_modules/@msgpack/msgpack/dist.cjs/index.cjs
var require_dist = __commonJS({
  "node_modules/@msgpack/msgpack/dist.cjs/index.cjs"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.decodeTimestampExtension = exports2.encodeTimestampExtension = exports2.decodeTimestampToTimeSpec = exports2.encodeTimeSpecToTimestamp = exports2.encodeDateToTimeSpec = exports2.EXT_TIMESTAMP = exports2.ExtData = exports2.ExtensionCodec = exports2.Encoder = exports2.DecodeError = exports2.Decoder = exports2.decodeMultiStream = exports2.decodeArrayStream = exports2.decodeAsync = exports2.decodeMulti = exports2.decode = exports2.encode = void 0;
    var encode_ts_1 = require_encode();
    Object.defineProperty(exports2, "encode", { enumerable: true, get: function() {
      return encode_ts_1.encode;
    } });
    var decode_ts_1 = require_decode();
    Object.defineProperty(exports2, "decode", { enumerable: true, get: function() {
      return decode_ts_1.decode;
    } });
    Object.defineProperty(exports2, "decodeMulti", { enumerable: true, get: function() {
      return decode_ts_1.decodeMulti;
    } });
    var decodeAsync_ts_1 = require_decodeAsync();
    Object.defineProperty(exports2, "decodeAsync", { enumerable: true, get: function() {
      return decodeAsync_ts_1.decodeAsync;
    } });
    Object.defineProperty(exports2, "decodeArrayStream", { enumerable: true, get: function() {
      return decodeAsync_ts_1.decodeArrayStream;
    } });
    Object.defineProperty(exports2, "decodeMultiStream", { enumerable: true, get: function() {
      return decodeAsync_ts_1.decodeMultiStream;
    } });
    var Decoder_ts_1 = require_Decoder();
    Object.defineProperty(exports2, "Decoder", { enumerable: true, get: function() {
      return Decoder_ts_1.Decoder;
    } });
    var DecodeError_ts_1 = require_DecodeError();
    Object.defineProperty(exports2, "DecodeError", { enumerable: true, get: function() {
      return DecodeError_ts_1.DecodeError;
    } });
    var Encoder_ts_1 = require_Encoder();
    Object.defineProperty(exports2, "Encoder", { enumerable: true, get: function() {
      return Encoder_ts_1.Encoder;
    } });
    var ExtensionCodec_ts_1 = require_ExtensionCodec();
    Object.defineProperty(exports2, "ExtensionCodec", { enumerable: true, get: function() {
      return ExtensionCodec_ts_1.ExtensionCodec;
    } });
    var ExtData_ts_1 = require_ExtData();
    Object.defineProperty(exports2, "ExtData", { enumerable: true, get: function() {
      return ExtData_ts_1.ExtData;
    } });
    var timestamp_ts_1 = require_timestamp();
    Object.defineProperty(exports2, "EXT_TIMESTAMP", { enumerable: true, get: function() {
      return timestamp_ts_1.EXT_TIMESTAMP;
    } });
    Object.defineProperty(exports2, "encodeDateToTimeSpec", { enumerable: true, get: function() {
      return timestamp_ts_1.encodeDateToTimeSpec;
    } });
    Object.defineProperty(exports2, "encodeTimeSpecToTimestamp", { enumerable: true, get: function() {
      return timestamp_ts_1.encodeTimeSpecToTimestamp;
    } });
    Object.defineProperty(exports2, "decodeTimestampToTimeSpec", { enumerable: true, get: function() {
      return timestamp_ts_1.decodeTimestampToTimeSpec;
    } });
    Object.defineProperty(exports2, "encodeTimestampExtension", { enumerable: true, get: function() {
      return timestamp_ts_1.encodeTimestampExtension;
    } });
    Object.defineProperty(exports2, "decodeTimestampExtension", { enumerable: true, get: function() {
      return timestamp_ts_1.decodeTimestampExtension;
    } });
  }
});

// node_modules/dpack/lib/serialize.js
var require_serialize = __commonJS({
  "node_modules/dpack/lib/serialize.js"(exports2) {
    "use strict";
    var PROPERTY_CODE = 0;
    var TYPE_CODE = 3;
    var STRING_CODE = 2;
    var NUMBER_CODE = 1;
    var SEQUENCE_CODE = 7;
    var NULL = 0;
    var FALSE = 3;
    var TRUE = 4;
    var UNDEFINED = 5;
    var DEFAULT_TYPE = 6;
    var ARRAY_TYPE = 7;
    var REFERENCING_TYPE = 8;
    var NUMBER_TYPE = 9;
    var METADATA_TYPE = 11;
    var REFERENCING_POSITION = 13;
    var ERROR_METADATA = 500;
    var OPEN_SEQUENCE = 12;
    var END_SEQUENCE = 14;
    var DEFERRED_REFERENCE = 15;
    var nextId = 1;
    var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "__iterator_symbol__";
    function createSerializer(options2) {
      if (!options2)
        options2 = {};
      var extendedTypes = options2.converterByConstructor;
      if (!extendedTypes) {
        extendedTypes = /* @__PURE__ */ new Map();
      }
      extendedTypes.set(Map, {
        name: "Map",
        toValue: writeMap
      });
      extendedTypes.set(Set, {
        name: "Set",
        toValue: writeSet
      });
      extendedTypes.set(Date, {
        name: "Date",
        toValue: writeDate
      });
      var avoidShareUpdate = options2.outlet || options2.avoidShareUpdate;
      var charEncoder = typeof global != "undefined" && global.Buffer && !(options2 && options2.encoding === "utf16le") ? exports2.nodeCharEncoder(options2) : browserCharEncoder(options2);
      var writeString = charEncoder.writeString;
      var writeToken = charEncoder.writeToken;
      var startSequence = charEncoder.startSequence;
      var endSequence = charEncoder.endSequence;
      var writeBuffer = charEncoder.writeBuffer;
      var forProperty = options2.forProperty;
      var propertyUsed;
      var valueUsed;
      if (options2.shared) {
        propertyUsed = options2.shared.propertyUsed;
        valueUsed = options2.shared.propertyUsed;
      }
      var pendingEncodings = [];
      var nextPropertyIndex = 8;
      var property;
      var bufferSymbol = exports2.bufferSymbol || "_bufferSymbol_";
      var targetSymbol = exports2.targetSymbol || "_targetSymbol_";
      var propertyComparisons = 0;
      var serializerId = nextId++;
      var writers = [
        0,
        1,
        2,
        3,
        4,
        5,
        writeAsDefault,
        writeAsArray,
        writeAsReferencing,
        writeAsNumber,
        writeOnlyNull
      ];
      function writeNumber(number) {
        writeToken(NUMBER_CODE, number);
      }
      function writeInlineString(string) {
        writeToken(STRING_CODE, string.length);
        writeString(string);
      }
      function writeAsReferencing(value) {
        var type, values = property.values;
        if (values) {
          if (values.resetTo > -1 && values.serializer !== serializerId) {
            values.serializer = serializerId;
            if (values.resetTo < values.length)
              values.length = values.resetTo;
            writeToken(TYPE_CODE, REFERENCING_POSITION);
            writeToken(NUMBER_CODE, values.resetTo);
          }
          var reference = values.indexOf(value);
          if (reference > -1) {
            return writeNumber(reference);
          }
        }
        if ((type = typeof value) === "string" || type === "object" && value) {
          if (property.writeSharedValue) {
            if (property.writeSharedValue(value, writeToken, serializerId))
              return;
          } else if (values) {
            var index = values.length;
            if (index < 12)
              values[index] = value;
          }
        }
        if (type === "string") {
          writeInlineString(value);
        } else {
          writeAsDefault(value);
        }
      }
      function writeAsNumber(number) {
        var type = typeof number;
        if (type === "number") {
          if (number >>> 0 === number || number > 0 && number < 70368744177664 && number % 1 === 0) {
            writeToken(NUMBER_CODE, number);
          } else {
            var asString = number.toString();
            writeInlineString(asString);
          }
        } else if (type === "object") {
          writeAsDefault(number);
        } else {
          writeTypedValue(number);
        }
      }
      function writeTypedValue(value) {
        if (value === null)
          writeToken(TYPE_CODE, NULL);
        else if (value === false)
          writeToken(TYPE_CODE, FALSE);
        else if (value === true)
          writeToken(TYPE_CODE, TRUE);
        else if (value === void 0)
          writeToken(TYPE_CODE, UNDEFINED);
        else {
          writeTypedNonConstant(value);
        }
      }
      function writeTypedNonConstant(value) {
        var type = typeof value;
        var extendedType;
        if (type === "object") {
          if (value) {
            var constructor2 = value.constructor;
            if (constructor2 === Object) {
            } else if (constructor2 === Array) {
              type = "array";
            } else {
              extendedType = extendedTypes.get(constructor2);
              if (extendedType && extendedType.toValue) {
                value = extendedType.toValue(value);
                type = typeof value;
                if (value && type === "object" && value.constructor === Array) {
                  type = "array";
                }
                if (property.type === type) {
                  if (property.extendedType !== extendedType) {
                    property.extendedType = extendedType;
                    writeToken(TYPE_CODE, METADATA_TYPE);
                    writeInlineString(extendedType.name);
                  }
                  return writers[property.code](value);
                }
              } else {
                extendedType = false;
              }
            }
          } else {
            type = "undefined";
          }
        } else if (type === "boolean") {
          type = "undefined";
        } else if (type === "function") {
          value = value.toString();
          type = "string";
        }
        property = writeProperty(null, type, extendedType);
        writers[property.code](value);
      }
      function writeOnlyNull() {
        writeToken(TYPE_CODE, NULL);
      }
      function writeAsDefault(value, isRoot) {
        var type = typeof value;
        if (type === "object") {
          if (!value) {
            return writeToken(TYPE_CODE, NULL);
          }
        } else if (type === "string") {
          return writeInlineString(value);
        } else if (type === "number" && (value >>> 0 === value || value > 0 && value < 70368744177664 && value % 1 === 0)) {
          return writeToken(NUMBER_CODE, value);
        } else {
          return writeTypedValue(value);
        }
        var object = value;
        var constructor2 = object.constructor;
        var notPlainObject;
        if (object[targetSymbol]) {
          return writeBlockReference(value);
        } else if (constructor2 === Object) {
          notPlainObject = false;
        } else if (constructor2 === Array) {
          property = writeProperty(property.key, "array");
          return writers[property.code](value);
        } else {
          if (object.then) {
            return writeBlockReference(value);
          }
          extendedType = extendedTypes.get(constructor2);
          if (extendedType) {
            if (extendedType.toValue) {
              return writeTypedValue(object);
            }
          } else {
            if (object[iteratorSymbol]) {
              property = writeProperty(property.key, "array");
              return writeAsIterable(object, isRoot);
            }
            extendedTypes.set(constructor2, extendedType = {
              name: constructor2.name
            });
          }
          if (property.constructs !== constructor2) {
            writeToken(TYPE_CODE, METADATA_TYPE);
            writeInlineString(extendedType.name);
            property.constructs = constructor2;
          }
          notPlainObject = true;
        }
        var thisProperty = property;
        if (thisProperty.resetTo < thisProperty.length && thisProperty.serializer != serializerId) {
          thisProperty.length = thisProperty.resetTo;
          thisProperty.serializer = serializerId;
        }
        startSequence();
        var i = 0;
        var resumeIndex = -2;
        var propertyIndex = 0;
        for (var key in object) {
          if (notPlainObject && !object.hasOwnProperty(key))
            continue;
          var value = object[key];
          type = typeof value;
          property = thisProperty[propertyIndex];
          var constructor2;
          var extendedType = false;
          if (type === "object") {
            if (value) {
              constructor2 = value.constructor;
              if (constructor2 === Object) {
              } else if (constructor2 === Array) {
                type = "array";
              } else {
                extendedType = extendedTypes.get(constructor2);
                if (extendedType && extendedType.toValue) {
                  value = extendedType.toValue(value);
                  type = typeof value;
                  if (value && type === "object" && value.constructor === Array) {
                    type = "array";
                  }
                } else if (value[iteratorSymbol] && !value.then) {
                  type = "array";
                } else {
                  extendedType = false;
                }
              }
            } else {
              type = "undefined";
            }
          }
          if (!property || property.key !== key || property.type !== type && type !== "boolean" && type !== "undefined" && !(type === "string" && property.type !== "number") || extendedType && property.extendedType !== constructor2) {
            var lastPropertyIndex = propertyIndex;
            if (resumeIndex > -2)
              propertyIndex = resumeIndex;
            do {
              property = thisProperty[++propertyIndex];
            } while (property && (property.key !== key || property.type !== type && type !== "boolean" && type !== "undefined" && !(type === "string" && property.type !== "number") || extendedType && property.extendedType !== constructor2));
            if (property) {
              writeToken(PROPERTY_CODE, propertyIndex);
              if (resumeIndex === -2) {
                resumeIndex = lastPropertyIndex - 1;
              }
            } else if (thisProperty.getProperty) {
              property = thisProperty.getProperty(value, key, type, extendedType, writeProperty, writeToken, lastPropertyIndex);
              propertyIndex = property.index;
              if (lastPropertyIndex !== propertyIndex && resumeIndex === -2) {
                resumeIndex = lastPropertyIndex - 1;
              }
            } else {
              if (lastPropertyIndex === thisProperty.length) {
                propertyIndex = lastPropertyIndex;
              } else {
                writeToken(PROPERTY_CODE, propertyIndex = thisProperty.length);
                if (resumeIndex === -2) {
                  resumeIndex = lastPropertyIndex - 1;
                }
              }
              if (propertyIndex < thisProperty.resetTo) {
                debugger;
                throw new Error("overwriting frozen property");
              }
              property = thisProperty[propertyIndex] = writeProperty(key, type, extendedType);
            }
          }
          if (propertyUsed)
            propertyUsed(property, object, serializerId, i);
          var code = property.code;
          if (code > 7) {
            if (code === 8)
              writeAsReferencing(value);
            else
              writeAsNumber(value);
          } else {
            if (code === 6)
              writeAsDefault(value);
            else
              writeAsArray(value);
          }
          propertyIndex++;
          i++;
        }
        property = thisProperty;
        endSequence(i);
      }
      function writeProperty(key, type, extendedType) {
        var property2;
        property2 = [];
        property2.key = key;
        property2.type = type;
        if (type === "string") {
          writeToken(TYPE_CODE, REFERENCING_TYPE);
          property2.values = [];
          property2.code = REFERENCING_TYPE;
        } else if (type === "number") {
          writeToken(TYPE_CODE, NUMBER_TYPE);
          property2.code = NUMBER_TYPE;
        } else if (type === "object") {
          writeToken(TYPE_CODE, DEFAULT_TYPE);
          property2.code = DEFAULT_TYPE;
        } else if (type === "array") {
          writeToken(TYPE_CODE, ARRAY_TYPE);
          property2.code = ARRAY_TYPE;
        } else if (type === "boolean" || type === "undefined") {
          property2.type = "object";
          writeToken(TYPE_CODE, DEFAULT_TYPE);
          property2.code = DEFAULT_TYPE;
        } else {
          writeToken(TYPE_CODE, DEFAULT_TYPE);
          property2.code = 10;
          console.error("Unable to write value of type " + type);
        }
        if (typeof key === "string") {
          writeInlineString(key);
        } else if (!(key === null && (type === "object" || type === "array"))) {
          writeAsDefault(key);
        }
        if (extendedType) {
          property2.extendedType = extendedType;
          writeToken(TYPE_CODE, METADATA_TYPE);
          writeInlineString(extendedType.name);
        }
        return property2;
      }
      function writeAsIterable(iterable, isRoot, iterator) {
        try {
          if (!iterator) {
            writeToken(SEQUENCE_CODE, OPEN_SEQUENCE);
            iterator = iterable[iteratorSymbol]();
          }
          var arrayProperty = property;
          property = arrayProperty.child || (arrayProperty.child = arrayProperty);
          var result;
          while (!(result = iterator.next()).done) {
            writers[property.code](result.value, arrayProperty);
            if (isRoot && charEncoder.hasWritten) {
              charEncoder.hasWritten = false;
              property = arrayProperty;
              pendingEncodings.unshift({
                then: function(callback) {
                  writeAsIterable(null, true, iterator);
                  return callback();
                }
              });
              return;
            }
          }
        } catch (error) {
          writeToken(TYPE_CODE, METADATA_TYPE);
          writeToken(NUMBER_CODE, ERROR_METADATA);
          writeAsDefault(Object.assign(new (typeof error == "object" && error ? error.constructor : Error)(), {
            name: error && error.name,
            // make these enumerable so they will serialize
            message: error && error.message || error
          }));
          throw error;
        }
        if (property !== arrayProperty.child) {
          arrayProperty.child = property;
        }
        property = arrayProperty;
        writeToken(SEQUENCE_CODE, END_SEQUENCE);
      }
      function writeAsArray(array) {
        if (!array) {
          writeTypedValue(array);
        } else if (array[targetSymbol]) {
          return writeBlockReference(array);
        } else if (array.constructor === Array) {
          var length = array.length;
          var needsClosing;
          if (length > 11) {
            writeToken(SEQUENCE_CODE, OPEN_SEQUENCE);
            needsClosing = true;
          } else {
            writeToken(SEQUENCE_CODE, length);
          }
          var arrayProperty = property;
          property = arrayProperty[0];
          if (arrayProperty.resetTo < arrayProperty.length && arrayProperty.serializer != serializerId) {
            arrayProperty.length = arrayProperty.resetTo;
            arrayProperty.serializer = serializerId;
          }
          var propertyIndex = 0;
          for (var i = 0; i < length; i++) {
            var value = array[i];
            var type = typeof value;
            if (type === "object") {
              if (value) {
                var constructor2 = value.constructor;
                if (constructor2 === Object) {
                } else if (constructor2 === Array) {
                  type = "array";
                } else {
                  var extendedType = extendedTypes.get(constructor2);
                  if (extendedType && extendedType.toValue) {
                    value = extendedType.toValue(value);
                    type = typeof value;
                    if (value && type === "object" && value.constructor === Array) {
                      type = "array";
                    }
                  } else {
                    extendedType = false;
                  }
                }
              } else {
                type = "undefined";
              }
            }
            if (!property) {
              if (arrayProperty.getProperty) {
                property = arrayProperty.getProperty(value, null, type, extendedType, writeProperty, writeToken, 0);
              } else {
                if (type === "string" || type === "number" || type === "array")
                  property = writeProperty(null, type, extendedType);
                else {
                  property = [];
                  property.type = type;
                  property.key = null;
                  property.code = DEFAULT_TYPE;
                }
                arrayProperty[0] = property;
              }
            } else if (property.type !== type && type !== "boolean" && type !== "undefined" && !(type === "string" && property.type !== "number") || extendedType && property.extendedType !== constructor2) {
              propertyIndex = -1;
              do {
                property = arrayProperty[++propertyIndex];
              } while (property && (property.type !== type && type !== "boolean" && type !== "undefined" && !(type === "string" && property.type !== "number") || extendedType && property.extendedType !== constructor2));
              if (property) {
                writeToken(PROPERTY_CODE, propertyIndex);
              } else if (arrayProperty.getProperty) {
                property = arrayProperty.getProperty(value, null, type, extendedType, writeProperty, writeToken, -1);
              } else {
                writeToken(PROPERTY_CODE, propertyIndex);
                property = writeProperty(null, type, extendedType);
                arrayProperty[propertyIndex] = property;
              }
            }
            if (propertyUsed)
              propertyUsed(property, array, serializerId, i);
            var code = property.code;
            if (code > 7) {
              if (code === 8)
                writeAsReferencing(value);
              else
                writeAsNumber(value);
            } else {
              if (code === 6)
                writeAsDefault(value);
              else
                writeAsArray(value);
            }
          }
          if (needsClosing) {
            writeToken(SEQUENCE_CODE, END_SEQUENCE);
          }
          property = arrayProperty;
        } else if (typeof array == "object" && array[iteratorSymbol]) {
          return writeAsIterable(array);
        } else if (type === "string") {
          return writeInlineString(value);
        } else if (type === "number" && (value >>> 0 === value || value > 0 && value < 70368744177664 && value % 1 === 0)) {
          return writeToken(NUMBER_CODE, value);
        } else {
          writeTypedValue(array);
        }
      }
      var blockProperty;
      function writeBlockReference(block, writer) {
        writeToken(SEQUENCE_CODE, DEFERRED_REFERENCE);
        var blockProperty2 = property;
        var lazyPromise = block[targetSymbol] ? {
          then
        } : {
          then: function(callback) {
            return block.then(function(value) {
              block = value;
              then(callback);
            }, function(error) {
              block = Object.assign(new (typeof error == "object" && error ? error.constructor : Error)(), {
                name: error && error.name,
                // make these enumerable so they will serialize
                message: error && error.message || error
              });
              if (!blockProperty2.upgrade) {
                writeToken(TYPE_CODE, METADATA_TYPE);
                writeToken(NUMBER_CODE, ERROR_METADATA);
              }
              then(callback);
            });
          }
        };
        function then(callback) {
          if (options2.forBlock && block) {
            options2.forBlock(block, blockProperty2);
          } else {
            var buffer = block && block[bufferSymbol] && block[bufferSymbol](blockProperty2);
            if (buffer) {
              writeBuffer(buffer);
            } else {
              property = blockProperty2;
              var lastPendingEncodings = pendingEncodings;
              pendingEncodings = [];
              writeAsDefault(block, true);
              lastPendingEncodings.unshift.apply(lastPendingEncodings, pendingEncodings);
              pendingEncodings = lastPendingEncodings;
            }
          }
          callback();
        }
        pendingEncodings.push(lazyPromise);
      }
      var serializer = {
        serialize: function(value, sharedProperty) {
          var buffer = value && value[bufferSymbol] && value[bufferSymbol](sharedProperty);
          if (buffer) {
            charEncoder.writeBuffer(buffer);
            return;
          }
          if (sharedProperty) {
            property = sharedProperty;
            writers[property.code](value);
          } else {
            property = [];
            property.key = null;
            writeAsDefault(value, true);
          }
        },
        getSerialized: function() {
          if (pendingEncodings.length > 0) {
            var promises = [];
            while (pendingEncodings.length > 0) {
              var finished = false;
              var promise = pendingEncodings.shift().then(function() {
                finished = true;
              });
              if (!finished) {
                promises.push(promise);
              }
            }
            if (promises.length > 0) {
              return Promise.all(promises).then(function() {
                return serializer.getSerialized();
              });
            }
          }
          if (options2 && options2.encoding === "utf16le") {
            return Buffer.from(charEncoder.getSerialized(), "utf16le");
          }
          return charEncoder.getSerialized();
        },
        flush: charEncoder.flush,
        setOffset: charEncoder.setOffset,
        finish: charEncoder.finish,
        pendingEncodings,
        getWriters: function() {
          return {
            writeProperty,
            writeToken,
            writeAsDefault,
            writeBuffer
          };
        }
      };
      return serializer;
    }
    function serialize2(value, options2) {
      var serializer = createSerializer(options2);
      var sharedProperty = options2 && options2.shared;
      var buffer;
      if (sharedProperty && sharedProperty.startWrite) {
        sharedProperty.startWrite(options2.avoidShareUpdate, value);
      }
      serializer.serialize(value, sharedProperty);
      buffer = serializer.getSerialized();
      if (sharedProperty && sharedProperty.endWrite) {
        sharedProperty.endWrite(options2.avoidShareUpdate, value);
      }
      if (serializer.finish)
        serializer.finish();
      var sizeTable = value && value[exports2.sizeTableSymbol];
      if (sizeTable) {
        buffer.sizeTable = sizeTable;
      }
      if (options2 && options2.lazy) {
        return Buffer.concat([value[exports2.sizeTableSymbol], buffer]);
      }
      return buffer;
    }
    exports2.serialize = serialize2;
    exports2.createSerializer = createSerializer;
    function browserCharEncoder() {
      var serialized = "";
      function writeToken(type, number) {
        var serializedToken;
        if (number < 16) {
          serializedToken = String.fromCharCode((type << 4 | number) ^ 64);
        } else if (number < 1024) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number >>> 6),
            (number & 63) + 64
          );
        } else if (number < 65536) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number >>> 12),
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else if (number < 4194304) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number >>> 18),
            number >>> 12 & 63,
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else if (number < 268435456) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number >>> 24),
            number >>> 18 & 63,
            number >>> 12 & 63,
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else if (number < 4294967296) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number >>> 30),
            number >>> 24 & 63,
            number >>> 18 & 63,
            number >>> 12 & 63,
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else if (number < 17179869184) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number / 1073741824 >>> 0),
            number >>> 24 & 63,
            number >>> 18 & 63,
            number >>> 12 & 63,
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else if (number < 1099511627776) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number / 68719476736 >>> 0),
            number / 1073741824 & 63,
            number >>> 24 & 63,
            number >>> 18 & 63,
            number >>> 12 & 63,
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else if (number < 70368744177664) {
          serializedToken = String.fromCharCode(
            (type << 4) + (number / 4398046511104 >>> 0),
            number / 68719476736 & 63,
            number / 1073741824 & 63,
            number >>> 24 & 63,
            number >>> 18 & 63,
            number >>> 12 & 63,
            number >>> 6 & 63,
            (number & 63) + 64
          );
        } else {
          throw new Error("Too big of number");
        }
        serialized += serializedToken;
      }
      function writeString(string) {
        serialized += string;
      }
      function getSerialized() {
        return serialized;
      }
      return {
        writeToken,
        writeString,
        //writeBuffer,
        getSerialized,
        //insertBuffer,
        //flush,
        startSequence: function() {
          writeToken(SEQUENCE_CODE, OPEN_SEQUENCE);
        },
        endSequence: function() {
          writeToken(SEQUENCE_CODE, END_SEQUENCE);
        },
        getOffset: function() {
          return -1;
        }
      };
    }
    var ArrayFrom = Array.from || function(iterable, keyValue) {
      var array = [];
      var keyValue = iterable.constructor === Map;
      iterable.forEach(function(key, value) {
        if (keyValue) {
          array.push([value, key]);
        } else {
          array.push(key);
        }
      });
      return array;
    };
    function writeMap(map) {
      var keyValues = ArrayFrom(map);
      for (var i = 0, length = keyValues.length; i < length; i++) {
        var keyValue = keyValues[i];
        keyValues[i] = {
          key: keyValue[0],
          value: keyValue[1]
        };
      }
      return keyValues;
    }
    function writeSet(set) {
      return ArrayFrom(set);
    }
    function writeDate(date) {
      return date.getTime();
    }
  }
});

// node_modules/dpack/lib/serialize-stream.js
var require_serialize_stream = __commonJS({
  "node_modules/dpack/lib/serialize-stream.js"(exports2) {
    "use strict";
    var { Transform } = __require("stream");
    var { createSerializer } = require_serialize();
    var DPackSerializeStream = class extends Transform {
      constructor(options2) {
        options2 = options2 || {};
        super(options2);
        this.options = options2;
        this.continueWriting = true;
      }
      write(value) {
        const serializer = this.serializer || (this.serializer = createSerializer({ asBlock: true }));
        serializer.serialize(value);
        const buffer = serializer.getSerialized();
        if (buffer.then) {
          buffer.then((buffer2) => this.push(buffer2));
          this.serializer = null;
        } else {
          serializer.flush(this);
        }
      }
      end(value) {
        if (value) {
          this.options.outlet = this;
          const serializer = this.serializer || (this.serializer = createSerializer(this.options));
          serializer.serialize(value);
        }
        if (this.serializer.pendingEncodings.length > 0) {
          this.endWhenDone = true;
          this.writeNext();
        } else {
          this.serializer.flush();
          this.push(null);
        }
      }
      writeBytes(buffer) {
        try {
          this.continueWriting = this.push(buffer);
        } catch (error) {
          throw error;
        }
      }
      _read() {
        this.continueWriting = true;
        if (!this.pausedForPromise && this.serializer && this.endWhenDone && this.serializer.pendingEncodings.length > 0) {
          this.writeNext();
        }
      }
      writeNext() {
        var isSync;
        do {
          var hasMoreToSend = this.serializer.pendingEncodings.length > 0;
          isSync = null;
          if (hasMoreToSend) {
            this.serializer.pendingEncodings.shift().then(() => {
              if (isSync === false) {
                this.pausedForPromise = false;
                if (this.continueWriting || this.serializer.pendingEncodings.length === 0)
                  this.writeNext();
                else {
                  this.serializer.flush();
                }
              } else {
                isSync = true;
              }
            }, (error) => {
              console.error(error);
              this.push(error.toString());
              this.push(null);
            });
            if (!isSync) {
              isSync = false;
              this.pausedForPromise = true;
              this.serializer.flush();
            } else if (!this.continueWriting && this.serializer.pendingEncodings.length > 0) {
              this.serializer.flush();
              return;
            }
          } else if (this.endWhenDone) {
            this.serializer.flush();
            this.push("]");
            this.push(null);
          }
        } while (isSync);
      }
    };
    exports2.createSerializeStream = () => {
      return new DPackSerializeStream();
    };
  }
});

// node_modules/dpack/lib/parse.js
var require_parse = __commonJS({
  "node_modules/dpack/lib/parse.js"(exports2) {
    "use strict";
    var FALSE = 3;
    var TRUE = 4;
    var DEFAULT_TYPE = 6;
    var ARRAY_TYPE = 7;
    var REFERENCING_TYPE = 8;
    var NUMBER_TYPE = 9;
    var METADATA_TYPE = 11;
    var REFERENCING_POSITION = 13;
    var TYPE_DEFINITION = 14;
    var ERROR_METADATA = 500;
    var OPEN_SEQUENCE = 12;
    var END_SEQUENCE = 14;
    var DEFERRED_REFERENCE = 15;
    var MAX_LENGTH = 1024 * 1024 * 16;
    function createParser(options2) {
      if (!options2)
        options2 = {};
      var offset;
      var source;
      var isPartial;
      var classByName = options2.classByName || /* @__PURE__ */ new Map();
      classByName.set("Map", readMap);
      classByName.set("Set", readSet);
      classByName.set("Date", readDate);
      var pausedState;
      var deferredReads;
      function pause(state, lastRead) {
        state.previous = pausedState;
        state.resume = true;
        pausedState = state;
        if (!isPartial)
          throw new Error("Unexpected end of dpack stream");
        if (!parser.onResume)
          parser.onResume = function(nextString, isPartialString, rebuildString) {
            var resumeState = pausedState;
            pausedState = null;
            parser.onResume = null;
            if (lastRead < source.length)
              source = source.slice(lastRead) + nextString;
            else {
              if (rebuildString)
                source = nextString.slice(0, 1) + nextString.slice(1);
              else
                source = nextString;
            }
            isPartial = isPartialString;
            disposedChars += lastRead;
            offset = 0;
            return resumeState.reader ? resumeState.reader(resumeState) : readSequence(resumeState.length, resumeState);
          };
        return state.object;
      }
      function readSequence(length, thisProperty) {
        var propertyState = 0;
        thisProperty = thisProperty || [];
        var property, isArray, object, value, i = 0, propertyIndex = 0;
        if (thisProperty.resume) {
          property = thisProperty.previous;
          if (property) {
            var value = property.reader ? property.reader(property) : readSequence(property.length, property);
            var values = property.values;
            if (values) {
              if (pausedState) {
                pausedState.values = values;
              } else {
                if (value.nextPosition > -1) {
                  values[values.nextPosition++] = value;
                } else {
                  values.push(value);
                }
              }
            }
          }
          if (thisProperty.code && thisProperty.code !== thisProperty.thisProperty.code) {
            thisProperty.resume = false;
          } else {
            i = thisProperty.i || 0;
            object = thisProperty.object;
            propertyState = thisProperty.propertyState || 0;
            propertyIndex = thisProperty.propertyIndex || 0;
            thisProperty = thisProperty.thisProperty;
          }
        }
        isArray = thisProperty.code === ARRAY_TYPE;
        object = object || (thisProperty.constructs ? new thisProperty.constructs() : isArray ? [] : {});
        for (; i < length; ) {
          var type, number;
          var lastRead = offset;
          var token = source.charCodeAt(offset++);
          if (token >= 48) {
            if (token > 12288) {
              type = token >>> 12 ^ 4;
              number = token & 4095;
            } else {
              type = token >>> 4 ^ 4;
              number = token & 15;
            }
          } else {
            type = token >>> 4 & 11;
            number = token & 15;
            token = source.charCodeAt(offset++);
            number = (number << 6) + (token & 63);
            if (!(token >= 64)) {
              token = source.charCodeAt(offset++);
              number = (number << 6) + (token & 63);
              if (!(token >= 64)) {
                token = source.charCodeAt(offset++);
                number = (number << 6) + (token & 63);
                if (!(token >= 64)) {
                  token = source.charCodeAt(offset++);
                  number = (number << 6) + (token & 63);
                  if (!(token >= 64)) {
                    token = source.charCodeAt(offset++);
                    number = number * 64 + (token & 63);
                    if (!(token >= 64)) {
                      token = source.charCodeAt(offset++);
                      number = number * 64 + (token & 63);
                      if (!(token >= 64)) {
                        token = source.charCodeAt(offset++);
                        number = number * 64 + (token & 63);
                        if (!(token >= 0)) {
                          if (offset > source.length) {
                            return pause({
                              length,
                              thisProperty,
                              i,
                              object,
                              propertyIndex,
                              propertyState
                            }, lastRead);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (type === 0) {
            propertyIndex = number;
            propertyState = 0;
            continue;
          }
          property = thisProperty[propertyIndex];
          if (type === 3) {
            if (number < 6) {
              if (number < 3) {
                if (number === 0) {
                  value = null;
                } else {
                  value = "Unknown token, type: " + type + " number: " + number;
                }
              } else {
                if (number === TRUE) {
                  value = true;
                } else if (number === FALSE) {
                  value = false;
                } else {
                  value = void 0;
                }
              }
            } else {
              if (number <= NUMBER_TYPE) {
                if (propertyState === 1) {
                  propertyIndex++;
                  i++;
                  property = thisProperty[propertyIndex];
                }
                if (propertyIndex < thisProperty.resetTo) {
                  throw new Error("Overwriting frozen property");
                }
                if (property) {
                  if (!property.resume) {
                    value = property.key;
                    property = thisProperty[propertyIndex] = [];
                    property.key = value;
                  }
                } else {
                  property = thisProperty[propertyIndex] = [];
                  property.key = null;
                }
                property.code = number;
                property.parent = thisProperty;
                propertyState = 2;
                if (number === REFERENCING_TYPE) {
                  property.values = [];
                } else if (number === ARRAY_TYPE) {
                  property[0] = [];
                  property[0].key = null;
                  property[0].code = DEFAULT_TYPE;
                  property[0].parent = property;
                }
              } else {
                propertyState = number;
              }
              continue;
            }
          } else {
            if (type === 2) {
              value = source.slice(offset, offset += number);
              if (offset > source.length) {
                return pause({
                  length,
                  thisProperty,
                  i,
                  object,
                  propertyIndex,
                  propertyState
                }, lastRead);
              }
              if (propertyState < 2) {
                if (property.code === NUMBER_TYPE) {
                  value = +value;
                }
              }
            } else if (type === 1) {
              value = number;
            } else {
              if (number > 13) {
                if (number === END_SEQUENCE)
                  return object;
                else if (number === DEFERRED_REFERENCE) {
                  value = readSequence(0, property);
                  propertyState = 0;
                  if (options2.forDeferred) {
                    value = options2.forDeferred(value, property);
                  } else {
                    (deferredReads || (deferredReads = [])).push({
                      property,
                      value
                    });
                  }
                }
              } else {
                if (number >= OPEN_SEQUENCE) {
                  number = 2e9;
                }
                if (propertyState > 1) {
                  if (propertyState === 2) {
                    propertyState = 0;
                    value = readSequence(number, property);
                  } else if (propertyState === METADATA_TYPE)
                    value = readSequence(number, [{ key: null, code: 6 }]);
                  else if (property.resume && (property.code || DEFAULT_TYPE) === property.thisProperty.code)
                    value = readSequence(number, property.thisProperty);
                  else
                    value = readSequence(number, property);
                } else
                  value = readSequence(number, property);
                if (pausedState) {
                  if (value === void 0) {
                    pausedState = null;
                    parser.onResume = null;
                    return pause({
                      length,
                      thisProperty,
                      i,
                      object,
                      property,
                      propertyIndex,
                      previousProperty,
                      propertyState
                    }, lastRead);
                  } else {
                    pausedState.values = property.values instanceof Array ? property.values : void 0;
                  }
                }
              }
            }
          }
          if (!property) {
            throw new Error("No property defined for slot" + (thisProperty.key ? " in " + thisProperty.key : ""));
          }
          if (propertyState < 2 && property && property.code === REFERENCING_TYPE) {
            var values = property.values;
            if (typeof value === "number") {
              value = values[number];
              if (value === void 0 && !(number in values)) {
                throw new Error("Referencing value that has not been read yet");
              }
            } else if ((type === 2 || type === 7) && values) {
              if (values.nextPosition > -1) {
                if (property.recordValueReference) {
                  property.recordValueReference(values);
                }
                values[values.nextPosition++] = value;
              } else {
                values.push(value);
              }
            }
          }
          if (propertyState > 1) {
            if (propertyState === 2) {
              property.key = value;
            } else if (propertyState === METADATA_TYPE) {
              if (typeof value === "string") {
                var extendedType = classByName.get(value);
                if (extendedType) {
                  if (extendedType.fromValue) {
                    property.fromValue = extendedType.fromValue;
                  } else {
                    property.constructs = extendedType;
                  }
                } else if (options2.errorOnUnknownClass) {
                  throw new Error("Attempt to deserialize to unknown class " + parameter);
                } else {
                }
                property.extendedType = extendedType;
              } else {
                property.metadata = value;
                if (value === ERROR_METADATA)
                  property.fromValue = onError;
              }
            } else if (propertyState === REFERENCING_POSITION) {
              var values = property.values || (property.values = []);
              values.nextPosition = value;
            } else if (propertyState === TYPE_DEFINITION) {
            } else {
              throw new Error("Unknown property type " + propertyState);
            }
            propertyState = 1;
            continue;
          } else {
            propertyState = 0;
          }
          if (property.fromValue) {
            value = property.fromValue(value);
          }
          if (isArray && property.key === null) {
            object.push(value);
          } else if (value !== void 0) {
            object[property.key] = value;
          }
          i++;
          if (!isArray)
            propertyIndex++;
        }
        return object;
      }
      function unknownType2(number) {
        throw new Error("Unknown type " + number);
      }
      var nonParsingError;
      function onError(error) {
        var g = typeof global != "undefined" ? global : window;
        if (error && error.name && g[error.name])
          error = new g[error.name](error.message);
        else if (typeof error == "string")
          error = new Error(error);
        if (options2.onError)
          options2.onError(error);
        else {
          nonParsingError = true;
          throw error;
        }
      }
      var disposedChars = 0;
      function read(property) {
        try {
          if (property && property.resume) {
            var previous = property.previous;
            value = readSequence(previous.length, previous);
            value = property.object || value;
            property = property.property;
          } else {
            property = property || [options2 && options2.shared || {
              key: null,
              code: 6
            }];
            var value = readSequence(1, property)[property[0].key];
          }
          while (true) {
            if (pausedState) {
              return pause({
                reader: read,
                object: value,
                property
              });
            }
            if (!deferredReads) {
              return value;
            }
            var index = deferredReads.index || 0;
            var deferredRead = deferredReads[index];
            deferredReads.index = index + 1;
            if (!deferredRead) {
              deferredReads = deferredReads.parent;
              continue;
            }
            var target = deferredRead.value;
            var parentDeferredReads = deferredReads;
            deferredReads = [];
            deferredReads.parent = parentDeferredReads;
            var targetProperty = deferredRead.property;
            var result = readSequence(1, property = [{
              resume: true,
              key: null,
              thisProperty: targetProperty,
              object: target
            }]);
            result = result.null || result[targetProperty.key];
            if (result != target) {
              Object.assign(target, result);
              if (pausedState && pausedState.object === result) {
                pausedState.object = target;
              }
              if (result && result.constructor === Array) {
                target.length = result.length;
                Object.setPrototypeOf(target, Object.getPrototypeOf(result));
              }
            }
          }
        } catch (error) {
          if (!nonParsingError)
            error.message = "DPack parsing error: " + error.message + " at position: " + (offset + disposedChars) + " near: " + source.slice(offset - 10, offset + 10);
          throw error;
        }
      }
      var parser = {
        setSource: function(string, startOffset, isPartialString) {
          source = string;
          offset = startOffset || 0;
          disposedChars = 0;
          isPartial = isPartialString;
          return this;
        },
        hasMoreData: function() {
          return source.length > offset;
        },
        isPaused: function() {
          return pausedState;
        },
        hasUnfulfilledReferences: function() {
          return deferredReads && deferredReads.length > deferredReads.index;
        },
        getOffset: function() {
          return offset + disposedChars;
        },
        read
      };
      return parser;
    }
    exports2.parse = function(stringOrBuffer, options2) {
      var source;
      if (typeof stringOrBuffer === "string") {
        source = stringOrBuffer;
      } else if (stringOrBuffer && stringOrBuffer.toString) {
        source = stringOrBuffer.toString(options2 && options2.encoding || "utf8");
      } else {
        return stringOrBuffer;
      }
      var parser = createParser(options2).setSource(source);
      if (options2 && options2.shared)
        return parser.read([options2.shared]);
      return parser.read();
    };
    exports2.createParser = createParser;
    var readMap = {
      fromValue: function(entries) {
        var map = /* @__PURE__ */ new Map();
        for (var i = 0, l = entries.length; i < l; i++) {
          var entry = entries[i];
          map.set(entry.key, entry.value);
        }
        return map;
      }
    };
    var readSet = {
      fromValue: function(values) {
        var set = new Set(values);
        if (set.size === 0 && values.length > 0) {
          for (var i = 0, l = values.length; i < l; i++) {
            set.add(values[i]);
          }
        }
        return set;
      }
    };
    var readDate = {
      fromValue: function(time) {
        return new Date(time);
      }
    };
  }
});

// node_modules/dpack/lib/parse-stream.js
var require_parse_stream = __commonJS({
  "node_modules/dpack/lib/parse-stream.js"(exports2) {
    "use strict";
    var Transform = __require("stream").Transform;
    var createParser = require_parse().createParser;
    var DEFAULT_OPTIONS = { objectMode: true };
    var DPackParseStream = class extends Transform {
      constructor(options2) {
        if (options2) {
          options2.objectMode = true;
        } else {
          options2 = DEFAULT_OPTIONS;
        }
        super(options2);
        this.parser = createParser(options2);
        this.waitingValues = [];
      }
      _transform(chunk, encoding, callback) {
        var value;
        try {
          var sourceString = chunk.toString();
          var parser = this.parser;
          if (parser.onResume) {
            value = parser.onResume(sourceString, true);
            if (!parser.isPaused())
              this.sendValue(value);
          } else {
            parser.setSource(sourceString, 0, true);
          }
          while (parser.hasMoreData()) {
            value = parser.read();
            if (parser.isPaused())
              break;
            else
              this.sendValue(value);
          }
        } catch (error) {
          console.error(error);
        }
        if (callback) callback();
      }
      sendValue(value) {
        if (this.parser.hasUnfulfilledReferences()) {
          if (value !== void 0) {
            this.waitingValues.push(value);
          }
        } else {
          while (this.waitingValues.length > 0) {
            this.push(this.waitingValues.shift());
          }
          if (value !== void 0) {
            this.push(value);
          }
        }
      }
    };
    exports2.createParseStream = () => new DPackParseStream();
  }
});

// node_modules/dpack/lib/node-encoder.js
var require_node_encoder = __commonJS({
  "node_modules/dpack/lib/node-encoder.js"(exports2) {
    var PREFERRED_MAX_BUFFER_SIZE = 32768;
    var availableBuffers = [];
    function nodeCharEncoder(options2) {
      var offset = options2.startOffset || 0;
      var bufferSize;
      var outlet = options2.outlet;
      var buffer = availableBuffers.pop();
      if (buffer && buffer.length > offset + 128) {
        bufferSize = buffer.length;
      } else {
        bufferSize = (offset >> 12 << 12) + 8192;
        buffer = Buffer.allocUnsafeSlow(bufferSize);
      }
      var encoding = options2.encoding;
      var sequences = [];
      function makeRoom(bytesNeeded) {
        if (outlet) {
          outlet.writeBytes(buffer.slice(0, offset));
          if (bufferSize < PREFERRED_MAX_BUFFER_SIZE || bytesNeeded > PREFERRED_MAX_BUFFER_SIZE) {
            bufferSize = Math.max(bufferSize * 4, bytesNeeded);
          }
          buffer = Buffer.allocUnsafeSlow(bufferSize);
          offset = 0;
          sequences = [];
          encoder.hasWritten = true;
        } else {
          bufferSize = Math.max(bufferSize * 4, bufferSize + bytesNeeded, 8192);
          var oldBuffer = buffer;
          buffer = Buffer.allocUnsafeSlow(bufferSize);
          oldBuffer.copy(buffer, 0, 0, offset);
        }
      }
      function flush(specifiedOutlet) {
        (specifiedOutlet || outlet).writeBytes(buffer.slice(0, offset));
        if (offset + 128 > buffer.length)
          buffer = Buffer.allocUnsafeSlow(bufferSize = Math.min(Math.max((offset >> 10 << 10) + 8192, bufferSize), 32768));
        else {
          buffer = buffer.slice(offset);
          bufferSize = buffer.length;
        }
        offset = 0;
        sequences = [];
      }
      function writeToken(type, number) {
        if (number < 16) {
          buffer[offset++] = (type << 4) + number ^ 64;
        } else if (number < 1024) {
          buffer[offset++] = (type << 4) + (number >>> 6);
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 65536) {
          buffer[offset++] = (type << 4) + (number >>> 12);
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 4194304) {
          buffer[offset++] = (type << 4) + (number >>> 18);
          buffer[offset++] = number >>> 12 & 63;
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 268435456) {
          buffer[offset++] = (type << 4) + (number >>> 24);
          buffer[offset++] = number >>> 18 & 63;
          buffer[offset++] = number >>> 12 & 63;
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 4294967296) {
          buffer[offset++] = (type << 4) + (number >>> 30);
          buffer[offset++] = number >>> 24 & 63;
          buffer[offset++] = number >>> 18 & 63;
          buffer[offset++] = number >>> 12 & 63;
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 17179869184) {
          buffer[offset++] = (type << 4) + (number / 1073741824 >>> 0);
          buffer[offset++] = number >>> 24 & 63;
          buffer[offset++] = number >>> 18 & 63;
          buffer[offset++] = number >>> 12 & 63;
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 1099511627776) {
          buffer[offset++] = (type << 4) + (number / 68719476736 >>> 0);
          buffer[offset++] = number / 1073741824 & 63;
          buffer[offset++] = number >>> 24 & 63;
          buffer[offset++] = number >>> 18 & 63;
          buffer[offset++] = number >>> 12 & 63;
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else if (number < 70368744177664) {
          buffer[offset++] = (type << 4) + (number / 4398046511104 >>> 0);
          buffer[offset++] = number / 68719476736 & 63;
          buffer[offset++] = number / 1073741824 & 63;
          buffer[offset++] = number >>> 24 & 63;
          buffer[offset++] = number >>> 18 & 63;
          buffer[offset++] = number >>> 12 & 63;
          buffer[offset++] = number >>> 6 & 63;
          buffer[offset++] = (number & 63) + 64;
        } else {
          throw new Error("Invalid number " + number);
        }
        if (offset > bufferSize - 10) {
          makeRoom(0);
        }
      }
      function writeBuffer(source) {
        var sourceLength = source.length;
        if (sourceLength + offset + 10 > bufferSize) {
          makeRoom(sourceLength + 10);
        }
        source.copy(buffer, offset);
        offset += sourceLength;
      }
      function writeString(string) {
        var length = string.length;
        var maxStringLength = length * 3 + 10;
        if (offset + maxStringLength > bufferSize) {
          makeRoom(maxStringLength + 10);
        }
        var bytesWritten = encoding ? buffer.write(string, offset, buffer.length, encoding) : buffer.utf8Write(string, offset, buffer.length);
        offset += bytesWritten;
      }
      function getSerialized() {
        return buffer.slice(0, offset);
      }
      function insertBuffer(headerBuffer, position) {
        var headerLength = headerBuffer.length;
        if (offset + headerLength + 10 > bufferSize) {
          makeRoom(headerLength + 10);
        }
        buffer.copy(buffer, headerLength + position, position, offset);
        headerBuffer.copy(buffer, position);
        offset += headerLength;
      }
      var encoder = {
        writeToken,
        writeString,
        writeBuffer,
        getSerialized,
        insertBuffer,
        flush,
        startSequence() {
          var currentOffset = offset;
          buffer[offset++] = 60;
          sequences.push(currentOffset);
          if (offset > bufferSize - 10) {
            makeRoom(0);
          }
        },
        endSequence(length) {
          var startOffset = sequences.pop();
          if (length < 12 && startOffset > -1) {
            buffer[startOffset] = 48 + length;
            return;
          }
          buffer[offset++] = 62;
        },
        finish() {
          if (buffer.length - offset > 144)
            availableBuffers.push(buffer.slice(offset));
        },
        getOffset() {
          return offset;
        },
        setOffset(newOffset) {
          offset = newOffset;
        }
      };
      if (false) {
        global.typeCount = [];
        encoder.writeToken = function(type, number) {
          typeCount[type] = (typeCount[type] || 0) + 1;
          writeToken(type, number);
        };
        global.stringCount = /* @__PURE__ */ new Map();
        encoder.writeString = function(string) {
          stringCount.set(string, (stringCount.get(string) || 0) + 1);
          writeString(string);
        };
        setTimeout(function() {
          var stringDuplicationCount = 0;
          console.log("stringCount", Array.from(stringCount).filter(([string, count3]) => {
            if (count3 > 1 & string.length > 3) {
              stringDuplicationCount += (count3 - 1) * string.length;
              return true;
            }
          }));
          console.log("stringDuplicationCount", stringDuplicationCount);
          console.log("typeCount", typeCount);
        });
      }
      return encoder;
    }
    exports2.nodeCharEncoder = nodeCharEncoder;
  }
});

// node_modules/dpack/lib/Options.js
var require_Options = __commonJS({
  "node_modules/dpack/lib/Options.js"(exports2) {
    "use strict";
    function Options() {
      var classByName = this.classByName = /* @__PURE__ */ new Map();
      this.converterByConstructor = /* @__PURE__ */ new Map();
    }
    Options.prototype.addExtension = function(Class, name, options2) {
      if (name && Class.name !== name) {
        Class.name = name;
      }
      this.classByName.set(Class.name, options2 && options2.fromArray ? options2 : Class);
      this.converterByConstructor.set(Class, options2 && options2.toArray ? options2 : Class);
    };
    exports2.Options = Options;
  }
});

// node_modules/dpack/lib/shared.js
var require_shared = __commonJS({
  "node_modules/dpack/lib/shared.js"(exports2) {
    var createSerializer = require_serialize().createSerializer;
    var serialize2 = require_serialize().serialize;
    var createParser = require_parse().createParser;
    var Options = require_Options().Options;
    var PROPERTY_CODE = 0;
    var TYPE_CODE = 3;
    var SEQUENCE_CODE = 7;
    var DEFAULT_TYPE = 6;
    var ARRAY_TYPE = 7;
    var REFERENCING_TYPE = 8;
    var NUMBER_TYPE = 9;
    var TYPE_DEFINITION = 14;
    var UNSTRUCTURED_MARKER = 11;
    var OPEN_SEQUENCE = 12;
    var END_SEQUENCE = 14;
    exports2.createSharedStructure = createSharedStructure;
    exports2.readSharedStructure = readSharedStructure;
    function readSharedStructure(from) {
      var parser = createParser();
      var sharedProperty = [];
      sharedProperty.code = 6;
      sharedProperty.key = null;
      parser.setSource(from + "p").read([sharedProperty]);
      setupShared(sharedProperty);
      sharedProperty.serialized = from;
      return sharedProperty;
    }
    function setupShared(property) {
      property.resetTo = property.length;
      property.upgrade = upgrade;
      property.type = types[property.code];
      property.isFrozen = true;
      Object.defineProperty(property, "serialized", {
        get() {
          return this._serialized || (this._serialized = serializeSharedStructure(this));
        }
      });
      if (typeof property.values === "object" && property.values) {
        property.values.resetTo = property.values.length;
        property.lastIndex = property.values.length;
      }
      for (var i = 0, l = property.length; i < l; i++) {
        property[i].index = i;
        property[i].resumeIndex = i;
        setupShared(property[i]);
      }
    }
    function upgrade(property) {
      if (!property) {
        return 1;
      }
      var compatibility;
      if (property) {
        if (property.insertedFrom === this && property.insertedVersion === this.version && (property.recordUpdate || property.isFrozen || property.length == 0 && property.code == this.code && property.values == null)) {
          return 0;
        }
        var changedCode;
        if (this.code !== property.code)
          changedCode = true;
        if (property.upgrade) {
          var compatibility = copyProperty(this, property);
          if (changedCode)
            compatibility = 2;
          if (property.isFrozen && compatibility > 0) {
            return 2;
          }
          property.insertedFrom = this;
          property.insertedVersion = this.version;
          if (compatibility === 2) {
            debugger;
            console.error("Inserting incompatible block into property");
            return 2;
          } else
            return 0;
        } else {
          property.insertedFrom = this;
          property.insertedVersion = this.version;
          property.length = 0;
          property.values = null;
          if (property.fromValue)
            property.fromValue = null;
          return 1;
        }
      } else {
        if (this.length > 0) {
          blockBuffer = Buffer.concat([this.serialized, blockBuffer]);
        }
      }
      return 1;
    }
    var typeToCode = {
      string: REFERENCING_TYPE,
      number: NUMBER_TYPE,
      object: DEFAULT_TYPE,
      boolean: DEFAULT_TYPE,
      undefined: DEFAULT_TYPE,
      array: ARRAY_TYPE
    };
    var lastPropertyOnObject = /* @__PURE__ */ new WeakMap();
    function createSharedStructure(from, options2) {
      var instanceProperty = [];
      instanceProperty.key = null;
      instanceProperty.code = 6;
      instanceProperty.type = "object";
      let activeList = [];
      let needsCleanup = [];
      activeList.iteration = 0;
      var previousAvoidShareUpdate;
      class Shared extends Array {
        constructor(instanceProperty2) {
          super();
          let hasUpdates;
          this.key = typeof instanceProperty2.key == "string" ? isolateString(instanceProperty2.key) : instanceProperty2.key;
          this.type = instanceProperty2.type;
          this.code = instanceProperty2.code;
          this.count = 0;
          this.comesAfter = [];
          if (this.code == REFERENCING_TYPE) {
            this.values = [];
            this.values.resetTo = 512;
            this.values.nextPosition = 512;
            this.previousValues = /* @__PURE__ */ new Map();
            this.lastIndex = 0;
            this.repetitions = 0;
          }
        }
        newProperty(instance) {
          return new Shared(instance);
        }
        getProperty(value, key, type, extendedType, writeProperty, writeToken, lastPropertyIndex) {
          let property;
          if (this.insertedFrom) {
            propertySearch(this.insertedFrom);
            if (property) {
              if (lastPropertyIndex !== property.index) {
                writeToken(PROPERTY_CODE, propertyIndex);
              }
              return property;
            }
            if (this.insertedFrom.getProperty) {
              return this.insertedFrom.getProperty(value, key, type, extendedType, writeProperty, writeToken, lastPropertyIndex);
            } else {
              debugger;
            }
          }
          this.recordUpdate();
          let propertyIndex = this.length;
          if (lastPropertyIndex !== propertyIndex) {
            writeToken(PROPERTY_CODE, propertyIndex);
          }
          if (type === "boolean" || type === "undefined") {
            type = "object";
          }
          property = this[propertyIndex] = new Shared({
            key,
            type,
            code: typeToCode[type]
          });
          property.parent = this;
          property.index = propertyIndex;
          return property;
          function propertySearch(parentProperty) {
            let propertyIndex2 = -1;
            do {
              property = parentProperty[++propertyIndex2];
            } while (property && (property.key !== key || property.type !== type && type !== "boolean" && type !== "undefined" || extendedType && property.extendedType !== constructor));
          }
        }
        writeSharedValue(value, writeToken, serializerId) {
          let valueEntry = this.previousValues.get(value);
          if (valueEntry) {
            if (valueEntry.serializer == serializerId) {
              this.repetitions++;
            } else {
              valueEntry.serializations++;
              valueEntry.serializer = serializerId;
            }
          } else {
            this.previousValues.set(value, valueEntry = {
              serializations: 1,
              serializer: serializerId
            });
          }
          if (!this.active) {
            this.active = 2;
            activeList.push(this);
          }
          return false;
        }
        propertyUsed(property, object, serializerId, i) {
          if (property.lastSerializer !== serializerId) {
            property.lastSerializer = serializerId;
            property.count++;
          }
          if (i !== 0) {
            let lastProperty = lastPropertyOnObject.get(object);
            if (lastProperty && property.comesAfter.indexOf(lastProperty) === -1)
              property.comesAfter.push(lastProperty);
          }
          lastPropertyOnObject.set(object, property);
        }
        recordUpdate() {
          var property = this;
          do {
            property.version = (property.version || 0) + 1;
            if (property.insertedFrom) {
              property.insertedFrom = null;
            }
            if (property._serialized)
              property._serialized = null;
          } while (property = property.parent);
        }
        readingBlock(parse3) {
          try {
            return parse3();
          } finally {
            this.readReset();
            if (this.length > 500) {
              debugger;
            }
          }
        }
        //active:
        // 0 - not-actively being monitored
        // 1 - being monitored, but an iteration hasn't started for this
        // 2 - being monitored, and an iteration has started
        startWrite(avoidShareUpdate, value) {
          activeList.iteration++;
          if (value && value.constructor === Array) {
            if (this.code !== ARRAY_TYPE && this.version > 0) {
              throw new Error("Can not change the root type of a shared object to an array");
            }
            if (this.code != ARRAY_TYPE)
              this.recordUpdate();
            this.code = ARRAY_TYPE;
            this.type = "array";
          }
          if (this.writing)
            return;
          else
            this.writing = true;
          return;
          previousAvoidShareUpdate = currentAvoidShareUpdate;
          if (avoidShareUpdate)
            currentAvoidShareUpdate = true;
        }
        endWrite() {
          if (this.writing)
            this.writing = false;
          else
            return;
          let iterations = this.iterations = (this.iterations || 0) + 1;
          for (let i = 0; i < activeList.length; i++) {
            let activeSharedProperty = activeList[i];
            let previousValues = activeSharedProperty.previousValues;
            if (previousValues && previousValues.size && !activeSharedProperty.isFrozen) {
              if (!currentAvoidShareUpdate) {
                if (activeSharedProperty.values.length == 0 && iterations > ((activeSharedProperty.repetitions || 0) + 10) * 5) {
                  console.log("changing referenceable to default", activeSharedProperty.key);
                  activeSharedProperty.previousValues = null;
                  activeSharedProperty.code = DEFAULT_TYPE;
                  activeSharedProperty.type = "object";
                  activeSharedProperty.recordUpdate();
                  activeList.splice(i--, 1);
                  previousValues = [];
                }
                for (let [value, entry] of previousValues) {
                  let values = activeSharedProperty.values;
                  if ((entry.serializations + 3) * 8 < iterations - (entry.startingIteration || (entry.startingIteration = iterations)) || values.length > 500) {
                    previousValues.delete(value);
                  }
                  if (entry.serializations > 50 && entry.serializations * 3 > iterations) {
                    values[activeSharedProperty.lastIndex++] = value;
                    activeSharedProperty.recordUpdate();
                    console.log("adding value", value, "to", activeSharedProperty.key);
                    previousValues.delete(value);
                  }
                }
              }
            } else {
              activeSharedProperty.active = 0;
              activeList.splice(i--, 1);
            }
          }
          if (activeList.hasUpdates) {
            activeList.hasUpdates = false;
            this.version++;
            if (!this._serialized)
              this._serialized = null;
            if (options2 && options2.onUpdate)
              options2.onUpdate();
          }
          currentAvoidShareUpdate = previousAvoidShareUpdate;
        }
        upgrade(property) {
          return upgrade.call(this, property);
        }
        get serialized() {
          return this._serialized || (this._serialized = serializeSharedStructure(this));
        }
        serializeCommonStructure(embedded) {
          var usageThreshold = Math.sqrt(activeList.iteration);
          return serializeSharedStructure(this, (childProperty) => childProperty.count >= usageThreshold, embedded);
        }
      }
      var sharedStructure = new Shared(instanceProperty);
      sharedStructure.version = 0;
      sharedStructure.freeze = function() {
        this.isFrozen = true;
        this.reset();
      };
      if (from) {
        var parser = createParser({
          forDeferred(block, property) {
            property.isBlock = true;
            return block;
          },
          parseDeferreds: true
        });
        var readProperty = [];
        readProperty.code = 6;
        readProperty.key = null;
        parser.setSource(from + "p").read([readProperty]);
        copyProperty(readProperty, sharedStructure);
        activeList.hasUpdates = false;
        sharedStructure.version = 1;
      }
      sharedStructure.key = null;
      return sharedStructure;
    }
    var types = {
      6: "object",
      7: "array",
      8: "string",
      9: "number"
    };
    var currentAvoidShareUpdate;
    function serializeSharedStructure(property, condition, embedded) {
      var serializer = createSerializer();
      var writers = serializer.getWriters();
      serializeSharedProperty(property, !embedded, !embedded);
      function serializeSharedProperty(property2, expectsObjectWithNullKey, isRoot) {
        if (property2.insertedFrom && property2.insertedFrom.serializeCommonStructure) {
          property2 = property2.insertedFrom;
          return writers.writeBuffer(property2.serializeCommonStructure(!isRoot));
        }
        var isArray = property2.code === ARRAY_TYPE;
        var commonProperties = condition ? orderProperties(property2.filter(condition)) : property2;
        var length = commonProperties.length;
        if (!(expectsObjectWithNullKey && property2.code === DEFAULT_TYPE)) {
          let key = isRoot ? null : property2.key;
          writers.writeProperty(key, types[property2.code]);
          if (length === 0 && key === null && (property2.code === DEFAULT_TYPE || property2.code === ARRAY_TYPE)) {
            writers.writeToken(SEQUENCE_CODE, 0);
          }
        }
        if (isRoot && length > 0) {
          writers.writeToken(TYPE_CODE, TYPE_DEFINITION);
        }
        if (length > 0) {
          writers.writeToken(SEQUENCE_CODE, OPEN_SEQUENCE);
          for (var i = 0; i < length; i++) {
            var childProperty = commonProperties[i];
            childProperty.index = i;
            if (isArray && i > 0) {
              writers.writeToken(PROPERTY_CODE, i);
            }
            serializeSharedProperty(childProperty, commonProperties.code === ARRAY_TYPE && i === 0, false, condition);
          }
          writers.writeToken(SEQUENCE_CODE, END_SEQUENCE);
        }
        var first = true;
        if (property2.lastIndex > 0) {
          for (var i = 0, l = property2.lastIndex; i < l; i++) {
            var value = property2.values[i];
            if (first)
              first = false;
            else
              writers.writeToken(PROPERTY_CODE, property2.index);
            writers.writeAsDefault(value);
          }
        }
      }
      let serialized = serializer.getSerialized();
      return serialized;
    }
    function copyProperty(source, target, freezeTarget, startingIndex) {
      var compatibility = 0;
      target.code = source.code;
      target.type = source.type || types[source.code];
      if (freezeTarget) {
        target.isFrozen = true;
        if (target.previousValues)
          target.previousValues = null;
      }
      let sourceLength = source.resetTo > -1 ? source.resetTo : source.length;
      if (target.resetTo > -1 && target.resetTo < target.length)
        target.length = target.resetTo;
      for (var i = startingIndex || 0; i < sourceLength; i++) {
        var targetChild = target[i];
        var childProperty = source[i];
        if (targetChild && (targetChild.key != childProperty.key || targetChild.extendedType != childProperty.extendedType || targetChild.code != childProperty.code && !(targetChild.code == 8 && childProperty.code === 6 && (!targetChild.values || !targetChild.values.length)))) {
          if (target.isFrozen)
            return 2;
          compatibility = 2;
        }
        if (!targetChild) {
          if (target.isFrozen)
            return 2;
          var targetChild = [];
          targetChild.code = childProperty.code;
          if (target.newProperty) {
            targetChild = target.newProperty(targetChild);
          }
          target[i] = targetChild;
          if (childProperty.metadata)
            targetChild.metadata = childProperty.metadata;
          if (childProperty.insertedFrom) {
            targetChild.insertedFrom = childProperty.insertedFrom;
            targetChild.insertedVersion = childProperty.insertedVersion;
          }
          targetChild.parent = target;
        }
        targetChild.key = childProperty.key;
        if (childProperty.values && childProperty.values.length > 0) {
          if (childProperty.values.resetTo > -1) {
            childProperty.values.length = childProperty.values.resetTo;
          }
          if (!targetChild.values || childProperty.values.length > (targetChild.values.resetTo > -1 ? targetChild.values.resetTo : targetChild.values.length)) {
            targetChild.values = childProperty.values.slice(0);
            targetChild.values.nextPosition = childProperty.values.length;
            if (targetChild.values.length >= 12) {
              targetChild.previousValues = null;
            }
            if (compatibility == 0) {
              compatibility = 1;
            }
          }
        }
        var childCompatibility = copyProperty(childProperty, targetChild, freezeTarget);
        if (childCompatibility > compatibility)
          compatibility = childCompatibility;
      }
      let targetLength = target.resetTo > -1 ? target.resetTo : target.length;
      if (targetLength > sourceLength) {
        if (target.recordUpdate) {
          source.metadata = UNSTRUCTURED_MARKER;
          source.recordUpdate();
        } else if (target.isFrozen) {
          return 2;
        }
      }
      return compatibility;
    }
    function isolateString(string) {
      return string.slice(0, 1) + string.slice(1);
    }
    function orderProperties(properties) {
      var ordered = [];
      var traversed = /* @__PURE__ */ new Set();
      function addProperty(property) {
        if (traversed.has(property))
          return;
        traversed.add(property);
        for (var propertyBefore of property.comesAfter) {
          addProperty(propertyBefore);
        }
        ordered.push(property);
      }
      for (let property of properties) {
        addProperty(property);
      }
      return ordered;
    }
  }
});

// node_modules/dpack/lib/Block.js
var require_Block = __commonJS({
  "node_modules/dpack/lib/Block.js"(exports2) {
    "use strict";
    var makeSymbol = typeof Symbol !== "undefined" ? Symbol : function(name) {
      return "symbol-" + name;
    };
    var nextVersion = 1;
    var bufferSymbol = makeSymbol("buffer");
    var sizeTableSymbol = makeSymbol("sizeTable");
    var headerSymbol = makeSymbol("header");
    var parsedSymbol = makeSymbol("parsed");
    var sharedSymbol = makeSymbol("shared");
    var targetSymbol = makeSymbol("target");
    var freezeObjects = process.env.NODE_ENV != "production";
    var DEFAULT_TYPE = 6;
    var ARRAY_TYPE = 7;
    function Block() {
    }
    var serializeModule = require_serialize();
    exports2.Block = Block;
    exports2.bufferSymbol = serializeModule.bufferSymbol = bufferSymbol;
    exports2.parsedSymbol = parsedSymbol;
    exports2.sharedSymbol = sharedSymbol;
    exports2.targetSymbol = serializeModule.targetSymbol = targetSymbol;
    exports2.sizeTableSymbol = serializeModule.sizeTableSymbol = sizeTableSymbol;
    var serialize2 = serializeModule.serialize;
    var createSerializer = serializeModule.createSerializer;
    exports2.asBlock = asBlock;
    function asBlock(object, shared) {
      if (object && object[targetSymbol]) {
        return object;
      }
      if (Array.isArray(object)) {
        let target = [];
        target.parsed = object;
        target.shared = shared;
        return new Proxy(target, onDemandHandler);
      }
      return new Proxy({
        parsed: object,
        shared
      }, onDemandHandler);
    }
    exports2.isBlock = isBlock;
    function isBlock(object) {
      return object && object[targetSymbol];
    }
    exports2.makeBlockFromBuffer = makeBlockFromBuffer;
    function makeBlockFromBuffer(buffer, shared) {
      var dpackBuffer, sizeTableBuffer;
      if (buffer[0] < 128) {
        dpackBuffer = buffer;
      } else {
        var type = buffer[0] >> 6;
        var dpackOffset;
        if (type === 2) {
          dpackOffset = buffer.readUInt16BE(0) & 16383;
        } else {
          dpackOffset = buffer.readUInt32BE(0) & 1073741823;
        }
        dpackBuffer = buffer.slice(dpackOffset);
        sizeTableBuffer = buffer.slice(0, dpackOffset);
      }
      var target = {
        dpackBuffer,
        sizeTableBuffer,
        shared,
        reassign: function(buffer2) {
          this.buffer = buffer2;
        }
      };
      buffer.owner = target;
      return new Proxy(target, onDemandHandler);
    }
    exports2.getLazyHeader = function(block) {
      return block[sizeTableSymbol];
    };
    var onDemandHandler = {
      get: function(target, key) {
        if (specialGetters.hasOwnProperty(key)) {
          return specialGetters[key].call(target);
        }
        var parsed = target.parsed;
        if (!parsed) {
          parsed = getParsed(target);
        }
        return parsed[key];
      },
      set: function(target, key, value) {
        if (typeof key === "symbol") {
          target[key] = value;
          makeSymbolGetter(key);
          return true;
        }
        throw new Error("No changes are allowed on frozen parsed object, Use dpack copy() function to modify");
      },
      deleteProperty: function() {
        throw new Error("No changes are allowed on frozen parsed object, Use dpack copy() function to modify");
      },
      getOwnPropertyDescriptor: function(target, key) {
        var parsed = getParsed(target);
        return Object.getOwnPropertyDescriptor(parsed, key);
      },
      has: function(target, key) {
        var parsed = getParsed(target);
        return key in parsed;
      },
      ownKeys: function(target) {
        var parsed = getParsed(target);
        var keys = Object.keys(parsed);
        if (Array.isArray(parsed)) {
          keys.push("length");
        }
        return keys;
      },
      getPrototypeOf: function(target) {
        var parsed = getParsed(target);
        return Object.getPrototypeOf(parsed);
      }
    };
    exports2.reassignBuffers = reassignBuffers;
    function reassignBuffers(block, newParentNodeBuffer, parentArrayBuffer) {
      var target = block[targetSymbol];
      var buffer = target.dpackBuffer;
      if (!parentArrayBuffer)
        parentArrayBuffer = buffer.buffer;
      if (buffer && buffer.buffer === parentArrayBuffer) {
        var byteOffset = buffer.byteOffset;
        target.dpackBuffer = newParentNodeBuffer.slice(byteOffset, byteOffset + buffer.length);
      }
      var buffer = target.sizeTableBuffer;
      if (buffer && buffer.buffer === parentArrayBuffer) {
        var byteOffset = buffer.byteOffset;
        target.sizeTableBuffer = newParentNodeBuffer.slice(byteOffset, byteOffset + buffer.length);
      }
      if (target.parsed) {
        var parsed = target.parsed;
        for (var key in parsed) {
          var value = parsed[key];
          if (isBlock(value)) {
            reassignBuffers(value, newParentNodeBuffer, parentArrayBuffer);
          }
        }
      }
    }
    var copyOnWriteHandler = {
      get: function(target, key) {
        if (specialGetters.hasOwnProperty(key)) {
          return specialGetters[key].call(target);
        }
        var cachedParsed = target.cachedParsed;
        if (cachedParsed && cachedParsed.hasOwnProperty(key) && !(key == "length" && Array.isArray(cachedParsed))) {
          return cachedParsed[key];
        }
        var parsed = target.parsed;
        if (!parsed) {
          parsed = getParsed(target);
        }
        var value = parsed[key];
        if (value && value[targetSymbol]) {
          if (!cachedParsed) {
            target.cachedParsed = cachedParsed = parsed instanceof Array ? [] : {};
          }
          cachedParsed[key] = value = copyWithParent(value, target);
        }
        return value;
      },
      changed: function(target) {
        target.dpackBuffer = null;
        target.sizeTableBuffer = null;
        target.shared = null;
        var parsed = target.parsed;
        if (!parsed) {
          parsed = getParsed(target);
        }
        if (!target.copied) {
          var cachedParsed = target.cachedParsed;
          var copied = target.parsed = target.cachedParsed = parsed instanceof Array ? [] : {};
          for (var key in parsed) {
            var value = cachedParsed && cachedParsed[key];
            if (!value) {
              value = parsed[key];
              if (value && value[targetSymbol]) {
                value = copyWithParent(value, target);
              }
            }
            copied[key] = value;
          }
          parsed = copied;
          target.copied = true;
        }
        target.version = nextVersion++;
        return parsed;
      },
      checkVersion: function(target) {
        var cachedParsed = target.cachedParsed;
        let version = target.version || 0;
        if (cachedParsed) {
          for (let key in cachedParsed) {
            var value = cachedParsed[key];
            if (value && value[targetSymbol]) {
              version = Math.max(version, this.checkVersion(value[targetSymbol]));
            }
          }
        }
        if (version != (target.version || 0)) {
          this.changed(target);
          target.version = version;
        }
        return version;
      },
      set: function(target, key, value, proxy) {
        if (specialSetters.hasOwnProperty(key)) {
          specialSetters[key].call(target, value);
          return true;
        }
        var parsed = copyOnWriteHandler.changed(target);
        parsed[key] = value;
        return true;
      },
      deleteProperty: function(target, key) {
        var parsed = copyOnWriteHandler.changed(target);
        return delete parsed[key];
      },
      getOwnPropertyDescriptor: function(target, key) {
        var parsed = getParsed(target);
        return Object.getOwnPropertyDescriptor(parsed, key);
      },
      has: function(target, key) {
        var parsed = getParsed(target);
        return key in parsed;
      },
      ownKeys: function(target) {
        var parsed = getParsed(target);
        var keys = Object.keys(parsed);
        if (Array.isArray(parsed)) {
          keys.push("length");
        }
        if (target.copied) {
          for (var key in target.copied) {
            if (keys.indexOf(key) === -1) {
              keys.push(key);
            }
          }
        }
        return keys;
      },
      getPrototypeOf: function(target) {
        var parsed = getParsed(target);
        return Object.getPrototypeOf(parsed);
      }
    };
    var specialGetters = {};
    specialGetters[bufferSymbol] = function() {
      return function(property, randomAccess) {
        var propertyIsShared = property && property.upgrade;
        var buffer;
        if (this.cachedParsed && this.dpackBuffer) {
          copyOnWriteHandler.checkVersion(this);
        }
        if (!(this.shared && this.shared.upgrade) && propertyIsShared) {
          if (this.dpackBuffer) {
            this.sizeTableBuffer = null;
            return inSeparateProperty(this.dpackBuffer, true);
          } else {
            return getSerialized(this, this.shared = property);
          }
        }
        if (!this.dpackBuffer) {
          getSerialized(this, this.shared);
        }
        if (this.shared && this.shared.upgrade && this.shared !== property) {
          var compatibility = this.shared.upgrade(property, randomAccess);
          if (compatibility > 0) {
            this.sizeTableBuffer = null;
            var sharedBuffer = this.shared.serialized;
            if (sharedBuffer.length > 0) {
              if (compatibility == 2 && !(property.isFrozen && property.resetTo === 0))
                sharedBuffer = inSeparateProperty(sharedBuffer);
              buffer = Buffer.concat([sharedBuffer, this.dpackBuffer]);
              buffer.mustSequence = true;
              return buffer;
            }
          }
        } else if (property) {
          if (!propertyIsShared) {
            property.length = 0;
          }
          if (property.insertedFrom)
            property.insertedFrom = null;
        }
        return this.dpackBuffer;
        function inSeparateProperty(dpackBuffer) {
          var serializer = createSerializer();
          var isArray = dpackBuffer[0] === 119;
          var writeToken = serializer.getWriters().writeToken;
          if (isArray) {
            dpackBuffer = dpackBuffer.slice(1);
          }
          writeToken(0, 1e3);
          writeToken(3, isArray ? ARRAY_TYPE : DEFAULT_TYPE);
          if (property && property.key !== null)
            serializer.serialize(property.key);
          dpackBuffer = Buffer.concat([serializer.getSerialized(), dpackBuffer]);
          dpackBuffer.mustSequence = true;
          return dpackBuffer;
        }
      }.bind(this);
    };
    specialGetters[targetSymbol] = function() {
      return this;
    };
    specialGetters[sharedSymbol] = function() {
      return this.shared;
    };
    specialGetters[parsedSymbol] = function() {
      return this.parsed || getParsed(this);
    };
    specialGetters[sizeTableSymbol] = function() {
      if (!this.dpackBuffer) {
        getSerialized(this);
      }
      return this.sizeTableBuffer;
    };
    specialGetters.then = function() {
    };
    specialGetters.toJSON = function() {
      return valueOf;
    };
    specialGetters.valueOf = function() {
      return valueOf;
    };
    specialGetters.entries = function() {
      return entries;
    };
    function entries() {
      return this[parsedSymbol].entries();
    }
    specialGetters[Symbol.iterator] = function() {
      var parsed = this.parsed || getParsed(this);
      return parsed && parsed[Symbol.iterator] && iterator;
    };
    function iterator() {
      var parsed = this[parsedSymbol];
      return parsed && parsed[Symbol.iterator] ? parsed[Symbol.iterator]() : [][Symbol.iterator]();
    }
    specialGetters.constructor = function() {
      if (this.parsed) {
        return this.parsed.constructor;
      }
      if (this.dpackBuffer) {
        let firstByte = this.dpackBuffer[0];
        if (firstByte >= 48 && firstByte <= 60) {
          if (this.shared) {
            if (this.shared.code == DEFAULT_TYPE) {
              return Object;
            } else if (this.shared.code == ARRAY_TYPE) {
              return Array;
            }
          } else {
            return Object;
          }
        } else if (firstByte === 119) {
          return Array;
        }
      }
      return getParsed(this).constructor;
    };
    function makeSymbolGetter(symbol) {
      if (!specialGetters[symbol])
        specialGetters[symbol] = function() {
          return this[symbol];
        };
    }
    function valueOf() {
      return this[parsedSymbol];
    }
    function copy(source) {
      return copyWithParent(source);
    }
    function copyWithParent(source, parent) {
      if (!isBlock(source)) {
        return source;
      }
      let isArray = Array.isArray(source);
      let target = isArray ? [] : {};
      Object.defineProperties(target, {
        parsed: {
          get() {
            return source[parsedSymbol];
          },
          set(value) {
            Object.defineProperty(this, "parsed", {
              value,
              writable: true,
              enumerable: true
            });
          },
          configurable: true
        },
        shared: {
          get() {
            return source[sharedSymbol];
          },
          set(value) {
            Object.defineProperty(this, "shared", {
              value,
              writable: true,
              enumerable: true
            });
            this.dpackBuffer = null;
            this.sizeTableBuffer = null;
          },
          configurable: true
        },
        dpackBuffer: {
          get() {
            return source[targetSymbol].dpackBuffer;
          },
          set(value) {
            Object.defineProperty(this, "dpackBuffer", {
              value,
              writable: true,
              enumerable: true
            });
          },
          configurable: true
        },
        sizeTableBuffer: {
          get() {
            return source[sizeTableSymbol];
          },
          set(value) {
            Object.defineProperty(this, "sizeTableBuffer", {
              value,
              writable: true,
              enumerable: true
            });
          },
          configurable: true
        }
      });
      if (isArray) {
        Object.define;
      }
      return new Proxy(target, copyOnWriteHandler);
    }
    exports2.copy = copy;
    var specialSetters = {};
    function getParsed(target) {
      var parsed = target.parsed;
      if (parsed)
        return parsed;
      var sizeTableBuffer = target.sizeTableBuffer;
      var dpackBuffer = target.dpackBuffer;
      if (!sizeTableBuffer) {
        return target.parsed = parse3(dpackBuffer, {
          freezeObjects,
          shared: target.shared
        });
      }
      var totalSizeTableLength = sizeTableBuffer.length;
      var totalDPackLength;
      var rootBlockLength;
      var type = sizeTableBuffer[0] >> 6;
      var offset;
      if (type === 2) {
        rootBlockLength = sizeTableBuffer.readUInt16BE(4);
        offset = 6;
      } else {
        rootBlockLength = sizeTableBuffer.readUIntBE(10, 6);
        offset = 16;
      }
      var childSizeTables = [];
      var childDpackBlocks = [];
      var dpackChildOffset = rootBlockLength;
      while (offset < totalSizeTableLength) {
        var type = sizeTableBuffer[offset] >> 6;
        var sizeTableLength;
        var dpackLength;
        if (type < 2) {
          if (type == 0) {
            sizeTableLength = 1;
            dpackLength = sizeTableBuffer[offset];
          } else {
            sizeTableLength = 2;
            dpackLength = sizeTableBuffer.readUInt16BE(offset) & 16383;
          }
        } else if (type === 2) {
          sizeTableLength = sizeTableBuffer.readUInt16BE(offset) & 16383;
          dpackLength = sizeTableBuffer.readUInt16BE(offset + 2);
        } else {
          sizeTableLength = sizeTableBuffer.readUInt32BE(offset) & 1073741823;
          dpackLength = sizeTableBuffer.readUIntBE(offset + 4, 6);
        }
        childSizeTables.push(type < 2 || type == 3 && sizeTableLength == 16 ? (
          // type 3 with a length of 16 is a long leaf node
          void 0
        ) : sizeTableBuffer.slice(offset, offset + sizeTableLength));
        offset += sizeTableLength;
        childDpackBlocks.push(dpackBuffer.slice(dpackChildOffset, dpackChildOffset += dpackLength));
      }
      var blockIndex = 0;
      var rootBlock = target.dpackBuffer.slice(0, rootBlockLength);
      return target.parsed = parse3(rootBlock, childDpackBlocks.length > 0 ? {
        // if no child blocks, use normal deferred parsing
        shared: target.shared,
        forDeferred: function(value, property) {
          let target2 = new value.constructor();
          target2.dpackBuffer = childDpackBlocks[blockIndex];
          target2.sizeTableBuffer = childSizeTables[blockIndex++];
          target2.shared = property ? property.upgrade ? property : { code: property.code, key: null, type: property.type } : null;
          return new Proxy(target2, onDemandHandler);
        },
        freezeObjects
      } : {
        shared: target.shared
      });
    }
    function getSerialized(target, shareProperty) {
      var childBlocks = [];
      var childSizeTables = [];
      var childDpackSizes = 0;
      var mustSequence;
      var serializerOptions = {
        forBlock: function(block, property) {
          var dpackBuffer2 = block[bufferSymbol](property, true);
          if (dpackBuffer2.mustSequence) {
            mustSequence = true;
            childBlocks.push(dpackBuffer2);
            return dpackBuffer2;
          }
          var sizeTableBuffer = block[sizeTableSymbol];
          if (!sizeTableBuffer) {
            var bufferLength = dpackBuffer2.length;
            if (bufferLength < 64) {
              sizeTableBuffer = Buffer.from([bufferLength]);
            } else if (bufferLength < 16384) {
              sizeTableBuffer = Buffer.from([bufferLength >> 8 | 64, bufferLength & 255]);
            } else {
              sizeTableBuffer = Buffer.allocUnsafe(16);
              sizeTableBuffer.writeUInt32BE(3221225488);
              sizeTableBuffer.writeUIntBE(bufferLength, 4, 6);
              sizeTableBuffer.writeUIntBE(bufferLength, 10, 6);
            }
          }
          childSizeTables.push(sizeTableBuffer);
          childDpackSizes += dpackBuffer2.length;
          childBlocks.push(dpackBuffer2);
          return dpackBuffer2;
        },
        shared: shareProperty,
        freezeObjects
      };
      var rootBlock = serialize2(target.parsed, serializerOptions);
      if (childBlocks.length == 0) {
        return target.dpackBuffer = rootBlock;
      }
      childBlocks.unshift(rootBlock);
      var dpackBuffer = target.dpackBuffer = Buffer.concat(childBlocks);
      if (mustSequence) {
        return dpackBuffer;
      }
      var ourSizeBlock = Buffer.allocUnsafe(dpackBuffer.length >= 65536 ? 16 : 6);
      childSizeTables.unshift(ourSizeBlock);
      ourSizeBlock = target.sizeTableBuffer = Buffer.concat(childSizeTables);
      if (dpackBuffer.length >= 65536) {
        ourSizeBlock.writeUInt32BE(ourSizeBlock.length + 3221225472, 0);
        ourSizeBlock.writeUIntBE(dpackBuffer.length, 4, 6);
        ourSizeBlock.writeUIntBE(rootBlock.length, 10, 6);
      } else {
        ourSizeBlock.writeUInt16BE(ourSizeBlock.length | 32768, 0);
        ourSizeBlock.writeUInt16BE(dpackBuffer.length, 2);
        ourSizeBlock.writeUInt16BE(rootBlock.length, 4);
      }
      return dpackBuffer;
    }
    var parse3 = require_parse().parse;
    var serializeSharedBlock = require_shared().serializeSharedBlock;
    exports2.parseLazy = function(buffer, options2) {
      if (buffer[0] & 128 || // starts with size table
      buffer[0] >> 4 === 3 || // sequence (object)
      buffer[0] === 119) {
        return makeBlockFromBuffer(buffer, options2 && options2.shared);
      } else {
        return parse3(buffer, options2);
      }
    };
  }
});

// node_modules/dpack/index.js
var require_dpack = __commonJS({
  "node_modules/dpack/index.js"(exports2) {
    exports2.createSerializeStream = require_serialize_stream().createSerializeStream;
    exports2.createParseStream = require_parse_stream().createParseStream;
    var serialize2 = require_serialize();
    serialize2.nodeCharEncoder = require_node_encoder().nodeCharEncoder;
    var parse3 = require_parse();
    var Options = require_Options().Options;
    exports2.serialize = serialize2.serialize;
    exports2.parse = parse3.parse;
    exports2.createSerializer = serialize2.createSerializer;
    exports2.createParser = parse3.createParser;
    var Block = require_Block();
    exports2.parseLazy = Block.parseLazy;
    exports2.asBlock = Block.asBlock;
    exports2.isBlock = Block.isBlock;
    exports2.copy = Block.copy;
    exports2.reassignBuffers = Block.reassignBuffers;
    exports2.Options = Options;
    exports2.createSharedStructure = require_shared().createSharedStructure;
    exports2.readSharedStructure = require_shared().readSharedStructure;
  }
});

// node_modules/kind-of/index.js
var require_kind_of = __commonJS({
  "node_modules/kind-of/index.js"(exports2, module2) {
    var toString = Object.prototype.toString;
    module2.exports = function kindOf(val) {
      if (val === void 0) return "undefined";
      if (val === null) return "null";
      var type = typeof val;
      if (type === "boolean") return "boolean";
      if (type === "string") return "string";
      if (type === "number") return "number";
      if (type === "symbol") return "symbol";
      if (type === "function") {
        return isGeneratorFn(val) ? "generatorfunction" : "function";
      }
      if (isArray(val)) return "array";
      if (isBuffer(val)) return "buffer";
      if (isArguments(val)) return "arguments";
      if (isDate(val)) return "date";
      if (isError(val)) return "error";
      if (isRegexp(val)) return "regexp";
      switch (ctorName(val)) {
        case "Symbol":
          return "symbol";
        case "Promise":
          return "promise";
        // Set, Map, WeakSet, WeakMap
        case "WeakMap":
          return "weakmap";
        case "WeakSet":
          return "weakset";
        case "Map":
          return "map";
        case "Set":
          return "set";
        // 8-bit typed arrays
        case "Int8Array":
          return "int8array";
        case "Uint8Array":
          return "uint8array";
        case "Uint8ClampedArray":
          return "uint8clampedarray";
        // 16-bit typed arrays
        case "Int16Array":
          return "int16array";
        case "Uint16Array":
          return "uint16array";
        // 32-bit typed arrays
        case "Int32Array":
          return "int32array";
        case "Uint32Array":
          return "uint32array";
        case "Float32Array":
          return "float32array";
        case "Float64Array":
          return "float64array";
      }
      if (isGeneratorObj(val)) {
        return "generator";
      }
      type = toString.call(val);
      switch (type) {
        case "[object Object]":
          return "object";
        // iterators
        case "[object Map Iterator]":
          return "mapiterator";
        case "[object Set Iterator]":
          return "setiterator";
        case "[object String Iterator]":
          return "stringiterator";
        case "[object Array Iterator]":
          return "arrayiterator";
      }
      return type.slice(8, -1).toLowerCase().replace(/\s/g, "");
    };
    function ctorName(val) {
      return typeof val.constructor === "function" ? val.constructor.name : null;
    }
    function isArray(val) {
      if (Array.isArray) return Array.isArray(val);
      return val instanceof Array;
    }
    function isError(val) {
      return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
    }
    function isDate(val) {
      if (val instanceof Date) return true;
      return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
    }
    function isRegexp(val) {
      if (val instanceof RegExp) return true;
      return typeof val.flags === "string" && typeof val.ignoreCase === "boolean" && typeof val.multiline === "boolean" && typeof val.global === "boolean";
    }
    function isGeneratorFn(name, val) {
      return ctorName(name) === "GeneratorFunction";
    }
    function isGeneratorObj(val) {
      return typeof val.throw === "function" && typeof val.return === "function" && typeof val.next === "function";
    }
    function isArguments(val) {
      try {
        if (typeof val.length === "number" && typeof val.callee === "function") {
          return true;
        }
      } catch (err) {
        if (err.message.indexOf("callee") !== -1) {
          return true;
        }
      }
      return false;
    }
    function isBuffer(val) {
      if (val.constructor && typeof val.constructor.isBuffer === "function") {
        return val.constructor.isBuffer(val);
      }
      return false;
    }
  }
});

// node_modules/is-extendable/index.js
var require_is_extendable = __commonJS({
  "node_modules/is-extendable/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function isExtendable(val) {
      return typeof val !== "undefined" && val !== null && (typeof val === "object" || typeof val === "function");
    };
  }
});

// node_modules/extend-shallow/index.js
var require_extend_shallow = __commonJS({
  "node_modules/extend-shallow/index.js"(exports2, module2) {
    "use strict";
    var isObject = require_is_extendable();
    module2.exports = function extend(o) {
      if (!isObject(o)) {
        o = {};
      }
      var len = arguments.length;
      for (var i = 1; i < len; i++) {
        var obj = arguments[i];
        if (isObject(obj)) {
          assign(o, obj);
        }
      }
      return o;
    };
    function assign(a, b) {
      for (var key in b) {
        if (hasOwn(b, key)) {
          a[key] = b[key];
        }
      }
    }
    function hasOwn(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
  }
});

// node_modules/section-matter/index.js
var require_section_matter = __commonJS({
  "node_modules/section-matter/index.js"(exports2, module2) {
    "use strict";
    var typeOf = require_kind_of();
    var extend = require_extend_shallow();
    module2.exports = function(input, options2) {
      if (typeof options2 === "function") {
        options2 = { parse: options2 };
      }
      var file = toObject(input);
      var defaults = { section_delimiter: "---", parse: identity };
      var opts = extend({}, defaults, options2);
      var delim = opts.section_delimiter;
      var lines = file.content.split(/\r?\n/);
      var sections = null;
      var section = createSection();
      var content = [];
      var stack = [];
      function initSections(val) {
        file.content = val;
        sections = [];
        content = [];
      }
      function closeSection(val) {
        if (stack.length) {
          section.key = getKey(stack[0], delim);
          section.content = val;
          opts.parse(section, sections);
          sections.push(section);
          section = createSection();
          content = [];
          stack = [];
        }
      }
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var len = stack.length;
        var ln = line.trim();
        if (isDelimiter(ln, delim)) {
          if (ln.length === 3 && i !== 0) {
            if (len === 0 || len === 2) {
              content.push(line);
              continue;
            }
            stack.push(ln);
            section.data = content.join("\n");
            content = [];
            continue;
          }
          if (sections === null) {
            initSections(content.join("\n"));
          }
          if (len === 2) {
            closeSection(content.join("\n"));
          }
          stack.push(ln);
          continue;
        }
        content.push(line);
      }
      if (sections === null) {
        initSections(content.join("\n"));
      } else {
        closeSection(content.join("\n"));
      }
      file.sections = sections;
      return file;
    };
    function isDelimiter(line, delim) {
      if (line.slice(0, delim.length) !== delim) {
        return false;
      }
      if (line.charAt(delim.length + 1) === delim.slice(-1)) {
        return false;
      }
      return true;
    }
    function toObject(input) {
      if (typeOf(input) !== "object") {
        input = { content: input };
      }
      if (typeof input.content !== "string" && !isBuffer(input.content)) {
        throw new TypeError("expected a buffer or string");
      }
      input.content = input.content.toString();
      input.sections = [];
      return input;
    }
    function getKey(val, delim) {
      return val ? val.slice(delim.length).trim() : "";
    }
    function createSection() {
      return { key: "", data: "", content: "" };
    }
    function identity(val) {
      return val;
    }
    function isBuffer(val) {
      if (val && val.constructor && typeof val.constructor.isBuffer === "function") {
        return val.constructor.isBuffer(val);
      }
      return false;
    }
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/common.js
var require_common = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/common.js"(exports2, module2) {
    "use strict";
    function isNothing(subject) {
      return typeof subject === "undefined" || subject === null;
    }
    function isObject(subject) {
      return typeof subject === "object" && subject !== null;
    }
    function toArray(sequence) {
      if (Array.isArray(sequence)) return sequence;
      else if (isNothing(sequence)) return [];
      return [sequence];
    }
    function extend(target, source) {
      var index, length, key, sourceKeys;
      if (source) {
        sourceKeys = Object.keys(source);
        for (index = 0, length = sourceKeys.length; index < length; index += 1) {
          key = sourceKeys[index];
          target[key] = source[key];
        }
      }
      return target;
    }
    function repeat(string, count3) {
      var result = "", cycle;
      for (cycle = 0; cycle < count3; cycle += 1) {
        result += string;
      }
      return result;
    }
    function isNegativeZero(number) {
      return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
    }
    module2.exports.isNothing = isNothing;
    module2.exports.isObject = isObject;
    module2.exports.toArray = toArray;
    module2.exports.repeat = repeat;
    module2.exports.isNegativeZero = isNegativeZero;
    module2.exports.extend = extend;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/exception.js
var require_exception = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/exception.js"(exports2, module2) {
    "use strict";
    function YAMLException(reason, mark) {
      Error.call(this);
      this.name = "YAMLException";
      this.reason = reason;
      this.mark = mark;
      this.message = (this.reason || "(unknown reason)") + (this.mark ? " " + this.mark.toString() : "");
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack || "";
      }
    }
    YAMLException.prototype = Object.create(Error.prototype);
    YAMLException.prototype.constructor = YAMLException;
    YAMLException.prototype.toString = function toString(compact) {
      var result = this.name + ": ";
      result += this.reason || "(unknown reason)";
      if (!compact && this.mark) {
        result += " " + this.mark.toString();
      }
      return result;
    };
    module2.exports = YAMLException;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/mark.js
var require_mark = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/mark.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    function Mark(name, buffer, position, line, column) {
      this.name = name;
      this.buffer = buffer;
      this.position = position;
      this.line = line;
      this.column = column;
    }
    Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
      var head, start, tail, end, snippet;
      if (!this.buffer) return null;
      indent = indent || 4;
      maxLength = maxLength || 75;
      head = "";
      start = this.position;
      while (start > 0 && "\0\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1) {
        start -= 1;
        if (this.position - start > maxLength / 2 - 1) {
          head = " ... ";
          start += 5;
          break;
        }
      }
      tail = "";
      end = this.position;
      while (end < this.buffer.length && "\0\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1) {
        end += 1;
        if (end - this.position > maxLength / 2 - 1) {
          tail = " ... ";
          end -= 5;
          break;
        }
      }
      snippet = this.buffer.slice(start, end);
      return common.repeat(" ", indent) + head + snippet + tail + "\n" + common.repeat(" ", indent + this.position - start + head.length) + "^";
    };
    Mark.prototype.toString = function toString(compact) {
      var snippet, where = "";
      if (this.name) {
        where += 'in "' + this.name + '" ';
      }
      where += "at line " + (this.line + 1) + ", column " + (this.column + 1);
      if (!compact) {
        snippet = this.getSnippet();
        if (snippet) {
          where += ":\n" + snippet;
        }
      }
      return where;
    };
    module2.exports = Mark;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type.js
var require_type = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type.js"(exports2, module2) {
    "use strict";
    var YAMLException = require_exception();
    var TYPE_CONSTRUCTOR_OPTIONS = [
      "kind",
      "resolve",
      "construct",
      "instanceOf",
      "predicate",
      "represent",
      "defaultStyle",
      "styleAliases"
    ];
    var YAML_NODE_KINDS = [
      "scalar",
      "sequence",
      "mapping"
    ];
    function compileStyleAliases(map) {
      var result = {};
      if (map !== null) {
        Object.keys(map).forEach(function(style) {
          map[style].forEach(function(alias) {
            result[String(alias)] = style;
          });
        });
      }
      return result;
    }
    function Type(tag, options2) {
      options2 = options2 || {};
      Object.keys(options2).forEach(function(name) {
        if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
          throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
        }
      });
      this.tag = tag;
      this.kind = options2["kind"] || null;
      this.resolve = options2["resolve"] || function() {
        return true;
      };
      this.construct = options2["construct"] || function(data) {
        return data;
      };
      this.instanceOf = options2["instanceOf"] || null;
      this.predicate = options2["predicate"] || null;
      this.represent = options2["represent"] || null;
      this.defaultStyle = options2["defaultStyle"] || null;
      this.styleAliases = compileStyleAliases(options2["styleAliases"] || null);
      if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
        throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
      }
    }
    module2.exports = Type;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema.js
var require_schema = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var Type = require_type();
    function compileList(schema, name, result) {
      var exclude = [];
      schema.include.forEach(function(includedSchema) {
        result = compileList(includedSchema, name, result);
      });
      schema[name].forEach(function(currentType) {
        result.forEach(function(previousType, previousIndex) {
          if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
            exclude.push(previousIndex);
          }
        });
        result.push(currentType);
      });
      return result.filter(function(type, index) {
        return exclude.indexOf(index) === -1;
      });
    }
    function compileMap() {
      var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {}
      }, index, length;
      function collectType(type) {
        result[type.kind][type.tag] = result["fallback"][type.tag] = type;
      }
      for (index = 0, length = arguments.length; index < length; index += 1) {
        arguments[index].forEach(collectType);
      }
      return result;
    }
    function Schema(definition) {
      this.include = definition.include || [];
      this.implicit = definition.implicit || [];
      this.explicit = definition.explicit || [];
      this.implicit.forEach(function(type) {
        if (type.loadKind && type.loadKind !== "scalar") {
          throw new YAMLException("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
        }
      });
      this.compiledImplicit = compileList(this, "implicit", []);
      this.compiledExplicit = compileList(this, "explicit", []);
      this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
    }
    Schema.DEFAULT = null;
    Schema.create = function createSchema() {
      var schemas, types;
      switch (arguments.length) {
        case 1:
          schemas = Schema.DEFAULT;
          types = arguments[0];
          break;
        case 2:
          schemas = arguments[0];
          types = arguments[1];
          break;
        default:
          throw new YAMLException("Wrong number of arguments for Schema.create function");
      }
      schemas = common.toArray(schemas);
      types = common.toArray(types);
      if (!schemas.every(function(schema) {
        return schema instanceof Schema;
      })) {
        throw new YAMLException("Specified list of super schemas (or a single Schema object) contains a non-Schema object.");
      }
      if (!types.every(function(type) {
        return type instanceof Type;
      })) {
        throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
      return new Schema({
        include: schemas,
        explicit: types
      });
    };
    module2.exports = Schema;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/str.js
var require_str = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/str.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    module2.exports = new Type("tag:yaml.org,2002:str", {
      kind: "scalar",
      construct: function(data) {
        return data !== null ? data : "";
      }
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/seq.js
var require_seq = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/seq.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    module2.exports = new Type("tag:yaml.org,2002:seq", {
      kind: "sequence",
      construct: function(data) {
        return data !== null ? data : [];
      }
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/map.js
var require_map = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/map.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    module2.exports = new Type("tag:yaml.org,2002:map", {
      kind: "mapping",
      construct: function(data) {
        return data !== null ? data : {};
      }
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/failsafe.js
var require_failsafe = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/failsafe.js"(exports2, module2) {
    "use strict";
    var Schema = require_schema();
    module2.exports = new Schema({
      explicit: [
        require_str(),
        require_seq(),
        require_map()
      ]
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/null.js
var require_null = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/null.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    function resolveYamlNull(data) {
      if (data === null) return true;
      var max = data.length;
      return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
    }
    function constructYamlNull() {
      return null;
    }
    function isNull(object) {
      return object === null;
    }
    module2.exports = new Type("tag:yaml.org,2002:null", {
      kind: "scalar",
      resolve: resolveYamlNull,
      construct: constructYamlNull,
      predicate: isNull,
      represent: {
        canonical: function() {
          return "~";
        },
        lowercase: function() {
          return "null";
        },
        uppercase: function() {
          return "NULL";
        },
        camelcase: function() {
          return "Null";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/bool.js
var require_bool = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/bool.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    function resolveYamlBoolean(data) {
      if (data === null) return false;
      var max = data.length;
      return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
    }
    function constructYamlBoolean(data) {
      return data === "true" || data === "True" || data === "TRUE";
    }
    function isBoolean(object) {
      return Object.prototype.toString.call(object) === "[object Boolean]";
    }
    module2.exports = new Type("tag:yaml.org,2002:bool", {
      kind: "scalar",
      resolve: resolveYamlBoolean,
      construct: constructYamlBoolean,
      predicate: isBoolean,
      represent: {
        lowercase: function(object) {
          return object ? "true" : "false";
        },
        uppercase: function(object) {
          return object ? "TRUE" : "FALSE";
        },
        camelcase: function(object) {
          return object ? "True" : "False";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/int.js
var require_int2 = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/int.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    function isHexCode(c2) {
      return 48 <= c2 && c2 <= 57 || 65 <= c2 && c2 <= 70 || 97 <= c2 && c2 <= 102;
    }
    function isOctCode(c2) {
      return 48 <= c2 && c2 <= 55;
    }
    function isDecCode(c2) {
      return 48 <= c2 && c2 <= 57;
    }
    function resolveYamlInteger(data) {
      if (data === null) return false;
      var max = data.length, index = 0, hasDigits = false, ch;
      if (!max) return false;
      ch = data[index];
      if (ch === "-" || ch === "+") {
        ch = data[++index];
      }
      if (ch === "0") {
        if (index + 1 === max) return true;
        ch = data[++index];
        if (ch === "b") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (ch !== "0" && ch !== "1") return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        if (ch === "x") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_") continue;
            if (!isHexCode(data.charCodeAt(index))) return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        for (; index < max; index++) {
          ch = data[index];
          if (ch === "_") continue;
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== "_";
      }
      if (ch === "_") return false;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch === ":") break;
        if (!isDecCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }
      if (!hasDigits || ch === "_") return false;
      if (ch !== ":") return true;
      return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
    }
    function constructYamlInteger(data) {
      var value = data, sign = 1, ch, base, digits = [];
      if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
      }
      ch = value[0];
      if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
      }
      if (value === "0") return 0;
      if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value, 16);
        return sign * parseInt(value, 8);
      }
      if (value.indexOf(":") !== -1) {
        value.split(":").forEach(function(v2) {
          digits.unshift(parseInt(v2, 10));
        });
        value = 0;
        base = 1;
        digits.forEach(function(d) {
          value += d * base;
          base *= 60;
        });
        return sign * value;
      }
      return sign * parseInt(value, 10);
    }
    function isInteger(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
    }
    module2.exports = new Type("tag:yaml.org,2002:int", {
      kind: "scalar",
      resolve: resolveYamlInteger,
      construct: constructYamlInteger,
      predicate: isInteger,
      represent: {
        binary: function(obj) {
          return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
        },
        octal: function(obj) {
          return obj >= 0 ? "0" + obj.toString(8) : "-0" + obj.toString(8).slice(1);
        },
        decimal: function(obj) {
          return obj.toString(10);
        },
        /* eslint-disable max-len */
        hexadecimal: function(obj) {
          return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
        }
      },
      defaultStyle: "decimal",
      styleAliases: {
        binary: [2, "bin"],
        octal: [8, "oct"],
        decimal: [10, "dec"],
        hexadecimal: [16, "hex"]
      }
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/float.js
var require_float = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/float.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    var YAML_FLOAT_PATTERN = new RegExp(
      // 2.5e4, 2.5 and integers
      "^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
    );
    function resolveYamlFloat(data) {
      if (data === null) return false;
      if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === "_") {
        return false;
      }
      return true;
    }
    function constructYamlFloat(data) {
      var value, sign, base, digits;
      value = data.replace(/_/g, "").toLowerCase();
      sign = value[0] === "-" ? -1 : 1;
      digits = [];
      if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
      }
      if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      } else if (value === ".nan") {
        return NaN;
      } else if (value.indexOf(":") >= 0) {
        value.split(":").forEach(function(v2) {
          digits.unshift(parseFloat(v2, 10));
        });
        value = 0;
        base = 1;
        digits.forEach(function(d) {
          value += d * base;
          base *= 60;
        });
        return sign * value;
      }
      return sign * parseFloat(value, 10);
    }
    var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
    function representYamlFloat(object, style) {
      var res;
      if (isNaN(object)) {
        switch (style) {
          case "lowercase":
            return ".nan";
          case "uppercase":
            return ".NAN";
          case "camelcase":
            return ".NaN";
        }
      } else if (Number.POSITIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return ".inf";
          case "uppercase":
            return ".INF";
          case "camelcase":
            return ".Inf";
        }
      } else if (Number.NEGATIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return "-.inf";
          case "uppercase":
            return "-.INF";
          case "camelcase":
            return "-.Inf";
        }
      } else if (common.isNegativeZero(object)) {
        return "-0.0";
      }
      res = object.toString(10);
      return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
    }
    function isFloat(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
    }
    module2.exports = new Type("tag:yaml.org,2002:float", {
      kind: "scalar",
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/json.js
var require_json = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/json.js"(exports2, module2) {
    "use strict";
    var Schema = require_schema();
    module2.exports = new Schema({
      include: [
        require_failsafe()
      ],
      implicit: [
        require_null(),
        require_bool(),
        require_int2(),
        require_float()
      ]
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/core.js
var require_core = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/core.js"(exports2, module2) {
    "use strict";
    var Schema = require_schema();
    module2.exports = new Schema({
      include: [
        require_json()
      ]
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/timestamp.js
var require_timestamp2 = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/timestamp.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    var YAML_DATE_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
    );
    var YAML_TIMESTAMP_REGEXP = new RegExp(
      "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
    );
    function resolveYamlTimestamp(data) {
      if (data === null) return false;
      if (YAML_DATE_REGEXP.exec(data) !== null) return true;
      if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
      return false;
    }
    function constructYamlTimestamp(data) {
      var match, year, month, day, hour, minute, second2, fraction = 0, delta = null, tz_hour, tz_minute, date;
      match = YAML_DATE_REGEXP.exec(data);
      if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
      if (match === null) throw new Error("Date resolve error");
      year = +match[1];
      month = +match[2] - 1;
      day = +match[3];
      if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
      }
      hour = +match[4];
      minute = +match[5];
      second2 = +match[6];
      if (match[7]) {
        fraction = match[7].slice(0, 3);
        while (fraction.length < 3) {
          fraction += "0";
        }
        fraction = +fraction;
      }
      if (match[9]) {
        tz_hour = +match[10];
        tz_minute = +(match[11] || 0);
        delta = (tz_hour * 60 + tz_minute) * 6e4;
        if (match[9] === "-") delta = -delta;
      }
      date = new Date(Date.UTC(year, month, day, hour, minute, second2, fraction));
      if (delta) date.setTime(date.getTime() - delta);
      return date;
    }
    function representYamlTimestamp(object) {
      return object.toISOString();
    }
    module2.exports = new Type("tag:yaml.org,2002:timestamp", {
      kind: "scalar",
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/merge.js
var require_merge = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/merge.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    function resolveYamlMerge(data) {
      return data === "<<" || data === null;
    }
    module2.exports = new Type("tag:yaml.org,2002:merge", {
      kind: "scalar",
      resolve: resolveYamlMerge
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/binary.js
var require_binary = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/binary.js"(exports2, module2) {
    "use strict";
    var NodeBuffer;
    try {
      _require = __require;
      NodeBuffer = _require("buffer").Buffer;
    } catch (__) {
    }
    var _require;
    var Type = require_type();
    var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
    function resolveYamlBinary(data) {
      if (data === null) return false;
      var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        code = map.indexOf(data.charAt(idx));
        if (code > 64) continue;
        if (code < 0) return false;
        bitlen += 6;
      }
      return bitlen % 8 === 0;
    }
    function constructYamlBinary(data) {
      var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map = BASE64_MAP, bits = 0, result = [];
      for (idx = 0; idx < max; idx++) {
        if (idx % 4 === 0 && idx) {
          result.push(bits >> 16 & 255);
          result.push(bits >> 8 & 255);
          result.push(bits & 255);
        }
        bits = bits << 6 | map.indexOf(input.charAt(idx));
      }
      tailbits = max % 4 * 6;
      if (tailbits === 0) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      } else if (tailbits === 18) {
        result.push(bits >> 10 & 255);
        result.push(bits >> 2 & 255);
      } else if (tailbits === 12) {
        result.push(bits >> 4 & 255);
      }
      if (NodeBuffer) {
        return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
      }
      return result;
    }
    function representYamlBinary(object) {
      var result = "", bits = 0, idx, tail, max = object.length, map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        if (idx % 3 === 0 && idx) {
          result += map[bits >> 18 & 63];
          result += map[bits >> 12 & 63];
          result += map[bits >> 6 & 63];
          result += map[bits & 63];
        }
        bits = (bits << 8) + object[idx];
      }
      tail = max % 3;
      if (tail === 0) {
        result += map[bits >> 18 & 63];
        result += map[bits >> 12 & 63];
        result += map[bits >> 6 & 63];
        result += map[bits & 63];
      } else if (tail === 2) {
        result += map[bits >> 10 & 63];
        result += map[bits >> 4 & 63];
        result += map[bits << 2 & 63];
        result += map[64];
      } else if (tail === 1) {
        result += map[bits >> 2 & 63];
        result += map[bits << 4 & 63];
        result += map[64];
        result += map[64];
      }
      return result;
    }
    function isBinary(object) {
      return NodeBuffer && NodeBuffer.isBuffer(object);
    }
    module2.exports = new Type("tag:yaml.org,2002:binary", {
      kind: "scalar",
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/omap.js
var require_omap = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/omap.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var _toString = Object.prototype.toString;
    function resolveYamlOmap(data) {
      if (data === null) return true;
      var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for (pairKey in pair) {
          if (_hasOwnProperty.call(pair, pairKey)) {
            if (!pairHasKey) pairHasKey = true;
            else return false;
          }
        }
        if (!pairHasKey) return false;
        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
      }
      return true;
    }
    function constructYamlOmap(data) {
      return data !== null ? data : [];
    }
    module2.exports = new Type("tag:yaml.org,2002:omap", {
      kind: "sequence",
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/pairs.js
var require_pairs = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/pairs.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    var _toString = Object.prototype.toString;
    function resolveYamlPairs(data) {
      if (data === null) return true;
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        if (_toString.call(pair) !== "[object Object]") return false;
        keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [keys[0], pair[keys[0]]];
      }
      return true;
    }
    function constructYamlPairs(data) {
      if (data === null) return [];
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        keys = Object.keys(pair);
        result[index] = [keys[0], pair[keys[0]]];
      }
      return result;
    }
    module2.exports = new Type("tag:yaml.org,2002:pairs", {
      kind: "sequence",
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/set.js
var require_set = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/set.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function resolveYamlSet(data) {
      if (data === null) return true;
      var key, object = data;
      for (key in object) {
        if (_hasOwnProperty.call(object, key)) {
          if (object[key] !== null) return false;
        }
      }
      return true;
    }
    function constructYamlSet(data) {
      return data !== null ? data : {};
    }
    module2.exports = new Type("tag:yaml.org,2002:set", {
      kind: "mapping",
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/default_safe.js
var require_default_safe = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/default_safe.js"(exports2, module2) {
    "use strict";
    var Schema = require_schema();
    module2.exports = new Schema({
      include: [
        require_core()
      ],
      implicit: [
        require_timestamp2(),
        require_merge()
      ],
      explicit: [
        require_binary(),
        require_omap(),
        require_pairs(),
        require_set()
      ]
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/js/undefined.js
var require_undefined = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/js/undefined.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    function resolveJavascriptUndefined() {
      return true;
    }
    function constructJavascriptUndefined() {
      return void 0;
    }
    function representJavascriptUndefined() {
      return "";
    }
    function isUndefined(object) {
      return typeof object === "undefined";
    }
    module2.exports = new Type("tag:yaml.org,2002:js/undefined", {
      kind: "scalar",
      resolve: resolveJavascriptUndefined,
      construct: constructJavascriptUndefined,
      predicate: isUndefined,
      represent: representJavascriptUndefined
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/js/regexp.js
var require_regexp = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/js/regexp.js"(exports2, module2) {
    "use strict";
    var Type = require_type();
    function resolveJavascriptRegExp(data) {
      if (data === null) return false;
      if (data.length === 0) return false;
      var regexp = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
      if (regexp[0] === "/") {
        if (tail) modifiers = tail[1];
        if (modifiers.length > 3) return false;
        if (regexp[regexp.length - modifiers.length - 1] !== "/") return false;
      }
      return true;
    }
    function constructJavascriptRegExp(data) {
      var regexp = data, tail = /\/([gim]*)$/.exec(data), modifiers = "";
      if (regexp[0] === "/") {
        if (tail) modifiers = tail[1];
        regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
      }
      return new RegExp(regexp, modifiers);
    }
    function representJavascriptRegExp(object) {
      var result = "/" + object.source + "/";
      if (object.global) result += "g";
      if (object.multiline) result += "m";
      if (object.ignoreCase) result += "i";
      return result;
    }
    function isRegExp(object) {
      return Object.prototype.toString.call(object) === "[object RegExp]";
    }
    module2.exports = new Type("tag:yaml.org,2002:js/regexp", {
      kind: "scalar",
      resolve: resolveJavascriptRegExp,
      construct: constructJavascriptRegExp,
      predicate: isRegExp,
      represent: representJavascriptRegExp
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/js/function.js
var require_function = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/type/js/function.js"(exports2, module2) {
    "use strict";
    var esprima;
    try {
      _require = __require;
      esprima = _require("esprima");
    } catch (_) {
      if (typeof window !== "undefined") esprima = window.esprima;
    }
    var _require;
    var Type = require_type();
    function resolveJavascriptFunction(data) {
      if (data === null) return false;
      try {
        var source = "(" + data + ")", ast = esprima.parse(source, { range: true });
        if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    function constructJavascriptFunction(data) {
      var source = "(" + data + ")", ast = esprima.parse(source, { range: true }), params = [], body;
      if (ast.type !== "Program" || ast.body.length !== 1 || ast.body[0].type !== "ExpressionStatement" || ast.body[0].expression.type !== "ArrowFunctionExpression" && ast.body[0].expression.type !== "FunctionExpression") {
        throw new Error("Failed to resolve function");
      }
      ast.body[0].expression.params.forEach(function(param) {
        params.push(param.name);
      });
      body = ast.body[0].expression.body.range;
      if (ast.body[0].expression.body.type === "BlockStatement") {
        return new Function(params, source.slice(body[0] + 1, body[1] - 1));
      }
      return new Function(params, "return " + source.slice(body[0], body[1]));
    }
    function representJavascriptFunction(object) {
      return object.toString();
    }
    function isFunction(object) {
      return Object.prototype.toString.call(object) === "[object Function]";
    }
    module2.exports = new Type("tag:yaml.org,2002:js/function", {
      kind: "scalar",
      resolve: resolveJavascriptFunction,
      construct: constructJavascriptFunction,
      predicate: isFunction,
      represent: representJavascriptFunction
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/default_full.js
var require_default_full = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/schema/default_full.js"(exports2, module2) {
    "use strict";
    var Schema = require_schema();
    module2.exports = Schema.DEFAULT = new Schema({
      include: [
        require_default_safe()
      ],
      explicit: [
        require_undefined(),
        require_regexp(),
        require_function()
      ]
    });
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/loader.js
var require_loader = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/loader.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var Mark = require_mark();
    var DEFAULT_SAFE_SCHEMA = require_default_safe();
    var DEFAULT_FULL_SCHEMA = require_default_full();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CONTEXT_FLOW_IN = 1;
    var CONTEXT_FLOW_OUT = 2;
    var CONTEXT_BLOCK_IN = 3;
    var CONTEXT_BLOCK_OUT = 4;
    var CHOMPING_CLIP = 1;
    var CHOMPING_STRIP = 2;
    var CHOMPING_KEEP = 3;
    var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
    var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
    var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    function _class(obj) {
      return Object.prototype.toString.call(obj);
    }
    function is_EOL(c2) {
      return c2 === 10 || c2 === 13;
    }
    function is_WHITE_SPACE(c2) {
      return c2 === 9 || c2 === 32;
    }
    function is_WS_OR_EOL(c2) {
      return c2 === 9 || c2 === 32 || c2 === 10 || c2 === 13;
    }
    function is_FLOW_INDICATOR(c2) {
      return c2 === 44 || c2 === 91 || c2 === 93 || c2 === 123 || c2 === 125;
    }
    function fromHexCode(c2) {
      var lc;
      if (48 <= c2 && c2 <= 57) {
        return c2 - 48;
      }
      lc = c2 | 32;
      if (97 <= lc && lc <= 102) {
        return lc - 97 + 10;
      }
      return -1;
    }
    function escapedHexLen(c2) {
      if (c2 === 120) {
        return 2;
      }
      if (c2 === 117) {
        return 4;
      }
      if (c2 === 85) {
        return 8;
      }
      return 0;
    }
    function fromDecimalCode(c2) {
      if (48 <= c2 && c2 <= 57) {
        return c2 - 48;
      }
      return -1;
    }
    function simpleEscapeSequence(c2) {
      return c2 === 48 ? "\0" : c2 === 97 ? "\x07" : c2 === 98 ? "\b" : c2 === 116 ? "	" : c2 === 9 ? "	" : c2 === 110 ? "\n" : c2 === 118 ? "\v" : c2 === 102 ? "\f" : c2 === 114 ? "\r" : c2 === 101 ? "\x1B" : c2 === 32 ? " " : c2 === 34 ? '"' : c2 === 47 ? "/" : c2 === 92 ? "\\" : c2 === 78 ? "\x85" : c2 === 95 ? "\xA0" : c2 === 76 ? "\u2028" : c2 === 80 ? "\u2029" : "";
    }
    function charFromCodepoint(c2) {
      if (c2 <= 65535) {
        return String.fromCharCode(c2);
      }
      return String.fromCharCode(
        (c2 - 65536 >> 10) + 55296,
        (c2 - 65536 & 1023) + 56320
      );
    }
    function setProperty(object, key, value) {
      if (key === "__proto__") {
        Object.defineProperty(object, key, {
          configurable: true,
          enumerable: true,
          writable: true,
          value
        });
      } else {
        object[key] = value;
      }
    }
    var simpleEscapeCheck = new Array(256);
    var simpleEscapeMap = new Array(256);
    for (i = 0; i < 256; i++) {
      simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
      simpleEscapeMap[i] = simpleEscapeSequence(i);
    }
    var i;
    function State(input, options2) {
      this.input = input;
      this.filename = options2["filename"] || null;
      this.schema = options2["schema"] || DEFAULT_FULL_SCHEMA;
      this.onWarning = options2["onWarning"] || null;
      this.legacy = options2["legacy"] || false;
      this.json = options2["json"] || false;
      this.listener = options2["listener"] || null;
      this.implicitTypes = this.schema.compiledImplicit;
      this.typeMap = this.schema.compiledTypeMap;
      this.length = input.length;
      this.position = 0;
      this.line = 0;
      this.lineStart = 0;
      this.lineIndent = 0;
      this.documents = [];
    }
    function generateError(state, message) {
      return new YAMLException(
        message,
        new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart)
      );
    }
    function throwError(state, message) {
      throw generateError(state, message);
    }
    function throwWarning(state, message) {
      if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
      }
    }
    var directiveHandlers = {
      YAML: function handleYamlDirective(state, name, args) {
        var match, major, minor;
        if (state.version !== null) {
          throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
          throwError(state, "YAML directive accepts exactly one argument");
        }
        match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
          throwError(state, "ill-formed argument of the YAML directive");
        }
        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);
        if (major !== 1) {
          throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
          throwWarning(state, "unsupported YAML version of the document");
        }
      },
      TAG: function handleTagDirective(state, name, args) {
        var handle, prefix;
        if (args.length !== 2) {
          throwError(state, "TAG directive accepts exactly two arguments");
        }
        handle = args[0];
        prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
          throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty.call(state.tagMap, handle)) {
          throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
          throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        state.tagMap[handle] = prefix;
      }
    };
    function captureSegment(state, start, end, checkJson) {
      var _position, _length, _character, _result;
      if (start < end) {
        _result = state.input.slice(start, end);
        if (checkJson) {
          for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
            _character = _result.charCodeAt(_position);
            if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
              throwError(state, "expected valid JSON character");
            }
          }
        } else if (PATTERN_NON_PRINTABLE.test(_result)) {
          throwError(state, "the stream contains non-printable characters");
        }
        state.result += _result;
      }
    }
    function mergeMappings(state, destination, source, overridableKeys) {
      var sourceKeys, key, index, quantity;
      if (!common.isObject(source)) {
        throwError(state, "cannot merge mappings; the provided source object is unacceptable");
      }
      sourceKeys = Object.keys(source);
      for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
        key = sourceKeys[index];
        if (!_hasOwnProperty.call(destination, key)) {
          setProperty(destination, key, source[key]);
          overridableKeys[key] = true;
        }
      }
    }
    function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
      var index, quantity;
      if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
          if (Array.isArray(keyNode[index])) {
            throwError(state, "nested arrays are not supported inside keys");
          }
          if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
            keyNode[index] = "[object Object]";
          }
        }
      }
      if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
      }
      keyNode = String(keyNode);
      if (_result === null) {
        _result = {};
      }
      if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
          for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
            mergeMappings(state, _result, valueNode[index], overridableKeys);
          }
        } else {
          mergeMappings(state, _result, valueNode, overridableKeys);
        }
      } else {
        if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
          state.line = startLine || state.line;
          state.position = startPos || state.position;
          throwError(state, "duplicated mapping key");
        }
        setProperty(_result, keyNode, valueNode);
        delete overridableKeys[keyNode];
      }
      return _result;
    }
    function readLineBreak(state) {
      var ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 10) {
        state.position++;
      } else if (ch === 13) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 10) {
          state.position++;
        }
      } else {
        throwError(state, "a line break is expected");
      }
      state.line += 1;
      state.lineStart = state.position;
    }
    function skipSeparationSpace(state, allowComments, checkIndent) {
      var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 10 && ch !== 13 && ch !== 0);
        }
        if (is_EOL(ch)) {
          readLineBreak(state);
          ch = state.input.charCodeAt(state.position);
          lineBreaks++;
          state.lineIndent = 0;
          while (ch === 32) {
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
          }
        } else {
          break;
        }
      }
      if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
      }
      return lineBreaks;
    }
    function testDocumentSeparator(state) {
      var _position = state.position, ch;
      ch = state.input.charCodeAt(_position);
      if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || is_WS_OR_EOL(ch)) {
          return true;
        }
      }
      return false;
    }
    function writeFoldedLines(state, count3) {
      if (count3 === 1) {
        state.result += " ";
      } else if (count3 > 1) {
        state.result += common.repeat("\n", count3 - 1);
      }
    }
    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
      var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
      ch = state.input.charCodeAt(state.position);
      if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
        return false;
      }
      if (ch === 63 || ch === 45) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          return false;
        }
      }
      state.kind = "scalar";
      state.result = "";
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
      while (ch !== 0) {
        if (ch === 58) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
            break;
          }
        } else if (ch === 35) {
          preceding = state.input.charCodeAt(state.position - 1);
          if (is_WS_OR_EOL(preceding)) {
            break;
          }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
          break;
        } else if (is_EOL(ch)) {
          _line = state.line;
          _lineStart = state.lineStart;
          _lineIndent = state.lineIndent;
          skipSeparationSpace(state, false, -1);
          if (state.lineIndent >= nodeIndent) {
            hasPendingContent = true;
            ch = state.input.charCodeAt(state.position);
            continue;
          } else {
            state.position = captureEnd;
            state.line = _line;
            state.lineStart = _lineStart;
            state.lineIndent = _lineIndent;
            break;
          }
        }
        if (hasPendingContent) {
          captureSegment(state, captureStart, captureEnd, false);
          writeFoldedLines(state, state.line - _line);
          captureStart = captureEnd = state.position;
          hasPendingContent = false;
        }
        if (!is_WHITE_SPACE(ch)) {
          captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, captureEnd, false);
      if (state.result) {
        return true;
      }
      state.kind = _kind;
      state.result = _result;
      return false;
    }
    function readSingleQuotedScalar(state, nodeIndent) {
      var ch, captureStart, captureEnd;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 39) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 39) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (ch === 39) {
            captureStart = state.position;
            state.position++;
            captureEnd = state.position;
          } else {
            return true;
          }
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a single quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state, nodeIndent) {
      var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 34) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 34) {
          captureSegment(state, captureStart, state.position, true);
          state.position++;
          return true;
        } else if (ch === 92) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (is_EOL(ch)) {
            skipSeparationSpace(state, false, nodeIndent);
          } else if (ch < 256 && simpleEscapeCheck[ch]) {
            state.result += simpleEscapeMap[ch];
            state.position++;
          } else if ((tmp = escapedHexLen(ch)) > 0) {
            hexLength = tmp;
            hexResult = 0;
            for (; hexLength > 0; hexLength--) {
              ch = state.input.charCodeAt(++state.position);
              if ((tmp = fromHexCode(ch)) >= 0) {
                hexResult = (hexResult << 4) + tmp;
              } else {
                throwError(state, "expected hexadecimal character");
              }
            }
            state.result += charFromCodepoint(hexResult);
            state.position++;
          } else {
            throwError(state, "unknown escape sequence");
          }
          captureStart = captureEnd = state.position;
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a double quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state, nodeIndent) {
      var readNext = true, _line, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = {}, keyNode, keyTag, valueNode, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 91) {
        terminator = 93;
        isMapping = false;
        _result = [];
      } else if (ch === 123) {
        terminator = 125;
        isMapping = true;
        _result = {};
      } else {
        return false;
      }
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(++state.position);
      while (ch !== 0) {
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
          state.position++;
          state.tag = _tag;
          state.anchor = _anchor;
          state.kind = isMapping ? "mapping" : "sequence";
          state.result = _result;
          return true;
        } else if (!readNext) {
          throwError(state, "missed comma between flow collection entries");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 63) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following)) {
            isPair = isExplicitPair = true;
            state.position++;
            skipSeparationSpace(state, true, nodeIndent);
          }
        }
        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state.tag;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === _line) && ch === 58) {
          isPair = true;
          ch = state.input.charCodeAt(++state.position);
          skipSeparationSpace(state, true, nodeIndent);
          composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state.result;
        }
        if (isMapping) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
        } else if (isPair) {
          _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
        } else {
          _result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 44) {
          readNext = true;
          ch = state.input.charCodeAt(++state.position);
        } else {
          readNext = false;
        }
      }
      throwError(state, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state, nodeIndent) {
      var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 124) {
        folding = false;
      } else if (ch === 62) {
        folding = true;
      } else {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      while (ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
        if (ch === 43 || ch === 45) {
          if (CHOMPING_CLIP === chomping) {
            chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
          } else {
            throwError(state, "repeat of a chomping mode identifier");
          }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
          if (tmp === 0) {
            throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
          } else if (!detectedIndent) {
            textIndent = nodeIndent + tmp - 1;
            detectedIndent = true;
          } else {
            throwError(state, "repeat of an indentation width identifier");
          }
        } else {
          break;
        }
      }
      if (is_WHITE_SPACE(ch)) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (is_WHITE_SPACE(ch));
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (!is_EOL(ch) && ch !== 0);
        }
      }
      while (ch !== 0) {
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
          textIndent = state.lineIndent;
        }
        if (is_EOL(ch)) {
          emptyLines++;
          continue;
        }
        if (state.lineIndent < textIndent) {
          if (chomping === CHOMPING_KEEP) {
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (chomping === CHOMPING_CLIP) {
            if (didReadContent) {
              state.result += "\n";
            }
          }
          break;
        }
        if (folding) {
          if (is_WHITE_SPACE(ch)) {
            atMoreIndented = true;
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (atMoreIndented) {
            atMoreIndented = false;
            state.result += common.repeat("\n", emptyLines + 1);
          } else if (emptyLines === 0) {
            if (didReadContent) {
              state.result += " ";
            }
          } else {
            state.result += common.repeat("\n", emptyLines);
          }
        } else {
          state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        captureStart = state.position;
        while (!is_EOL(ch) && ch !== 0) {
          ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
      }
      return true;
    }
    function readBlockSequence(state, nodeIndent) {
      var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        if (ch !== 45) {
          break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!is_WS_OR_EOL(following)) {
          break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
          if (state.lineIndent <= nodeIndent) {
            _result.push(null);
            ch = state.input.charCodeAt(state.position);
            continue;
          }
        }
        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        _result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
          throwError(state, "bad indentation of a sequence entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "sequence";
        state.result = _result;
        return true;
      }
      return false;
    }
    function readBlockMapping(state, nodeIndent, flowIndent) {
      var following, allowCompact, _line, _pos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = {}, keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        following = state.input.charCodeAt(state.position + 1);
        _line = state.line;
        _pos = state.position;
        if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
          if (ch === 63) {
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = true;
            allowCompact = true;
          } else if (atExplicitKey) {
            atExplicitKey = false;
            allowCompact = true;
          } else {
            throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
          }
          state.position += 1;
          ch = following;
        } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          if (state.line === _line) {
            ch = state.input.charCodeAt(state.position);
            while (is_WHITE_SPACE(ch)) {
              ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 58) {
              ch = state.input.charCodeAt(++state.position);
              if (!is_WS_OR_EOL(ch)) {
                throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
              }
              if (atExplicitKey) {
                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
                keyTag = keyNode = valueNode = null;
              }
              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state.tag;
              keyNode = state.result;
            } else if (detected) {
              throwError(state, "can not read an implicit mapping pair; a colon is missed");
            } else {
              state.tag = _tag;
              state.anchor = _anchor;
              return true;
            }
          } else if (detected) {
            throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else {
          break;
        }
        if (state.line === _line || state.lineIndent > nodeIndent) {
          if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
            if (atExplicitKey) {
              keyNode = state.result;
            } else {
              valueNode = state.result;
            }
          }
          if (!atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
            keyTag = keyNode = valueNode = null;
          }
          skipSeparationSpace(state, true, -1);
          ch = state.input.charCodeAt(state.position);
        }
        if (state.lineIndent > nodeIndent && ch !== 0) {
          throwError(state, "bad indentation of a mapping entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "mapping";
        state.result = _result;
      }
      return detected;
    }
    function readTagProperty(state) {
      var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 33) return false;
      if (state.tag !== null) {
        throwError(state, "duplication of a tag property");
      }
      ch = state.input.charCodeAt(++state.position);
      if (ch === 60) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
      } else if (ch === 33) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
      } else {
        tagHandle = "!";
      }
      _position = state.position;
      if (isVerbatim) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && ch !== 62);
        if (state.position < state.length) {
          tagName = state.input.slice(_position, state.position);
          ch = state.input.charCodeAt(++state.position);
        } else {
          throwError(state, "unexpected end of the stream within a verbatim tag");
        }
      } else {
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          if (ch === 33) {
            if (!isNamed) {
              tagHandle = state.input.slice(_position - 1, state.position + 1);
              if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                throwError(state, "named tag handle cannot contain such characters");
              }
              isNamed = true;
              _position = state.position + 1;
            } else {
              throwError(state, "tag suffix cannot contain exclamation marks");
            }
          }
          ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(_position, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
          throwError(state, "tag suffix cannot contain flow indicator characters");
        }
      }
      if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        throwError(state, "tag name cannot contain such characters: " + tagName);
      }
      if (isVerbatim) {
        state.tag = tagName;
      } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
      } else if (tagHandle === "!") {
        state.tag = "!" + tagName;
      } else if (tagHandle === "!!") {
        state.tag = "tag:yaml.org,2002:" + tagName;
      } else {
        throwError(state, 'undeclared tag handle "' + tagHandle + '"');
      }
      return true;
    }
    function readAnchorProperty(state) {
      var _position, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 38) return false;
      if (state.anchor !== null) {
        throwError(state, "duplication of an anchor property");
      }
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an anchor node must contain at least one character");
      }
      state.anchor = state.input.slice(_position, state.position);
      return true;
    }
    function readAlias(state) {
      var _position, alias, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 42) return false;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an alias node must contain at least one character");
      }
      alias = state.input.slice(_position, state.position);
      if (!_hasOwnProperty.call(state.anchorMap, alias)) {
        throwError(state, 'unidentified alias "' + alias + '"');
      }
      state.result = state.anchorMap[alias];
      skipSeparationSpace(state, true, -1);
      return true;
    }
    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
      var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, type, flowIndent, blockIndent;
      if (state.listener !== null) {
        state.listener("open", state);
      }
      state.tag = null;
      state.anchor = null;
      state.kind = null;
      state.result = null;
      allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
      if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        }
      }
      if (indentStatus === 1) {
        while (readTagProperty(state) || readAnchorProperty(state)) {
          if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            allowBlockCollections = allowBlockStyles;
            if (state.lineIndent > parentIndent) {
              indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
              indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
              indentStatus = -1;
            }
          } else {
            allowBlockCollections = false;
          }
        }
      }
      if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
      }
      if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
        if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
          flowIndent = parentIndent;
        } else {
          flowIndent = parentIndent + 1;
        }
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
          if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
            hasContent = true;
          } else {
            if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
              hasContent = true;
            } else if (readAlias(state)) {
              hasContent = true;
              if (state.tag !== null || state.anchor !== null) {
                throwError(state, "alias node should not have any properties");
              }
            } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
              hasContent = true;
              if (state.tag === null) {
                state.tag = "?";
              }
            }
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else if (indentStatus === 0) {
          hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
      }
      if (state.tag !== null && state.tag !== "!") {
        if (state.tag === "?") {
          if (state.result !== null && state.kind !== "scalar") {
            throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
          }
          for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
            type = state.implicitTypes[typeIndex];
            if (type.resolve(state.result)) {
              state.result = type.construct(state.result);
              state.tag = type.tag;
              if (state.anchor !== null) {
                state.anchorMap[state.anchor] = state.result;
              }
              break;
            }
          }
        } else if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
          type = state.typeMap[state.kind || "fallback"][state.tag];
          if (state.result !== null && type.kind !== state.kind) {
            throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
          }
          if (!type.resolve(state.result)) {
            throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
          } else {
            state.result = type.construct(state.result);
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else {
          throwError(state, "unknown tag !<" + state.tag + ">");
        }
      }
      if (state.listener !== null) {
        state.listener("close", state);
      }
      return state.tag !== null || state.anchor !== null || hasContent;
    }
    function readDocument(state) {
      var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
      state.version = null;
      state.checkLineBreaks = state.legacy;
      state.tagMap = {};
      state.anchorMap = {};
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 37) {
          break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(_position, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
          throwError(state, "directive name must not be less than one character in length");
        }
        while (ch !== 0) {
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 35) {
            do {
              ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0 && !is_EOL(ch));
            break;
          }
          if (is_EOL(ch)) break;
          _position = state.position;
          while (ch !== 0 && !is_WS_OR_EOL(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          directiveArgs.push(state.input.slice(_position, state.position));
        }
        if (ch !== 0) readLineBreak(state);
        if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
          directiveHandlers[directiveName](state, directiveName, directiveArgs);
        } else {
          throwWarning(state, 'unknown document directive "' + directiveName + '"');
        }
      }
      skipSeparationSpace(state, true, -1);
      if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      } else if (hasDirectives) {
        throwError(state, "directives end mark is expected");
      }
      composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
      skipSeparationSpace(state, true, -1);
      if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
      }
      state.documents.push(state.result);
      if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 46) {
          state.position += 3;
          skipSeparationSpace(state, true, -1);
        }
        return;
      }
      if (state.position < state.length - 1) {
        throwError(state, "end of the stream or a document separator is expected");
      } else {
        return;
      }
    }
    function loadDocuments(input, options2) {
      input = String(input);
      options2 = options2 || {};
      if (input.length !== 0) {
        if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
          input += "\n";
        }
        if (input.charCodeAt(0) === 65279) {
          input = input.slice(1);
        }
      }
      var state = new State(input, options2);
      var nullpos = input.indexOf("\0");
      if (nullpos !== -1) {
        state.position = nullpos;
        throwError(state, "null byte is not allowed in input");
      }
      state.input += "\0";
      while (state.input.charCodeAt(state.position) === 32) {
        state.lineIndent += 1;
        state.position += 1;
      }
      while (state.position < state.length - 1) {
        readDocument(state);
      }
      return state.documents;
    }
    function loadAll(input, iterator, options2) {
      if (iterator !== null && typeof iterator === "object" && typeof options2 === "undefined") {
        options2 = iterator;
        iterator = null;
      }
      var documents = loadDocuments(input, options2);
      if (typeof iterator !== "function") {
        return documents;
      }
      for (var index = 0, length = documents.length; index < length; index += 1) {
        iterator(documents[index]);
      }
    }
    function load7(input, options2) {
      var documents = loadDocuments(input, options2);
      if (documents.length === 0) {
        return void 0;
      } else if (documents.length === 1) {
        return documents[0];
      }
      throw new YAMLException("expected a single document in the stream, but found more");
    }
    function safeLoadAll(input, iterator, options2) {
      if (typeof iterator === "object" && iterator !== null && typeof options2 === "undefined") {
        options2 = iterator;
        iterator = null;
      }
      return loadAll(input, iterator, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
    }
    function safeLoad(input, options2) {
      return load7(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
    }
    module2.exports.loadAll = loadAll;
    module2.exports.load = load7;
    module2.exports.safeLoadAll = safeLoadAll;
    module2.exports.safeLoad = safeLoad;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/dumper.js
var require_dumper = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml/dumper.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var DEFAULT_FULL_SCHEMA = require_default_full();
    var DEFAULT_SAFE_SCHEMA = require_default_safe();
    var _toString = Object.prototype.toString;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CHAR_TAB = 9;
    var CHAR_LINE_FEED = 10;
    var CHAR_CARRIAGE_RETURN = 13;
    var CHAR_SPACE = 32;
    var CHAR_EXCLAMATION = 33;
    var CHAR_DOUBLE_QUOTE = 34;
    var CHAR_SHARP = 35;
    var CHAR_PERCENT = 37;
    var CHAR_AMPERSAND = 38;
    var CHAR_SINGLE_QUOTE = 39;
    var CHAR_ASTERISK = 42;
    var CHAR_COMMA = 44;
    var CHAR_MINUS = 45;
    var CHAR_COLON = 58;
    var CHAR_EQUALS = 61;
    var CHAR_GREATER_THAN = 62;
    var CHAR_QUESTION = 63;
    var CHAR_COMMERCIAL_AT = 64;
    var CHAR_LEFT_SQUARE_BRACKET = 91;
    var CHAR_RIGHT_SQUARE_BRACKET = 93;
    var CHAR_GRAVE_ACCENT = 96;
    var CHAR_LEFT_CURLY_BRACKET = 123;
    var CHAR_VERTICAL_LINE = 124;
    var CHAR_RIGHT_CURLY_BRACKET = 125;
    var ESCAPE_SEQUENCES = {};
    ESCAPE_SEQUENCES[0] = "\\0";
    ESCAPE_SEQUENCES[7] = "\\a";
    ESCAPE_SEQUENCES[8] = "\\b";
    ESCAPE_SEQUENCES[9] = "\\t";
    ESCAPE_SEQUENCES[10] = "\\n";
    ESCAPE_SEQUENCES[11] = "\\v";
    ESCAPE_SEQUENCES[12] = "\\f";
    ESCAPE_SEQUENCES[13] = "\\r";
    ESCAPE_SEQUENCES[27] = "\\e";
    ESCAPE_SEQUENCES[34] = '\\"';
    ESCAPE_SEQUENCES[92] = "\\\\";
    ESCAPE_SEQUENCES[133] = "\\N";
    ESCAPE_SEQUENCES[160] = "\\_";
    ESCAPE_SEQUENCES[8232] = "\\L";
    ESCAPE_SEQUENCES[8233] = "\\P";
    var DEPRECATED_BOOLEANS_SYNTAX = [
      "y",
      "Y",
      "yes",
      "Yes",
      "YES",
      "on",
      "On",
      "ON",
      "n",
      "N",
      "no",
      "No",
      "NO",
      "off",
      "Off",
      "OFF"
    ];
    function compileStyleMap(schema, map) {
      var result, keys, index, length, tag, style, type;
      if (map === null) return {};
      result = {};
      keys = Object.keys(map);
      for (index = 0, length = keys.length; index < length; index += 1) {
        tag = keys[index];
        style = String(map[tag]);
        if (tag.slice(0, 2) === "!!") {
          tag = "tag:yaml.org,2002:" + tag.slice(2);
        }
        type = schema.compiledTypeMap["fallback"][tag];
        if (type && _hasOwnProperty.call(type.styleAliases, style)) {
          style = type.styleAliases[style];
        }
        result[tag] = style;
      }
      return result;
    }
    function encodeHex(character) {
      var string, handle, length;
      string = character.toString(16).toUpperCase();
      if (character <= 255) {
        handle = "x";
        length = 2;
      } else if (character <= 65535) {
        handle = "u";
        length = 4;
      } else if (character <= 4294967295) {
        handle = "U";
        length = 8;
      } else {
        throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
      }
      return "\\" + handle + common.repeat("0", length - string.length) + string;
    }
    function State(options2) {
      this.schema = options2["schema"] || DEFAULT_FULL_SCHEMA;
      this.indent = Math.max(1, options2["indent"] || 2);
      this.noArrayIndent = options2["noArrayIndent"] || false;
      this.skipInvalid = options2["skipInvalid"] || false;
      this.flowLevel = common.isNothing(options2["flowLevel"]) ? -1 : options2["flowLevel"];
      this.styleMap = compileStyleMap(this.schema, options2["styles"] || null);
      this.sortKeys = options2["sortKeys"] || false;
      this.lineWidth = options2["lineWidth"] || 80;
      this.noRefs = options2["noRefs"] || false;
      this.noCompatMode = options2["noCompatMode"] || false;
      this.condenseFlow = options2["condenseFlow"] || false;
      this.implicitTypes = this.schema.compiledImplicit;
      this.explicitTypes = this.schema.compiledExplicit;
      this.tag = null;
      this.result = "";
      this.duplicates = [];
      this.usedDuplicates = null;
    }
    function indentString(string, spaces) {
      var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
      while (position < length) {
        next = string.indexOf("\n", position);
        if (next === -1) {
          line = string.slice(position);
          position = length;
        } else {
          line = string.slice(position, next + 1);
          position = next + 1;
        }
        if (line.length && line !== "\n") result += ind;
        result += line;
      }
      return result;
    }
    function generateNextLine(state, level) {
      return "\n" + common.repeat(" ", state.indent * level);
    }
    function testImplicitResolving(state, str2) {
      var index, length, type;
      for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
        type = state.implicitTypes[index];
        if (type.resolve(str2)) {
          return true;
        }
      }
      return false;
    }
    function isWhitespace(c2) {
      return c2 === CHAR_SPACE || c2 === CHAR_TAB;
    }
    function isPrintable(c2) {
      return 32 <= c2 && c2 <= 126 || 161 <= c2 && c2 <= 55295 && c2 !== 8232 && c2 !== 8233 || 57344 <= c2 && c2 <= 65533 && c2 !== 65279 || 65536 <= c2 && c2 <= 1114111;
    }
    function isNsChar(c2) {
      return isPrintable(c2) && !isWhitespace(c2) && c2 !== 65279 && c2 !== CHAR_CARRIAGE_RETURN && c2 !== CHAR_LINE_FEED;
    }
    function isPlainSafe(c2, prev) {
      return isPrintable(c2) && c2 !== 65279 && c2 !== CHAR_COMMA && c2 !== CHAR_LEFT_SQUARE_BRACKET && c2 !== CHAR_RIGHT_SQUARE_BRACKET && c2 !== CHAR_LEFT_CURLY_BRACKET && c2 !== CHAR_RIGHT_CURLY_BRACKET && c2 !== CHAR_COLON && (c2 !== CHAR_SHARP || prev && isNsChar(prev));
    }
    function isPlainSafeFirst(c2) {
      return isPrintable(c2) && c2 !== 65279 && !isWhitespace(c2) && c2 !== CHAR_MINUS && c2 !== CHAR_QUESTION && c2 !== CHAR_COLON && c2 !== CHAR_COMMA && c2 !== CHAR_LEFT_SQUARE_BRACKET && c2 !== CHAR_RIGHT_SQUARE_BRACKET && c2 !== CHAR_LEFT_CURLY_BRACKET && c2 !== CHAR_RIGHT_CURLY_BRACKET && c2 !== CHAR_SHARP && c2 !== CHAR_AMPERSAND && c2 !== CHAR_ASTERISK && c2 !== CHAR_EXCLAMATION && c2 !== CHAR_VERTICAL_LINE && c2 !== CHAR_EQUALS && c2 !== CHAR_GREATER_THAN && c2 !== CHAR_SINGLE_QUOTE && c2 !== CHAR_DOUBLE_QUOTE && c2 !== CHAR_PERCENT && c2 !== CHAR_COMMERCIAL_AT && c2 !== CHAR_GRAVE_ACCENT;
    }
    function needIndentIndicator(string) {
      var leadingSpaceRe = /^\n* /;
      return leadingSpaceRe.test(string);
    }
    var STYLE_PLAIN = 1;
    var STYLE_SINGLE = 2;
    var STYLE_LITERAL = 3;
    var STYLE_FOLDED = 4;
    var STYLE_DOUBLE = 5;
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
      var i;
      var char, prev_char;
      var hasLineBreak = false;
      var hasFoldableLine = false;
      var shouldTrackWidth = lineWidth !== -1;
      var previousLineBreak = -1;
      var plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
      if (singleLineOnly) {
        for (i = 0; i < string.length; i++) {
          char = string.charCodeAt(i);
          if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
          plain = plain && isPlainSafe(char, prev_char);
        }
      } else {
        for (i = 0; i < string.length; i++) {
          char = string.charCodeAt(i);
          if (char === CHAR_LINE_FEED) {
            hasLineBreak = true;
            if (shouldTrackWidth) {
              hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
              i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
              previousLineBreak = i;
            }
          } else if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          prev_char = i > 0 ? string.charCodeAt(i - 1) : null;
          plain = plain && isPlainSafe(char, prev_char);
        }
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
      }
      if (!hasLineBreak && !hasFoldableLine) {
        return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
      }
      if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
      }
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    function writeScalar(state, string, level, iskey) {
      state.dump = (function() {
        if (string.length === 0) {
          return "''";
        }
        if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
          return "'" + string + "'";
        }
        var indent = state.indent * Math.max(1, level);
        var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(string2) {
          return testImplicitResolving(state, string2);
        }
        switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
          case STYLE_PLAIN:
            return string;
          case STYLE_SINGLE:
            return "'" + string.replace(/'/g, "''") + "'";
          case STYLE_LITERAL:
            return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
          case STYLE_FOLDED:
            return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
          case STYLE_DOUBLE:
            return '"' + escapeString(string, lineWidth) + '"';
          default:
            throw new YAMLException("impossible error: invalid scalar style");
        }
      })();
    }
    function blockHeader(string, indentPerLevel) {
      var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
      var clip = string[string.length - 1] === "\n";
      var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
      var chomp = keep ? "+" : clip ? "" : "-";
      return indentIndicator + chomp + "\n";
    }
    function dropEndingNewline(string) {
      return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
    }
    function foldString(string, width) {
      var lineRe = /(\n+)([^\n]*)/g;
      var result = (function() {
        var nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
      })();
      var prevMoreIndented = string[0] === "\n" || string[0] === " ";
      var moreIndented;
      var match;
      while (match = lineRe.exec(string)) {
        var prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
        prevMoreIndented = moreIndented;
      }
      return result;
    }
    function foldLine(line, width) {
      if (line === "" || line[0] === " ") return line;
      var breakRe = / [^ ]/g;
      var match;
      var start = 0, end, curr = 0, next = 0;
      var result = "";
      while (match = breakRe.exec(line)) {
        next = match.index;
        if (next - start > width) {
          end = curr > start ? curr : next;
          result += "\n" + line.slice(start, end);
          start = end + 1;
        }
        curr = next;
      }
      result += "\n";
      if (line.length - start > width && curr > start) {
        result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
      } else {
        result += line.slice(start);
      }
      return result.slice(1);
    }
    function escapeString(string) {
      var result = "";
      var char, nextChar;
      var escapeSeq;
      for (var i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (char >= 55296 && char <= 56319) {
          nextChar = string.charCodeAt(i + 1);
          if (nextChar >= 56320 && nextChar <= 57343) {
            result += encodeHex((char - 55296) * 1024 + nextChar - 56320 + 65536);
            i++;
            continue;
          }
        }
        escapeSeq = ESCAPE_SEQUENCES[char];
        result += !escapeSeq && isPrintable(char) ? string[i] : escapeSeq || encodeHex(char);
      }
      return result;
    }
    function writeFlowSequence(state, level, object) {
      var _result = "", _tag = state.tag, index, length;
      for (index = 0, length = object.length; index < length; index += 1) {
        if (writeNode(state, level, object[index], false, false)) {
          if (index !== 0) _result += "," + (!state.condenseFlow ? " " : "");
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = "[" + _result + "]";
    }
    function writeBlockSequence(state, level, object, compact) {
      var _result = "", _tag = state.tag, index, length;
      for (index = 0, length = object.length; index < length; index += 1) {
        if (writeNode(state, level + 1, object[index], true, true)) {
          if (!compact || index !== 0) {
            _result += generateNextLine(state, level);
          }
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            _result += "-";
          } else {
            _result += "- ";
          }
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = _result || "[]";
    }
    function writeFlowMapping(state, level, object) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (index !== 0) pairBuffer += ", ";
        if (state.condenseFlow) pairBuffer += '"';
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level, objectKey, false, false)) {
          continue;
        }
        if (state.dump.length > 1024) pairBuffer += "? ";
        pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
        if (!writeNode(state, level, objectValue, false, false)) {
          continue;
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = "{" + _result + "}";
    }
    function writeBlockMapping(state, level, object, compact) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
      if (state.sortKeys === true) {
        objectKeyList.sort();
      } else if (typeof state.sortKeys === "function") {
        objectKeyList.sort(state.sortKeys);
      } else if (state.sortKeys) {
        throw new YAMLException("sortKeys must be a boolean or a function");
      }
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (!compact || index !== 0) {
          pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
          continue;
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += "?";
          } else {
            pairBuffer += "? ";
          }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
          pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
          continue;
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += ":";
        } else {
          pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = _result || "{}";
    }
    function detectType(state, object, explicit) {
      var _result, typeList, index, length, type, style;
      typeList = explicit ? state.explicitTypes : state.implicitTypes;
      for (index = 0, length = typeList.length; index < length; index += 1) {
        type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
          state.tag = explicit ? type.tag : "?";
          if (type.represent) {
            style = state.styleMap[type.tag] || type.defaultStyle;
            if (_toString.call(type.represent) === "[object Function]") {
              _result = type.represent(object, style);
            } else if (_hasOwnProperty.call(type.represent, style)) {
              _result = type.represent[style](object, style);
            } else {
              throw new YAMLException("!<" + type.tag + '> tag resolver accepts not "' + style + '" style');
            }
            state.dump = _result;
          }
          return true;
        }
      }
      return false;
    }
    function writeNode(state, level, object, block, compact, iskey) {
      state.tag = null;
      state.dump = object;
      if (!detectType(state, object, false)) {
        detectType(state, object, true);
      }
      var type = _toString.call(state.dump);
      if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
      }
      var objectOrArray = type === "[object Object]" || type === "[object Array]", duplicateIndex, duplicate;
      if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
      }
      if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
      }
      if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = "*ref_" + duplicateIndex;
      } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
          state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
          if (block && Object.keys(state.dump).length !== 0) {
            writeBlockMapping(state, level, state.dump, compact);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowMapping(state, level, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object Array]") {
          var arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
          if (block && state.dump.length !== 0) {
            writeBlockSequence(state, arrayLevel, state.dump, compact);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowSequence(state, arrayLevel, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object String]") {
          if (state.tag !== "?") {
            writeScalar(state, state.dump, level, iskey);
          }
        } else {
          if (state.skipInvalid) return false;
          throw new YAMLException("unacceptable kind of an object to dump " + type);
        }
        if (state.tag !== null && state.tag !== "?") {
          state.dump = "!<" + state.tag + "> " + state.dump;
        }
      }
      return true;
    }
    function getDuplicateReferences(object, state) {
      var objects = [], duplicatesIndexes = [], index, length;
      inspectNode(object, objects, duplicatesIndexes);
      for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
        state.duplicates.push(objects[duplicatesIndexes[index]]);
      }
      state.usedDuplicates = new Array(length);
    }
    function inspectNode(object, objects, duplicatesIndexes) {
      var objectKeyList, index, length;
      if (object !== null && typeof object === "object") {
        index = objects.indexOf(object);
        if (index !== -1) {
          if (duplicatesIndexes.indexOf(index) === -1) {
            duplicatesIndexes.push(index);
          }
        } else {
          objects.push(object);
          if (Array.isArray(object)) {
            for (index = 0, length = object.length; index < length; index += 1) {
              inspectNode(object[index], objects, duplicatesIndexes);
            }
          } else {
            objectKeyList = Object.keys(object);
            for (index = 0, length = objectKeyList.length; index < length; index += 1) {
              inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
            }
          }
        }
      }
    }
    function dump(input, options2) {
      options2 = options2 || {};
      var state = new State(options2);
      if (!state.noRefs) getDuplicateReferences(input, state);
      if (writeNode(state, 0, input, true, true)) return state.dump + "\n";
      return "";
    }
    function safeDump(input, options2) {
      return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options2));
    }
    module2.exports.dump = dump;
    module2.exports.safeDump = safeDump;
  }
});

// node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml.js
var require_js_yaml = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/lib/js-yaml.js"(exports2, module2) {
    "use strict";
    var loader = require_loader();
    var dumper = require_dumper();
    function deprecated(name) {
      return function() {
        throw new Error("Function " + name + " is deprecated and cannot be used.");
      };
    }
    module2.exports.Type = require_type();
    module2.exports.Schema = require_schema();
    module2.exports.FAILSAFE_SCHEMA = require_failsafe();
    module2.exports.JSON_SCHEMA = require_json();
    module2.exports.CORE_SCHEMA = require_core();
    module2.exports.DEFAULT_SAFE_SCHEMA = require_default_safe();
    module2.exports.DEFAULT_FULL_SCHEMA = require_default_full();
    module2.exports.load = loader.load;
    module2.exports.loadAll = loader.loadAll;
    module2.exports.safeLoad = loader.safeLoad;
    module2.exports.safeLoadAll = loader.safeLoadAll;
    module2.exports.dump = dumper.dump;
    module2.exports.safeDump = dumper.safeDump;
    module2.exports.YAMLException = require_exception();
    module2.exports.MINIMAL_SCHEMA = require_failsafe();
    module2.exports.SAFE_SCHEMA = require_default_safe();
    module2.exports.DEFAULT_SCHEMA = require_default_full();
    module2.exports.scan = deprecated("scan");
    module2.exports.parse = deprecated("parse");
    module2.exports.compose = deprecated("compose");
    module2.exports.addConstructor = deprecated("addConstructor");
  }
});

// node_modules/gray-matter/node_modules/js-yaml/index.js
var require_js_yaml2 = __commonJS({
  "node_modules/gray-matter/node_modules/js-yaml/index.js"(exports2, module2) {
    "use strict";
    var yaml2 = require_js_yaml();
    module2.exports = yaml2;
  }
});

// node_modules/gray-matter/lib/engines.js
var require_engines = __commonJS({
  "node_modules/gray-matter/lib/engines.js"(exports, module) {
    "use strict";
    var yaml = require_js_yaml2();
    var engines = exports = module.exports;
    engines.yaml = {
      parse: yaml.safeLoad.bind(yaml),
      stringify: yaml.safeDump.bind(yaml)
    };
    engines.json = {
      parse: JSON.parse.bind(JSON),
      stringify: function(obj, options2) {
        const opts = Object.assign({ replacer: null, space: 2 }, options2);
        return JSON.stringify(obj, opts.replacer, opts.space);
      }
    };
    engines.javascript = {
      parse: function parse(str, options, wrap) {
        try {
          if (wrap !== false) {
            str = "(function() {\nreturn " + str.trim() + ";\n}());";
          }
          return eval(str) || {};
        } catch (err) {
          if (wrap !== false && /(unexpected|identifier)/i.test(err.message)) {
            return parse(str, options, false);
          }
          throw new SyntaxError(err);
        }
      },
      stringify: function() {
        throw new Error("stringifying JavaScript is not supported");
      }
    };
  }
});

// node_modules/strip-bom-string/index.js
var require_strip_bom_string = __commonJS({
  "node_modules/strip-bom-string/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(str2) {
      if (typeof str2 === "string" && str2.charAt(0) === "\uFEFF") {
        return str2.slice(1);
      }
      return str2;
    };
  }
});

// node_modules/gray-matter/lib/utils.js
var require_utils = __commonJS({
  "node_modules/gray-matter/lib/utils.js"(exports2) {
    "use strict";
    var stripBom = require_strip_bom_string();
    var typeOf = require_kind_of();
    exports2.define = function(obj, key, val) {
      Reflect.defineProperty(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: val
      });
    };
    exports2.isBuffer = function(val) {
      return typeOf(val) === "buffer";
    };
    exports2.isObject = function(val) {
      return typeOf(val) === "object";
    };
    exports2.toBuffer = function(input) {
      return typeof input === "string" ? Buffer.from(input) : input;
    };
    exports2.toString = function(input) {
      if (exports2.isBuffer(input)) return stripBom(String(input));
      if (typeof input !== "string") {
        throw new TypeError("expected input to be a string or buffer");
      }
      return stripBom(input);
    };
    exports2.arrayify = function(val) {
      return val ? Array.isArray(val) ? val : [val] : [];
    };
    exports2.startsWith = function(str2, substr, len) {
      if (typeof len !== "number") len = substr.length;
      return str2.slice(0, len) === substr;
    };
  }
});

// node_modules/gray-matter/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/gray-matter/lib/defaults.js"(exports2, module2) {
    "use strict";
    var engines2 = require_engines();
    var utils = require_utils();
    module2.exports = function(options2) {
      const opts = Object.assign({}, options2);
      opts.delimiters = utils.arrayify(opts.delims || opts.delimiters || "---");
      if (opts.delimiters.length === 1) {
        opts.delimiters.push(opts.delimiters[0]);
      }
      opts.language = (opts.language || opts.lang || "yaml").toLowerCase();
      opts.engines = Object.assign({}, engines2, opts.parsers, opts.engines);
      return opts;
    };
  }
});

// node_modules/gray-matter/lib/engine.js
var require_engine = __commonJS({
  "node_modules/gray-matter/lib/engine.js"(exports2, module2) {
    "use strict";
    module2.exports = function(name, options2) {
      let engine = options2.engines[name] || options2.engines[aliase(name)];
      if (typeof engine === "undefined") {
        throw new Error('gray-matter engine "' + name + '" is not registered');
      }
      if (typeof engine === "function") {
        engine = { parse: engine };
      }
      return engine;
    };
    function aliase(name) {
      switch (name.toLowerCase()) {
        case "js":
        case "javascript":
          return "javascript";
        case "coffee":
        case "coffeescript":
        case "cson":
          return "coffee";
        case "yaml":
        case "yml":
          return "yaml";
        default: {
          return name;
        }
      }
    }
  }
});

// node_modules/gray-matter/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/gray-matter/lib/stringify.js"(exports2, module2) {
    "use strict";
    var typeOf = require_kind_of();
    var getEngine = require_engine();
    var defaults = require_defaults();
    module2.exports = function(file, data, options2) {
      if (data == null && options2 == null) {
        switch (typeOf(file)) {
          case "object":
            data = file.data;
            options2 = {};
            break;
          case "string":
            return file;
          default: {
            throw new TypeError("expected file to be a string or object");
          }
        }
      }
      const str2 = file.content;
      const opts = defaults(options2);
      if (data == null) {
        if (!opts.data) return file;
        data = opts.data;
      }
      const language = file.language || opts.language;
      const engine = getEngine(language, opts);
      if (typeof engine.stringify !== "function") {
        throw new TypeError('expected "' + language + '.stringify" to be a function');
      }
      data = Object.assign({}, file.data, data);
      const open = opts.delimiters[0];
      const close = opts.delimiters[1];
      const matter2 = engine.stringify(data, options2).trim();
      let buf = "";
      if (matter2 !== "{}") {
        buf = newline(open) + newline(matter2) + newline(close);
      }
      if (typeof file.excerpt === "string" && file.excerpt !== "") {
        if (str2.indexOf(file.excerpt.trim()) === -1) {
          buf += newline(file.excerpt) + newline(close);
        }
      }
      return buf + newline(str2);
    };
    function newline(str2) {
      return str2.slice(-1) !== "\n" ? str2 + "\n" : str2;
    }
  }
});

// node_modules/gray-matter/lib/excerpt.js
var require_excerpt = __commonJS({
  "node_modules/gray-matter/lib/excerpt.js"(exports2, module2) {
    "use strict";
    var defaults = require_defaults();
    module2.exports = function(file, options2) {
      const opts = defaults(options2);
      if (file.data == null) {
        file.data = {};
      }
      if (typeof opts.excerpt === "function") {
        return opts.excerpt(file, opts);
      }
      const sep = file.data.excerpt_separator || opts.excerpt_separator;
      if (sep == null && (opts.excerpt === false || opts.excerpt == null)) {
        return file;
      }
      const delimiter = typeof opts.excerpt === "string" ? opts.excerpt : sep || opts.delimiters[0];
      const idx = file.content.indexOf(delimiter);
      if (idx !== -1) {
        file.excerpt = file.content.slice(0, idx);
      }
      return file;
    };
  }
});

// node_modules/gray-matter/lib/to-file.js
var require_to_file = __commonJS({
  "node_modules/gray-matter/lib/to-file.js"(exports2, module2) {
    "use strict";
    var typeOf = require_kind_of();
    var stringify = require_stringify();
    var utils = require_utils();
    module2.exports = function(file) {
      if (typeOf(file) !== "object") {
        file = { content: file };
      }
      if (typeOf(file.data) !== "object") {
        file.data = {};
      }
      if (file.contents && file.content == null) {
        file.content = file.contents;
      }
      utils.define(file, "orig", utils.toBuffer(file.content));
      utils.define(file, "language", file.language || "");
      utils.define(file, "matter", file.matter || "");
      utils.define(file, "stringify", function(data, options2) {
        if (options2 && options2.language) {
          file.language = options2.language;
        }
        return stringify(file, data, options2);
      });
      file.content = utils.toString(file.content);
      file.isEmpty = false;
      file.excerpt = "";
      return file;
    };
  }
});

// node_modules/gray-matter/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/gray-matter/lib/parse.js"(exports2, module2) {
    "use strict";
    var getEngine = require_engine();
    var defaults = require_defaults();
    module2.exports = function(language, str2, options2) {
      const opts = defaults(options2);
      const engine = getEngine(language, opts);
      if (typeof engine.parse !== "function") {
        throw new TypeError('expected "' + language + '.parse" to be a function');
      }
      return engine.parse(str2, opts);
    };
  }
});

// node_modules/gray-matter/index.js
var require_gray_matter = __commonJS({
  "node_modules/gray-matter/index.js"(exports2, module2) {
    "use strict";
    var fs6 = __require("fs");
    var sections = require_section_matter();
    var defaults = require_defaults();
    var stringify = require_stringify();
    var excerpt = require_excerpt();
    var engines2 = require_engines();
    var toFile = require_to_file();
    var parse3 = require_parse2();
    var utils = require_utils();
    function matter2(input, options2) {
      if (input === "") {
        return { data: {}, content: input, excerpt: "", orig: input };
      }
      let file = toFile(input);
      const cached = matter2.cache[file.content];
      if (!options2) {
        if (cached) {
          file = Object.assign({}, cached);
          file.orig = cached.orig;
          return file;
        }
        matter2.cache[file.content] = file;
      }
      return parseMatter(file, options2);
    }
    function parseMatter(file, options2) {
      const opts = defaults(options2);
      const open = opts.delimiters[0];
      const close = "\n" + opts.delimiters[1];
      let str2 = file.content;
      if (opts.language) {
        file.language = opts.language;
      }
      const openLen = open.length;
      if (!utils.startsWith(str2, open, openLen)) {
        excerpt(file, opts);
        return file;
      }
      if (str2.charAt(openLen) === open.slice(-1)) {
        return file;
      }
      str2 = str2.slice(openLen);
      const len = str2.length;
      const language = matter2.language(str2, opts);
      if (language.name) {
        file.language = language.name;
        str2 = str2.slice(language.raw.length);
      }
      let closeIndex = str2.indexOf(close);
      if (closeIndex === -1) {
        closeIndex = len;
      }
      file.matter = str2.slice(0, closeIndex);
      const block = file.matter.replace(/^\s*#[^\n]+/gm, "").trim();
      if (block === "") {
        file.isEmpty = true;
        file.empty = file.content;
        file.data = {};
      } else {
        file.data = parse3(file.language, file.matter, opts);
      }
      if (closeIndex === len) {
        file.content = "";
      } else {
        file.content = str2.slice(closeIndex + close.length);
        if (file.content[0] === "\r") {
          file.content = file.content.slice(1);
        }
        if (file.content[0] === "\n") {
          file.content = file.content.slice(1);
        }
      }
      excerpt(file, opts);
      if (opts.sections === true || typeof opts.section === "function") {
        sections(file, opts.section);
      }
      return file;
    }
    matter2.engines = engines2;
    matter2.stringify = function(file, data, options2) {
      if (typeof file === "string") file = matter2(file, options2);
      return stringify(file, data, options2);
    };
    matter2.read = function(filepath, options2) {
      const str2 = fs6.readFileSync(filepath, "utf8");
      const file = matter2(str2, options2);
      file.path = filepath;
      return file;
    };
    matter2.test = function(str2, options2) {
      return utils.startsWith(str2, defaults(options2).delimiters[0]);
    };
    matter2.language = function(str2, options2) {
      const opts = defaults(options2);
      const open = opts.delimiters[0];
      if (matter2.test(str2)) {
        str2 = str2.slice(open.length);
      }
      const language = str2.slice(0, str2.search(/\r?\n/));
      return {
        raw: language,
        name: language ? language.trim() : ""
      };
    };
    matter2.cache = {};
    matter2.clearCache = function() {
      matter2.cache = {};
    };
    module2.exports = matter2;
  }
});

// src/hooks/stop.ts
import { promises as fs5 } from "node:fs";

// src/utils/config.ts
import { promises as fs } from "node:fs";
import path from "node:path";

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second2) => {
    return {
      ...first,
      ...second2
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path7, errorMaps, issueData } = params;
  const fullPath = [...path7, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path7, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path7;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options2) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options2) });
  }
  ip(options2) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options2) });
  }
  cidr(options2) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options2) });
  }
  datetime(options2) {
    if (typeof options2 === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options2
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options2?.precision === "undefined" ? null : options2?.precision,
      offset: options2?.offset ?? false,
      local: options2?.local ?? false,
      ...errorUtil.errToObj(options2?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options2) {
    if (typeof options2 === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options2
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options2?.precision === "undefined" ? null : options2?.precision,
      ...errorUtil.errToObj(options2?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options2) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options2?.position,
      ...errorUtil.errToObj(options2?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options2 = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options2.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options2) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options2, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options2) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options: options2,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second2, third) {
    if (second2 instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second2,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second2)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// src/core/types.ts
var memoryScopeSchema = external_exports.string().refine(
  (val) => {
    return val === "global" || val.startsWith("file:") || val.startsWith("area:");
  },
  { message: "Scope must be 'global', 'file:<path>', or 'area:<name>'" }
);
var memoryFrontmatterSchema = external_exports.object({
  id: external_exports.string().uuid(),
  subject: external_exports.string().min(1).max(200),
  keywords: external_exports.array(external_exports.string().min(1).max(50)).min(1).max(20),
  applies_to: memoryScopeSchema,
  occurred_at: external_exports.string().datetime(),
  content_hash: external_exports.string()
});
var createMemoryInputSchema = external_exports.object({
  subject: external_exports.string().min(1).max(200),
  keywords: external_exports.array(external_exports.string().min(1).max(50)).min(1).max(20),
  applies_to: memoryScopeSchema,
  content: external_exports.string().min(10),
  occurred_at: external_exports.string().datetime().optional()
});
var thinkingMemoryFrontmatterSchema = external_exports.object({
  id: external_exports.string().uuid(),
  subject: external_exports.string().min(1).max(200),
  applies_to: memoryScopeSchema,
  occurred_at: external_exports.string().datetime(),
  content_hash: external_exports.string()
});
var createThinkingMemoryInputSchema = external_exports.object({
  subject: external_exports.string().min(1).max(200),
  applies_to: memoryScopeSchema,
  content: external_exports.string().min(10),
  occurred_at: external_exports.string().datetime().optional()
});
var configSchema = external_exports.object({
  memoryDir: external_exports.string().default("./local-recall"),
  maxMemories: external_exports.number().positive().default(1e3),
  indexRefreshInterval: external_exports.number().nonnegative().default(300),
  fuzzyThreshold: external_exports.number().min(0).max(1).default(0.6),
  episodicEnabled: external_exports.boolean().default(true),
  episodicMaxTokens: external_exports.number().positive().default(1e3),
  episodicMinSimilarity: external_exports.number().min(0).max(1).default(0.5),
  thinkingEnabled: external_exports.boolean().default(true),
  thinkingMaxTokens: external_exports.number().positive().default(1e3),
  thinkingMinSimilarity: external_exports.number().min(0).max(1).default(0.5),
  hooks: external_exports.object({
    maxContextMemories: external_exports.number().positive().default(10)
  }).default({}),
  mcp: external_exports.object({
    port: external_exports.number().positive().default(7847),
    host: external_exports.string().default("localhost")
  }).default({})
});

// src/utils/config.ts
var cachedConfig = null;
async function loadConfig(configPath) {
  const defaultPath = path.join(process.cwd(), ".local-recall.json");
  const filePath = configPath ?? defaultPath;
  let fileConfig = {};
  try {
    const content = await fs.readFile(filePath, "utf-8");
    fileConfig = JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Warning: Could not parse config file: ${filePath}`);
    }
  }
  const envConfig = {};
  if (process.env["LOCAL_RECALL_DIR"]) {
    envConfig.memoryDir = process.env["LOCAL_RECALL_DIR"];
  }
  if (process.env["LOCAL_RECALL_MAX_MEMORIES"]) {
    envConfig.maxMemories = parseInt(process.env["LOCAL_RECALL_MAX_MEMORIES"], 10);
  }
  if (process.env["LOCAL_RECALL_INDEX_REFRESH"]) {
    envConfig.indexRefreshInterval = parseInt(
      process.env["LOCAL_RECALL_INDEX_REFRESH"],
      10
    );
  }
  if (process.env["LOCAL_RECALL_FUZZY_THRESHOLD"]) {
    envConfig.fuzzyThreshold = parseFloat(
      process.env["LOCAL_RECALL_FUZZY_THRESHOLD"]
    );
  }
  if (process.env["LOCAL_RECALL_EPISODIC_ENABLED"]) {
    envConfig.episodicEnabled = process.env["LOCAL_RECALL_EPISODIC_ENABLED"] === "true";
  }
  if (process.env["LOCAL_RECALL_EPISODIC_MAX_TOKENS"]) {
    envConfig.episodicMaxTokens = parseInt(process.env["LOCAL_RECALL_EPISODIC_MAX_TOKENS"], 10);
  }
  if (process.env["LOCAL_RECALL_EPISODIC_MIN_SIMILARITY"]) {
    envConfig.episodicMinSimilarity = parseFloat(process.env["LOCAL_RECALL_EPISODIC_MIN_SIMILARITY"]);
  }
  if (process.env["LOCAL_RECALL_THINKING_ENABLED"]) {
    envConfig.thinkingEnabled = process.env["LOCAL_RECALL_THINKING_ENABLED"] === "true";
  }
  if (process.env["LOCAL_RECALL_THINKING_MAX_TOKENS"]) {
    envConfig.thinkingMaxTokens = parseInt(process.env["LOCAL_RECALL_THINKING_MAX_TOKENS"], 10);
  }
  if (process.env["LOCAL_RECALL_THINKING_MIN_SIMILARITY"]) {
    envConfig.thinkingMinSimilarity = parseFloat(process.env["LOCAL_RECALL_THINKING_MIN_SIMILARITY"]);
  }
  const merged = {
    ...fileConfig,
    ...envConfig,
    hooks: {
      ...fileConfig.hooks,
      ...process.env["LOCAL_RECALL_MAX_CONTEXT"] && {
        maxContextMemories: parseInt(process.env["LOCAL_RECALL_MAX_CONTEXT"], 10)
      }
    },
    mcp: {
      ...fileConfig.mcp,
      ...process.env["MCP_PORT"] && {
        port: parseInt(process.env["MCP_PORT"], 10)
      },
      ...process.env["MCP_HOST"] && {
        host: process.env["MCP_HOST"]
      }
    }
  };
  cachedConfig = configSchema.parse(merged);
  return cachedConfig;
}
function getConfig() {
  if (!cachedConfig) {
    cachedConfig = configSchema.parse({});
  }
  return cachedConfig;
}

// src/utils/logger.ts
import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import path2 from "node:path";
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
function getMinLogLevel() {
  const envLevel = process.env["LOCAL_RECALL_LOG_LEVEL"]?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }
  return "error";
}
function formatMessage(level, component, message) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
}
function getLogPath() {
  try {
    const config = getConfig();
    return path2.join(config.memoryDir, "recall.log");
  } catch {
    const baseDir = process.env["LOCAL_RECALL_DIR"] ?? "./local-recall";
    return path2.join(baseDir, "recall.log");
  }
}
function ensureLogDir(logPath) {
  const dir = path2.dirname(logPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
function writeLog(level, component, message) {
  const minLevel = getMinLogLevel();
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) {
    return;
  }
  try {
    const logPath = getLogPath();
    ensureLogDir(logPath);
    const formattedMessage = formatMessage(level, component, message);
    appendFileSync(logPath, formattedMessage + "\n", "utf-8");
  } catch {
  }
}
function createLogger(component) {
  return {
    debug: (message) => writeLog("debug", component, message),
    info: (message) => writeLog("info", component, message),
    warn: (message) => writeLog("warn", component, message),
    error: (message) => writeLog("error", component, message)
  };
}
function createLoggerWithErrors(component) {
  return {
    debug: (message) => writeLog("debug", component, message),
    info: (message) => writeLog("info", component, message),
    warn: (message) => writeLog("warn", component, message),
    error: (message, error) => {
      const errorDetails = error instanceof Error ? `: ${error.message}` : "";
      writeLog("error", component, message + errorDetails);
    }
  };
}
var logger = {
  hooks: createLogger("hooks"),
  memory: createLogger("memory"),
  index: createLogger("index"),
  search: createLogger("search"),
  mcp: createLogger("mcp"),
  config: createLogger("config"),
  transcript: createLoggerWithErrors("transcript"),
  extractor: createLoggerWithErrors("extractor")
};

// src/utils/gitignore.ts
import { promises as fs2 } from "node:fs";
import path3 from "node:path";
var GITIGNORE_CONTENT = `# Local Recall - auto-generated
# These files are regenerated and should not be committed

# Index cache (rebuilt automatically)
index.json

# Orama vector indexes (rebuilt automatically from memory files)
orama-episodic-index.json
orama-thinking-index.json

# Debug log
recall.log

# Synced transcripts (local copies, originals in ~/.claude)
transcripts/

# Processed transcript tracking (local state, regenerated from transcripts)
processed-log.jsonl
thinking-processed-log.jsonl
`;
async function ensureGitignore(baseDir) {
  const gitignorePath = path3.join(baseDir, ".gitignore");
  await fs2.mkdir(baseDir, { recursive: true });
  await fs2.writeFile(gitignorePath, GITIGNORE_CONTENT, "utf-8");
  logger.memory.debug("Updated .gitignore in local-recall directory");
}

// node_modules/@orama/orama/dist/esm/components/tokenizer/languages.js
var STEMMERS = {
  arabic: "ar",
  armenian: "am",
  bulgarian: "bg",
  czech: "cz",
  danish: "dk",
  dutch: "nl",
  english: "en",
  finnish: "fi",
  french: "fr",
  german: "de",
  greek: "gr",
  hungarian: "hu",
  indian: "in",
  indonesian: "id",
  irish: "ie",
  italian: "it",
  lithuanian: "lt",
  nepali: "np",
  norwegian: "no",
  portuguese: "pt",
  romanian: "ro",
  russian: "ru",
  serbian: "rs",
  slovenian: "ru",
  spanish: "es",
  swedish: "se",
  tamil: "ta",
  turkish: "tr",
  ukrainian: "uk",
  sanskrit: "sk"
};
var SPLITTERS = {
  dutch: /[^A-Za-zàèéìòóù0-9_'-]+/gim,
  english: /[^A-Za-zàèéìòóù0-9_'-]+/gim,
  french: /[^a-z0-9äâàéèëêïîöôùüûœç-]+/gim,
  italian: /[^A-Za-zàèéìòóù0-9_'-]+/gim,
  norwegian: /[^a-z0-9_æøåÆØÅäÄöÖüÜ]+/gim,
  portuguese: /[^a-z0-9à-úÀ-Ú]/gim,
  russian: /[^a-z0-9а-яА-ЯёЁ]+/gim,
  spanish: /[^a-z0-9A-Zá-úÁ-ÚñÑüÜ]+/gim,
  swedish: /[^a-z0-9_åÅäÄöÖüÜ-]+/gim,
  german: /[^a-z0-9A-ZäöüÄÖÜß]+/gim,
  finnish: /[^a-z0-9äöÄÖ]+/gim,
  danish: /[^a-z0-9æøåÆØÅ]+/gim,
  hungarian: /[^a-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]+/gim,
  romanian: /[^a-z0-9ăâîșțĂÂÎȘȚ]+/gim,
  serbian: /[^a-z0-9čćžšđČĆŽŠĐ]+/gim,
  turkish: /[^a-z0-9çÇğĞıİöÖşŞüÜ]+/gim,
  lithuanian: /[^a-z0-9ąčęėįšųūžĄČĘĖĮŠŲŪŽ]+/gim,
  arabic: /[^a-z0-9أ-ي]+/gim,
  nepali: /[^a-z0-9अ-ह]+/gim,
  irish: /[^a-z0-9áéíóúÁÉÍÓÚ]+/gim,
  indian: /[^a-z0-9अ-ह]+/gim,
  armenian: /[^a-z0-9ա-ֆ]+/gim,
  greek: /[^a-z0-9α-ωά-ώ]+/gim,
  indonesian: /[^a-z0-9]+/gim,
  ukrainian: /[^a-z0-9а-яА-ЯіїєІЇЄ]+/gim,
  slovenian: /[^a-z0-9čžšČŽŠ]+/gim,
  bulgarian: /[^a-z0-9а-яА-Я]+/gim,
  tamil: /[^a-z0-9அ-ஹ]+/gim,
  sanskrit: /[^a-z0-9A-Zāīūṛḷṃṁḥśṣṭḍṇṅñḻḹṝ]+/gim,
  czech: /[^A-Z0-9a-zěščřžýáíéúůóťďĚŠČŘŽÝÁÍÉÓÚŮŤĎ-]+/gim
};
var SUPPORTED_LANGUAGES = Object.keys(STEMMERS);
function getLocale(language) {
  return language !== void 0 && SUPPORTED_LANGUAGES.includes(language) ? STEMMERS[language] : void 0;
}

// node_modules/@orama/orama/dist/esm/utils.js
var baseId = Date.now().toString().slice(5);
var lastId = 0;
var nano = BigInt(1e3);
var milli = BigInt(1e6);
var second = BigInt(1e9);
var MAX_ARGUMENT_FOR_STACK = 65535;
function safeArrayPush(arr, newArr) {
  if (newArr.length < MAX_ARGUMENT_FOR_STACK) {
    Array.prototype.push.apply(arr, newArr);
  } else {
    const newArrLength = newArr.length;
    for (let i = 0; i < newArrLength; i += MAX_ARGUMENT_FOR_STACK) {
      Array.prototype.push.apply(arr, newArr.slice(i, i + MAX_ARGUMENT_FOR_STACK));
    }
  }
}
function sprintf(template, ...args) {
  return template.replace(/%(?:(?<position>\d+)\$)?(?<width>-?\d*\.?\d*)(?<type>[dfs])/g, function(...replaceArgs) {
    const groups = replaceArgs[replaceArgs.length - 1];
    const { width: rawWidth, type, position } = groups;
    const replacement = position ? args[Number.parseInt(position) - 1] : args.shift();
    const width = rawWidth === "" ? 0 : Number.parseInt(rawWidth);
    switch (type) {
      case "d":
        return replacement.toString().padStart(width, "0");
      case "f": {
        let value = replacement;
        const [padding, precision] = rawWidth.split(".").map((w) => Number.parseFloat(w));
        if (typeof precision === "number" && precision >= 0) {
          value = value.toFixed(precision);
        }
        return typeof padding === "number" && padding >= 0 ? value.toString().padStart(width, "0") : value.toString();
      }
      case "s":
        return width < 0 ? replacement.toString().padEnd(-width, " ") : replacement.toString().padStart(width, " ");
      default:
        return replacement;
    }
  });
}
function isInsideWebWorker() {
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
function isInsideNode() {
  return typeof process !== "undefined" && process.release && process.release.name === "node";
}
function getNanosecondTimeViaPerformance() {
  return BigInt(Math.floor(performance.now() * 1e6));
}
function formatNanoseconds(value) {
  if (typeof value === "number") {
    value = BigInt(value);
  }
  if (value < nano) {
    return `${value}ns`;
  } else if (value < milli) {
    return `${value / nano}\u03BCs`;
  } else if (value < second) {
    return `${value / milli}ms`;
  }
  return `${value / second}s`;
}
function getNanosecondsTime() {
  if (isInsideWebWorker()) {
    return getNanosecondTimeViaPerformance();
  }
  if (isInsideNode()) {
    return process.hrtime.bigint();
  }
  if (typeof process !== "undefined" && typeof process?.hrtime?.bigint === "function") {
    return process.hrtime.bigint();
  }
  if (typeof performance !== "undefined") {
    return getNanosecondTimeViaPerformance();
  }
  return BigInt(0);
}
function uniqueId() {
  return `${baseId}-${lastId++}`;
}
function getOwnProperty(object, property) {
  if (Object.hasOwn === void 0) {
    return Object.prototype.hasOwnProperty.call(object, property) ? object[property] : void 0;
  }
  return Object.hasOwn(object, property) ? object[property] : void 0;
}
function sortTokenScorePredicate(a, b) {
  if (b[1] === a[1]) {
    return a[0] - b[0];
  }
  return b[1] - a[1];
}
function intersect(arrays) {
  if (arrays.length === 0) {
    return [];
  } else if (arrays.length === 1) {
    return arrays[0];
  }
  for (let i = 1; i < arrays.length; i++) {
    if (arrays[i].length < arrays[0].length) {
      const tmp = arrays[0];
      arrays[0] = arrays[i];
      arrays[i] = tmp;
    }
  }
  const set = /* @__PURE__ */ new Map();
  for (const elem of arrays[0]) {
    set.set(elem, 1);
  }
  for (let i = 1; i < arrays.length; i++) {
    let found = 0;
    for (const elem of arrays[i]) {
      const count3 = set.get(elem);
      if (count3 === i) {
        set.set(elem, count3 + 1);
        found++;
      }
    }
    if (found === 0)
      return [];
  }
  return arrays[0].filter((e) => {
    const count3 = set.get(e);
    if (count3 !== void 0)
      set.set(e, 0);
    return count3 === arrays.length;
  });
}
function getDocumentProperties(doc, paths) {
  const properties = {};
  const pathsLength = paths.length;
  for (let i = 0; i < pathsLength; i++) {
    const path7 = paths[i];
    const pathTokens = path7.split(".");
    let current = doc;
    const pathTokensLength = pathTokens.length;
    for (let j = 0; j < pathTokensLength; j++) {
      current = current[pathTokens[j]];
      if (typeof current === "object") {
        if (current !== null && "lat" in current && "lon" in current && typeof current.lat === "number" && typeof current.lon === "number") {
          current = properties[path7] = current;
          break;
        } else if (!Array.isArray(current) && current !== null && j === pathTokensLength - 1) {
          current = void 0;
          break;
        }
      } else if ((current === null || typeof current !== "object") && j < pathTokensLength - 1) {
        current = void 0;
        break;
      }
    }
    if (typeof current !== "undefined") {
      properties[path7] = current;
    }
  }
  return properties;
}
function getNested(obj, path7) {
  const props = getDocumentProperties(obj, [path7]);
  return props[path7];
}
var mapDistanceToMeters = {
  cm: 0.01,
  m: 1,
  km: 1e3,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344
};
function convertDistanceToMeters(distance, unit) {
  const ratio = mapDistanceToMeters[unit];
  if (ratio === void 0) {
    throw new Error(createError("INVALID_DISTANCE_SUFFIX", distance).message);
  }
  return distance * ratio;
}
function removeVectorsFromHits(searchResult, vectorProperties) {
  searchResult.hits = searchResult.hits.map((result) => ({
    ...result,
    document: {
      ...result.document,
      // Remove embeddings from the result
      ...vectorProperties.reduce((acc, prop) => {
        const path7 = prop.split(".");
        const lastKey = path7.pop();
        let obj = acc;
        for (const key of path7) {
          obj[key] = obj[key] ?? {};
          obj = obj[key];
        }
        obj[lastKey] = null;
        return acc;
      }, result.document)
    }
  }));
}
function isAsyncFunction(func) {
  if (Array.isArray(func)) {
    return func.some((item) => isAsyncFunction(item));
  }
  return func?.constructor?.name === "AsyncFunction";
}
var withIntersection = "intersection" in /* @__PURE__ */ new Set();
function setIntersection(...sets) {
  if (sets.length === 0) {
    return /* @__PURE__ */ new Set();
  }
  if (sets.length === 1) {
    return sets[0];
  }
  if (sets.length === 2) {
    const set1 = sets[0];
    const set2 = sets[1];
    if (withIntersection) {
      return set1.intersection(set2);
    }
    const result = /* @__PURE__ */ new Set();
    const base2 = set1.size < set2.size ? set1 : set2;
    const other = base2 === set1 ? set2 : set1;
    for (const value of base2) {
      if (other.has(value)) {
        result.add(value);
      }
    }
    return result;
  }
  const min = {
    index: 0,
    size: sets[0].size
  };
  for (let i = 1; i < sets.length; i++) {
    if (sets[i].size < min.size) {
      min.index = i;
      min.size = sets[i].size;
    }
  }
  if (withIntersection) {
    let base2 = sets[min.index];
    for (let i = 0; i < sets.length; i++) {
      if (i === min.index) {
        continue;
      }
      base2 = base2.intersection(sets[i]);
    }
    return base2;
  }
  const base = sets[min.index];
  for (let i = 0; i < sets.length; i++) {
    if (i === min.index) {
      continue;
    }
    const other = sets[i];
    for (const value of base) {
      if (!other.has(value)) {
        base.delete(value);
      }
    }
  }
  return base;
}
var withUnion = "union" in /* @__PURE__ */ new Set();
function setUnion(set1, set2) {
  if (withUnion) {
    if (set1) {
      return set1.union(set2);
    }
    return set2;
  }
  if (!set1) {
    return new Set(set2);
  }
  return /* @__PURE__ */ new Set([...set1, ...set2]);
}
function setDifference(set1, set2) {
  const result = /* @__PURE__ */ new Set();
  for (const value of set1) {
    if (!set2.has(value)) {
      result.add(value);
    }
  }
  return result;
}

// node_modules/@orama/orama/dist/esm/errors.js
var allLanguages = SUPPORTED_LANGUAGES.join("\n - ");
var errors = {
  NO_LANGUAGE_WITH_CUSTOM_TOKENIZER: "Do not pass the language option to create when using a custom tokenizer.",
  LANGUAGE_NOT_SUPPORTED: `Language "%s" is not supported.
Supported languages are:
 - ${allLanguages}`,
  INVALID_STEMMER_FUNCTION_TYPE: `config.stemmer property must be a function.`,
  MISSING_STEMMER: `As of version 1.0.0 @orama/orama does not ship non English stemmers by default. To solve this, please explicitly import and specify the "%s" stemmer from the package @orama/stemmers. See https://docs.orama.com/docs/orama-js/text-analysis/stemming for more information.`,
  CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY: "Custom stop words array must only contain strings.",
  UNSUPPORTED_COMPONENT: `Unsupported component "%s".`,
  COMPONENT_MUST_BE_FUNCTION: `The component "%s" must be a function.`,
  COMPONENT_MUST_BE_FUNCTION_OR_ARRAY_FUNCTIONS: `The component "%s" must be a function or an array of functions.`,
  INVALID_SCHEMA_TYPE: `Unsupported schema type "%s" at "%s". Expected "string", "boolean" or "number" or array of them.`,
  DOCUMENT_ID_MUST_BE_STRING: `Document id must be of type "string". Got "%s" instead.`,
  DOCUMENT_ALREADY_EXISTS: `A document with id "%s" already exists.`,
  DOCUMENT_DOES_NOT_EXIST: `A document with id "%s" does not exists.`,
  MISSING_DOCUMENT_PROPERTY: `Missing searchable property "%s".`,
  INVALID_DOCUMENT_PROPERTY: `Invalid document property "%s": expected "%s", got "%s"`,
  UNKNOWN_INDEX: `Invalid property name "%s". Expected a wildcard string ("*") or array containing one of the following properties: %s`,
  INVALID_BOOST_VALUE: `Boost value must be a number greater than, or less than 0.`,
  INVALID_FILTER_OPERATION: `You can only use one operation per filter, you requested %d.`,
  SCHEMA_VALIDATION_FAILURE: `Cannot insert document due schema validation failure on "%s" property.`,
  INVALID_SORT_SCHEMA_TYPE: `Unsupported sort schema type "%s" at "%s". Expected "string" or "number".`,
  CANNOT_SORT_BY_ARRAY: `Cannot configure sort for "%s" because it is an array (%s).`,
  UNABLE_TO_SORT_ON_UNKNOWN_FIELD: `Unable to sort on unknown field "%s". Allowed fields: %s`,
  SORT_DISABLED: `Sort is disabled. Please read the documentation at https://docs.orama.com/docs/orama-js for more information.`,
  UNKNOWN_GROUP_BY_PROPERTY: `Unknown groupBy property "%s".`,
  INVALID_GROUP_BY_PROPERTY: `Invalid groupBy property "%s". Allowed types: "%s", but given "%s".`,
  UNKNOWN_FILTER_PROPERTY: `Unknown filter property "%s".`,
  UNKNOWN_VECTOR_PROPERTY: `Unknown vector property "%s". Make sure the property exists in the schema and is configured as a vector.`,
  INVALID_VECTOR_SIZE: `Vector size must be a number greater than 0. Got "%s" instead.`,
  INVALID_VECTOR_VALUE: `Vector value must be a number greater than 0. Got "%s" instead.`,
  INVALID_INPUT_VECTOR: `Property "%s" was declared as a %s-dimensional vector, but got a %s-dimensional vector instead.
Input vectors must be of the size declared in the schema, as calculating similarity between vectors of different sizes can lead to unexpected results.`,
  WRONG_SEARCH_PROPERTY_TYPE: `Property "%s" is not searchable. Only "string" properties are searchable.`,
  FACET_NOT_SUPPORTED: `Facet doens't support the type "%s".`,
  INVALID_DISTANCE_SUFFIX: `Invalid distance suffix "%s". Valid suffixes are: cm, m, km, mi, yd, ft.`,
  INVALID_SEARCH_MODE: `Invalid search mode "%s". Valid modes are: "fulltext", "vector", "hybrid".`,
  MISSING_VECTOR_AND_SECURE_PROXY: `No vector was provided and no secure proxy was configured. Please provide a vector or configure an Orama Secure Proxy to perform hybrid search.`,
  MISSING_TERM: `"term" is a required parameter when performing hybrid search. Please provide a search term.`,
  INVALID_VECTOR_INPUT: `Invalid "vector" property. Expected an object with "value" and "property" properties, but got "%s" instead.`,
  PLUGIN_CRASHED: `A plugin crashed during initialization. Please check the error message for more information:`,
  PLUGIN_SECURE_PROXY_NOT_FOUND: `Could not find '@orama/secure-proxy-plugin' installed in your Orama instance.
Please install it before proceeding with creating an answer session.
Read more at https://docs.orama.com/docs/orama-js/plugins/plugin-secure-proxy#plugin-secure-proxy
`,
  PLUGIN_SECURE_PROXY_MISSING_CHAT_MODEL: `Could not find a chat model defined in the secure proxy plugin configuration.
Please provide a chat model before proceeding with creating an answer session.
Read more at https://docs.orama.com/docs/orama-js/plugins/plugin-secure-proxy#plugin-secure-proxy
`,
  ANSWER_SESSION_LAST_MESSAGE_IS_NOT_ASSISTANT: `The last message in the session is not an assistant message. Cannot regenerate non-assistant messages.`,
  PLUGIN_COMPONENT_CONFLICT: `The component "%s" is already defined. The plugin "%s" is trying to redefine it.`
};
function createError(code, ...args) {
  const error = new Error(sprintf(errors[code] ?? `Unsupported Orama Error code: ${code}`, ...args));
  error.code = code;
  if ("captureStackTrace" in Error.prototype) {
    Error.captureStackTrace(error);
  }
  return error;
}

// node_modules/@orama/orama/dist/esm/components/defaults.js
function formatElapsedTime(n) {
  return {
    raw: Number(n),
    formatted: formatNanoseconds(n)
  };
}
function getDocumentIndexId(doc) {
  if (doc.id) {
    if (typeof doc.id !== "string") {
      throw createError("DOCUMENT_ID_MUST_BE_STRING", typeof doc.id);
    }
    return doc.id;
  }
  return uniqueId();
}
function validateSchema(doc, schema) {
  for (const [prop, type] of Object.entries(schema)) {
    const value = doc[prop];
    if (typeof value === "undefined") {
      continue;
    }
    if (type === "geopoint" && typeof value === "object" && typeof value.lon === "number" && typeof value.lat === "number") {
      continue;
    }
    if (type === "enum" && (typeof value === "string" || typeof value === "number")) {
      continue;
    }
    if (type === "enum[]" && Array.isArray(value)) {
      const valueLength = value.length;
      for (let i = 0; i < valueLength; i++) {
        if (typeof value[i] !== "string" && typeof value[i] !== "number") {
          return prop + "." + i;
        }
      }
      continue;
    }
    if (isVectorType(type)) {
      const vectorSize = getVectorSize(type);
      if (!Array.isArray(value) || value.length !== vectorSize) {
        throw createError("INVALID_INPUT_VECTOR", prop, vectorSize, value.length);
      }
      continue;
    }
    if (isArrayType(type)) {
      if (!Array.isArray(value)) {
        return prop;
      }
      const expectedType = getInnerType(type);
      const valueLength = value.length;
      for (let i = 0; i < valueLength; i++) {
        if (typeof value[i] !== expectedType) {
          return prop + "." + i;
        }
      }
      continue;
    }
    if (typeof type === "object") {
      if (!value || typeof value !== "object") {
        return prop;
      }
      const subProp = validateSchema(value, type);
      if (subProp) {
        return prop + "." + subProp;
      }
      continue;
    }
    if (typeof value !== type) {
      return prop;
    }
  }
  return void 0;
}
var IS_ARRAY_TYPE = {
  string: false,
  number: false,
  boolean: false,
  enum: false,
  geopoint: false,
  "string[]": true,
  "number[]": true,
  "boolean[]": true,
  "enum[]": true
};
var INNER_TYPE = {
  "string[]": "string",
  "number[]": "number",
  "boolean[]": "boolean",
  "enum[]": "enum"
};
function isGeoPointType(type) {
  return type === "geopoint";
}
function isVectorType(type) {
  return typeof type === "string" && /^vector\[\d+\]$/.test(type);
}
function isArrayType(type) {
  return typeof type === "string" && IS_ARRAY_TYPE[type];
}
function getInnerType(type) {
  return INNER_TYPE[type];
}
function getVectorSize(type) {
  const size = Number(type.slice(7, -1));
  switch (true) {
    case isNaN(size):
      throw createError("INVALID_VECTOR_VALUE", type);
    case size <= 0:
      throw createError("INVALID_VECTOR_SIZE", type);
    default:
      return size;
  }
}

// node_modules/@orama/orama/dist/esm/components/internal-document-id-store.js
function createInternalDocumentIDStore() {
  return {
    idToInternalId: /* @__PURE__ */ new Map(),
    internalIdToId: [],
    save,
    load
  };
}
function save(store2) {
  return {
    internalIdToId: store2.internalIdToId
  };
}
function load(orama, raw) {
  const { internalIdToId } = raw;
  orama.internalDocumentIDStore.idToInternalId.clear();
  orama.internalDocumentIDStore.internalIdToId = [];
  const internalIdToIdLength = internalIdToId.length;
  for (let i = 0; i < internalIdToIdLength; i++) {
    const internalIdItem = internalIdToId[i];
    orama.internalDocumentIDStore.idToInternalId.set(internalIdItem, i + 1);
    orama.internalDocumentIDStore.internalIdToId.push(internalIdItem);
  }
}
function getInternalDocumentId(store2, id) {
  if (typeof id === "string") {
    const internalId = store2.idToInternalId.get(id);
    if (internalId) {
      return internalId;
    }
    const currentId = store2.idToInternalId.size + 1;
    store2.idToInternalId.set(id, currentId);
    store2.internalIdToId.push(id);
    return currentId;
  }
  if (id > store2.internalIdToId.length) {
    return getInternalDocumentId(store2, id.toString());
  }
  return id;
}
function getDocumentIdFromInternalId(store2, internalId) {
  if (store2.internalIdToId.length < internalId) {
    throw new Error(`Invalid internalId ${internalId}`);
  }
  return store2.internalIdToId[internalId - 1];
}

// node_modules/@orama/orama/dist/esm/components/documents-store.js
function create(_, sharedInternalDocumentStore) {
  return {
    sharedInternalDocumentStore,
    docs: {},
    count: 0
  };
}
function get(store2, id) {
  const internalId = getInternalDocumentId(store2.sharedInternalDocumentStore, id);
  return store2.docs[internalId];
}
function getMultiple(store2, ids) {
  const idsLength = ids.length;
  const found = Array.from({ length: idsLength });
  for (let i = 0; i < idsLength; i++) {
    const internalId = getInternalDocumentId(store2.sharedInternalDocumentStore, ids[i]);
    found[i] = store2.docs[internalId];
  }
  return found;
}
function getAll(store2) {
  return store2.docs;
}
function store(store2, id, internalId, doc) {
  if (typeof store2.docs[internalId] !== "undefined") {
    return false;
  }
  store2.docs[internalId] = doc;
  store2.count++;
  return true;
}
function remove(store2, id) {
  const internalId = getInternalDocumentId(store2.sharedInternalDocumentStore, id);
  if (typeof store2.docs[internalId] === "undefined") {
    return false;
  }
  delete store2.docs[internalId];
  store2.count--;
  return true;
}
function count(store2) {
  return store2.count;
}
function load2(sharedInternalDocumentStore, raw) {
  const rawDocument = raw;
  return {
    docs: rawDocument.docs,
    count: rawDocument.count,
    sharedInternalDocumentStore
  };
}
function save2(store2) {
  return {
    docs: store2.docs,
    count: store2.count
  };
}
function createDocumentsStore() {
  return {
    create,
    get,
    getMultiple,
    getAll,
    store,
    remove,
    count,
    load: load2,
    save: save2
  };
}

// node_modules/@orama/orama/dist/esm/components/plugins.js
var AVAILABLE_PLUGIN_HOOKS = [
  "beforeInsert",
  "afterInsert",
  "beforeRemove",
  "afterRemove",
  "beforeUpdate",
  "afterUpdate",
  "beforeUpsert",
  "afterUpsert",
  "beforeSearch",
  "afterSearch",
  "beforeInsertMultiple",
  "afterInsertMultiple",
  "beforeRemoveMultiple",
  "afterRemoveMultiple",
  "beforeUpdateMultiple",
  "afterUpdateMultiple",
  "beforeUpsertMultiple",
  "afterUpsertMultiple",
  "beforeLoad",
  "afterLoad",
  "afterCreate"
];
function getAllPluginsByHook(orama, hook) {
  const pluginsToRun = [];
  const pluginsLength = orama.plugins?.length;
  if (!pluginsLength) {
    return pluginsToRun;
  }
  for (let i = 0; i < pluginsLength; i++) {
    try {
      const plugin = orama.plugins[i];
      if (typeof plugin[hook] === "function") {
        pluginsToRun.push(plugin[hook]);
      }
    } catch (error) {
      console.error("Caught error in getAllPluginsByHook:", error);
      throw createError("PLUGIN_CRASHED");
    }
  }
  return pluginsToRun;
}

// node_modules/@orama/orama/dist/esm/components/hooks.js
var OBJECT_COMPONENTS = ["tokenizer", "index", "documentsStore", "sorter", "pinning"];
var FUNCTION_COMPONENTS = [
  "validateSchema",
  "getDocumentIndexId",
  "getDocumentProperties",
  "formatElapsedTime"
];
function runSingleHook(hooks, orama, id, doc) {
  const needAsync = hooks.some(isAsyncFunction);
  if (needAsync) {
    return (async () => {
      for (const hook of hooks) {
        await hook(orama, id, doc);
      }
    })();
  } else {
    for (const hook of hooks) {
      hook(orama, id, doc);
    }
  }
}
function runAfterSearch(hooks, db, params, language, results) {
  const needAsync = hooks.some(isAsyncFunction);
  if (needAsync) {
    return (async () => {
      for (const hook of hooks) {
        await hook(db, params, language, results);
      }
    })();
  } else {
    for (const hook of hooks) {
      hook(db, params, language, results);
    }
  }
}
function runBeforeSearch(hooks, db, params, language) {
  const needAsync = hooks.some(isAsyncFunction);
  if (needAsync) {
    return (async () => {
      for (const hook of hooks) {
        await hook(db, params, language);
      }
    })();
  } else {
    for (const hook of hooks) {
      hook(db, params, language);
    }
  }
}
function runAfterCreate(hooks, db) {
  const needAsync = hooks.some(isAsyncFunction);
  if (needAsync) {
    return (async () => {
      for (const hook of hooks) {
        await hook(db);
      }
    })();
  } else {
    for (const hook of hooks) {
      hook(db);
    }
  }
}

// node_modules/@orama/orama/dist/esm/trees/avl.js
var AVLNode = class _AVLNode {
  k;
  v;
  l = null;
  r = null;
  h = 1;
  constructor(key, value) {
    this.k = key;
    this.v = new Set(value);
  }
  updateHeight() {
    this.h = Math.max(_AVLNode.getHeight(this.l), _AVLNode.getHeight(this.r)) + 1;
  }
  static getHeight(node) {
    return node ? node.h : 0;
  }
  getBalanceFactor() {
    return _AVLNode.getHeight(this.l) - _AVLNode.getHeight(this.r);
  }
  rotateLeft() {
    const newRoot = this.r;
    this.r = newRoot.l;
    newRoot.l = this;
    this.updateHeight();
    newRoot.updateHeight();
    return newRoot;
  }
  rotateRight() {
    const newRoot = this.l;
    this.l = newRoot.r;
    newRoot.r = this;
    this.updateHeight();
    newRoot.updateHeight();
    return newRoot;
  }
  toJSON() {
    return {
      k: this.k,
      v: Array.from(this.v),
      l: this.l ? this.l.toJSON() : null,
      r: this.r ? this.r.toJSON() : null,
      h: this.h
    };
  }
  static fromJSON(json) {
    const node = new _AVLNode(json.k, json.v);
    node.l = json.l ? _AVLNode.fromJSON(json.l) : null;
    node.r = json.r ? _AVLNode.fromJSON(json.r) : null;
    node.h = json.h;
    return node;
  }
};
var AVLTree = class _AVLTree {
  root = null;
  insertCount = 0;
  constructor(key, value) {
    if (key !== void 0 && value !== void 0) {
      this.root = new AVLNode(key, value);
    }
  }
  insert(key, value, rebalanceThreshold = 1e3) {
    this.root = this.insertNode(this.root, key, value, rebalanceThreshold);
  }
  insertMultiple(key, value, rebalanceThreshold = 1e3) {
    for (const v2 of value) {
      this.insert(key, v2, rebalanceThreshold);
    }
  }
  // Rebalance the tree if the insert count reaches the threshold.
  // This will improve insertion performance since we won't be rebalancing the tree on every insert.
  // When inserting docs using `insertMultiple`, the threshold will be set to the number of docs being inserted.
  // We can force rebalancing the tree by setting the threshold to 1 (default).
  rebalance() {
    if (this.root) {
      this.root = this.rebalanceNode(this.root);
    }
  }
  toJSON() {
    return {
      root: this.root ? this.root.toJSON() : null,
      insertCount: this.insertCount
    };
  }
  static fromJSON(json) {
    const tree = new _AVLTree();
    tree.root = json.root ? AVLNode.fromJSON(json.root) : null;
    tree.insertCount = json.insertCount || 0;
    return tree;
  }
  insertNode(node, key, value, rebalanceThreshold) {
    if (node === null) {
      return new AVLNode(key, [value]);
    }
    const path7 = [];
    let current = node;
    let parent = null;
    while (current !== null) {
      path7.push({ parent, node: current });
      if (key < current.k) {
        if (current.l === null) {
          current.l = new AVLNode(key, [value]);
          path7.push({ parent: current, node: current.l });
          break;
        } else {
          parent = current;
          current = current.l;
        }
      } else if (key > current.k) {
        if (current.r === null) {
          current.r = new AVLNode(key, [value]);
          path7.push({ parent: current, node: current.r });
          break;
        } else {
          parent = current;
          current = current.r;
        }
      } else {
        current.v.add(value);
        return node;
      }
    }
    let needRebalance = false;
    if (this.insertCount++ % rebalanceThreshold === 0) {
      needRebalance = true;
    }
    for (let i = path7.length - 1; i >= 0; i--) {
      const { parent: parent2, node: currentNode } = path7[i];
      currentNode.updateHeight();
      if (needRebalance) {
        const rebalancedNode = this.rebalanceNode(currentNode);
        if (parent2) {
          if (parent2.l === currentNode) {
            parent2.l = rebalancedNode;
          } else if (parent2.r === currentNode) {
            parent2.r = rebalancedNode;
          }
        } else {
          node = rebalancedNode;
        }
      }
    }
    return node;
  }
  rebalanceNode(node) {
    const balanceFactor = node.getBalanceFactor();
    if (balanceFactor > 1) {
      if (node.l && node.l.getBalanceFactor() >= 0) {
        return node.rotateRight();
      } else if (node.l) {
        node.l = node.l.rotateLeft();
        return node.rotateRight();
      }
    }
    if (balanceFactor < -1) {
      if (node.r && node.r.getBalanceFactor() <= 0) {
        return node.rotateLeft();
      } else if (node.r) {
        node.r = node.r.rotateRight();
        return node.rotateLeft();
      }
    }
    return node;
  }
  find(key) {
    const node = this.findNodeByKey(key);
    return node ? node.v : null;
  }
  contains(key) {
    return this.find(key) !== null;
  }
  getSize() {
    let count3 = 0;
    const stack = [];
    let current = this.root;
    while (current || stack.length > 0) {
      while (current) {
        stack.push(current);
        current = current.l;
      }
      current = stack.pop();
      count3++;
      current = current.r;
    }
    return count3;
  }
  isBalanced() {
    if (!this.root)
      return true;
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      const balanceFactor = node.getBalanceFactor();
      if (Math.abs(balanceFactor) > 1) {
        return false;
      }
      if (node.l)
        stack.push(node.l);
      if (node.r)
        stack.push(node.r);
    }
    return true;
  }
  remove(key) {
    this.root = this.removeNode(this.root, key);
  }
  removeDocument(key, id) {
    const node = this.findNodeByKey(key);
    if (!node) {
      return;
    }
    if (node.v.size === 1) {
      this.root = this.removeNode(this.root, key);
    } else {
      node.v = new Set([...node.v.values()].filter((v2) => v2 !== id));
    }
  }
  findNodeByKey(key) {
    let node = this.root;
    while (node) {
      if (key < node.k) {
        node = node.l;
      } else if (key > node.k) {
        node = node.r;
      } else {
        return node;
      }
    }
    return null;
  }
  removeNode(node, key) {
    if (node === null)
      return null;
    const path7 = [];
    let current = node;
    while (current !== null && current.k !== key) {
      path7.push(current);
      if (key < current.k) {
        current = current.l;
      } else {
        current = current.r;
      }
    }
    if (current === null) {
      return node;
    }
    if (current.l === null || current.r === null) {
      const child = current.l ? current.l : current.r;
      if (path7.length === 0) {
        node = child;
      } else {
        const parent = path7[path7.length - 1];
        if (parent.l === current) {
          parent.l = child;
        } else {
          parent.r = child;
        }
      }
    } else {
      let successorParent = current;
      let successor = current.r;
      while (successor.l !== null) {
        successorParent = successor;
        successor = successor.l;
      }
      current.k = successor.k;
      current.v = successor.v;
      if (successorParent.l === successor) {
        successorParent.l = successor.r;
      } else {
        successorParent.r = successor.r;
      }
      current = successorParent;
    }
    path7.push(current);
    for (let i = path7.length - 1; i >= 0; i--) {
      const currentNode = path7[i];
      currentNode.updateHeight();
      const rebalancedNode = this.rebalanceNode(currentNode);
      if (i > 0) {
        const parent = path7[i - 1];
        if (parent.l === currentNode) {
          parent.l = rebalancedNode;
        } else if (parent.r === currentNode) {
          parent.r = rebalancedNode;
        }
      } else {
        node = rebalancedNode;
      }
    }
    return node;
  }
  rangeSearch(min, max) {
    const result = /* @__PURE__ */ new Set();
    const stack = [];
    let current = this.root;
    while (current || stack.length > 0) {
      while (current) {
        stack.push(current);
        current = current.l;
      }
      current = stack.pop();
      if (current.k >= min && current.k <= max) {
        for (const value of current.v) {
          result.add(value);
        }
      }
      if (current.k > max) {
        break;
      }
      current = current.r;
    }
    return result;
  }
  greaterThan(key, inclusive = false) {
    const result = /* @__PURE__ */ new Set();
    const stack = [];
    let current = this.root;
    while (current || stack.length > 0) {
      while (current) {
        stack.push(current);
        current = current.r;
      }
      current = stack.pop();
      if (inclusive && current.k >= key || !inclusive && current.k > key) {
        for (const value of current.v) {
          result.add(value);
        }
      } else if (current.k <= key) {
        break;
      }
      current = current.l;
    }
    return result;
  }
  lessThan(key, inclusive = false) {
    const result = /* @__PURE__ */ new Set();
    const stack = [];
    let current = this.root;
    while (current || stack.length > 0) {
      while (current) {
        stack.push(current);
        current = current.l;
      }
      current = stack.pop();
      if (inclusive && current.k <= key || !inclusive && current.k < key) {
        for (const value of current.v) {
          result.add(value);
        }
      } else if (current.k > key) {
        break;
      }
      current = current.r;
    }
    return result;
  }
};

// node_modules/@orama/orama/dist/esm/trees/flat.js
var FlatTree = class _FlatTree {
  numberToDocumentId;
  constructor() {
    this.numberToDocumentId = /* @__PURE__ */ new Map();
  }
  insert(key, value) {
    if (this.numberToDocumentId.has(key)) {
      this.numberToDocumentId.get(key).add(value);
    } else {
      this.numberToDocumentId.set(key, /* @__PURE__ */ new Set([value]));
    }
  }
  find(key) {
    const idSet = this.numberToDocumentId.get(key);
    return idSet ? Array.from(idSet) : null;
  }
  remove(key) {
    this.numberToDocumentId.delete(key);
  }
  removeDocument(id, key) {
    const idSet = this.numberToDocumentId.get(key);
    if (idSet) {
      idSet.delete(id);
      if (idSet.size === 0) {
        this.numberToDocumentId.delete(key);
      }
    }
  }
  contains(key) {
    return this.numberToDocumentId.has(key);
  }
  getSize() {
    let size = 0;
    for (const idSet of this.numberToDocumentId.values()) {
      size += idSet.size;
    }
    return size;
  }
  filter(operation) {
    const operationKeys = Object.keys(operation);
    if (operationKeys.length !== 1) {
      throw new Error("Invalid operation");
    }
    const operationType = operationKeys[0];
    switch (operationType) {
      case "eq": {
        const value = operation[operationType];
        const idSet = this.numberToDocumentId.get(value);
        return idSet ? Array.from(idSet) : [];
      }
      case "in": {
        const values = operation[operationType];
        const resultSet = /* @__PURE__ */ new Set();
        for (const value of values) {
          const idSet = this.numberToDocumentId.get(value);
          if (idSet) {
            for (const id of idSet) {
              resultSet.add(id);
            }
          }
        }
        return Array.from(resultSet);
      }
      case "nin": {
        const excludeValues = new Set(operation[operationType]);
        const resultSet = /* @__PURE__ */ new Set();
        for (const [key, idSet] of this.numberToDocumentId.entries()) {
          if (!excludeValues.has(key)) {
            for (const id of idSet) {
              resultSet.add(id);
            }
          }
        }
        return Array.from(resultSet);
      }
      default:
        throw new Error("Invalid operation");
    }
  }
  filterArr(operation) {
    const operationKeys = Object.keys(operation);
    if (operationKeys.length !== 1) {
      throw new Error("Invalid operation");
    }
    const operationType = operationKeys[0];
    switch (operationType) {
      case "containsAll": {
        const values = operation[operationType];
        const idSets = values.map((value) => this.numberToDocumentId.get(value) ?? /* @__PURE__ */ new Set());
        if (idSets.length === 0)
          return [];
        const intersection = idSets.reduce((prev, curr) => {
          return new Set([...prev].filter((id) => curr.has(id)));
        });
        return Array.from(intersection);
      }
      case "containsAny": {
        const values = operation[operationType];
        const idSets = values.map((value) => this.numberToDocumentId.get(value) ?? /* @__PURE__ */ new Set());
        if (idSets.length === 0)
          return [];
        const union = idSets.reduce((prev, curr) => {
          return /* @__PURE__ */ new Set([...prev, ...curr]);
        });
        return Array.from(union);
      }
      default:
        throw new Error("Invalid operation");
    }
  }
  static fromJSON(json) {
    if (!json.numberToDocumentId) {
      throw new Error("Invalid Flat Tree JSON");
    }
    const tree = new _FlatTree();
    for (const [key, ids] of json.numberToDocumentId) {
      tree.numberToDocumentId.set(key, new Set(ids));
    }
    return tree;
  }
  toJSON() {
    return {
      numberToDocumentId: Array.from(this.numberToDocumentId.entries()).map(([key, idSet]) => [key, Array.from(idSet)])
    };
  }
};

// node_modules/@orama/orama/dist/esm/components/levenshtein.js
function _boundedLevenshtein(term, word, tolerance) {
  if (tolerance < 0)
    return -1;
  if (term === word)
    return 0;
  const m = term.length;
  const n = word.length;
  if (m === 0)
    return n <= tolerance ? n : -1;
  if (n === 0)
    return m <= tolerance ? m : -1;
  const diff = Math.abs(m - n);
  if (term.startsWith(word)) {
    return diff <= tolerance ? diff : -1;
  }
  if (word.startsWith(term)) {
    return 0;
  }
  if (diff > tolerance)
    return -1;
  const matrix = [];
  for (let i = 0; i <= m; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= n; j++) {
      matrix[i][j] = i === 0 ? j : 0;
    }
  }
  for (let i = 1; i <= m; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= n; j++) {
      if (term[i - 1] === word[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          // deletion
          matrix[i][j - 1] + 1,
          // insertion
          matrix[i - 1][j - 1] + 1
          // substitution
        );
      }
      rowMin = Math.min(rowMin, matrix[i][j]);
    }
    if (rowMin > tolerance) {
      return -1;
    }
  }
  return matrix[m][n] <= tolerance ? matrix[m][n] : -1;
}
function syncBoundedLevenshtein(term, w, tolerance) {
  const distance = _boundedLevenshtein(term, w, tolerance);
  return {
    distance,
    isBounded: distance >= 0
  };
}

// node_modules/@orama/orama/dist/esm/trees/radix.js
var RadixNode = class _RadixNode {
  // Node key
  k;
  // Node subword
  s;
  // Node children
  c = /* @__PURE__ */ new Map();
  // Node documents
  d = /* @__PURE__ */ new Set();
  // Node end
  e;
  // Node word
  w = "";
  constructor(key, subWord, end) {
    this.k = key;
    this.s = subWord;
    this.e = end;
  }
  updateParent(parent) {
    this.w = parent.w + this.s;
  }
  addDocument(docID) {
    this.d.add(docID);
  }
  removeDocument(docID) {
    return this.d.delete(docID);
  }
  findAllWords(output, term, exact, tolerance) {
    const stack = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.e) {
        const { w, d: docIDs } = node;
        if (exact && w !== term) {
          continue;
        }
        if (getOwnProperty(output, w) !== null) {
          if (tolerance) {
            const difference = Math.abs(term.length - w.length);
            if (difference <= tolerance && syncBoundedLevenshtein(term, w, tolerance).isBounded) {
              output[w] = [];
            } else {
              continue;
            }
          } else {
            output[w] = [];
          }
        }
        if (getOwnProperty(output, w) != null && docIDs.size > 0) {
          const docs = output[w];
          for (const docID of docIDs) {
            if (!docs.includes(docID)) {
              docs.push(docID);
            }
          }
        }
      }
      if (node.c.size > 0) {
        stack.push(...node.c.values());
      }
    }
    return output;
  }
  insert(word, docId) {
    let node = this;
    let i = 0;
    const wordLength = word.length;
    while (i < wordLength) {
      const currentCharacter = word[i];
      const childNode = node.c.get(currentCharacter);
      if (childNode) {
        const edgeLabel = childNode.s;
        const edgeLabelLength = edgeLabel.length;
        let j = 0;
        while (j < edgeLabelLength && i + j < wordLength && edgeLabel[j] === word[i + j]) {
          j++;
        }
        if (j === edgeLabelLength) {
          node = childNode;
          i += j;
          if (i === wordLength) {
            if (!childNode.e) {
              childNode.e = true;
            }
            childNode.addDocument(docId);
            return;
          }
          continue;
        }
        const commonPrefix = edgeLabel.slice(0, j);
        const newEdgeLabel = edgeLabel.slice(j);
        const newWordLabel = word.slice(i + j);
        const inbetweenNode = new _RadixNode(commonPrefix[0], commonPrefix, false);
        node.c.set(commonPrefix[0], inbetweenNode);
        inbetweenNode.updateParent(node);
        childNode.s = newEdgeLabel;
        childNode.k = newEdgeLabel[0];
        inbetweenNode.c.set(newEdgeLabel[0], childNode);
        childNode.updateParent(inbetweenNode);
        if (newWordLabel) {
          const newNode = new _RadixNode(newWordLabel[0], newWordLabel, true);
          newNode.addDocument(docId);
          inbetweenNode.c.set(newWordLabel[0], newNode);
          newNode.updateParent(inbetweenNode);
        } else {
          inbetweenNode.e = true;
          inbetweenNode.addDocument(docId);
        }
        return;
      } else {
        const newNode = new _RadixNode(currentCharacter, word.slice(i), true);
        newNode.addDocument(docId);
        node.c.set(currentCharacter, newNode);
        newNode.updateParent(node);
        return;
      }
    }
    if (!node.e) {
      node.e = true;
    }
    node.addDocument(docId);
  }
  _findLevenshtein(term, index, tolerance, originalTolerance, output) {
    const stack = [{ node: this, index, tolerance }];
    while (stack.length > 0) {
      const { node, index: index2, tolerance: tolerance2 } = stack.pop();
      if (node.w.startsWith(term)) {
        node.findAllWords(output, term, false, 0);
        continue;
      }
      if (tolerance2 < 0) {
        continue;
      }
      if (node.e) {
        const { w, d: docIDs } = node;
        if (w) {
          if (syncBoundedLevenshtein(term, w, originalTolerance).isBounded) {
            output[w] = [];
          }
          if (getOwnProperty(output, w) !== void 0 && docIDs.size > 0) {
            const docs = new Set(output[w]);
            for (const docID of docIDs) {
              docs.add(docID);
            }
            output[w] = Array.from(docs);
          }
        }
      }
      if (index2 >= term.length) {
        continue;
      }
      const currentChar = term[index2];
      if (node.c.has(currentChar)) {
        const childNode = node.c.get(currentChar);
        stack.push({ node: childNode, index: index2 + 1, tolerance: tolerance2 });
      }
      stack.push({ node, index: index2 + 1, tolerance: tolerance2 - 1 });
      for (const [character, childNode] of node.c) {
        stack.push({ node: childNode, index: index2, tolerance: tolerance2 - 1 });
        if (character !== currentChar) {
          stack.push({ node: childNode, index: index2 + 1, tolerance: tolerance2 - 1 });
        }
      }
    }
  }
  find(params) {
    const { term, exact, tolerance } = params;
    if (tolerance && !exact) {
      const output = {};
      this._findLevenshtein(term, 0, tolerance, tolerance, output);
      return output;
    } else {
      let node = this;
      let i = 0;
      const termLength = term.length;
      while (i < termLength) {
        const character = term[i];
        const childNode = node.c.get(character);
        if (childNode) {
          const edgeLabel = childNode.s;
          const edgeLabelLength = edgeLabel.length;
          let j = 0;
          while (j < edgeLabelLength && i + j < termLength && edgeLabel[j] === term[i + j]) {
            j++;
          }
          if (j === edgeLabelLength) {
            node = childNode;
            i += j;
          } else if (i + j === termLength) {
            if (j === termLength - i) {
              if (exact) {
                return {};
              } else {
                const output2 = {};
                childNode.findAllWords(output2, term, exact, tolerance);
                return output2;
              }
            } else {
              return {};
            }
          } else {
            return {};
          }
        } else {
          return {};
        }
      }
      const output = {};
      node.findAllWords(output, term, exact, tolerance);
      return output;
    }
  }
  contains(term) {
    let node = this;
    let i = 0;
    const termLength = term.length;
    while (i < termLength) {
      const character = term[i];
      const childNode = node.c.get(character);
      if (childNode) {
        const edgeLabel = childNode.s;
        const edgeLabelLength = edgeLabel.length;
        let j = 0;
        while (j < edgeLabelLength && i + j < termLength && edgeLabel[j] === term[i + j]) {
          j++;
        }
        if (j < edgeLabelLength) {
          return false;
        }
        i += edgeLabelLength;
        node = childNode;
      } else {
        return false;
      }
    }
    return true;
  }
  removeWord(term) {
    if (!term) {
      return false;
    }
    let node = this;
    const termLength = term.length;
    const stack = [];
    for (let i = 0; i < termLength; i++) {
      const character = term[i];
      if (node.c.has(character)) {
        const childNode = node.c.get(character);
        stack.push({ parent: node, character });
        i += childNode.s.length - 1;
        node = childNode;
      } else {
        return false;
      }
    }
    node.d.clear();
    node.e = false;
    while (stack.length > 0 && node.c.size === 0 && !node.e && node.d.size === 0) {
      const { parent, character } = stack.pop();
      parent.c.delete(character);
      node = parent;
    }
    return true;
  }
  removeDocumentByWord(term, docID, exact = true) {
    if (!term) {
      return true;
    }
    let node = this;
    const termLength = term.length;
    for (let i = 0; i < termLength; i++) {
      const character = term[i];
      if (node.c.has(character)) {
        const childNode = node.c.get(character);
        i += childNode.s.length - 1;
        node = childNode;
        if (exact && node.w !== term) {
        } else {
          node.removeDocument(docID);
        }
      } else {
        return false;
      }
    }
    return true;
  }
  static getCommonPrefix(a, b) {
    const len = Math.min(a.length, b.length);
    let i = 0;
    while (i < len && a.charCodeAt(i) === b.charCodeAt(i)) {
      i++;
    }
    return a.slice(0, i);
  }
  toJSON() {
    return {
      w: this.w,
      s: this.s,
      e: this.e,
      k: this.k,
      d: Array.from(this.d),
      c: Array.from(this.c?.entries())?.map(([key, node]) => [key, node.toJSON()])
    };
  }
  static fromJSON(json) {
    const node = new _RadixNode(json.k, json.s, json.e);
    node.w = json.w;
    node.d = new Set(json.d);
    node.c = new Map(json?.c?.map(([key, nodeJson]) => [key, _RadixNode.fromJSON(nodeJson)]) || []);
    return node;
  }
};
var RadixTree = class _RadixTree extends RadixNode {
  constructor() {
    super("", "", false);
  }
  static fromJSON(json) {
    const tree = new _RadixTree();
    tree.w = json.w;
    tree.s = json.s;
    tree.e = json.e;
    tree.k = json.k;
    tree.d = new Set(json.d);
    tree.c = new Map(json?.c?.map(([key, nodeJson]) => [key, RadixNode.fromJSON(nodeJson)]) || []);
    return tree;
  }
  toJSON() {
    return super.toJSON();
  }
};

// node_modules/@orama/orama/dist/esm/trees/bkd.js
var K = 2;
var EARTH_RADIUS = 6371e3;
var BKDNode = class _BKDNode {
  point;
  docIDs;
  left;
  right;
  parent;
  constructor(point, docIDs) {
    this.point = point;
    this.docIDs = new Set(docIDs);
    this.left = null;
    this.right = null;
    this.parent = null;
  }
  toJSON() {
    return {
      point: this.point,
      docIDs: Array.from(this.docIDs),
      left: this.left ? this.left.toJSON() : null,
      right: this.right ? this.right.toJSON() : null
    };
  }
  static fromJSON(json, parent = null) {
    const node = new _BKDNode(json.point, json.docIDs);
    node.parent = parent;
    if (json.left) {
      node.left = _BKDNode.fromJSON(json.left, node);
    }
    if (json.right) {
      node.right = _BKDNode.fromJSON(json.right, node);
    }
    return node;
  }
};
var BKDTree = class _BKDTree {
  root;
  nodeMap;
  constructor() {
    this.root = null;
    this.nodeMap = /* @__PURE__ */ new Map();
  }
  getPointKey(point) {
    return `${point.lon},${point.lat}`;
  }
  insert(point, docIDs) {
    const pointKey = this.getPointKey(point);
    const existingNode = this.nodeMap.get(pointKey);
    if (existingNode) {
      docIDs.forEach((id) => existingNode.docIDs.add(id));
      return;
    }
    const newNode = new BKDNode(point, docIDs);
    this.nodeMap.set(pointKey, newNode);
    if (this.root == null) {
      this.root = newNode;
      return;
    }
    let node = this.root;
    let depth = 0;
    while (true) {
      const axis = depth % K;
      if (axis === 0) {
        if (point.lon < node.point.lon) {
          if (node.left == null) {
            node.left = newNode;
            newNode.parent = node;
            return;
          }
          node = node.left;
        } else {
          if (node.right == null) {
            node.right = newNode;
            newNode.parent = node;
            return;
          }
          node = node.right;
        }
      } else {
        if (point.lat < node.point.lat) {
          if (node.left == null) {
            node.left = newNode;
            newNode.parent = node;
            return;
          }
          node = node.left;
        } else {
          if (node.right == null) {
            node.right = newNode;
            newNode.parent = node;
            return;
          }
          node = node.right;
        }
      }
      depth++;
    }
  }
  contains(point) {
    const pointKey = this.getPointKey(point);
    return this.nodeMap.has(pointKey);
  }
  getDocIDsByCoordinates(point) {
    const pointKey = this.getPointKey(point);
    const node = this.nodeMap.get(pointKey);
    if (node) {
      return Array.from(node.docIDs);
    }
    return null;
  }
  removeDocByID(point, docID) {
    const pointKey = this.getPointKey(point);
    const node = this.nodeMap.get(pointKey);
    if (node) {
      node.docIDs.delete(docID);
      if (node.docIDs.size === 0) {
        this.nodeMap.delete(pointKey);
        this.deleteNode(node);
      }
    }
  }
  deleteNode(node) {
    const parent = node.parent;
    const child = node.left ? node.left : node.right;
    if (child) {
      child.parent = parent;
    }
    if (parent) {
      if (parent.left === node) {
        parent.left = child;
      } else if (parent.right === node) {
        parent.right = child;
      }
    } else {
      this.root = child;
      if (this.root) {
        this.root.parent = null;
      }
    }
  }
  searchByRadius(center, radius, inclusive = true, sort = "asc", highPrecision = false) {
    const distanceFn = highPrecision ? _BKDTree.vincentyDistance : _BKDTree.haversineDistance;
    const stack = [{ node: this.root, depth: 0 }];
    const result = [];
    while (stack.length > 0) {
      const { node, depth } = stack.pop();
      if (node == null)
        continue;
      const dist = distanceFn(center, node.point);
      if (inclusive ? dist <= radius : dist > radius) {
        result.push({ point: node.point, docIDs: Array.from(node.docIDs) });
      }
      if (node.left != null) {
        stack.push({ node: node.left, depth: depth + 1 });
      }
      if (node.right != null) {
        stack.push({ node: node.right, depth: depth + 1 });
      }
    }
    if (sort) {
      result.sort((a, b) => {
        const distA = distanceFn(center, a.point);
        const distB = distanceFn(center, b.point);
        return sort.toLowerCase() === "asc" ? distA - distB : distB - distA;
      });
    }
    return result;
  }
  searchByPolygon(polygon, inclusive = true, sort = null, highPrecision = false) {
    const stack = [{ node: this.root, depth: 0 }];
    const result = [];
    while (stack.length > 0) {
      const { node, depth } = stack.pop();
      if (node == null)
        continue;
      if (node.left != null) {
        stack.push({ node: node.left, depth: depth + 1 });
      }
      if (node.right != null) {
        stack.push({ node: node.right, depth: depth + 1 });
      }
      const isInsidePolygon = _BKDTree.isPointInPolygon(polygon, node.point);
      if (isInsidePolygon && inclusive || !isInsidePolygon && !inclusive) {
        result.push({ point: node.point, docIDs: Array.from(node.docIDs) });
      }
    }
    const centroid = _BKDTree.calculatePolygonCentroid(polygon);
    if (sort) {
      const distanceFn = highPrecision ? _BKDTree.vincentyDistance : _BKDTree.haversineDistance;
      result.sort((a, b) => {
        const distA = distanceFn(centroid, a.point);
        const distB = distanceFn(centroid, b.point);
        return sort.toLowerCase() === "asc" ? distA - distB : distB - distA;
      });
    }
    return result;
  }
  toJSON() {
    return {
      root: this.root ? this.root.toJSON() : null
    };
  }
  static fromJSON(json) {
    const tree = new _BKDTree();
    if (json.root) {
      tree.root = BKDNode.fromJSON(json.root);
      tree.buildNodeMap(tree.root);
    }
    return tree;
  }
  buildNodeMap(node) {
    if (node == null)
      return;
    const pointKey = this.getPointKey(node.point);
    this.nodeMap.set(pointKey, node);
    if (node.left) {
      this.buildNodeMap(node.left);
    }
    if (node.right) {
      this.buildNodeMap(node.right);
    }
  }
  static calculatePolygonCentroid(polygon) {
    let totalArea = 0;
    let centroidX = 0;
    let centroidY = 0;
    const polygonLength = polygon.length;
    for (let i = 0, j = polygonLength - 1; i < polygonLength; j = i++) {
      const xi = polygon[i].lon;
      const yi = polygon[i].lat;
      const xj = polygon[j].lon;
      const yj = polygon[j].lat;
      const areaSegment = xi * yj - xj * yi;
      totalArea += areaSegment;
      centroidX += (xi + xj) * areaSegment;
      centroidY += (yi + yj) * areaSegment;
    }
    totalArea /= 2;
    const centroidCoordinate = 6 * totalArea;
    centroidX /= centroidCoordinate;
    centroidY /= centroidCoordinate;
    return { lon: centroidX, lat: centroidY };
  }
  static isPointInPolygon(polygon, point) {
    let isInside = false;
    const x = point.lon;
    const y = point.lat;
    const polygonLength = polygon.length;
    for (let i = 0, j = polygonLength - 1; i < polygonLength; j = i++) {
      const xi = polygon[i].lon;
      const yi = polygon[i].lat;
      const xj = polygon[j].lon;
      const yj = polygon[j].lat;
      const intersect2 = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect2)
        isInside = !isInside;
    }
    return isInside;
  }
  static haversineDistance(coord1, coord2) {
    const P = Math.PI / 180;
    const lat1 = coord1.lat * P;
    const lat2 = coord2.lat * P;
    const deltaLat = (coord2.lat - coord1.lat) * P;
    const deltaLon = (coord2.lon - coord1.lon) * P;
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c2 = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c2;
  }
  static vincentyDistance(coord1, coord2) {
    const a = 6378137;
    const f = 1 / 298.257223563;
    const b = (1 - f) * a;
    const P = Math.PI / 180;
    const lat1 = coord1.lat * P;
    const lat2 = coord2.lat * P;
    const deltaLon = (coord2.lon - coord1.lon) * P;
    const U1 = Math.atan((1 - f) * Math.tan(lat1));
    const U2 = Math.atan((1 - f) * Math.tan(lat2));
    const sinU1 = Math.sin(U1);
    const cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2);
    const cosU2 = Math.cos(U2);
    let lambda = deltaLon;
    let prevLambda;
    let iterationLimit = 1e3;
    let sinSigma;
    let cosSigma;
    let sigma;
    let sinAlpha;
    let cos2Alpha;
    let cos2SigmaM;
    do {
      const sinLambda = Math.sin(lambda);
      const cosLambda = Math.cos(lambda);
      sinSigma = Math.sqrt(cosU2 * sinLambda * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
      if (sinSigma === 0)
        return 0;
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      sigma = Math.atan2(sinSigma, cosSigma);
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      cos2Alpha = 1 - sinAlpha * sinAlpha;
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cos2Alpha;
      if (isNaN(cos2SigmaM))
        cos2SigmaM = 0;
      const C2 = f / 16 * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
      prevLambda = lambda;
      lambda = deltaLon + (1 - C2) * f * sinAlpha * (sigma + C2 * sinSigma * (cos2SigmaM + C2 * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - prevLambda) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      return NaN;
    }
    const uSquared = cos2Alpha * (a * a - b * b) / (b * b);
    const A = 1 + uSquared / 16384 * (4096 + uSquared * (-768 + uSquared * (320 - 175 * uSquared)));
    const B = uSquared / 1024 * (256 + uSquared * (-128 + uSquared * (74 - 47 * uSquared)));
    const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    const s = b * A * (sigma - deltaSigma);
    return s;
  }
};

// node_modules/@orama/orama/dist/esm/trees/bool.js
var BoolNode = class _BoolNode {
  true;
  false;
  constructor() {
    this.true = /* @__PURE__ */ new Set();
    this.false = /* @__PURE__ */ new Set();
  }
  insert(value, bool) {
    if (bool) {
      this.true.add(value);
    } else {
      this.false.add(value);
    }
  }
  delete(value, bool) {
    if (bool) {
      this.true.delete(value);
    } else {
      this.false.delete(value);
    }
  }
  getSize() {
    return this.true.size + this.false.size;
  }
  toJSON() {
    return {
      true: Array.from(this.true),
      false: Array.from(this.false)
    };
  }
  static fromJSON(json) {
    const node = new _BoolNode();
    node.true = new Set(json.true);
    node.false = new Set(json.false);
    return node;
  }
};

// node_modules/@orama/orama/dist/esm/components/algorithms.js
function BM25(tf, matchingCount, docsCount, fieldLength, averageFieldLength, { k, b, d }) {
  const idf = Math.log(1 + (docsCount - matchingCount + 0.5) / (matchingCount + 0.5));
  return idf * (d + tf * (k + 1)) / (tf + k * (1 - b + b * fieldLength / averageFieldLength));
}

// node_modules/@orama/orama/dist/esm/trees/vector.js
var DEFAULT_SIMILARITY = 0.8;
var VectorIndex = class _VectorIndex {
  size;
  vectors = /* @__PURE__ */ new Map();
  constructor(size) {
    this.size = size;
  }
  add(internalDocumentId, value) {
    if (!(value instanceof Float32Array)) {
      value = new Float32Array(value);
    }
    const magnitude = getMagnitude(value, this.size);
    this.vectors.set(internalDocumentId, [magnitude, value]);
  }
  remove(internalDocumentId) {
    this.vectors.delete(internalDocumentId);
  }
  find(vector, similarity, whereFiltersIDs) {
    if (!(vector instanceof Float32Array)) {
      vector = new Float32Array(vector);
    }
    const results = findSimilarVectors(vector, whereFiltersIDs, this.vectors, this.size, similarity);
    return results;
  }
  toJSON() {
    const vectors = [];
    for (const [id, [magnitude, vector]] of this.vectors) {
      vectors.push([id, [magnitude, Array.from(vector)]]);
    }
    return {
      size: this.size,
      vectors
    };
  }
  static fromJSON(json) {
    const raw = json;
    const index = new _VectorIndex(raw.size);
    for (const [id, [magnitude, vector]] of raw.vectors) {
      index.vectors.set(id, [magnitude, new Float32Array(vector)]);
    }
    return index;
  }
};
function getMagnitude(vector, vectorLength) {
  let magnitude = 0;
  for (let i = 0; i < vectorLength; i++) {
    magnitude += vector[i] * vector[i];
  }
  return Math.sqrt(magnitude);
}
function findSimilarVectors(targetVector, keys, vectors, length, threshold) {
  const targetMagnitude = getMagnitude(targetVector, length);
  const similarVectors = [];
  const base = keys ? keys : vectors.keys();
  for (const vectorId of base) {
    const entry = vectors.get(vectorId);
    if (!entry) {
      continue;
    }
    const magnitude = entry[0];
    const vector = entry[1];
    let dotProduct = 0;
    for (let i = 0; i < length; i++) {
      dotProduct += targetVector[i] * vector[i];
    }
    const similarity = dotProduct / (targetMagnitude * magnitude);
    if (similarity >= threshold) {
      similarVectors.push([vectorId, similarity]);
    }
  }
  return similarVectors;
}

// node_modules/@orama/orama/dist/esm/components/index.js
function insertDocumentScoreParameters(index, prop, id, tokens, docsCount) {
  const internalId = getInternalDocumentId(index.sharedInternalDocumentStore, id);
  index.avgFieldLength[prop] = ((index.avgFieldLength[prop] ?? 0) * (docsCount - 1) + tokens.length) / docsCount;
  index.fieldLengths[prop][internalId] = tokens.length;
  index.frequencies[prop][internalId] = {};
}
function insertTokenScoreParameters(index, prop, id, tokens, token) {
  let tokenFrequency = 0;
  for (const t of tokens) {
    if (t === token) {
      tokenFrequency++;
    }
  }
  const internalId = getInternalDocumentId(index.sharedInternalDocumentStore, id);
  const tf = tokenFrequency / tokens.length;
  index.frequencies[prop][internalId][token] = tf;
  if (!(token in index.tokenOccurrences[prop])) {
    index.tokenOccurrences[prop][token] = 0;
  }
  index.tokenOccurrences[prop][token] = (index.tokenOccurrences[prop][token] ?? 0) + 1;
}
function removeDocumentScoreParameters(index, prop, id, docsCount) {
  const internalId = getInternalDocumentId(index.sharedInternalDocumentStore, id);
  if (docsCount > 1) {
    index.avgFieldLength[prop] = (index.avgFieldLength[prop] * docsCount - index.fieldLengths[prop][internalId]) / (docsCount - 1);
  } else {
    index.avgFieldLength[prop] = void 0;
  }
  index.fieldLengths[prop][internalId] = void 0;
  index.frequencies[prop][internalId] = void 0;
}
function removeTokenScoreParameters(index, prop, token) {
  index.tokenOccurrences[prop][token]--;
}
function create2(orama, sharedInternalDocumentStore, schema, index, prefix = "") {
  if (!index) {
    index = {
      sharedInternalDocumentStore,
      indexes: {},
      vectorIndexes: {},
      searchableProperties: [],
      searchablePropertiesWithTypes: {},
      frequencies: {},
      tokenOccurrences: {},
      avgFieldLength: {},
      fieldLengths: {}
    };
  }
  for (const [prop, type] of Object.entries(schema)) {
    const path7 = `${prefix}${prefix ? "." : ""}${prop}`;
    if (typeof type === "object" && !Array.isArray(type)) {
      create2(orama, sharedInternalDocumentStore, type, index, path7);
      continue;
    }
    if (isVectorType(type)) {
      index.searchableProperties.push(path7);
      index.searchablePropertiesWithTypes[path7] = type;
      index.vectorIndexes[path7] = {
        type: "Vector",
        node: new VectorIndex(getVectorSize(type)),
        isArray: false
      };
    } else {
      const isArray = /\[/.test(type);
      switch (type) {
        case "boolean":
        case "boolean[]":
          index.indexes[path7] = { type: "Bool", node: new BoolNode(), isArray };
          break;
        case "number":
        case "number[]":
          index.indexes[path7] = { type: "AVL", node: new AVLTree(0, []), isArray };
          break;
        case "string":
        case "string[]":
          index.indexes[path7] = { type: "Radix", node: new RadixTree(), isArray };
          index.avgFieldLength[path7] = 0;
          index.frequencies[path7] = {};
          index.tokenOccurrences[path7] = {};
          index.fieldLengths[path7] = {};
          break;
        case "enum":
        case "enum[]":
          index.indexes[path7] = { type: "Flat", node: new FlatTree(), isArray };
          break;
        case "geopoint":
          index.indexes[path7] = { type: "BKD", node: new BKDTree(), isArray };
          break;
        default:
          throw createError("INVALID_SCHEMA_TYPE", Array.isArray(type) ? "array" : type, path7);
      }
      index.searchableProperties.push(path7);
      index.searchablePropertiesWithTypes[path7] = type;
    }
  }
  return index;
}
function insertScalarBuilder(implementation, index, prop, internalId, language, tokenizer, docsCount, options2) {
  return (value) => {
    const { type, node } = index.indexes[prop];
    switch (type) {
      case "Bool": {
        node[value ? "true" : "false"].add(internalId);
        break;
      }
      case "AVL": {
        const avlRebalanceThreshold = options2?.avlRebalanceThreshold ?? 1;
        node.insert(value, internalId, avlRebalanceThreshold);
        break;
      }
      case "Radix": {
        const tokens = tokenizer.tokenize(value, language, prop, false);
        implementation.insertDocumentScoreParameters(index, prop, internalId, tokens, docsCount);
        for (const token of tokens) {
          implementation.insertTokenScoreParameters(index, prop, internalId, tokens, token);
          node.insert(token, internalId);
        }
        break;
      }
      case "Flat": {
        node.insert(value, internalId);
        break;
      }
      case "BKD": {
        node.insert(value, [internalId]);
        break;
      }
    }
  };
}
function insert(implementation, index, prop, id, internalId, value, schemaType, language, tokenizer, docsCount, options2) {
  if (isVectorType(schemaType)) {
    return insertVector(index, prop, value, id, internalId);
  }
  const insertScalar = insertScalarBuilder(implementation, index, prop, internalId, language, tokenizer, docsCount, options2);
  if (!isArrayType(schemaType)) {
    return insertScalar(value);
  }
  const elements = value;
  const elementsLength = elements.length;
  for (let i = 0; i < elementsLength; i++) {
    insertScalar(elements[i]);
  }
}
function insertVector(index, prop, value, id, internalDocumentId) {
  index.vectorIndexes[prop].node.add(internalDocumentId, value);
}
function removeScalar(implementation, index, prop, id, internalId, value, schemaType, language, tokenizer, docsCount) {
  if (isVectorType(schemaType)) {
    index.vectorIndexes[prop].node.remove(internalId);
    return true;
  }
  const { type, node } = index.indexes[prop];
  switch (type) {
    case "AVL": {
      node.removeDocument(value, internalId);
      return true;
    }
    case "Bool": {
      node[value ? "true" : "false"].delete(internalId);
      return true;
    }
    case "Radix": {
      const tokens = tokenizer.tokenize(value, language, prop);
      implementation.removeDocumentScoreParameters(index, prop, id, docsCount);
      for (const token of tokens) {
        implementation.removeTokenScoreParameters(index, prop, token);
        node.removeDocumentByWord(token, internalId);
      }
      return true;
    }
    case "Flat": {
      node.removeDocument(internalId, value);
      return true;
    }
    case "BKD": {
      node.removeDocByID(value, internalId);
      return false;
    }
  }
}
function remove2(implementation, index, prop, id, internalId, value, schemaType, language, tokenizer, docsCount) {
  if (!isArrayType(schemaType)) {
    return removeScalar(implementation, index, prop, id, internalId, value, schemaType, language, tokenizer, docsCount);
  }
  const innerSchemaType = getInnerType(schemaType);
  const elements = value;
  const elementsLength = elements.length;
  for (let i = 0; i < elementsLength; i++) {
    removeScalar(implementation, index, prop, id, internalId, elements[i], innerSchemaType, language, tokenizer, docsCount);
  }
  return true;
}
function calculateResultScores(index, prop, term, ids, docsCount, bm25Relevance, resultsMap, boostPerProperty, whereFiltersIDs, keywordMatchesMap) {
  const documentIDs = Array.from(ids);
  const avgFieldLength = index.avgFieldLength[prop];
  const fieldLengths = index.fieldLengths[prop];
  const oramaOccurrences = index.tokenOccurrences[prop];
  const oramaFrequencies = index.frequencies[prop];
  const termOccurrences = typeof oramaOccurrences[term] === "number" ? oramaOccurrences[term] ?? 0 : 0;
  const documentIDsLength = documentIDs.length;
  for (let k = 0; k < documentIDsLength; k++) {
    const internalId = documentIDs[k];
    if (whereFiltersIDs && !whereFiltersIDs.has(internalId)) {
      continue;
    }
    if (!keywordMatchesMap.has(internalId)) {
      keywordMatchesMap.set(internalId, /* @__PURE__ */ new Map());
    }
    const propertyMatches = keywordMatchesMap.get(internalId);
    propertyMatches.set(prop, (propertyMatches.get(prop) || 0) + 1);
    const tf = oramaFrequencies?.[internalId]?.[term] ?? 0;
    const bm25 = BM25(tf, termOccurrences, docsCount, fieldLengths[internalId], avgFieldLength, bm25Relevance);
    if (resultsMap.has(internalId)) {
      resultsMap.set(internalId, resultsMap.get(internalId) + bm25 * boostPerProperty);
    } else {
      resultsMap.set(internalId, bm25 * boostPerProperty);
    }
  }
}
function search(index, term, tokenizer, language, propertiesToSearch, exact, tolerance, boost, relevance, docsCount, whereFiltersIDs, threshold = 0) {
  const tokens = tokenizer.tokenize(term, language);
  const keywordsCount = tokens.length || 1;
  const keywordMatchesMap = /* @__PURE__ */ new Map();
  const tokenFoundMap = /* @__PURE__ */ new Map();
  const resultsMap = /* @__PURE__ */ new Map();
  for (const prop of propertiesToSearch) {
    if (!(prop in index.indexes)) {
      continue;
    }
    const tree = index.indexes[prop];
    const { type } = tree;
    if (type !== "Radix") {
      throw createError("WRONG_SEARCH_PROPERTY_TYPE", prop);
    }
    const boostPerProperty = boost[prop] ?? 1;
    if (boostPerProperty <= 0) {
      throw createError("INVALID_BOOST_VALUE", boostPerProperty);
    }
    if (tokens.length === 0 && !term) {
      tokens.push("");
    }
    const tokenLength = tokens.length;
    for (let i = 0; i < tokenLength; i++) {
      const token = tokens[i];
      const searchResult = tree.node.find({ term: token, exact, tolerance });
      const termsFound = Object.keys(searchResult);
      if (termsFound.length > 0) {
        tokenFoundMap.set(token, true);
      }
      const termsFoundLength = termsFound.length;
      for (let j = 0; j < termsFoundLength; j++) {
        const word = termsFound[j];
        const ids = searchResult[word];
        calculateResultScores(index, prop, word, ids, docsCount, relevance, resultsMap, boostPerProperty, whereFiltersIDs, keywordMatchesMap);
      }
    }
  }
  const results = Array.from(resultsMap.entries()).map(([id, score]) => [id, score]).sort((a, b) => b[1] - a[1]);
  if (results.length === 0) {
    return [];
  }
  if (threshold === 1) {
    return results;
  }
  if (threshold === 0) {
    if (keywordsCount === 1) {
      return results;
    }
    for (const token of tokens) {
      if (!tokenFoundMap.get(token)) {
        return [];
      }
    }
    const fullMatches2 = results.filter(([id]) => {
      const propertyMatches = keywordMatchesMap.get(id);
      if (!propertyMatches)
        return false;
      return Array.from(propertyMatches.values()).some((matches) => matches === keywordsCount);
    });
    return fullMatches2;
  }
  const fullMatches = results.filter(([id]) => {
    const propertyMatches = keywordMatchesMap.get(id);
    if (!propertyMatches)
      return false;
    return Array.from(propertyMatches.values()).some((matches) => matches === keywordsCount);
  });
  if (fullMatches.length > 0) {
    const remainingResults = results.filter(([id]) => !fullMatches.some(([fid]) => fid === id));
    const additionalResults = Math.ceil(remainingResults.length * threshold);
    return [...fullMatches, ...remainingResults.slice(0, additionalResults)];
  }
  return results;
}
function searchByWhereClause(index, tokenizer, filters, language) {
  if ("and" in filters && filters.and && Array.isArray(filters.and)) {
    const andFilters = filters.and;
    if (andFilters.length === 0) {
      return /* @__PURE__ */ new Set();
    }
    const results = andFilters.map((filter) => searchByWhereClause(index, tokenizer, filter, language));
    return setIntersection(...results);
  }
  if ("or" in filters && filters.or && Array.isArray(filters.or)) {
    const orFilters = filters.or;
    if (orFilters.length === 0) {
      return /* @__PURE__ */ new Set();
    }
    const results = orFilters.map((filter) => searchByWhereClause(index, tokenizer, filter, language));
    return results.reduce((acc, set) => setUnion(acc, set), /* @__PURE__ */ new Set());
  }
  if ("not" in filters && filters.not) {
    const notFilter = filters.not;
    const allDocs = /* @__PURE__ */ new Set();
    const docsStore = index.sharedInternalDocumentStore;
    for (let i = 1; i <= docsStore.internalIdToId.length; i++) {
      allDocs.add(i);
    }
    const notResult = searchByWhereClause(index, tokenizer, notFilter, language);
    return setDifference(allDocs, notResult);
  }
  const filterKeys = Object.keys(filters);
  const filtersMap = filterKeys.reduce((acc, key) => ({
    [key]: /* @__PURE__ */ new Set(),
    ...acc
  }), {});
  for (const param of filterKeys) {
    const operation = filters[param];
    if (typeof index.indexes[param] === "undefined") {
      throw createError("UNKNOWN_FILTER_PROPERTY", param);
    }
    const { node, type, isArray } = index.indexes[param];
    if (type === "Bool") {
      const idx = node;
      const filteredIDs = operation ? idx.true : idx.false;
      filtersMap[param] = setUnion(filtersMap[param], filteredIDs);
      continue;
    }
    if (type === "BKD") {
      let reqOperation;
      if ("radius" in operation) {
        reqOperation = "radius";
      } else if ("polygon" in operation) {
        reqOperation = "polygon";
      } else {
        throw new Error(`Invalid operation ${operation}`);
      }
      if (reqOperation === "radius") {
        const { value, coordinates, unit = "m", inside = true, highPrecision = false } = operation[reqOperation];
        const distanceInMeters = convertDistanceToMeters(value, unit);
        const ids = node.searchByRadius(coordinates, distanceInMeters, inside, void 0, highPrecision);
        filtersMap[param] = addGeoResult(filtersMap[param], ids);
      } else {
        const { coordinates, inside = true, highPrecision = false } = operation[reqOperation];
        const ids = node.searchByPolygon(coordinates, inside, void 0, highPrecision);
        filtersMap[param] = addGeoResult(filtersMap[param], ids);
      }
      continue;
    }
    if (type === "Radix" && (typeof operation === "string" || Array.isArray(operation))) {
      for (const raw of [operation].flat()) {
        const term = tokenizer.tokenize(raw, language, param);
        for (const t of term) {
          const filteredIDsResults = node.find({ term: t, exact: true });
          filtersMap[param] = addFindResult(filtersMap[param], filteredIDsResults);
        }
      }
      continue;
    }
    const operationKeys = Object.keys(operation);
    if (operationKeys.length > 1) {
      throw createError("INVALID_FILTER_OPERATION", operationKeys.length);
    }
    if (type === "Flat") {
      const results = new Set(isArray ? node.filterArr(operation) : node.filter(operation));
      filtersMap[param] = setUnion(filtersMap[param], results);
      continue;
    }
    if (type === "AVL") {
      const operationOpt = operationKeys[0];
      const operationValue = operation[operationOpt];
      let filteredIDs;
      switch (operationOpt) {
        case "gt": {
          filteredIDs = node.greaterThan(operationValue, false);
          break;
        }
        case "gte": {
          filteredIDs = node.greaterThan(operationValue, true);
          break;
        }
        case "lt": {
          filteredIDs = node.lessThan(operationValue, false);
          break;
        }
        case "lte": {
          filteredIDs = node.lessThan(operationValue, true);
          break;
        }
        case "eq": {
          const ret = node.find(operationValue);
          filteredIDs = ret ?? /* @__PURE__ */ new Set();
          break;
        }
        case "between": {
          const [min, max] = operationValue;
          filteredIDs = node.rangeSearch(min, max);
          break;
        }
        default:
          throw createError("INVALID_FILTER_OPERATION", operationOpt);
      }
      filtersMap[param] = setUnion(filtersMap[param], filteredIDs);
    }
  }
  return setIntersection(...Object.values(filtersMap));
}
function getSearchableProperties(index) {
  return index.searchableProperties;
}
function getSearchablePropertiesWithTypes(index) {
  return index.searchablePropertiesWithTypes;
}
function load3(sharedInternalDocumentStore, raw) {
  const { indexes: rawIndexes, vectorIndexes: rawVectorIndexes, searchableProperties, searchablePropertiesWithTypes, frequencies, tokenOccurrences, avgFieldLength, fieldLengths } = raw;
  const indexes = {};
  const vectorIndexes = {};
  for (const prop of Object.keys(rawIndexes)) {
    const { node, type, isArray } = rawIndexes[prop];
    switch (type) {
      case "Radix":
        indexes[prop] = {
          type: "Radix",
          node: RadixTree.fromJSON(node),
          isArray
        };
        break;
      case "Flat":
        indexes[prop] = {
          type: "Flat",
          node: FlatTree.fromJSON(node),
          isArray
        };
        break;
      case "AVL":
        indexes[prop] = {
          type: "AVL",
          node: AVLTree.fromJSON(node),
          isArray
        };
        break;
      case "BKD":
        indexes[prop] = {
          type: "BKD",
          node: BKDTree.fromJSON(node),
          isArray
        };
        break;
      case "Bool":
        indexes[prop] = {
          type: "Bool",
          node: BoolNode.fromJSON(node),
          isArray
        };
        break;
      default:
        indexes[prop] = rawIndexes[prop];
    }
  }
  for (const idx of Object.keys(rawVectorIndexes)) {
    vectorIndexes[idx] = {
      type: "Vector",
      isArray: false,
      node: VectorIndex.fromJSON(rawVectorIndexes[idx])
    };
  }
  return {
    sharedInternalDocumentStore,
    indexes,
    vectorIndexes,
    searchableProperties,
    searchablePropertiesWithTypes,
    frequencies,
    tokenOccurrences,
    avgFieldLength,
    fieldLengths
  };
}
function save3(index) {
  const { indexes, vectorIndexes, searchableProperties, searchablePropertiesWithTypes, frequencies, tokenOccurrences, avgFieldLength, fieldLengths } = index;
  const dumpVectorIndexes = {};
  for (const idx of Object.keys(vectorIndexes)) {
    dumpVectorIndexes[idx] = vectorIndexes[idx].node.toJSON();
  }
  const savedIndexes = {};
  for (const name of Object.keys(indexes)) {
    const { type, node, isArray } = indexes[name];
    if (type === "Flat" || type === "Radix" || type === "AVL" || type === "BKD" || type === "Bool") {
      savedIndexes[name] = {
        type,
        node: node.toJSON(),
        isArray
      };
    } else {
      savedIndexes[name] = indexes[name];
      savedIndexes[name].node = savedIndexes[name].node.toJSON();
    }
  }
  return {
    indexes: savedIndexes,
    vectorIndexes: dumpVectorIndexes,
    searchableProperties,
    searchablePropertiesWithTypes,
    frequencies,
    tokenOccurrences,
    avgFieldLength,
    fieldLengths
  };
}
function createIndex() {
  return {
    create: create2,
    insert,
    remove: remove2,
    insertDocumentScoreParameters,
    insertTokenScoreParameters,
    removeDocumentScoreParameters,
    removeTokenScoreParameters,
    calculateResultScores,
    search,
    searchByWhereClause,
    getSearchableProperties,
    getSearchablePropertiesWithTypes,
    load: load3,
    save: save3
  };
}
function addGeoResult(set, ids) {
  if (!set) {
    set = /* @__PURE__ */ new Set();
  }
  const idsLength = ids.length;
  for (let i = 0; i < idsLength; i++) {
    const entry = ids[i].docIDs;
    const idsLength2 = entry.length;
    for (let j = 0; j < idsLength2; j++) {
      set.add(entry[j]);
    }
  }
  return set;
}
function createGeoTokenScores(ids, centerPoint, highPrecision = false) {
  const distanceFn = highPrecision ? BKDTree.vincentyDistance : BKDTree.haversineDistance;
  const results = [];
  const distances = [];
  for (const { point } of ids) {
    distances.push(distanceFn(centerPoint, point));
  }
  const maxDistance = Math.max(...distances);
  let index = 0;
  for (const { docIDs } of ids) {
    const distance = distances[index];
    const score = maxDistance - distance + 1;
    for (const docID of docIDs) {
      results.push([docID, score]);
    }
    index++;
  }
  results.sort((a, b) => b[1] - a[1]);
  return results;
}
function isGeosearchOnlyQuery(filters, index) {
  const filterKeys = Object.keys(filters);
  if (filterKeys.length !== 1) {
    return { isGeoOnly: false };
  }
  const param = filterKeys[0];
  const operation = filters[param];
  if (typeof index.indexes[param] === "undefined") {
    return { isGeoOnly: false };
  }
  const { type } = index.indexes[param];
  if (type === "BKD" && operation && ("radius" in operation || "polygon" in operation)) {
    return { isGeoOnly: true, geoProperty: param, geoOperation: operation };
  }
  return { isGeoOnly: false };
}
function searchByGeoWhereClause(index, filters) {
  const indexTyped = index;
  const geoInfo = isGeosearchOnlyQuery(filters, indexTyped);
  if (!geoInfo.isGeoOnly || !geoInfo.geoProperty || !geoInfo.geoOperation) {
    return null;
  }
  const { node } = indexTyped.indexes[geoInfo.geoProperty];
  const operation = geoInfo.geoOperation;
  const bkdNode = node;
  let results;
  if ("radius" in operation) {
    const { value, coordinates, unit = "m", inside = true, highPrecision = false } = operation.radius;
    const centerPoint = coordinates;
    const distanceInMeters = convertDistanceToMeters(value, unit);
    results = bkdNode.searchByRadius(centerPoint, distanceInMeters, inside, "asc", highPrecision);
    return createGeoTokenScores(results, centerPoint, highPrecision);
  } else if ("polygon" in operation) {
    const { coordinates, inside = true, highPrecision = false } = operation.polygon;
    results = bkdNode.searchByPolygon(coordinates, inside, "asc", highPrecision);
    const centroid = BKDTree.calculatePolygonCentroid(coordinates);
    return createGeoTokenScores(results, centroid, highPrecision);
  }
  return null;
}
function addFindResult(set, filteredIDsResults) {
  if (!set) {
    set = /* @__PURE__ */ new Set();
  }
  const keys = Object.keys(filteredIDsResults);
  const keysLength = keys.length;
  for (let i = 0; i < keysLength; i++) {
    const ids = filteredIDsResults[keys[i]];
    const idsLength = ids.length;
    for (let j = 0; j < idsLength; j++) {
      set.add(ids[j]);
    }
  }
  return set;
}

// node_modules/@orama/orama/dist/esm/components/sorter.js
function innerCreate(orama, sharedInternalDocumentStore, schema, sortableDeniedProperties, prefix) {
  const sorter = {
    language: orama.tokenizer.language,
    sharedInternalDocumentStore,
    enabled: true,
    isSorted: true,
    sortableProperties: [],
    sortablePropertiesWithTypes: {},
    sorts: {}
  };
  for (const [prop, type] of Object.entries(schema)) {
    const path7 = `${prefix}${prefix ? "." : ""}${prop}`;
    if (sortableDeniedProperties.includes(path7)) {
      continue;
    }
    if (typeof type === "object" && !Array.isArray(type)) {
      const ret = innerCreate(orama, sharedInternalDocumentStore, type, sortableDeniedProperties, path7);
      safeArrayPush(sorter.sortableProperties, ret.sortableProperties);
      sorter.sorts = {
        ...sorter.sorts,
        ...ret.sorts
      };
      sorter.sortablePropertiesWithTypes = {
        ...sorter.sortablePropertiesWithTypes,
        ...ret.sortablePropertiesWithTypes
      };
      continue;
    }
    if (!isVectorType(type)) {
      switch (type) {
        case "boolean":
        case "number":
        case "string":
          sorter.sortableProperties.push(path7);
          sorter.sortablePropertiesWithTypes[path7] = type;
          sorter.sorts[path7] = {
            docs: /* @__PURE__ */ new Map(),
            orderedDocsToRemove: /* @__PURE__ */ new Map(),
            orderedDocs: [],
            type
          };
          break;
        case "geopoint":
        case "enum":
          continue;
        case "enum[]":
        case "boolean[]":
        case "number[]":
        case "string[]":
          continue;
        default:
          throw createError("INVALID_SORT_SCHEMA_TYPE", Array.isArray(type) ? "array" : type, path7);
      }
    }
  }
  return sorter;
}
function create3(orama, sharedInternalDocumentStore, schema, config) {
  const isSortEnabled = config?.enabled !== false;
  if (!isSortEnabled) {
    return {
      disabled: true
    };
  }
  return innerCreate(orama, sharedInternalDocumentStore, schema, (config || {}).unsortableProperties || [], "");
}
function insert2(sorter, prop, id, value) {
  if (!sorter.enabled) {
    return;
  }
  sorter.isSorted = false;
  const internalId = getInternalDocumentId(sorter.sharedInternalDocumentStore, id);
  const s = sorter.sorts[prop];
  if (s.orderedDocsToRemove.has(internalId)) {
    ensureOrderedDocsAreDeletedByProperty(sorter, prop);
  }
  s.docs.set(internalId, s.orderedDocs.length);
  s.orderedDocs.push([internalId, value]);
}
function ensureIsSorted(sorter) {
  if (sorter.isSorted || !sorter.enabled) {
    return;
  }
  const properties = Object.keys(sorter.sorts);
  for (const prop of properties) {
    ensurePropertyIsSorted(sorter, prop);
  }
  sorter.isSorted = true;
}
function stringSort(language, value, d) {
  return value[1].localeCompare(d[1], getLocale(language));
}
function numberSort(value, d) {
  return value[1] - d[1];
}
function booleanSort(value, d) {
  return d[1] ? -1 : 1;
}
function ensurePropertyIsSorted(sorter, prop) {
  const s = sorter.sorts[prop];
  let predicate;
  switch (s.type) {
    case "string":
      predicate = stringSort.bind(null, sorter.language);
      break;
    case "number":
      predicate = numberSort.bind(null);
      break;
    case "boolean":
      predicate = booleanSort.bind(null);
      break;
  }
  s.orderedDocs.sort(predicate);
  const orderedDocsLength = s.orderedDocs.length;
  for (let i = 0; i < orderedDocsLength; i++) {
    const docId = s.orderedDocs[i][0];
    s.docs.set(docId, i);
  }
}
function ensureOrderedDocsAreDeleted(sorter) {
  const properties = Object.keys(sorter.sorts);
  for (const prop of properties) {
    ensureOrderedDocsAreDeletedByProperty(sorter, prop);
  }
}
function ensureOrderedDocsAreDeletedByProperty(sorter, prop) {
  const s = sorter.sorts[prop];
  if (!s.orderedDocsToRemove.size)
    return;
  s.orderedDocs = s.orderedDocs.filter((doc) => !s.orderedDocsToRemove.has(doc[0]));
  s.orderedDocsToRemove.clear();
}
function remove3(sorter, prop, id) {
  if (!sorter.enabled) {
    return;
  }
  const s = sorter.sorts[prop];
  const internalId = getInternalDocumentId(sorter.sharedInternalDocumentStore, id);
  const index = s.docs.get(internalId);
  if (!index)
    return;
  s.docs.delete(internalId);
  s.orderedDocsToRemove.set(internalId, true);
}
function sortBy(sorter, docIds, by) {
  if (!sorter.enabled) {
    throw createError("SORT_DISABLED");
  }
  const property = by.property;
  const isDesc = by.order === "DESC";
  const s = sorter.sorts[property];
  if (!s) {
    throw createError("UNABLE_TO_SORT_ON_UNKNOWN_FIELD", property, sorter.sortableProperties.join(", "));
  }
  ensureOrderedDocsAreDeletedByProperty(sorter, property);
  ensureIsSorted(sorter);
  docIds.sort((a, b) => {
    const indexOfA = s.docs.get(getInternalDocumentId(sorter.sharedInternalDocumentStore, a[0]));
    const indexOfB = s.docs.get(getInternalDocumentId(sorter.sharedInternalDocumentStore, b[0]));
    const isAIndexed = typeof indexOfA !== "undefined";
    const isBIndexed = typeof indexOfB !== "undefined";
    if (!isAIndexed && !isBIndexed) {
      return 0;
    }
    if (!isAIndexed) {
      return 1;
    }
    if (!isBIndexed) {
      return -1;
    }
    return isDesc ? indexOfB - indexOfA : indexOfA - indexOfB;
  });
  return docIds;
}
function getSortableProperties(sorter) {
  if (!sorter.enabled) {
    return [];
  }
  return sorter.sortableProperties;
}
function getSortablePropertiesWithTypes(sorter) {
  if (!sorter.enabled) {
    return {};
  }
  return sorter.sortablePropertiesWithTypes;
}
function load4(sharedInternalDocumentStore, raw) {
  const rawDocument = raw;
  if (!rawDocument.enabled) {
    return {
      enabled: false
    };
  }
  const sorts = Object.keys(rawDocument.sorts).reduce((acc, prop) => {
    const { docs, orderedDocs, type } = rawDocument.sorts[prop];
    acc[prop] = {
      docs: new Map(Object.entries(docs).map(([k, v2]) => [+k, v2])),
      orderedDocsToRemove: /* @__PURE__ */ new Map(),
      orderedDocs,
      type
    };
    return acc;
  }, {});
  return {
    sharedInternalDocumentStore,
    language: rawDocument.language,
    sortableProperties: rawDocument.sortableProperties,
    sortablePropertiesWithTypes: rawDocument.sortablePropertiesWithTypes,
    sorts,
    enabled: true,
    isSorted: rawDocument.isSorted
  };
}
function save4(sorter) {
  if (!sorter.enabled) {
    return {
      enabled: false
    };
  }
  ensureOrderedDocsAreDeleted(sorter);
  ensureIsSorted(sorter);
  const sorts = Object.keys(sorter.sorts).reduce((acc, prop) => {
    const { docs, orderedDocs, type } = sorter.sorts[prop];
    acc[prop] = {
      docs: Object.fromEntries(docs.entries()),
      orderedDocs,
      type
    };
    return acc;
  }, {});
  return {
    language: sorter.language,
    sortableProperties: sorter.sortableProperties,
    sortablePropertiesWithTypes: sorter.sortablePropertiesWithTypes,
    sorts,
    enabled: sorter.enabled,
    isSorted: sorter.isSorted
  };
}
function createSorter() {
  return {
    create: create3,
    insert: insert2,
    remove: remove3,
    save: save4,
    load: load4,
    sortBy,
    getSortableProperties,
    getSortablePropertiesWithTypes
  };
}

// node_modules/@orama/orama/dist/esm/components/tokenizer/diacritics.js
var DIACRITICS_CHARCODE_START = 192;
var DIACRITICS_CHARCODE_END = 383;
var CHARCODE_REPLACE_MAPPING = [
  65,
  65,
  65,
  65,
  65,
  65,
  65,
  67,
  69,
  69,
  69,
  69,
  73,
  73,
  73,
  73,
  69,
  78,
  79,
  79,
  79,
  79,
  79,
  null,
  79,
  85,
  85,
  85,
  85,
  89,
  80,
  115,
  97,
  97,
  97,
  97,
  97,
  97,
  97,
  99,
  101,
  101,
  101,
  101,
  105,
  105,
  105,
  105,
  101,
  110,
  111,
  111,
  111,
  111,
  111,
  null,
  111,
  117,
  117,
  117,
  117,
  121,
  112,
  121,
  65,
  97,
  65,
  97,
  65,
  97,
  67,
  99,
  67,
  99,
  67,
  99,
  67,
  99,
  68,
  100,
  68,
  100,
  69,
  101,
  69,
  101,
  69,
  101,
  69,
  101,
  69,
  101,
  71,
  103,
  71,
  103,
  71,
  103,
  71,
  103,
  72,
  104,
  72,
  104,
  73,
  105,
  73,
  105,
  73,
  105,
  73,
  105,
  73,
  105,
  73,
  105,
  74,
  106,
  75,
  107,
  107,
  76,
  108,
  76,
  108,
  76,
  108,
  76,
  108,
  76,
  108,
  78,
  110,
  78,
  110,
  78,
  110,
  110,
  78,
  110,
  79,
  111,
  79,
  111,
  79,
  111,
  79,
  111,
  82,
  114,
  82,
  114,
  82,
  114,
  83,
  115,
  83,
  115,
  83,
  115,
  83,
  115,
  84,
  116,
  84,
  116,
  84,
  116,
  85,
  117,
  85,
  117,
  85,
  117,
  85,
  117,
  85,
  117,
  85,
  117,
  87,
  119,
  89,
  121,
  89,
  90,
  122,
  90,
  122,
  90,
  122,
  115
];
function replaceChar(charCode) {
  if (charCode < DIACRITICS_CHARCODE_START || charCode > DIACRITICS_CHARCODE_END)
    return charCode;
  return CHARCODE_REPLACE_MAPPING[charCode - DIACRITICS_CHARCODE_START] || charCode;
}
function replaceDiacritics(str2) {
  const stringCharCode = [];
  for (let idx = 0; idx < str2.length; idx++) {
    stringCharCode[idx] = replaceChar(str2.charCodeAt(idx));
  }
  return String.fromCharCode(...stringCharCode);
}

// node_modules/@orama/orama/dist/esm/components/tokenizer/english-stemmer.js
var step2List = {
  ational: "ate",
  tional: "tion",
  enci: "ence",
  anci: "ance",
  izer: "ize",
  bli: "ble",
  alli: "al",
  entli: "ent",
  eli: "e",
  ousli: "ous",
  ization: "ize",
  ation: "ate",
  ator: "ate",
  alism: "al",
  iveness: "ive",
  fulness: "ful",
  ousness: "ous",
  aliti: "al",
  iviti: "ive",
  biliti: "ble",
  logi: "log"
};
var step3List = {
  icate: "ic",
  ative: "",
  alize: "al",
  iciti: "ic",
  ical: "ic",
  ful: "",
  ness: ""
};
var c = "[^aeiou]";
var v = "[aeiouy]";
var C = c + "[^aeiouy]*";
var V = v + "[aeiou]*";
var mgr0 = "^(" + C + ")?" + V + C;
var meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$";
var mgr1 = "^(" + C + ")?" + V + C + V + C;
var s_v = "^(" + C + ")?" + v;
function stemmer(w) {
  let stem;
  let suffix;
  let re;
  let re2;
  let re3;
  let re4;
  if (w.length < 3) {
    return w;
  }
  const firstch = w.substring(0, 1);
  if (firstch == "y") {
    w = firstch.toUpperCase() + w.substring(1);
  }
  re = /^(.+?)(ss|i)es$/;
  re2 = /^(.+?)([^s])s$/;
  if (re.test(w)) {
    w = w.replace(re, "$1$2");
  } else if (re2.test(w)) {
    w = w.replace(re2, "$1$2");
  }
  re = /^(.+?)eed$/;
  re2 = /^(.+?)(ed|ing)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    re = new RegExp(mgr0);
    if (re.test(fp[1])) {
      re = /.$/;
      w = w.replace(re, "");
    }
  } else if (re2.test(w)) {
    const fp = re2.exec(w);
    stem = fp[1];
    re2 = new RegExp(s_v);
    if (re2.test(stem)) {
      w = stem;
      re2 = /(at|bl|iz)$/;
      re3 = new RegExp("([^aeiouylsz])\\1$");
      re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re2.test(w)) {
        w = w + "e";
      } else if (re3.test(w)) {
        re = /.$/;
        w = w.replace(re, "");
      } else if (re4.test(w)) {
        w = w + "e";
      }
    }
  }
  re = /^(.+?)y$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp?.[1];
    re = new RegExp(s_v);
    if (stem && re.test(stem)) {
      w = stem + "i";
    }
  }
  re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp?.[1];
    suffix = fp?.[2];
    re = new RegExp(mgr0);
    if (stem && re.test(stem)) {
      w = stem + step2List[suffix];
    }
  }
  re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp?.[1];
    suffix = fp?.[2];
    re = new RegExp(mgr0);
    if (stem && re.test(stem)) {
      w = stem + step3List[suffix];
    }
  }
  re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  re2 = /^(.+?)(s|t)(ion)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp?.[1];
    re = new RegExp(mgr1);
    if (stem && re.test(stem)) {
      w = stem;
    }
  } else if (re2.test(w)) {
    const fp = re2.exec(w);
    stem = fp?.[1] ?? "" + fp?.[2] ?? "";
    re2 = new RegExp(mgr1);
    if (re2.test(stem)) {
      w = stem;
    }
  }
  re = /^(.+?)e$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    stem = fp?.[1];
    re = new RegExp(mgr1);
    re2 = new RegExp(meq1);
    re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
    if (stem && (re.test(stem) || re2.test(stem) && !re3.test(stem))) {
      w = stem;
    }
  }
  re = /ll$/;
  re2 = new RegExp(mgr1);
  if (re.test(w) && re2.test(w)) {
    re = /.$/;
    w = w.replace(re, "");
  }
  if (firstch == "y") {
    w = firstch.toLowerCase() + w.substring(1);
  }
  return w;
}

// node_modules/@orama/orama/dist/esm/components/tokenizer/index.js
function normalizeToken(prop, token, withCache = true) {
  const key = `${this.language}:${prop}:${token}`;
  if (withCache && this.normalizationCache.has(key)) {
    return this.normalizationCache.get(key);
  }
  if (this.stopWords?.includes(token)) {
    if (withCache) {
      this.normalizationCache.set(key, "");
    }
    return "";
  }
  if (this.stemmer && !this.stemmerSkipProperties.has(prop)) {
    token = this.stemmer(token);
  }
  token = replaceDiacritics(token);
  if (withCache) {
    this.normalizationCache.set(key, token);
  }
  return token;
}
function trim(text) {
  while (text[text.length - 1] === "") {
    text.pop();
  }
  while (text[0] === "") {
    text.shift();
  }
  return text;
}
function tokenize(input, language, prop, withCache = true) {
  if (language && language !== this.language) {
    throw createError("LANGUAGE_NOT_SUPPORTED", language);
  }
  if (typeof input !== "string") {
    return [input];
  }
  const normalizeToken2 = this.normalizeToken.bind(this, prop ?? "");
  let tokens;
  if (prop && this.tokenizeSkipProperties.has(prop)) {
    tokens = [normalizeToken2(input, withCache)];
  } else {
    const splitRule = SPLITTERS[this.language];
    tokens = input.toLowerCase().split(splitRule).map((t) => normalizeToken2(t, withCache)).filter(Boolean);
  }
  const trimTokens = trim(tokens);
  if (!this.allowDuplicates) {
    return Array.from(new Set(trimTokens));
  }
  return trimTokens;
}
function createTokenizer(config = {}) {
  if (!config.language) {
    config.language = "english";
  } else if (!SUPPORTED_LANGUAGES.includes(config.language)) {
    throw createError("LANGUAGE_NOT_SUPPORTED", config.language);
  }
  let stemmer2;
  if (config.stemming || config.stemmer && !("stemming" in config)) {
    if (config.stemmer) {
      if (typeof config.stemmer !== "function") {
        throw createError("INVALID_STEMMER_FUNCTION_TYPE");
      }
      stemmer2 = config.stemmer;
    } else {
      if (config.language === "english") {
        stemmer2 = stemmer;
      } else {
        throw createError("MISSING_STEMMER", config.language);
      }
    }
  }
  let stopWords;
  if (config.stopWords !== false) {
    stopWords = [];
    if (Array.isArray(config.stopWords)) {
      stopWords = config.stopWords;
    } else if (typeof config.stopWords === "function") {
      stopWords = config.stopWords(stopWords);
    } else if (config.stopWords) {
      throw createError("CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY");
    }
    if (!Array.isArray(stopWords)) {
      throw createError("CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY");
    }
    for (const s of stopWords) {
      if (typeof s !== "string") {
        throw createError("CUSTOM_STOP_WORDS_MUST_BE_FUNCTION_OR_ARRAY");
      }
    }
  }
  const tokenizer = {
    tokenize,
    language: config.language,
    stemmer: stemmer2,
    stemmerSkipProperties: new Set(config.stemmerSkipProperties ? [config.stemmerSkipProperties].flat() : []),
    tokenizeSkipProperties: new Set(config.tokenizeSkipProperties ? [config.tokenizeSkipProperties].flat() : []),
    stopWords,
    allowDuplicates: Boolean(config.allowDuplicates),
    normalizeToken,
    normalizationCache: /* @__PURE__ */ new Map()
  };
  tokenizer.tokenize = tokenize.bind(tokenizer);
  tokenizer.normalizeToken = normalizeToken;
  return tokenizer;
}

// node_modules/@orama/orama/dist/esm/components/pinning.js
function create4(sharedInternalDocumentStore) {
  return {
    sharedInternalDocumentStore,
    rules: /* @__PURE__ */ new Map()
  };
}
function addRule(store2, rule) {
  if (store2.rules.has(rule.id)) {
    throw new Error(`PINNING_RULE_ALREADY_EXISTS: A pinning rule with id "${rule.id}" already exists. Use updateRule to modify it.`);
  }
  store2.rules.set(rule.id, rule);
}
function updateRule(store2, rule) {
  if (!store2.rules.has(rule.id)) {
    throw new Error(`PINNING_RULE_NOT_FOUND: Cannot update pinning rule with id "${rule.id}" because it does not exist. Use addRule to create it.`);
  }
  store2.rules.set(rule.id, rule);
}
function removeRule(store2, ruleId) {
  return store2.rules.delete(ruleId);
}
function getRule(store2, ruleId) {
  return store2.rules.get(ruleId);
}
function getAllRules(store2) {
  return Array.from(store2.rules.values());
}
function matchesCondition(term, condition) {
  const normalizedTerm = term.toLowerCase().trim();
  const normalizedPattern = condition.pattern.toLowerCase().trim();
  switch (condition.anchoring) {
    case "is":
      return normalizedTerm === normalizedPattern;
    case "starts_with":
      return normalizedTerm.startsWith(normalizedPattern);
    case "contains":
      return normalizedTerm.includes(normalizedPattern);
    default:
      return false;
  }
}
function matchesRule(term, rule) {
  if (!term) {
    return false;
  }
  return rule.conditions.every((condition) => matchesCondition(term, condition));
}
function getMatchingRules(store2, term) {
  if (!term) {
    return [];
  }
  const matchingRules = [];
  for (const rule of store2.rules.values()) {
    if (matchesRule(term, rule)) {
      matchingRules.push(rule);
    }
  }
  return matchingRules;
}
function load5(sharedInternalDocumentStore, raw) {
  const rawStore = raw;
  return {
    sharedInternalDocumentStore,
    rules: new Map(rawStore?.rules ?? [])
  };
}
function save5(store2) {
  return {
    rules: Array.from(store2.rules.entries())
  };
}
function createPinning() {
  return {
    create: create4,
    addRule,
    updateRule,
    removeRule,
    getRule,
    getAllRules,
    getMatchingRules,
    load: load5,
    save: save5
  };
}

// node_modules/@orama/orama/dist/esm/methods/create.js
function validateComponents(components) {
  const defaultComponents = {
    formatElapsedTime,
    getDocumentIndexId,
    getDocumentProperties,
    validateSchema
  };
  for (const rawKey of FUNCTION_COMPONENTS) {
    const key = rawKey;
    if (components[key]) {
      if (typeof components[key] !== "function") {
        throw createError("COMPONENT_MUST_BE_FUNCTION", key);
      }
    } else {
      components[key] = defaultComponents[key];
    }
  }
  for (const rawKey of Object.keys(components)) {
    if (!OBJECT_COMPONENTS.includes(rawKey) && !FUNCTION_COMPONENTS.includes(rawKey)) {
      throw createError("UNSUPPORTED_COMPONENT", rawKey);
    }
  }
}
function create5({ schema, sort, language, components, id, plugins }) {
  if (!components) {
    components = {};
  }
  for (const plugin of plugins ?? []) {
    if (!("getComponents" in plugin)) {
      continue;
    }
    if (typeof plugin.getComponents !== "function") {
      continue;
    }
    const pluginComponents = plugin.getComponents(schema);
    const keys = Object.keys(pluginComponents);
    for (const key of keys) {
      if (components[key]) {
        throw createError("PLUGIN_COMPONENT_CONFLICT", key, plugin.name);
      }
    }
    components = {
      ...components,
      ...pluginComponents
    };
  }
  if (!id) {
    id = uniqueId();
  }
  let tokenizer = components.tokenizer;
  let index = components.index;
  let documentsStore = components.documentsStore;
  let sorter = components.sorter;
  let pinning = components.pinning;
  if (!tokenizer) {
    tokenizer = createTokenizer({ language: language ?? "english" });
  } else if (!tokenizer.tokenize) {
    tokenizer = createTokenizer(tokenizer);
  } else {
    const customTokenizer = tokenizer;
    tokenizer = customTokenizer;
  }
  if (components.tokenizer && language) {
    throw createError("NO_LANGUAGE_WITH_CUSTOM_TOKENIZER");
  }
  const internalDocumentStore = createInternalDocumentIDStore();
  index ||= createIndex();
  sorter ||= createSorter();
  documentsStore ||= createDocumentsStore();
  pinning ||= createPinning();
  validateComponents(components);
  const { getDocumentProperties: getDocumentProperties2, getDocumentIndexId: getDocumentIndexId2, validateSchema: validateSchema2, formatElapsedTime: formatElapsedTime2 } = components;
  const orama = {
    data: {},
    caches: {},
    schema,
    tokenizer,
    index,
    sorter,
    documentsStore,
    pinning,
    internalDocumentIDStore: internalDocumentStore,
    getDocumentProperties: getDocumentProperties2,
    getDocumentIndexId: getDocumentIndexId2,
    validateSchema: validateSchema2,
    beforeInsert: [],
    afterInsert: [],
    beforeRemove: [],
    afterRemove: [],
    beforeUpdate: [],
    afterUpdate: [],
    beforeUpsert: [],
    afterUpsert: [],
    beforeSearch: [],
    afterSearch: [],
    beforeInsertMultiple: [],
    afterInsertMultiple: [],
    beforeRemoveMultiple: [],
    afterRemoveMultiple: [],
    beforeUpdateMultiple: [],
    afterUpdateMultiple: [],
    beforeUpsertMultiple: [],
    afterUpsertMultiple: [],
    afterCreate: [],
    formatElapsedTime: formatElapsedTime2,
    id,
    plugins,
    version: getVersion()
  };
  orama.data = {
    index: orama.index.create(orama, internalDocumentStore, schema),
    docs: orama.documentsStore.create(orama, internalDocumentStore),
    sorting: orama.sorter.create(orama, internalDocumentStore, schema, sort),
    pinning: orama.pinning.create(internalDocumentStore)
  };
  for (const hook of AVAILABLE_PLUGIN_HOOKS) {
    orama[hook] = (orama[hook] ?? []).concat(getAllPluginsByHook(orama, hook));
  }
  const afterCreate = orama["afterCreate"];
  if (afterCreate) {
    runAfterCreate(afterCreate, orama);
  }
  return orama;
}
function getVersion() {
  return "{{VERSION}}";
}

// node_modules/@orama/orama/dist/esm/methods/docs.js
function count2(db) {
  return db.documentsStore.count(db.data.docs);
}

// node_modules/@orama/orama/dist/esm/methods/insert.js
function insert3(orama, doc, language, skipHooks, options2) {
  const errorProperty = orama.validateSchema(doc, orama.schema);
  if (errorProperty) {
    throw createError("SCHEMA_VALIDATION_FAILURE", errorProperty);
  }
  const asyncNeeded = isAsyncFunction(orama.beforeInsert) || isAsyncFunction(orama.afterInsert) || isAsyncFunction(orama.index.beforeInsert) || isAsyncFunction(orama.index.insert) || isAsyncFunction(orama.index.afterInsert);
  if (asyncNeeded) {
    return innerInsertAsync(orama, doc, language, skipHooks, options2);
  }
  return innerInsertSync(orama, doc, language, skipHooks, options2);
}
var ENUM_TYPE = /* @__PURE__ */ new Set(["enum", "enum[]"]);
var STRING_NUMBER_TYPE = /* @__PURE__ */ new Set(["string", "number"]);
async function innerInsertAsync(orama, doc, language, skipHooks, options2) {
  const { index, docs } = orama.data;
  const id = orama.getDocumentIndexId(doc);
  if (typeof id !== "string") {
    throw createError("DOCUMENT_ID_MUST_BE_STRING", typeof id);
  }
  const internalId = getInternalDocumentId(orama.internalDocumentIDStore, id);
  if (!skipHooks) {
    await runSingleHook(orama.beforeInsert, orama, id, doc);
  }
  if (!orama.documentsStore.store(docs, id, internalId, doc)) {
    throw createError("DOCUMENT_ALREADY_EXISTS", id);
  }
  const docsCount = orama.documentsStore.count(docs);
  const indexableProperties = orama.index.getSearchableProperties(index);
  const indexablePropertiesWithTypes = orama.index.getSearchablePropertiesWithTypes(index);
  const indexableValues = orama.getDocumentProperties(doc, indexableProperties);
  for (const [key, value] of Object.entries(indexableValues)) {
    if (typeof value === "undefined")
      continue;
    const actualType = typeof value;
    const expectedType = indexablePropertiesWithTypes[key];
    validateDocumentProperty(actualType, expectedType, key, value);
  }
  await indexAndSortDocument(orama, id, indexableProperties, indexableValues, docsCount, language, doc, options2);
  if (!skipHooks) {
    await runSingleHook(orama.afterInsert, orama, id, doc);
  }
  return id;
}
function innerInsertSync(orama, doc, language, skipHooks, options2) {
  const { index, docs } = orama.data;
  const id = orama.getDocumentIndexId(doc);
  if (typeof id !== "string") {
    throw createError("DOCUMENT_ID_MUST_BE_STRING", typeof id);
  }
  const internalId = getInternalDocumentId(orama.internalDocumentIDStore, id);
  if (!skipHooks) {
    runSingleHook(orama.beforeInsert, orama, id, doc);
  }
  if (!orama.documentsStore.store(docs, id, internalId, doc)) {
    throw createError("DOCUMENT_ALREADY_EXISTS", id);
  }
  const docsCount = orama.documentsStore.count(docs);
  const indexableProperties = orama.index.getSearchableProperties(index);
  const indexablePropertiesWithTypes = orama.index.getSearchablePropertiesWithTypes(index);
  const indexableValues = orama.getDocumentProperties(doc, indexableProperties);
  for (const [key, value] of Object.entries(indexableValues)) {
    if (typeof value === "undefined")
      continue;
    const actualType = typeof value;
    const expectedType = indexablePropertiesWithTypes[key];
    validateDocumentProperty(actualType, expectedType, key, value);
  }
  indexAndSortDocumentSync(orama, id, indexableProperties, indexableValues, docsCount, language, doc, options2);
  if (!skipHooks) {
    runSingleHook(orama.afterInsert, orama, id, doc);
  }
  return id;
}
function validateDocumentProperty(actualType, expectedType, key, value) {
  if (isGeoPointType(expectedType) && typeof value === "object" && typeof value.lon === "number" && typeof value.lat === "number") {
    return;
  }
  if (isVectorType(expectedType) && Array.isArray(value))
    return;
  if (isArrayType(expectedType) && Array.isArray(value))
    return;
  if (ENUM_TYPE.has(expectedType) && STRING_NUMBER_TYPE.has(actualType))
    return;
  if (actualType !== expectedType) {
    throw createError("INVALID_DOCUMENT_PROPERTY", key, expectedType, actualType);
  }
}
async function indexAndSortDocument(orama, id, indexableProperties, indexableValues, docsCount, language, doc, options2) {
  for (const prop of indexableProperties) {
    const value = indexableValues[prop];
    if (typeof value === "undefined")
      continue;
    const expectedType = orama.index.getSearchablePropertiesWithTypes(orama.data.index)[prop];
    await orama.index.beforeInsert?.(orama.data.index, prop, id, value, expectedType, language, orama.tokenizer, docsCount);
    const internalId = orama.internalDocumentIDStore.idToInternalId.get(id);
    await orama.index.insert(orama.index, orama.data.index, prop, id, internalId, value, expectedType, language, orama.tokenizer, docsCount, options2);
    await orama.index.afterInsert?.(orama.data.index, prop, id, value, expectedType, language, orama.tokenizer, docsCount);
  }
  const sortableProperties = orama.sorter.getSortableProperties(orama.data.sorting);
  const sortableValues = orama.getDocumentProperties(doc, sortableProperties);
  for (const prop of sortableProperties) {
    const value = sortableValues[prop];
    if (typeof value === "undefined")
      continue;
    const expectedType = orama.sorter.getSortablePropertiesWithTypes(orama.data.sorting)[prop];
    orama.sorter.insert(orama.data.sorting, prop, id, value, expectedType, language);
  }
}
function indexAndSortDocumentSync(orama, id, indexableProperties, indexableValues, docsCount, language, doc, options2) {
  for (const prop of indexableProperties) {
    const value = indexableValues[prop];
    if (typeof value === "undefined")
      continue;
    const expectedType = orama.index.getSearchablePropertiesWithTypes(orama.data.index)[prop];
    const internalDocumentId = getInternalDocumentId(orama.internalDocumentIDStore, id);
    orama.index.beforeInsert?.(orama.data.index, prop, id, value, expectedType, language, orama.tokenizer, docsCount);
    orama.index.insert(orama.index, orama.data.index, prop, id, internalDocumentId, value, expectedType, language, orama.tokenizer, docsCount, options2);
    orama.index.afterInsert?.(orama.data.index, prop, id, value, expectedType, language, orama.tokenizer, docsCount);
  }
  const sortableProperties = orama.sorter.getSortableProperties(orama.data.sorting);
  const sortableValues = orama.getDocumentProperties(doc, sortableProperties);
  for (const prop of sortableProperties) {
    const value = sortableValues[prop];
    if (typeof value === "undefined")
      continue;
    const expectedType = orama.sorter.getSortablePropertiesWithTypes(orama.data.sorting)[prop];
    orama.sorter.insert(orama.data.sorting, prop, id, value, expectedType, language);
  }
}

// node_modules/@orama/orama/dist/esm/methods/remove.js
function remove4(orama, id, language, skipHooks) {
  const asyncNeeded = isAsyncFunction(orama.index.beforeRemove) || isAsyncFunction(orama.index.remove) || isAsyncFunction(orama.index.afterRemove);
  if (asyncNeeded) {
    return removeAsync(orama, id, language, skipHooks);
  }
  return removeSync(orama, id, language, skipHooks);
}
async function removeAsync(orama, id, language, skipHooks) {
  let result = true;
  const { index, docs } = orama.data;
  const doc = orama.documentsStore.get(docs, id);
  if (!doc) {
    return false;
  }
  const internalId = getInternalDocumentId(orama.internalDocumentIDStore, id);
  const docId = getDocumentIdFromInternalId(orama.internalDocumentIDStore, internalId);
  const docsCount = orama.documentsStore.count(docs);
  if (!skipHooks) {
    await runSingleHook(orama.beforeRemove, orama, docId);
  }
  const indexableProperties = orama.index.getSearchableProperties(index);
  const indexablePropertiesWithTypes = orama.index.getSearchablePropertiesWithTypes(index);
  const values = orama.getDocumentProperties(doc, indexableProperties);
  for (const prop of indexableProperties) {
    const value = values[prop];
    if (typeof value === "undefined") {
      continue;
    }
    const schemaType = indexablePropertiesWithTypes[prop];
    await orama.index.beforeRemove?.(orama.data.index, prop, docId, value, schemaType, language, orama.tokenizer, docsCount);
    if (!await orama.index.remove(orama.index, orama.data.index, prop, id, internalId, value, schemaType, language, orama.tokenizer, docsCount)) {
      result = false;
    }
    await orama.index.afterRemove?.(orama.data.index, prop, docId, value, schemaType, language, orama.tokenizer, docsCount);
  }
  const sortableProperties = await orama.sorter.getSortableProperties(orama.data.sorting);
  const sortableValues = await orama.getDocumentProperties(doc, sortableProperties);
  for (const prop of sortableProperties) {
    if (typeof sortableValues[prop] === "undefined") {
      continue;
    }
    orama.sorter.remove(orama.data.sorting, prop, id);
  }
  if (!skipHooks) {
    await runSingleHook(orama.afterRemove, orama, docId);
  }
  orama.documentsStore.remove(orama.data.docs, id, internalId);
  return result;
}
function removeSync(orama, id, language, skipHooks) {
  let result = true;
  const { index, docs } = orama.data;
  const doc = orama.documentsStore.get(docs, id);
  if (!doc) {
    return false;
  }
  const internalId = getInternalDocumentId(orama.internalDocumentIDStore, id);
  const docId = getDocumentIdFromInternalId(orama.internalDocumentIDStore, internalId);
  const docsCount = orama.documentsStore.count(docs);
  if (!skipHooks) {
    runSingleHook(orama.beforeRemove, orama, docId);
  }
  const indexableProperties = orama.index.getSearchableProperties(index);
  const indexablePropertiesWithTypes = orama.index.getSearchablePropertiesWithTypes(index);
  const values = orama.getDocumentProperties(doc, indexableProperties);
  for (const prop of indexableProperties) {
    const value = values[prop];
    if (typeof value === "undefined") {
      continue;
    }
    const schemaType = indexablePropertiesWithTypes[prop];
    orama.index.beforeRemove?.(orama.data.index, prop, docId, value, schemaType, language, orama.tokenizer, docsCount);
    if (!orama.index.remove(orama.index, orama.data.index, prop, id, internalId, value, schemaType, language, orama.tokenizer, docsCount)) {
      result = false;
    }
    orama.index.afterRemove?.(orama.data.index, prop, docId, value, schemaType, language, orama.tokenizer, docsCount);
  }
  const sortableProperties = orama.sorter.getSortableProperties(orama.data.sorting);
  const sortableValues = orama.getDocumentProperties(doc, sortableProperties);
  for (const prop of sortableProperties) {
    if (typeof sortableValues[prop] === "undefined") {
      continue;
    }
    orama.sorter.remove(orama.data.sorting, prop, id);
  }
  if (!skipHooks) {
    runSingleHook(orama.afterRemove, orama, docId);
  }
  orama.documentsStore.remove(orama.data.docs, id, internalId);
  return result;
}

// node_modules/@orama/orama/dist/esm/constants.js
var MODE_FULLTEXT_SEARCH = "fulltext";
var MODE_HYBRID_SEARCH = "hybrid";
var MODE_VECTOR_SEARCH = "vector";

// node_modules/@orama/orama/dist/esm/components/facets.js
function sortAsc(a, b) {
  return a[1] - b[1];
}
function sortDesc(a, b) {
  return b[1] - a[1];
}
function sortingPredicateBuilder(order = "desc") {
  return order.toLowerCase() === "asc" ? sortAsc : sortDesc;
}
function getFacets(orama, results, facetsConfig) {
  const facets = {};
  const allIDs = results.map(([id]) => id);
  const allDocs = orama.documentsStore.getMultiple(orama.data.docs, allIDs);
  const facetKeys = Object.keys(facetsConfig);
  const properties = orama.index.getSearchablePropertiesWithTypes(orama.data.index);
  for (const facet of facetKeys) {
    let values;
    if (properties[facet] === "number") {
      const { ranges } = facetsConfig[facet];
      const rangesLength = ranges.length;
      const tmp = Array.from({ length: rangesLength });
      for (let i = 0; i < rangesLength; i++) {
        const range = ranges[i];
        tmp[i] = [`${range.from}-${range.to}`, 0];
      }
      values = Object.fromEntries(tmp);
    }
    facets[facet] = {
      count: 0,
      values: values ?? {}
    };
  }
  const allDocsLength = allDocs.length;
  for (let i = 0; i < allDocsLength; i++) {
    const doc = allDocs[i];
    for (const facet of facetKeys) {
      const facetValue = facet.includes(".") ? getNested(doc, facet) : doc[facet];
      const propertyType = properties[facet];
      const facetValues = facets[facet].values;
      switch (propertyType) {
        case "number": {
          const ranges = facetsConfig[facet].ranges;
          calculateNumberFacetBuilder(ranges, facetValues)(facetValue);
          break;
        }
        case "number[]": {
          const alreadyInsertedValues = /* @__PURE__ */ new Set();
          const ranges = facetsConfig[facet].ranges;
          const calculateNumberFacet = calculateNumberFacetBuilder(ranges, facetValues, alreadyInsertedValues);
          for (const v2 of facetValue) {
            calculateNumberFacet(v2);
          }
          break;
        }
        case "boolean":
        case "enum":
        case "string": {
          calculateBooleanStringOrEnumFacetBuilder(facetValues, propertyType)(facetValue);
          break;
        }
        case "boolean[]":
        case "enum[]":
        case "string[]": {
          const alreadyInsertedValues = /* @__PURE__ */ new Set();
          const innerType = propertyType === "boolean[]" ? "boolean" : "string";
          const calculateBooleanStringOrEnumFacet = calculateBooleanStringOrEnumFacetBuilder(facetValues, innerType, alreadyInsertedValues);
          for (const v2 of facetValue) {
            calculateBooleanStringOrEnumFacet(v2);
          }
          break;
        }
        default:
          throw createError("FACET_NOT_SUPPORTED", propertyType);
      }
    }
  }
  for (const facet of facetKeys) {
    const currentFacet = facets[facet];
    currentFacet.count = Object.keys(currentFacet.values).length;
    if (properties[facet] === "string") {
      const stringFacetDefinition = facetsConfig[facet];
      const sortingPredicate = sortingPredicateBuilder(stringFacetDefinition.sort);
      currentFacet.values = Object.fromEntries(Object.entries(currentFacet.values).sort(sortingPredicate).slice(stringFacetDefinition.offset ?? 0, stringFacetDefinition.limit ?? 10));
    }
  }
  return facets;
}
function calculateNumberFacetBuilder(ranges, values, alreadyInsertedValues) {
  return (facetValue) => {
    for (const range of ranges) {
      const value = `${range.from}-${range.to}`;
      if (alreadyInsertedValues?.has(value)) {
        continue;
      }
      if (facetValue >= range.from && facetValue <= range.to) {
        if (values[value] === void 0) {
          values[value] = 1;
        } else {
          values[value]++;
          alreadyInsertedValues?.add(value);
        }
      }
    }
  };
}
function calculateBooleanStringOrEnumFacetBuilder(values, propertyType, alreadyInsertedValues) {
  const defaultValue = propertyType === "boolean" ? "false" : "";
  return (facetValue) => {
    const value = facetValue?.toString() ?? defaultValue;
    if (alreadyInsertedValues?.has(value)) {
      return;
    }
    values[value] = (values[value] ?? 0) + 1;
    alreadyInsertedValues?.add(value);
  };
}

// node_modules/@orama/orama/dist/esm/components/groups.js
var DEFAULT_REDUCE = {
  reducer: (_, acc, res, index) => {
    acc[index] = res;
    return acc;
  },
  getInitialValue: (length) => Array.from({ length })
};
var ALLOWED_TYPES = ["string", "number", "boolean"];
function getGroups(orama, results, groupBy) {
  const properties = groupBy.properties;
  const propertiesLength = properties.length;
  const schemaProperties = orama.index.getSearchablePropertiesWithTypes(orama.data.index);
  for (let i = 0; i < propertiesLength; i++) {
    const property = properties[i];
    if (typeof schemaProperties[property] === "undefined") {
      throw createError("UNKNOWN_GROUP_BY_PROPERTY", property);
    }
    if (!ALLOWED_TYPES.includes(schemaProperties[property])) {
      throw createError("INVALID_GROUP_BY_PROPERTY", property, ALLOWED_TYPES.join(", "), schemaProperties[property]);
    }
  }
  const allIDs = results.map(([id]) => getDocumentIdFromInternalId(orama.internalDocumentIDStore, id));
  const allDocs = orama.documentsStore.getMultiple(orama.data.docs, allIDs);
  const allDocsLength = allDocs.length;
  const returnedCount = groupBy.maxResult || Number.MAX_SAFE_INTEGER;
  const listOfValues = [];
  const g = {};
  for (let i = 0; i < propertiesLength; i++) {
    const groupByKey = properties[i];
    const group = {
      property: groupByKey,
      perValue: {}
    };
    const values = /* @__PURE__ */ new Set();
    for (let j = 0; j < allDocsLength; j++) {
      const doc = allDocs[j];
      const value = getNested(doc, groupByKey);
      if (typeof value === "undefined") {
        continue;
      }
      const keyValue = typeof value !== "boolean" ? value : "" + value;
      const perValue = group.perValue[keyValue] ?? {
        indexes: [],
        count: 0
      };
      if (perValue.count >= returnedCount) {
        continue;
      }
      perValue.indexes.push(j);
      perValue.count++;
      group.perValue[keyValue] = perValue;
      values.add(value);
    }
    listOfValues.push(Array.from(values));
    g[groupByKey] = group;
  }
  const combinations = calculateCombination(listOfValues);
  const combinationsLength = combinations.length;
  const groups = [];
  for (let i = 0; i < combinationsLength; i++) {
    const combination = combinations[i];
    const combinationLength = combination.length;
    const group = {
      values: [],
      indexes: []
    };
    const indexes = [];
    for (let j = 0; j < combinationLength; j++) {
      const value = combination[j];
      const property = properties[j];
      indexes.push(g[property].perValue[typeof value !== "boolean" ? value : "" + value].indexes);
      group.values.push(value);
    }
    group.indexes = intersect(indexes).sort((a, b) => a - b);
    if (group.indexes.length === 0) {
      continue;
    }
    groups.push(group);
  }
  const groupsLength = groups.length;
  const res = Array.from({ length: groupsLength });
  for (let i = 0; i < groupsLength; i++) {
    const group = groups[i];
    const reduce = groupBy.reduce || DEFAULT_REDUCE;
    const docs = group.indexes.map((index) => {
      return {
        id: allIDs[index],
        score: results[index][1],
        document: allDocs[index]
      };
    });
    const func = reduce.reducer.bind(null, group.values);
    const initialValue = reduce.getInitialValue(group.indexes.length);
    const aggregationValue = docs.reduce(func, initialValue);
    res[i] = {
      values: group.values,
      result: aggregationValue
    };
  }
  return res;
}
function calculateCombination(arrs, index = 0) {
  if (index + 1 === arrs.length)
    return arrs[index].map((item) => [item]);
  const head = arrs[index];
  const c2 = calculateCombination(arrs, index + 1);
  const combinations = [];
  for (const value of head) {
    for (const combination of c2) {
      const result = [value];
      safeArrayPush(result, combination);
      combinations.push(result);
    }
  }
  return combinations;
}

// node_modules/@orama/orama/dist/esm/components/pinning-manager.js
function applyPinningRules(orama, pinningStore, uniqueDocsArray, searchTerm) {
  const matchingRules = getMatchingRules(pinningStore, searchTerm);
  if (matchingRules.length === 0) {
    return uniqueDocsArray;
  }
  const allPromotions = matchingRules.flatMap((rule) => rule.consequence.promote);
  allPromotions.sort((a, b) => a.position - b.position);
  const pinnedInternalIds = /* @__PURE__ */ new Set();
  const promotionsMap = /* @__PURE__ */ new Map();
  const positionsTaken = /* @__PURE__ */ new Set();
  for (const promotion of allPromotions) {
    const internalId = getInternalDocumentId(orama.internalDocumentIDStore, promotion.doc_id);
    if (internalId === void 0) {
      continue;
    }
    if (promotionsMap.has(internalId)) {
      const existingPosition = promotionsMap.get(internalId);
      if (promotion.position < existingPosition) {
        promotionsMap.set(internalId, promotion.position);
      }
      continue;
    }
    if (positionsTaken.has(promotion.position)) {
      continue;
    }
    pinnedInternalIds.add(internalId);
    promotionsMap.set(internalId, promotion.position);
    positionsTaken.add(promotion.position);
  }
  if (promotionsMap.size === 0) {
    return uniqueDocsArray;
  }
  const unpinnedResults = uniqueDocsArray.filter(([id]) => !pinnedInternalIds.has(id));
  const BASE_PIN_SCORE = 1e6;
  const pinnedResults = [];
  for (const [internalId, position] of promotionsMap.entries()) {
    const existingResult = uniqueDocsArray.find(([id]) => id === internalId);
    if (existingResult) {
      pinnedResults.push([internalId, BASE_PIN_SCORE - position]);
    } else {
      const doc = orama.documentsStore.get(orama.data.docs, internalId);
      if (doc) {
        pinnedResults.push([internalId, 0]);
      }
    }
  }
  pinnedResults.sort((a, b) => {
    const posA = promotionsMap.get(a[0]) ?? Infinity;
    const posB = promotionsMap.get(b[0]) ?? Infinity;
    return posA - posB;
  });
  const finalResults = [];
  const pinnedByPosition = /* @__PURE__ */ new Map();
  for (const pinnedResult of pinnedResults) {
    const position = promotionsMap.get(pinnedResult[0]);
    pinnedByPosition.set(position, pinnedResult);
  }
  let unpinnedIndex = 0;
  let currentPosition = 0;
  while (currentPosition < unpinnedResults.length + pinnedResults.length) {
    if (pinnedByPosition.has(currentPosition)) {
      finalResults.push(pinnedByPosition.get(currentPosition));
      currentPosition++;
    } else if (unpinnedIndex < unpinnedResults.length) {
      finalResults.push(unpinnedResults[unpinnedIndex]);
      unpinnedIndex++;
      currentPosition++;
    } else {
      break;
    }
  }
  for (const [position, pinnedResult] of pinnedByPosition.entries()) {
    if (position >= finalResults.length) {
      finalResults.push(pinnedResult);
    }
  }
  return finalResults;
}

// node_modules/@orama/orama/dist/esm/methods/search-fulltext.js
function innerFullTextSearch(orama, params, language) {
  const { term, properties } = params;
  const index = orama.data.index;
  let propertiesToSearch = orama.caches["propertiesToSearch"];
  if (!propertiesToSearch) {
    const propertiesToSearchWithTypes = orama.index.getSearchablePropertiesWithTypes(index);
    propertiesToSearch = orama.index.getSearchableProperties(index);
    propertiesToSearch = propertiesToSearch.filter((prop) => propertiesToSearchWithTypes[prop].startsWith("string"));
    orama.caches["propertiesToSearch"] = propertiesToSearch;
  }
  if (properties && properties !== "*") {
    for (const prop of properties) {
      if (!propertiesToSearch.includes(prop)) {
        throw createError("UNKNOWN_INDEX", prop, propertiesToSearch.join(", "));
      }
    }
    propertiesToSearch = propertiesToSearch.filter((prop) => properties.includes(prop));
  }
  const hasFilters = Object.keys(params.where ?? {}).length > 0;
  let whereFiltersIDs;
  if (hasFilters) {
    whereFiltersIDs = orama.index.searchByWhereClause(index, orama.tokenizer, params.where, language);
  }
  let uniqueDocsIDs;
  const threshold = params.threshold !== void 0 && params.threshold !== null ? params.threshold : 1;
  if (term || properties) {
    const docsCount = count2(orama);
    uniqueDocsIDs = orama.index.search(index, term || "", orama.tokenizer, language, propertiesToSearch, params.exact || false, params.tolerance || 0, params.boost || {}, applyDefault(params.relevance), docsCount, whereFiltersIDs, threshold);
    if (params.exact && term) {
      const searchTerms = term.trim().split(/\s+/);
      uniqueDocsIDs = uniqueDocsIDs.filter(([docId]) => {
        const doc = orama.documentsStore.get(orama.data.docs, docId);
        if (!doc)
          return false;
        for (const prop of propertiesToSearch) {
          const propValue = getPropValue(doc, prop);
          if (typeof propValue === "string") {
            const hasAllTerms = searchTerms.every((searchTerm) => {
              const regex = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`);
              return regex.test(propValue);
            });
            if (hasAllTerms) {
              return true;
            }
          }
        }
        return false;
      });
    }
  } else {
    if (hasFilters) {
      const geoResults = searchByGeoWhereClause(index, params.where);
      if (geoResults) {
        uniqueDocsIDs = geoResults;
      } else {
        const docIds = whereFiltersIDs ? Array.from(whereFiltersIDs) : [];
        uniqueDocsIDs = docIds.map((k) => [+k, 0]);
      }
    } else {
      const docIds = Object.keys(orama.documentsStore.getAll(orama.data.docs));
      uniqueDocsIDs = docIds.map((k) => [+k, 0]);
    }
  }
  return uniqueDocsIDs;
}
function escapeRegex(str2) {
  return str2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getPropValue(obj, path7) {
  const keys = path7.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return void 0;
    }
  }
  return value;
}
function fullTextSearch(orama, params, language) {
  const timeStart = getNanosecondsTime();
  function performSearchLogic() {
    const vectorProperties = Object.keys(orama.data.index.vectorIndexes);
    const shouldCalculateFacets = params.facets && Object.keys(params.facets).length > 0;
    const { limit = 10, offset = 0, distinctOn, includeVectors = false } = params;
    const isPreflight = params.preflight === true;
    let uniqueDocsArray = innerFullTextSearch(orama, params, language);
    if (params.sortBy) {
      if (typeof params.sortBy === "function") {
        const ids = uniqueDocsArray.map(([id]) => id);
        const docs = orama.documentsStore.getMultiple(orama.data.docs, ids);
        const docsWithIdAndScore = docs.map((d, i) => [
          uniqueDocsArray[i][0],
          uniqueDocsArray[i][1],
          d
        ]);
        docsWithIdAndScore.sort(params.sortBy);
        uniqueDocsArray = docsWithIdAndScore.map(([id, score]) => [id, score]);
      } else {
        uniqueDocsArray = orama.sorter.sortBy(orama.data.sorting, uniqueDocsArray, params.sortBy).map(([id, score]) => [getInternalDocumentId(orama.internalDocumentIDStore, id), score]);
      }
    } else {
      uniqueDocsArray = uniqueDocsArray.sort(sortTokenScorePredicate);
    }
    uniqueDocsArray = applyPinningRules(orama, orama.data.pinning, uniqueDocsArray, params.term);
    let results;
    if (!isPreflight) {
      results = distinctOn ? fetchDocumentsWithDistinct(orama, uniqueDocsArray, offset, limit, distinctOn) : fetchDocuments(orama, uniqueDocsArray, offset, limit);
    }
    const searchResult = {
      elapsed: {
        formatted: "",
        raw: 0
      },
      hits: [],
      count: uniqueDocsArray.length
    };
    if (typeof results !== "undefined") {
      searchResult.hits = results.filter(Boolean);
      if (!includeVectors) {
        removeVectorsFromHits(searchResult, vectorProperties);
      }
    }
    if (shouldCalculateFacets) {
      const facets = getFacets(orama, uniqueDocsArray, params.facets);
      searchResult.facets = facets;
    }
    if (params.groupBy) {
      searchResult.groups = getGroups(orama, uniqueDocsArray, params.groupBy);
    }
    searchResult.elapsed = orama.formatElapsedTime(getNanosecondsTime() - timeStart);
    return searchResult;
  }
  async function executeSearchAsync() {
    if (orama.beforeSearch) {
      await runBeforeSearch(orama.beforeSearch, orama, params, language);
    }
    const searchResult = performSearchLogic();
    if (orama.afterSearch) {
      await runAfterSearch(orama.afterSearch, orama, params, language, searchResult);
    }
    return searchResult;
  }
  const asyncNeeded = orama.beforeSearch?.length || orama.afterSearch?.length;
  if (asyncNeeded) {
    return executeSearchAsync();
  }
  return performSearchLogic();
}
var defaultBM25Params = {
  k: 1.2,
  b: 0.75,
  d: 0.5
};
function applyDefault(bm25Relevance) {
  const r = bm25Relevance ?? {};
  r.k = r.k ?? defaultBM25Params.k;
  r.b = r.b ?? defaultBM25Params.b;
  r.d = r.d ?? defaultBM25Params.d;
  return r;
}

// node_modules/@orama/orama/dist/esm/methods/search-vector.js
function innerVectorSearch(orama, params, language) {
  const vector = params.vector;
  if (vector && (!("value" in vector) || !("property" in vector))) {
    throw createError("INVALID_VECTOR_INPUT", Object.keys(vector).join(", "));
  }
  const vectorIndex = orama.data.index.vectorIndexes[vector.property];
  if (!vectorIndex) {
    throw createError("UNKNOWN_VECTOR_PROPERTY", vector.property);
  }
  const vectorSize = vectorIndex.node.size;
  if (vector?.value.length !== vectorSize) {
    if (vector?.property === void 0 || vector?.value.length === void 0) {
      throw createError("INVALID_INPUT_VECTOR", "undefined", vectorSize, "undefined");
    }
    throw createError("INVALID_INPUT_VECTOR", vector.property, vectorSize, vector.value.length);
  }
  const index = orama.data.index;
  let whereFiltersIDs;
  const hasFilters = Object.keys(params.where ?? {}).length > 0;
  if (hasFilters) {
    whereFiltersIDs = orama.index.searchByWhereClause(index, orama.tokenizer, params.where, language);
  }
  return vectorIndex.node.find(vector.value, params.similarity ?? DEFAULT_SIMILARITY, whereFiltersIDs);
}
function searchVector(orama, params, language = "english") {
  const timeStart = getNanosecondsTime();
  function performSearchLogic() {
    let results = innerVectorSearch(orama, params, language).sort(sortTokenScorePredicate);
    results = applyPinningRules(orama, orama.data.pinning, results, void 0);
    let facetsResults = [];
    const shouldCalculateFacets = params.facets && Object.keys(params.facets).length > 0;
    if (shouldCalculateFacets) {
      const facets = getFacets(orama, results, params.facets);
      facetsResults = facets;
    }
    const vectorProperty = params.vector.property;
    const includeVectors = params.includeVectors ?? false;
    const limit = params.limit ?? 10;
    const offset = params.offset ?? 0;
    const docs = Array.from({ length: limit });
    for (let i = 0; i < limit; i++) {
      const result = results[i + offset];
      if (!result) {
        break;
      }
      const doc = orama.data.docs.docs[result[0]];
      if (doc) {
        if (!includeVectors) {
          doc[vectorProperty] = null;
        }
        const newDoc = {
          id: getDocumentIdFromInternalId(orama.internalDocumentIDStore, result[0]),
          score: result[1],
          document: doc
        };
        docs[i] = newDoc;
      }
    }
    let groups = [];
    if (params.groupBy) {
      groups = getGroups(orama, results, params.groupBy);
    }
    const timeEnd = getNanosecondsTime();
    const elapsedTime = timeEnd - timeStart;
    return {
      count: results.length,
      hits: docs.filter(Boolean),
      elapsed: {
        raw: Number(elapsedTime),
        formatted: formatNanoseconds(elapsedTime)
      },
      ...facetsResults ? { facets: facetsResults } : {},
      ...groups ? { groups } : {}
    };
  }
  async function executeSearchAsync() {
    if (orama.beforeSearch) {
      await runBeforeSearch(orama.beforeSearch, orama, params, language);
    }
    const results = performSearchLogic();
    if (orama.afterSearch) {
      await runAfterSearch(orama.afterSearch, orama, params, language, results);
    }
    return results;
  }
  const asyncNeeded = orama.beforeSearch?.length || orama.afterSearch?.length;
  if (asyncNeeded) {
    return executeSearchAsync();
  }
  return performSearchLogic();
}

// node_modules/@orama/orama/dist/esm/methods/search-hybrid.js
function innerHybridSearch(orama, params, language) {
  const fullTextIDs = minMaxScoreNormalization(innerFullTextSearch(orama, params, language));
  const vectorIDs = innerVectorSearch(orama, params, language);
  const hybridWeights = params.hybridWeights;
  return mergeAndRankResults(fullTextIDs, vectorIDs, params.term ?? "", hybridWeights);
}
function hybridSearch(orama, params, language) {
  const timeStart = getNanosecondsTime();
  function performSearchLogic() {
    let uniqueTokenScores = innerHybridSearch(orama, params, language);
    uniqueTokenScores = applyPinningRules(orama, orama.data.pinning, uniqueTokenScores, params.term);
    let facetsResults;
    const shouldCalculateFacets = params.facets && Object.keys(params.facets).length > 0;
    if (shouldCalculateFacets) {
      facetsResults = getFacets(orama, uniqueTokenScores, params.facets);
    }
    let groups;
    if (params.groupBy) {
      groups = getGroups(orama, uniqueTokenScores, params.groupBy);
    }
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 10;
    const results = fetchDocuments(orama, uniqueTokenScores, offset, limit).filter(Boolean);
    const timeEnd = getNanosecondsTime();
    const returningResults = {
      count: uniqueTokenScores.length,
      elapsed: {
        raw: Number(timeEnd - timeStart),
        formatted: formatNanoseconds(timeEnd - timeStart)
      },
      hits: results,
      ...facetsResults ? { facets: facetsResults } : {},
      ...groups ? { groups } : {}
    };
    const includeVectors = params.includeVectors ?? false;
    if (!includeVectors) {
      const vectorProperties = Object.keys(orama.data.index.vectorIndexes);
      removeVectorsFromHits(returningResults, vectorProperties);
    }
    return returningResults;
  }
  async function executeSearchAsync() {
    if (orama.beforeSearch) {
      await runBeforeSearch(orama.beforeSearch, orama, params, language);
    }
    const results = performSearchLogic();
    if (orama.afterSearch) {
      await runAfterSearch(orama.afterSearch, orama, params, language, results);
    }
    return results;
  }
  const asyncNeeded = orama.beforeSearch?.length || orama.afterSearch?.length;
  if (asyncNeeded) {
    return executeSearchAsync();
  }
  return performSearchLogic();
}
function extractScore(token) {
  return token[1];
}
function minMaxScoreNormalization(results) {
  const maxScore = Math.max.apply(Math, results.map(extractScore));
  return results.map(([id, score]) => [id, score / maxScore]);
}
function normalizeScore(score, maxScore) {
  return score / maxScore;
}
function hybridScoreBuilder(textWeight, vectorWeight) {
  return (textScore, vectorScore) => textScore * textWeight + vectorScore * vectorWeight;
}
function mergeAndRankResults(textResults, vectorResults, query, hybridWeights) {
  const maxTextScore = Math.max.apply(Math, textResults.map(extractScore));
  const maxVectorScore = Math.max.apply(Math, vectorResults.map(extractScore));
  const hasHybridWeights = hybridWeights && hybridWeights.text && hybridWeights.vector;
  const { text: textWeight, vector: vectorWeight } = hasHybridWeights ? hybridWeights : getQueryWeights(query);
  const mergedResults = /* @__PURE__ */ new Map();
  const textResultsLength = textResults.length;
  const hybridScore = hybridScoreBuilder(textWeight, vectorWeight);
  for (let i = 0; i < textResultsLength; i++) {
    const [id, score] = textResults[i];
    const normalizedScore = normalizeScore(score, maxTextScore);
    const hybridScoreValue = hybridScore(normalizedScore, 0);
    mergedResults.set(id, hybridScoreValue);
  }
  const vectorResultsLength = vectorResults.length;
  for (let i = 0; i < vectorResultsLength; i++) {
    const [resultId, score] = vectorResults[i];
    const normalizedScore = normalizeScore(score, maxVectorScore);
    const existingRes = mergedResults.get(resultId) ?? 0;
    mergedResults.set(resultId, existingRes + hybridScore(0, normalizedScore));
  }
  return [...mergedResults].sort((a, b) => b[1] - a[1]);
}
function getQueryWeights(query) {
  return {
    text: 0.5,
    vector: 0.5
  };
}

// node_modules/@orama/orama/dist/esm/methods/search.js
function search2(orama, params, language) {
  const mode = params.mode ?? MODE_FULLTEXT_SEARCH;
  if (mode === MODE_FULLTEXT_SEARCH) {
    return fullTextSearch(orama, params, language);
  }
  if (mode === MODE_VECTOR_SEARCH) {
    return searchVector(orama, params);
  }
  if (mode === MODE_HYBRID_SEARCH) {
    return hybridSearch(orama, params);
  }
  throw createError("INVALID_SEARCH_MODE", mode);
}
function fetchDocumentsWithDistinct(orama, uniqueDocsArray, offset, limit, distinctOn) {
  const docs = orama.data.docs;
  const values = /* @__PURE__ */ new Map();
  const results = [];
  const resultIDs = /* @__PURE__ */ new Set();
  const uniqueDocsArrayLength = uniqueDocsArray.length;
  let count3 = 0;
  for (let i = 0; i < uniqueDocsArrayLength; i++) {
    const idAndScore = uniqueDocsArray[i];
    if (typeof idAndScore === "undefined") {
      continue;
    }
    const [id, score] = idAndScore;
    if (resultIDs.has(id)) {
      continue;
    }
    const doc = orama.documentsStore.get(docs, id);
    const value = getNested(doc, distinctOn);
    if (typeof value === "undefined" || values.has(value)) {
      continue;
    }
    values.set(value, true);
    count3++;
    if (count3 <= offset) {
      continue;
    }
    results.push({ id: getDocumentIdFromInternalId(orama.internalDocumentIDStore, id), score, document: doc });
    resultIDs.add(id);
    if (count3 >= offset + limit) {
      break;
    }
  }
  return results;
}
function fetchDocuments(orama, uniqueDocsArray, offset, limit) {
  const docs = orama.data.docs;
  const results = Array.from({
    length: limit
  });
  const resultIDs = /* @__PURE__ */ new Set();
  for (let i = offset; i < limit + offset; i++) {
    const idAndScore = uniqueDocsArray[i];
    if (typeof idAndScore === "undefined") {
      break;
    }
    const [id, score] = idAndScore;
    if (!resultIDs.has(id)) {
      const fullDoc = orama.documentsStore.get(docs, id);
      results[i] = { id: getDocumentIdFromInternalId(orama.internalDocumentIDStore, id), score, document: fullDoc };
      resultIDs.add(id);
    }
  }
  return results;
}

// node_modules/@orama/orama/dist/esm/methods/serialization.js
function load6(orama, raw) {
  orama.internalDocumentIDStore.load(orama, raw.internalDocumentIDStore);
  orama.data.index = orama.index.load(orama.internalDocumentIDStore, raw.index);
  orama.data.docs = orama.documentsStore.load(orama.internalDocumentIDStore, raw.docs);
  orama.data.sorting = orama.sorter.load(orama.internalDocumentIDStore, raw.sorting);
  orama.data.pinning = orama.pinning.load(orama.internalDocumentIDStore, raw.pinning);
  orama.tokenizer.language = raw.language;
}
function save6(orama) {
  return {
    internalDocumentIDStore: orama.internalDocumentIDStore.save(orama.internalDocumentIDStore),
    index: orama.index.save(orama.data.index),
    docs: orama.documentsStore.save(orama.data.docs),
    sorting: orama.sorter.save(orama.data.sorting),
    pinning: orama.pinning.save(orama.data.pinning),
    language: orama.tokenizer.language
  };
}

// node_modules/@orama/orama/dist/esm/types.js
var kInsertions = Symbol("orama.insertions");
var kRemovals = Symbol("orama.removals");

// node_modules/@orama/plugin-data-persistence/dist/index.js
var import_msgpack = __toESM(require_dist(), 1);
var dpack = __toESM(require_dpack(), 1);

// node_modules/@orama/plugin-data-persistence/dist/errors.js
function UNSUPPORTED_FORMAT(format) {
  return `Unsupported serialization format: ${format}`;
}

// node_modules/@orama/plugin-data-persistence/dist/utils.js
function detectRuntime() {
  if (typeof process !== "undefined" && process.versions !== void 0) {
    return "node";
  } else if (typeof Deno !== "undefined") {
    return "deno";
  } else if (typeof Bun !== "undefined") {
    return "bun";
  } else if (typeof window !== "undefined") {
    return "browser";
  }
  return "unknown";
}

// node_modules/seqproto/dist/esm/index.js
var TYPE_FLOAT = 0;
var TYPE_UINT32 = 1;
var TYPE_INT32 = 2;
var POW_2_32 = 2 ** 32;
function createSer({ bufferSize } = {}) {
  const size = bufferSize !== null && bufferSize !== void 0 ? bufferSize : 2 ** 24;
  if (size >= POW_2_32) {
    throw new Error("bufferSize option must be strictly less than 2 ** 32");
  }
  const buffer = new ArrayBuffer(size);
  return {
    index: 0,
    buffer,
    uint32Array: new Uint32Array(buffer),
    float32Array: new Float32Array(buffer),
    reset: function() {
      this.index = 0;
    },
    serializeBoolean,
    serializeUInt32,
    serializeFloat32,
    serializeNumber,
    serializeString,
    serializeArray,
    serializeIterable,
    serializeIndexableArray,
    unsafeSerializeUint32Array,
    getBuffer: function() {
      return this.buffer.slice(0, this.index * 4);
    }
  };
}
function createDes(buffer) {
  const n32 = Math.floor(buffer.byteLength / 4);
  return {
    index: 0,
    buffer,
    uint32Array: new Uint32Array(buffer, 0, n32),
    float32Array: new Float32Array(buffer, 0, n32),
    setBuffer: function(buffer2, byteOffset, byteLength) {
      if (typeof byteOffset === "number" && typeof byteLength === "number") {
        this.index = Math.floor(byteOffset / 4);
        const n323 = this.index + Math.ceil(byteLength / 4);
        this.buffer = buffer2;
        this.uint32Array = new Uint32Array(buffer2, 0, n323);
        this.float32Array = new Float32Array(buffer2, 0, n323);
        return;
      }
      const n322 = Math.floor(buffer2.byteLength / 4);
      this.buffer = buffer2;
      this.index = 0;
      this.uint32Array = new Uint32Array(buffer2, 0, n322);
      this.float32Array = new Float32Array(buffer2, 0, n322);
    },
    deserializeBoolean,
    deserializeUInt32,
    deserializeFloat32,
    deserializeNumber,
    deserializeString,
    deserializeArray,
    deserializeIterable,
    getArrayElements,
    unsafeDeserializeUint32Array
  };
}
function serializeBoolean(b) {
  this.uint32Array[this.index++] = b ? 1 : 0;
}
function deserializeBoolean() {
  return this.uint32Array[this.index++] === 1;
}
function serializeUInt32(n) {
  this.uint32Array[this.index++] = n;
}
function deserializeUInt32() {
  return this.uint32Array[this.index++];
}
function serializeFloat32(n) {
  this.float32Array[this.index++] = n;
}
function deserializeFloat32() {
  return this.float32Array[this.index++];
}
function serializeNumber(n) {
  if (n % 1 !== 0) {
    this.uint32Array[this.index++] = TYPE_FLOAT;
    this.serializeFloat32(n);
  } else if (n >= 0) {
    this.uint32Array[this.index++] = TYPE_UINT32;
    this.serializeUInt32(n);
  } else {
    this.uint32Array[this.index++] = TYPE_INT32;
    this.uint32Array[this.index++] = POW_2_32 + n;
  }
}
function deserializeNumber() {
  const type = this.uint32Array[this.index++];
  if (type === TYPE_FLOAT) {
    return this.deserializeFloat32();
  } else if (type === TYPE_UINT32) {
    return this.deserializeUInt32();
  } else if (type === TYPE_INT32) {
    return this.uint32Array[this.index++] - POW_2_32;
  } else {
    throw new Error("Unknown type");
  }
}
var textEncoder = new TextEncoder();
function serializeString(str2) {
  const r = textEncoder.encodeInto(str2, new Uint8Array(this.buffer, (this.index + 1) * 4));
  this.uint32Array[this.index] = r.written;
  this.index += Math.ceil(r.written / 4) + 1;
}
var textDecoder = new TextDecoder();
function deserializeString() {
  const len = this.uint32Array[this.index++];
  const decoded = textDecoder.decode(new Uint8Array(this.buffer, this.index * 4, len));
  this.index += Math.ceil(len / 4);
  return decoded;
}
function serializeArray(arr, serialize2) {
  const len = arr.length;
  this.serializeUInt32(len);
  for (let i = 0; i < len; i++) {
    serialize2(this, arr[i]);
  }
}
function deserializeArray(deserialize) {
  const len = this.deserializeUInt32();
  const arr = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = deserialize(this);
  }
  return arr;
}
function serializeIterable(iterable, serialize2) {
  const currentIndex = this.index++;
  let n = 0;
  for (const t of iterable) {
    n++;
    serialize2(this, t);
  }
  this.uint32Array[currentIndex] = n;
}
function deserializeIterable(deserialize) {
  const len = this.deserializeUInt32();
  const aGeneratorObject = (function* (des) {
    for (let i = 0; i < len; i++) {
      yield deserialize(des);
    }
  })(this);
  return {
    [Symbol.iterator]() {
      return aGeneratorObject;
    }
  };
}
function unsafeSerializeUint32Array(arr) {
  const length = Math.ceil(arr.byteLength / 4);
  this.uint32Array[this.index++] = length;
  this.uint32Array.set(arr, this.index);
  this.index += length;
}
function unsafeDeserializeUint32Array() {
  const byteLength = this.uint32Array[this.index++];
  const d = new Uint32Array(this.buffer, this.index * 4, byteLength);
  this.index += byteLength;
  return d;
}
function serializeIndexableArray(arr, serialize2) {
  const l = arr.length;
  this.uint32Array[this.index++] = l;
  let indexOffsets = this.index;
  this.index += l * 2;
  for (let i = 0; i < l; i++) {
    const offsetStart = this.index;
    serialize2(this, arr[i]);
    const offsetEnd = this.index;
    this.uint32Array[indexOffsets++] = offsetStart;
    this.uint32Array[indexOffsets++] = offsetEnd - offsetStart;
  }
}
function getArrayElements(indexes, deserialize) {
  const currentIndex = this.index + 1;
  const l = indexes.length;
  const arr = new Array(l);
  for (let i = 0; i < l; i++) {
    const indexOffset = currentIndex + indexes[i] * 2;
    const start = this.uint32Array[indexOffset];
    const end = this.uint32Array[indexOffset + 1];
    arr[i] = deserialize(this, start * 4, end);
  }
  return arr;
}

// node_modules/@orama/plugin-data-persistence/dist/seqproto.js
function serializeStringArray(ser, arr) {
  ser.serializeUInt32(arr.length);
  for (let i = 0; i < arr.length; i++) {
    ser.serializeString(arr[i]);
  }
}
function deserializeStringArray(des) {
  const len = des.deserializeUInt32();
  const arr = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = des.deserializeString();
  }
  return arr;
}
function deserializeNumberArray(des) {
  const len = des.deserializeUInt32();
  const arr = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = des.deserializeNumber();
  }
  return arr;
}
function serializeIndexNode(ser, type, node) {
  if (type === "Radix") {
    ser.serializeUInt32(1);
    ser.serializeString(node.w || "");
    ser.serializeString(node.s || "");
    ser.serializeBoolean(node.e || false);
    ser.serializeString(node.k || "");
    if (Array.isArray(node.d)) {
      ser.serializeUInt32(node.d.length);
      for (let i = 0; i < node.d.length; i++) {
        ser.serializeNumber(node.d[i]);
      }
    } else {
      ser.serializeUInt32(0);
    }
    if (Array.isArray(node.c)) {
      ser.serializeUInt32(node.c.length);
      for (let i = 0; i < node.c.length; i++) {
        const [key, child] = node.c[i];
        ser.serializeString(key);
        serializeIndexNode(ser, "Radix", child);
      }
    } else {
      ser.serializeUInt32(0);
    }
  } else if (type === "Flat") {
    ser.serializeUInt32(2);
    if (node.numberToDocumentId && Array.isArray(node.numberToDocumentId)) {
      ser.serializeUInt32(node.numberToDocumentId.length);
      for (let i = 0; i < node.numberToDocumentId.length; i++) {
        const [key, ids] = node.numberToDocumentId[i];
        ser.serializeString(String(key));
        const stringIds = Array.isArray(ids) ? ids.map((id) => String(id)) : [];
        serializeStringArray(ser, stringIds);
      }
    } else {
      ser.serializeUInt32(0);
    }
  } else {
    ser.serializeUInt32(0);
    serializeValue(ser, node);
  }
}
function deserializeIndexNode(des) {
  const nodeType = des.deserializeUInt32();
  if (nodeType === 1) {
    const w = des.deserializeString();
    const s = des.deserializeString();
    const e = des.deserializeBoolean();
    const k = des.deserializeString();
    const d = deserializeNumberArray(des);
    const childrenLen = des.deserializeUInt32();
    const c2 = [];
    for (let i = 0; i < childrenLen; i++) {
      const key = des.deserializeString();
      const child = deserializeIndexNode(des);
      c2.push([
        key,
        child
      ]);
    }
    return {
      w: w || "",
      s: s || "",
      e,
      k: k || "",
      d,
      c: c2
    };
  } else if (nodeType === 2) {
    const numberToDocumentIdLen = des.deserializeUInt32();
    const numberToDocumentId = [];
    for (let i = 0; i < numberToDocumentIdLen; i++) {
      const key = des.deserializeString();
      const ids = deserializeStringArray(des);
      numberToDocumentId.push([
        key,
        ids
      ]);
    }
    return {
      numberToDocumentId
    };
  } else {
    return deserializeValue(des);
  }
}
function serializeStringToNumberMap(ser, map) {
  const keys = Object.keys(map);
  ser.serializeUInt32(keys.length);
  const keysLength = keys.length;
  for (let i = 0; i < keysLength; i++) {
    const key = keys[i];
    ser.serializeString(key);
    ser.serializeNumber(map[key]);
  }
}
function deserializeStringToNumberMap(des) {
  const len = des.deserializeUInt32();
  const map = {};
  for (let i = 0; i < len; i++) {
    const key = des.deserializeString();
    map[key] = des.deserializeNumber();
  }
  return map;
}
function serializeFrequencies(ser, frequencies) {
  const fieldKeys = Object.keys(frequencies);
  const fieldKeysLength = fieldKeys.length;
  ser.serializeUInt32(fieldKeysLength);
  for (let i = 0; i < fieldKeysLength; i++) {
    const field = fieldKeys[i];
    ser.serializeString(field);
    const docFreqs = frequencies[field] || {};
    const docIds = Object.keys(docFreqs);
    ser.serializeUInt32(docIds.length);
    for (let j = 0; j < docIds.length; j++) {
      const docId = docIds[j];
      ser.serializeString(docId);
      serializeStringToNumberMap(ser, docFreqs[docId] || {});
    }
  }
}
function deserializeFrequencies(des) {
  const fieldCount = des.deserializeUInt32();
  const frequencies = {};
  for (let i = 0; i < fieldCount; i++) {
    const field = des.deserializeString();
    const docCount = des.deserializeUInt32();
    const docFreqs = {};
    for (let j = 0; j < docCount; j++) {
      const docId = des.deserializeString();
      docFreqs[docId] = deserializeStringToNumberMap(des);
    }
    frequencies[field] = docFreqs;
  }
  return frequencies;
}
function serializeTokenOccurrences(ser, tokenOccurrences) {
  const fieldKeys = Object.keys(tokenOccurrences);
  ser.serializeUInt32(fieldKeys.length);
  for (let i = 0; i < fieldKeys.length; i++) {
    const field = fieldKeys[i];
    ser.serializeString(field);
    serializeStringToNumberMap(ser, tokenOccurrences[field] || {});
  }
}
function deserializeTokenOccurrences(des) {
  const fieldCount = des.deserializeUInt32();
  const tokenOccurrences = {};
  for (let i = 0; i < fieldCount; i++) {
    const field = des.deserializeString();
    tokenOccurrences[field] = deserializeStringToNumberMap(des);
  }
  return tokenOccurrences;
}
function serializeValue(ser, value) {
  if (value === null) {
    ser.serializeUInt32(0);
    return;
  }
  if (value === void 0) {
    ser.serializeUInt32(1);
    return;
  }
  const t = typeof value;
  if (t === "string") {
    ser.serializeUInt32(2);
    ser.serializeString(value);
    return;
  }
  if (t === "number") {
    ser.serializeUInt32(3);
    ser.serializeNumber(value);
    return;
  }
  if (t === "boolean") {
    ser.serializeUInt32(4);
    ser.serializeBoolean(value);
    return;
  }
  if (Array.isArray(value)) {
    ser.serializeUInt32(5);
    ser.serializeUInt32(value.length);
    for (let i = 0; i < value.length; i++) {
      serializeValue(ser, value[i]);
    }
    return;
  }
  ser.serializeUInt32(6);
  const obj = value;
  const keys = Object.keys(obj);
  const keysLength = keys.length;
  ser.serializeUInt32(keysLength);
  for (let i = 0; i < keysLength; i++) {
    const key = keys[i];
    ser.serializeString(key);
    serializeValue(ser, obj[key]);
  }
}
function deserializeValue(des) {
  const type = des.deserializeUInt32();
  if (type === 0) return null;
  if (type === 1) return void 0;
  if (type === 2) return des.deserializeString();
  if (type === 3) return des.deserializeNumber();
  if (type === 4) return des.deserializeBoolean();
  if (type === 5) {
    const len = des.deserializeUInt32();
    const arr = new Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = deserializeValue(des);
    }
    return arr;
  }
  if (type === 6) {
    const len = des.deserializeUInt32();
    const obj = {};
    for (let i = 0; i < len; i++) {
      const key = des.deserializeString();
      obj[key] = deserializeValue(des);
    }
    return obj;
  }
  throw new Error(`Unknown type: ${type}`);
}
function serializeOramaInstance(db) {
  const raw = save6(db);
  const ser = createSer();
  ser.serializeUInt32(2);
  const idStore = raw.internalDocumentIDStore?.internalIdToId || [];
  ser.serializeUInt32(idStore.length);
  for (let i = 0; i < idStore.length; i++) {
    ser.serializeString(idStore[i]);
  }
  ser.serializeUInt32(raw.docs?.count || 0);
  if (raw.docs?.docs) {
    const docKeys = Object.keys(raw.docs.docs);
    ser.serializeUInt32(docKeys.length);
    for (let i = 0; i < docKeys.length; i++) {
      const docId = docKeys[i];
      const doc = raw.docs.docs[docId];
      ser.serializeString(docId);
      const docFields = Object.keys(doc);
      ser.serializeUInt32(docFields.length);
      for (let j = 0; j < docFields.length; j++) {
        const field = docFields[j];
        ser.serializeString(field);
        const value = doc[field];
        if (Array.isArray(value)) {
          ser.serializeUInt32(value.length | 2147483648);
          for (let k = 0; k < value.length; k++) {
            ser.serializeString(value[k]);
          }
        } else {
          ser.serializeUInt32(0);
          ser.serializeString(String(value));
        }
      }
    }
  } else {
    ser.serializeUInt32(0);
  }
  if (raw.index?.indexes) {
    const indexKeys = Object.keys(raw.index.indexes);
    ser.serializeUInt32(indexKeys.length);
    for (let i = 0; i < indexKeys.length; i++) {
      const key = indexKeys[i];
      const index = raw.index.indexes[key];
      ser.serializeString(key);
      ser.serializeString(index.type || "");
      ser.serializeBoolean(index.isArray || false);
      const node = index.node || {};
      if (index.type === "Radix") {
        ser.serializeUInt32(1);
        ser.serializeString(node.w || "");
        ser.serializeString(node.s || "");
        ser.serializeBoolean(node.e || false);
        ser.serializeString(node.k || "");
        const d = node.d || [];
        ser.serializeUInt32(d.length);
        for (let j = 0; j < d.length; j++) {
          ser.serializeNumber(d[j]);
        }
        const c2 = node.c || [];
        ser.serializeUInt32(c2.length);
        for (let j = 0; j < c2.length; j++) {
          const [cKey, child] = c2[j];
          ser.serializeString(cKey);
          serializeIndexNode(ser, "Radix", child);
        }
      } else if (index.type === "Flat") {
        ser.serializeUInt32(2);
        const ntdi = node.numberToDocumentId || [];
        ser.serializeUInt32(ntdi.length);
        for (let j = 0; j < ntdi.length; j++) {
          const [key2, ids] = ntdi[j];
          ser.serializeString(String(key2));
          const stringIds = Array.isArray(ids) ? ids.map((id) => String(id)) : [];
          ser.serializeUInt32(stringIds.length);
          for (let k = 0; k < stringIds.length; k++) {
            ser.serializeString(stringIds[k]);
          }
        }
      } else {
        ser.serializeUInt32(0);
      }
    }
  } else {
    ser.serializeUInt32(0);
  }
  const searchProps = raw.index?.searchableProperties || [];
  ser.serializeUInt32(searchProps.length);
  for (let i = 0; i < searchProps.length; i++) {
    ser.serializeString(searchProps[i]);
  }
  const propsWithTypes = raw.index?.searchablePropertiesWithTypes || {};
  const propsKeys = Object.keys(propsWithTypes);
  ser.serializeUInt32(propsKeys.length);
  for (let i = 0; i < propsKeys.length; i++) {
    const key = propsKeys[i];
    ser.serializeString(key);
    ser.serializeString(propsWithTypes[key]);
  }
  serializeFrequencies(ser, raw.index?.frequencies || {});
  serializeTokenOccurrences(ser, raw.index?.tokenOccurrences || {});
  const avgFL = raw.index?.avgFieldLength || {};
  const avgKeys = Object.keys(avgFL);
  ser.serializeUInt32(avgKeys.length);
  for (let i = 0; i < avgKeys.length; i++) {
    const key = avgKeys[i];
    ser.serializeString(key);
    ser.serializeNumber(avgFL[key]);
  }
  const fieldLengths = raw.index?.fieldLengths || {};
  const fieldKeys = Object.keys(fieldLengths);
  ser.serializeUInt32(fieldKeys.length);
  for (let i = 0; i < fieldKeys.length; i++) {
    const field = fieldKeys[i];
    ser.serializeString(field);
    const fieldData = fieldLengths[field] || {};
    const fieldDataKeys = Object.keys(fieldData);
    ser.serializeUInt32(fieldDataKeys.length);
    for (let j = 0; j < fieldDataKeys.length; j++) {
      const key = fieldDataKeys[j];
      ser.serializeString(key);
      ser.serializeNumber(fieldData[key]);
    }
  }
  ser.serializeString(raw.language || "");
  const pinningRules = raw.pinning?.rules || [];
  ser.serializeUInt32(pinningRules.length);
  for (let i = 0; i < pinningRules.length; i++) {
    const [ruleId, rule] = pinningRules[i];
    ser.serializeString(ruleId);
    serializeValue(ser, rule);
  }
  return ser.getBuffer();
}
function deserializeOramaInstance(buffer) {
  const des = createDes(buffer);
  const version = des.deserializeUInt32();
  if (version === 1) {
    const raw2 = deserializeValue(des);
    return raw2;
  }
  if (version !== 2) {
    throw new Error(`Unsupported seqproto Orama serialization version: ${version}`);
  }
  const raw = {};
  const idStoreLen = des.deserializeUInt32();
  const internalIdToId = new Array(idStoreLen);
  for (let i = 0; i < idStoreLen; i++) {
    internalIdToId[i] = des.deserializeString();
  }
  raw.internalDocumentIDStore = {
    internalIdToId
  };
  const docCount = des.deserializeUInt32();
  const docsLength = des.deserializeUInt32();
  const docs = {};
  for (let i = 0; i < docsLength; i++) {
    const docId = des.deserializeString();
    const doc = {};
    const fieldCount = des.deserializeUInt32();
    for (let j = 0; j < fieldCount; j++) {
      const field = des.deserializeString();
      const arrayInfo = des.deserializeUInt32();
      if (arrayInfo & 2147483648) {
        const len = arrayInfo & 2147483647;
        const arr = new Array(len);
        for (let k = 0; k < len; k++) {
          arr[k] = des.deserializeString();
        }
        doc[field] = arr;
      } else {
        doc[field] = des.deserializeString();
      }
    }
    docs[docId] = doc;
  }
  raw.docs = {
    docs,
    count: docCount
  };
  const indexCount = des.deserializeUInt32();
  const indexes = {};
  for (let i = 0; i < indexCount; i++) {
    const key = des.deserializeString();
    const type = des.deserializeString();
    const isArray = des.deserializeBoolean();
    const nodeType = des.deserializeUInt32();
    let node;
    if (nodeType === 1) {
      const w = des.deserializeString();
      const s = des.deserializeString();
      const e = des.deserializeBoolean();
      const k = des.deserializeString();
      const dLen = des.deserializeUInt32();
      const d = new Array(dLen);
      for (let j = 0; j < dLen; j++) {
        d[j] = des.deserializeNumber();
      }
      const cLen = des.deserializeUInt32();
      const c2 = new Array(cLen);
      for (let j = 0; j < cLen; j++) {
        const cKey = des.deserializeString();
        const child = deserializeIndexNode(des);
        c2[j] = [
          cKey,
          child
        ];
      }
      node = {
        w,
        s,
        e,
        k,
        d,
        c: c2
      };
    } else if (nodeType === 2) {
      const ntdiLen = des.deserializeUInt32();
      const numberToDocumentId = new Array(ntdiLen);
      for (let j = 0; j < ntdiLen; j++) {
        const key2 = des.deserializeString();
        const idsLen = des.deserializeUInt32();
        const ids = new Array(idsLen);
        for (let k = 0; k < idsLen; k++) {
          ids[k] = des.deserializeString();
        }
        numberToDocumentId[j] = [
          key2,
          ids
        ];
      }
      node = {
        numberToDocumentId
      };
    } else {
      node = {};
    }
    indexes[key] = {
      type,
      isArray,
      node
    };
  }
  const searchPropLen = des.deserializeUInt32();
  const searchableProperties = new Array(searchPropLen);
  for (let i = 0; i < searchPropLen; i++) {
    searchableProperties[i] = des.deserializeString();
  }
  const propsWithTypesLen = des.deserializeUInt32();
  const searchablePropertiesWithTypes = {};
  for (let i = 0; i < propsWithTypesLen; i++) {
    const key = des.deserializeString();
    const value = des.deserializeString();
    searchablePropertiesWithTypes[key] = value;
  }
  const frequencies = deserializeFrequencies(des);
  const tokenOccurrences = deserializeTokenOccurrences(des);
  const avgFLLen = des.deserializeUInt32();
  const avgFieldLength = {};
  for (let i = 0; i < avgFLLen; i++) {
    const key = des.deserializeString();
    avgFieldLength[key] = des.deserializeNumber();
  }
  const fieldLengthsLen = des.deserializeUInt32();
  const fieldLengths = {};
  for (let i = 0; i < fieldLengthsLen; i++) {
    const field = des.deserializeString();
    const dataLen = des.deserializeUInt32();
    const fieldData = {};
    for (let j = 0; j < dataLen; j++) {
      const key = des.deserializeString();
      fieldData[key] = des.deserializeNumber();
    }
    fieldLengths[field] = fieldData;
  }
  raw.index = {
    indexes,
    vectorIndexes: {},
    searchableProperties,
    searchablePropertiesWithTypes,
    frequencies,
    tokenOccurrences,
    avgFieldLength,
    fieldLengths
  };
  raw.language = des.deserializeString();
  const pinningRulesLen = des.deserializeUInt32();
  const pinningRules = new Array(pinningRulesLen);
  for (let i = 0; i < pinningRulesLen; i++) {
    const ruleId = des.deserializeString();
    const rule = deserializeValue(des);
    pinningRules[i] = [
      ruleId,
      rule
    ];
  }
  raw.pinning = {
    rules: pinningRules
  };
  raw.sorting = {};
  return raw;
}

// node_modules/@orama/plugin-data-persistence/dist/index.js
var hexFromMap = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15
};
var hexToMap = Object.keys(hexFromMap);
function slowHexToBuffer(hex) {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  hex = hex.toLowerCase();
  for (let i = 0; i < hex.length; i++) {
    const a = hexFromMap[hex[i * 2]];
    const b = hexFromMap[hex[i * 2 + 1]];
    if (a === void 0 || b === void 0) {
      break;
    }
    bytes[i] = a << 4 | b;
  }
  return bytes;
}
function slowHexToString(bytes) {
  return Array.from(bytes || []).map((b) => hexToMap[b >> 4] + hexToMap[b & 15]).join("");
}
async function persist(db, format = "binary", runtime) {
  if (!runtime) {
    runtime = detectRuntime();
  }
  const dbExport = await save6(db);
  let serialized;
  switch (format) {
    case "json":
      serialized = JSON.stringify(dbExport);
      break;
    case "dpack":
      serialized = dpack.serialize(dbExport);
      break;
    case "binary": {
      const msgpack = (0, import_msgpack.encode)(dbExport);
      if (runtime === "node") {
        serialized = Buffer.from(msgpack.buffer, msgpack.byteOffset, msgpack.byteLength);
        serialized = serialized.toString("hex");
      } else {
        serialized = slowHexToString(msgpack);
      }
      break;
    }
    case "seqproto":
      serialized = serializeOramaInstance(db);
      break;
    default:
      throw new Error(UNSUPPORTED_FORMAT(format));
  }
  return serialized;
}
async function restore(format, data, runtime) {
  if (!runtime) {
    runtime = detectRuntime();
  }
  const db = create5({
    schema: {
      __placeholder: "string"
    }
  });
  let deserialized;
  switch (format) {
    case "json":
      deserialized = JSON.parse(data.toString());
      break;
    case "dpack":
      deserialized = dpack.parse(data);
      break;
    case "binary": {
      if (runtime === "node") {
        data = Buffer.from(data.toString(), "hex");
      } else {
        data = slowHexToBuffer(data);
      }
      deserialized = (0, import_msgpack.decode)(data);
      break;
    }
    case "seqproto":
      {
        let ab;
        if (data instanceof ArrayBuffer) {
          ab = data;
        } else if (ArrayBuffer.isView(data)) {
          const view = data;
          const slice = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
          const copy = new Uint8Array(view.byteLength);
          copy.set(new Uint8Array(slice));
          ab = copy.buffer;
        } else if (typeof data === "string") {
          const buf = Buffer.from(data, "binary");
          const slice = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
          const copy = new Uint8Array(buf.byteLength);
          copy.set(new Uint8Array(slice));
          ab = copy.buffer;
        } else {
          throw new Error("Unsupported data type for seqproto restore");
        }
        deserialized = deserializeOramaInstance(ab);
      }
      break;
    default:
      throw new Error(UNSUPPORTED_FORMAT(format));
  }
  load6(db, deserialized);
  return db;
}

// src/core/vector-store.ts
import path4 from "node:path";
import { promises as fs3 } from "node:fs";

// src/core/embedding.ts
var OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
var EMBEDDING_MODEL = process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text";
var EMBEDDING_DIM = 768;
var MAX_INPUT_CHARS = 6e3;
function truncateInput(text) {
  if (text.length <= MAX_INPUT_CHARS) {
    return text;
  }
  logger.search.debug(`Truncating input from ${text.length} to ${MAX_INPUT_CHARS} chars`);
  return text.slice(0, MAX_INPUT_CHARS);
}
var EmbeddingService = class _EmbeddingService {
  static instance = null;
  initialized = false;
  constructor() {
  }
  static getInstance() {
    if (!_EmbeddingService.instance) {
      _EmbeddingService.instance = new _EmbeddingService();
    }
    return _EmbeddingService.instance;
  }
  /**
   * Initialize the embedding service (checks Ollama is available)
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    logger.search.info(`Initializing Ollama embedding service (model: ${EMBEDDING_MODEL})`);
    const startTime = Date.now();
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama not responding: ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Ollama not available at ${OLLAMA_BASE_URL}. Please start Ollama and ensure ${EMBEDDING_MODEL} is pulled: ollama pull ${EMBEDDING_MODEL}`
      );
    }
    await this.embed("test");
    const elapsed = Date.now() - startTime;
    logger.search.info(`Ollama embedding service ready in ${elapsed}ms`);
    this.initialized = true;
  }
  isInitialized() {
    return this.initialized;
  }
  /**
   * Generate embedding for a query
   */
  async embedQuery(text) {
    return this.embed(text);
  }
  /**
   * Generate embedding for a passage/document
   */
  async embed(text) {
    const truncatedText = truncateInput(text);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: truncatedText
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama embed failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    const embedding = data.embeddings[0];
    if (!embedding) {
      throw new Error("No embedding returned from Ollama");
    }
    return embedding;
  }
  /**
   * Generate embeddings for multiple passages (batch processing)
   */
  async embedBatch(texts) {
    if (texts.length === 0) {
      return [];
    }
    const truncatedTexts = texts.map(truncateInput);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: truncatedTexts
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama batch embed failed: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return data.embeddings;
  }
};
function getEmbeddingService() {
  return EmbeddingService.getInstance();
}

// src/core/vector-store.ts
var INDEX_FILENAME = "orama-episodic-index.json";
var EPISODIC_SCHEMA = {
  id: "string",
  subject: "string",
  keywords: "string",
  // JSON stringified array
  applies_to: "string",
  occurred_at: "string",
  content_hash: "string",
  content: "string",
  embedding: `vector[${EMBEDDING_DIM}]`
};
var VectorStore = class {
  embeddingService;
  indexPath;
  baseDir;
  readonly;
  initialized = false;
  db = null;
  dirty = false;
  constructor(options2 = {}) {
    const config = getConfig();
    this.baseDir = options2.baseDir ?? config.memoryDir;
    this.indexPath = path4.join(this.baseDir, INDEX_FILENAME);
    this.embeddingService = getEmbeddingService();
    this.readonly = options2.readonly ?? false;
  }
  /**
   * Initialize the store (loads existing index or creates new one)
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    logger.search.info(`Initializing Orama vector store (readonly=${this.readonly})`);
    if (!this.readonly) {
      await fs3.mkdir(this.baseDir, { recursive: true });
      await ensureGitignore(this.baseDir);
    }
    await this.embeddingService.initialize();
    try {
      const indexData = await fs3.readFile(this.indexPath, "utf-8");
      this.db = await restore("json", indexData);
      const docCount = await count2(this.db);
      logger.search.info(`Loaded existing Orama index with ${docCount} documents`);
    } catch (error) {
      if (error.code === "ENOENT") {
        logger.search.info("No existing index found, creating new Orama index");
      } else {
        logger.search.warn(`Failed to load index, creating new one: ${error}`);
      }
      this.db = await create5({
        schema: EPISODIC_SCHEMA
      });
    }
    this.initialized = true;
    logger.search.info("Orama vector store initialized");
  }
  /**
   * Persist the index to disk
   */
  async persistIndex() {
    if (this.readonly || !this.db || !this.dirty) {
      return;
    }
    try {
      const indexData = await persist(this.db, "json");
      await fs3.writeFile(this.indexPath, indexData, "utf-8");
      this.dirty = false;
      logger.search.debug("Orama index persisted to disk");
    } catch (error) {
      logger.search.error(`Failed to persist Orama index: ${error}`);
    }
  }
  /**
   * Add a memory to the vector store (generates embedding if not provided)
   */
  async add(memory) {
    const textForEmbedding = `${memory.subject}

${memory.content}`;
    const embedding = await this.embeddingService.embed(textForEmbedding);
    await this.addWithEmbedding(memory, embedding);
  }
  /**
   * Add a memory with a pre-computed embedding
   */
  async addWithEmbedding(memory, embedding) {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error("Vector store not initialized");
    }
    logger.search.debug(`Adding memory to Orama store: ${memory.id}`);
    const existing = await search2(this.db, {
      term: memory.id,
      properties: ["id"],
      limit: 1
    });
    if (existing.hits.length > 0 && existing.hits[0]?.id === memory.id) {
      logger.search.debug(`Memory ${memory.id} already exists in vector store`);
      return;
    }
    await insert3(this.db, {
      id: memory.id,
      subject: memory.subject,
      keywords: JSON.stringify(memory.keywords),
      applies_to: memory.applies_to,
      occurred_at: memory.occurred_at,
      content_hash: memory.content_hash,
      content: memory.content,
      embedding
    });
    this.dirty = true;
    logger.search.info(`Added memory ${memory.id} to Orama store`);
    await this.persistIndex();
  }
  /**
   * Remove a memory from the vector store
   */
  async remove(id) {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error("Vector store not initialized");
    }
    try {
      await remove4(this.db, id);
      this.dirty = true;
      logger.search.info(`Removed memory ${id} from Orama store`);
      await this.persistIndex();
      return true;
    } catch (error) {
      logger.search.debug(`Failed to remove memory ${id}: ${error}`);
      return false;
    }
  }
  /**
   * Search for similar memories using vector similarity
   * Applies recency weighting to boost more recent memories
   */
  async search(query, options2 = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error("Vector store not initialized");
    }
    const limit = options2.limit ?? 10;
    const recencyWeight = options2.recencyWeight ?? 0.1;
    logger.search.debug(`Orama vector search for: "${query}"`);
    const queryEmbedding = await this.embeddingService.embedQuery(query);
    const searchParams = {
      mode: "vector",
      vector: {
        value: queryEmbedding,
        property: "embedding"
      },
      similarity: 0,
      // Disable default threshold, we filter ourselves
      limit: options2.scope ? limit * 10 : limit,
      // Get more results when filtering by scope
      includeVectors: false
    };
    const results = await search2(this.db, searchParams);
    const now = Date.now();
    const timestamps = results.hits.map((hit) => new Date(hit.document.occurred_at).getTime());
    const oldestTime = Math.min(...timestamps);
    const timeRange = now - oldestTime;
    let mappedResults = results.hits.map((hit) => {
      const occurredAt = new Date(hit.document.occurred_at).getTime();
      const recencyFactor = timeRange > 0 ? (occurredAt - oldestTime) / timeRange : 1;
      const baseScore = hit.score;
      const boostedScore = baseScore * (1 + recencyWeight * recencyFactor);
      return {
        memory: {
          id: hit.document.id,
          subject: hit.document.subject,
          keywords: JSON.parse(hit.document.keywords),
          applies_to: hit.document.applies_to,
          occurred_at: hit.document.occurred_at,
          content_hash: hit.document.content_hash,
          content: hit.document.content
        },
        // Round to 2 decimal places
        score: Math.round(boostedScore * 100) / 100
      };
    });
    mappedResults.sort((a, b) => b.score - a.score);
    if (options2.scope) {
      mappedResults = mappedResults.filter((r) => r.memory.applies_to === options2.scope);
    }
    mappedResults = mappedResults.slice(0, limit);
    logger.search.info(`Orama vector search found ${mappedResults.length} results`);
    return mappedResults;
  }
  /**
   * Get all memory IDs currently in the store
   */
  async getStoredIds() {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error("Vector store not initialized");
    }
    const allDocs = await search2(this.db, {
      term: "",
      limit: 1e5
      // High limit to get all
    });
    return new Set(allDocs.hits.map((hit) => hit.document.id));
  }
  /**
   * Sync vector store with file-based memories
   * Adds any memories that exist as files but not in the vector store
   */
  async sync(memories) {
    if (!this.initialized) {
      await this.initialize();
    }
    logger.search.info(`Syncing Orama store with ${memories.length} memories`);
    const storedIds = await this.getStoredIds();
    const fileIds = new Set(memories.map((m) => m.id));
    let added = 0;
    let removed = 0;
    for (const memory of memories) {
      if (!storedIds.has(memory.id)) {
        await this.add(memory);
        added++;
      }
    }
    for (const storedId of storedIds) {
      if (!fileIds.has(storedId)) {
        await this.remove(storedId);
        removed++;
      }
    }
    logger.search.info(`Sync complete: ${added} added, ${removed} removed`);
    return { added, removed };
  }
  /**
   * Sync vector store with JSONL store
   * Uses pre-computed embeddings from JSONL when available, generates new ones otherwise
   * Stores newly generated embeddings back to the JSONL store
   */
  async syncWithJsonlStore(jsonlStore) {
    if (!this.initialized) {
      await this.initialize();
    }
    const memories = await jsonlStore.listMemories();
    const storedEmbeddings = await jsonlStore.getAllEmbeddings();
    logger.search.info(
      `Syncing Orama store with JSONL (${memories.length} memories, ${storedEmbeddings.size} embeddings)`
    );
    const storedIds = await this.getStoredIds();
    const memoryIds = new Set(memories.map((m) => m.id));
    let added = 0;
    let removed = 0;
    let embeddingsGenerated = 0;
    for (const memory of memories) {
      if (!storedIds.has(memory.id)) {
        const embedding = storedEmbeddings.get(memory.id);
        if (embedding) {
          await this.addWithEmbedding(memory, embedding);
        } else {
          const textForEmbedding = `${memory.subject}

${memory.content}`;
          const newEmbedding = await this.embeddingService.embed(textForEmbedding);
          await this.addWithEmbedding(memory, newEmbedding);
          await jsonlStore.storeEmbedding(memory.id, newEmbedding);
          embeddingsGenerated++;
        }
        added++;
      }
    }
    for (const storedId of storedIds) {
      if (!memoryIds.has(storedId)) {
        await this.remove(storedId);
        removed++;
      }
    }
    logger.search.info(
      `JSONL sync complete: ${added} added, ${removed} removed, ${embeddingsGenerated} embeddings generated`
    );
    return { added, removed, embeddingsGenerated };
  }
  /**
   * Close the vector store (persists any pending changes)
   */
  async close() {
    if (this.dirty) {
      await this.persistIndex();
    }
    logger.search.debug("Orama vector store closed");
  }
};
function getVectorStore(options2 = {}) {
  const baseDir = typeof options2 === "string" ? options2 : options2.baseDir;
  const readonly = typeof options2 === "string" ? false : options2.readonly ?? false;
  return new VectorStore({ baseDir, readonly });
}

// src/core/episodic-jsonl-store.ts
import { createHash } from "node:crypto";
import path6 from "node:path";

// node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm-node/rng.js
import crypto from "node:crypto";
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm-node/native.js
import crypto2 from "node:crypto";
var native_default = {
  randomUUID: crypto2.randomUUID
};

// node_modules/uuid/dist/esm-node/v4.js
function v4(options2, buf, offset) {
  if (native_default.randomUUID && !buf && !options2) {
    return native_default.randomUUID();
  }
  options2 = options2 || {};
  const rnds = options2.random || (options2.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/core/jsonl-types.ts
var scopeSchema = external_exports.string().refine(
  (val) => val === "global" || val.startsWith("file:") || val.startsWith("area:"),
  { message: "Scope must be 'global', 'file:<path>', or 'area:<name>'" }
);
var episodicAddEntrySchema = external_exports.object({
  action: external_exports.literal("add"),
  id: external_exports.string().uuid(),
  subject: external_exports.string().min(1).max(200),
  keywords: external_exports.array(external_exports.string().min(1).max(50)).min(1).max(20),
  applies_to: scopeSchema,
  occurred_at: external_exports.string().datetime(),
  content_hash: external_exports.string(),
  content: external_exports.string().min(10),
  timestamp: external_exports.string().datetime()
});
var thinkingAddEntrySchema = external_exports.object({
  action: external_exports.literal("add"),
  id: external_exports.string().uuid(),
  subject: external_exports.string().min(1).max(200),
  applies_to: scopeSchema,
  occurred_at: external_exports.string().datetime(),
  content_hash: external_exports.string(),
  content: external_exports.string().min(10),
  timestamp: external_exports.string().datetime()
});
var deleteEntrySchema = external_exports.object({
  action: external_exports.literal("delete"),
  id: external_exports.string().uuid(),
  timestamp: external_exports.string().datetime()
});
var embeddingEntrySchema = external_exports.object({
  action: external_exports.literal("embedding"),
  id: external_exports.string().uuid(),
  embedding: external_exports.array(external_exports.number()),
  timestamp: external_exports.string().datetime()
});
var episodicEntrySchema = external_exports.discriminatedUnion("action", [
  episodicAddEntrySchema,
  deleteEntrySchema,
  embeddingEntrySchema
]);
var thinkingEntrySchema = external_exports.discriminatedUnion("action", [
  thinkingAddEntrySchema,
  deleteEntrySchema,
  embeddingEntrySchema
]);
var compactionConfigSchema = external_exports.object({
  /** Maximum file size in MB before triggering compaction */
  maxFileSizeMb: external_exports.number().positive().default(50),
  /** Maximum ratio of delete entries before triggering compaction */
  maxDeleteRatio: external_exports.number().min(0).max(1).default(0.3),
  /** Minimum number of entries before checking delete ratio */
  minEntriesForRatioCheck: external_exports.number().positive().default(100)
});

// src/core/jsonl-store.ts
import { promises as fs4 } from "node:fs";
import path5 from "node:path";
var DEFAULT_ENTRIES_PER_FILE = 500;
var JsonlStore = class {
  baseDir;
  filePrefix;
  entriesPerFile;
  entrySchema;
  entryToMemory;
  getEntryId;
  isDeleteEntry;
  isEmbeddingEntry;
  getEmbedding;
  compactionConfig;
  // In-memory state
  memories = null;
  embeddings = null;
  stats = null;
  currentFileNumber = 1;
  currentFileEntryCount = 0;
  loadPromise = null;
  constructor(options2) {
    this.baseDir = options2.baseDir;
    this.filePrefix = options2.filePrefix;
    this.entriesPerFile = options2.entriesPerFile ?? DEFAULT_ENTRIES_PER_FILE;
    this.entrySchema = options2.entrySchema;
    this.entryToMemory = options2.entryToMemory;
    this.getEntryId = options2.getEntryId;
    this.isDeleteEntry = options2.isDeleteEntry;
    this.isEmbeddingEntry = options2.isEmbeddingEntry;
    this.getEmbedding = options2.getEmbedding;
    this.compactionConfig = compactionConfigSchema.parse(options2.compactionConfig ?? {});
  }
  /**
   * Get the file path for a given file number
   */
  getFilePathForNumber(fileNumber) {
    const paddedNumber = String(fileNumber).padStart(6, "0");
    return path5.join(this.baseDir, `${this.filePrefix}-${paddedNumber}.jsonl`);
  }
  /**
   * Get all JSONL files for this store, sorted by number
   */
  async getExistingFiles() {
    try {
      const files = await fs4.readdir(this.baseDir);
      const pattern = new RegExp(`^${this.filePrefix}-(\\d{6})\\.jsonl$`);
      return files.filter((f) => pattern.test(f)).sort((a, b) => {
        const numA = parseInt(a.match(pattern)[1], 10);
        const numB = parseInt(b.match(pattern)[1], 10);
        return numA - numB;
      }).map((f) => path5.join(this.baseDir, f));
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }
  /**
   * Count entries in a single file
   */
  async countEntriesInFile(filePath) {
    try {
      const content = await fs4.readFile(filePath, "utf-8");
      return content.split("\n").filter((line) => line.trim()).length;
    } catch {
      return 0;
    }
  }
  /**
   * Load all JSONL files and replay entries to build state
   *
   * Uses a promise guard to prevent race conditions when multiple
   * concurrent calls attempt to load before completion.
   */
  async load() {
    if (this.memories !== null) {
      return;
    }
    if (this.loadPromise !== null) {
      return this.loadPromise;
    }
    this.loadPromise = this.doLoad();
    try {
      await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }
  /**
   * Internal load implementation - actually performs the file loading
   */
  async doLoad() {
    const memories = /* @__PURE__ */ new Map();
    const embeddings = /* @__PURE__ */ new Map();
    const stats = {
      totalEntries: 0,
      addEntries: 0,
      deleteEntries: 0,
      embeddingEntries: 0,
      activeMemories: 0,
      memoriesWithEmbeddings: 0,
      totalFileSizeBytes: 0,
      fileCount: 0,
      currentFileEntries: 0
    };
    const files = await this.getExistingFiles();
    stats.fileCount = files.length;
    for (const filePath of files) {
      try {
        const content = await fs4.readFile(filePath, "utf-8");
        stats.totalFileSizeBytes += Buffer.byteLength(content, "utf-8");
        const lines = content.split("\n").filter((line) => line.trim());
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          try {
            const parsed = JSON.parse(line);
            const entry = this.entrySchema.parse(parsed);
            this.applyEntryToMaps(entry, memories, embeddings, stats);
          } catch {
            if (i === lines.length - 1) {
              logger.memory.warn(`Truncated last line in ${filePath}, skipping`);
            } else {
              logger.memory.warn(`Invalid JSONL entry in ${filePath} line ${i + 1}, skipping`);
            }
          }
        }
      } catch (error) {
        if (error.code !== "ENOENT") {
          logger.memory.error(`Failed to load JSONL file ${filePath}: ${error}`);
          throw error;
        }
      }
    }
    let currentFileNumber = 1;
    let currentFileEntryCount = 0;
    if (files.length > 0) {
      const lastFile = files[files.length - 1];
      const match = lastFile.match(/-(\d{6})\.jsonl$/);
      currentFileNumber = match ? parseInt(match[1], 10) : 1;
      currentFileEntryCount = await this.countEntriesInFile(lastFile);
    }
    stats.activeMemories = memories.size;
    stats.memoriesWithEmbeddings = embeddings.size;
    stats.currentFileEntries = currentFileEntryCount;
    this.memories = memories;
    this.embeddings = embeddings;
    this.stats = stats;
    this.currentFileNumber = currentFileNumber;
    this.currentFileEntryCount = currentFileEntryCount;
    logger.memory.debug(
      `Loaded ${stats.fileCount} JSONL files: ${memories.size} memories, ${embeddings.size} embeddings`
    );
  }
  /**
   * Apply an entry to the provided maps (used during loading)
   */
  applyEntryToMaps(entry, memories, embeddings, stats) {
    const id = this.getEntryId(entry);
    if (this.isDeleteEntry(entry)) {
      memories.delete(id);
      embeddings.delete(id);
      stats.deleteEntries++;
    } else if (this.isEmbeddingEntry(entry)) {
      const embedding = this.getEmbedding(entry);
      if (embedding) {
        embeddings.set(id, embedding);
      }
      stats.embeddingEntries++;
    } else {
      const memory = this.entryToMemory(entry);
      if (memory) {
        memories.set(id, memory);
      }
      stats.addEntries++;
    }
    stats.totalEntries++;
  }
  /**
   * Apply an entry to the in-memory state
   */
  applyEntry(entry) {
    const id = this.getEntryId(entry);
    if (this.isDeleteEntry(entry)) {
      this.memories?.delete(id);
      this.embeddings?.delete(id);
      if (this.stats) this.stats.deleteEntries++;
    } else if (this.isEmbeddingEntry(entry)) {
      const embedding = this.getEmbedding(entry);
      if (embedding && this.embeddings) {
        this.embeddings.set(id, embedding);
      }
      if (this.stats) this.stats.embeddingEntries++;
    } else {
      const memory = this.entryToMemory(entry);
      if (memory && this.memories) {
        this.memories.set(id, memory);
      }
      if (this.stats) this.stats.addEntries++;
    }
  }
  /**
   * Append an entry to the current JSONL file
   * Creates a new file if current file has reached entry limit
   */
  async appendEntry(entry) {
    await this.load();
    await fs4.mkdir(this.baseDir, { recursive: true });
    if (this.currentFileEntryCount >= this.entriesPerFile) {
      this.currentFileNumber++;
      this.currentFileEntryCount = 0;
      if (this.stats) this.stats.fileCount++;
    }
    const filePath = this.getFilePathForNumber(this.currentFileNumber);
    const line = JSON.stringify(entry) + "\n";
    await fs4.appendFile(filePath, line, "utf-8");
    this.applyEntry(entry);
    this.currentFileEntryCount++;
    if (this.stats) {
      this.stats.totalEntries++;
      this.stats.totalFileSizeBytes += Buffer.byteLength(line, "utf-8");
      this.stats.activeMemories = this.memories?.size ?? 0;
      this.stats.memoriesWithEmbeddings = this.embeddings?.size ?? 0;
      this.stats.currentFileEntries = this.currentFileEntryCount;
    }
  }
  /**
   * Get a memory by ID
   */
  async getMemory(id) {
    await this.load();
    return this.memories?.get(id) ?? null;
  }
  /**
   * Get all memories
   */
  async listMemories() {
    await this.load();
    return Array.from(this.memories?.values() ?? []);
  }
  /**
   * Get the number of active memories
   */
  async count() {
    await this.load();
    return this.memories?.size ?? 0;
  }
  /**
   * Check if a memory exists
   */
  async has(id) {
    await this.load();
    return this.memories?.has(id) ?? false;
  }
  /**
   * Get embedding for a memory
   */
  async getEmbeddingForMemory(id) {
    await this.load();
    return this.embeddings?.get(id) ?? null;
  }
  /**
   * Get all embeddings
   */
  async getAllEmbeddings() {
    await this.load();
    return new Map(this.embeddings ?? []);
  }
  /**
   * Get memories that don't have embeddings
   */
  async getMemoriesWithoutEmbeddings() {
    await this.load();
    const result = [];
    if (this.memories && this.embeddings) {
      for (const [id, memory] of this.memories) {
        if (!this.embeddings.has(id)) {
          result.push(memory);
        }
      }
    }
    return result;
  }
  /**
   * Get current statistics
   */
  async getStats() {
    await this.load();
    return { ...this.stats };
  }
  /**
   * Check if compaction is needed
   */
  async needsCompaction() {
    await this.load();
    if (!this.stats) {
      return { needsCompaction: false };
    }
    const fileSizeMb = this.stats.totalFileSizeBytes / (1024 * 1024);
    if (fileSizeMb > this.compactionConfig.maxFileSizeMb) {
      return {
        needsCompaction: true,
        reason: "file_size",
        fileSizeMb
      };
    }
    if (this.stats.totalEntries >= this.compactionConfig.minEntriesForRatioCheck) {
      const deleteRatio = this.stats.deleteEntries / this.stats.totalEntries;
      if (deleteRatio > this.compactionConfig.maxDeleteRatio) {
        return {
          needsCompaction: true,
          reason: "delete_ratio",
          deleteRatio,
          totalEntries: this.stats.totalEntries
        };
      }
    }
    return { needsCompaction: false };
  }
  /**
   * Compact by rewriting only current state across multiple files
   *
   * @param createAddEntry - Function to create an add entry from a memory
   * @param createEmbeddingEntry - Function to create an embedding entry
   */
  async compact(createAddEntry, createEmbeddingEntry) {
    await this.load();
    const originalLines = this.stats?.totalEntries ?? 0;
    const existingFiles = await this.getExistingFiles();
    if (!this.memories || this.memories.size === 0) {
      for (const file of existingFiles) {
        try {
          await fs4.unlink(file);
        } catch {
        }
      }
      this.clearCache();
      return { originalLines, newLines: 0 };
    }
    const backupPaths = [];
    const backupSuffix = `.backup-${Date.now()}`;
    for (const file of existingFiles) {
      const backupPath = file + backupSuffix;
      try {
        await fs4.copyFile(file, backupPath);
        backupPaths.push(backupPath);
      } catch {
      }
    }
    try {
      const allEntries = [];
      for (const [id, memory] of this.memories) {
        const addEntry = createAddEntry(memory);
        allEntries.push(JSON.stringify(addEntry));
        const embedding = this.embeddings?.get(id);
        if (embedding) {
          const embeddingEntry = createEmbeddingEntry(id, embedding);
          allEntries.push(JSON.stringify(embeddingEntry));
        }
      }
      const newFileCount = Math.ceil(allEntries.length / this.entriesPerFile);
      const tempFiles = [];
      for (let fileNum = 1; fileNum <= newFileCount; fileNum++) {
        const startIdx = (fileNum - 1) * this.entriesPerFile;
        const endIdx = Math.min(startIdx + this.entriesPerFile, allEntries.length);
        const fileEntries = allEntries.slice(startIdx, endIdx);
        const tempPath = this.getFilePathForNumber(fileNum) + ".compact.tmp";
        await fs4.writeFile(tempPath, fileEntries.join("\n") + "\n", "utf-8");
        tempFiles.push(tempPath);
      }
      for (const file of existingFiles) {
        try {
          await fs4.unlink(file);
        } catch {
        }
      }
      for (let i = 0; i < tempFiles.length; i++) {
        const tempPath = tempFiles[i];
        const finalPath = this.getFilePathForNumber(i + 1);
        await fs4.rename(tempPath, finalPath);
      }
      this.clearCache();
      for (const backupPath of backupPaths) {
        try {
          await fs4.unlink(backupPath);
        } catch {
        }
      }
      logger.memory.info(
        `Compacted JSONL: ${originalLines} \u2192 ${allEntries.length} entries across ${newFileCount} files`
      );
      return { originalLines, newLines: allEntries.length };
    } catch (error) {
      for (const backupPath of backupPaths) {
        const originalPath = backupPath.replace(backupSuffix, "");
        try {
          await fs4.copyFile(backupPath, originalPath);
          await fs4.unlink(backupPath);
        } catch {
        }
      }
      throw error;
    }
  }
  /**
   * Clear the in-memory cache (forces reload on next access)
   */
  clearCache() {
    this.memories = null;
    this.embeddings = null;
    this.stats = null;
    this.currentFileNumber = 1;
    this.currentFileEntryCount = 0;
    this.loadPromise = null;
  }
  /**
   * Get the base directory
   */
  getBaseDir() {
    return this.baseDir;
  }
  /**
   * Get the file prefix
   */
  getFilePrefix() {
    return this.filePrefix;
  }
  /**
   * Get the current file path (for backwards compatibility)
   */
  getFilePath() {
    return this.getFilePathForNumber(this.currentFileNumber);
  }
};

// src/core/episodic-jsonl-store.ts
var EPISODIC_FILE_PREFIX = "episodic";
var EPISODIC_SUBDIR = "episodic-memory";
function computeContentHash(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}
function entryToMemory(entry) {
  if (entry.action !== "add") {
    return null;
  }
  return {
    id: entry.id,
    subject: entry.subject,
    keywords: entry.keywords,
    applies_to: entry.applies_to,
    occurred_at: entry.occurred_at,
    content_hash: entry.content_hash,
    content: entry.content
  };
}
var EpisodicJsonlStore = class {
  store;
  baseDir;
  storeDir;
  constructor(options2 = {}) {
    const config = getConfig();
    this.baseDir = options2.baseDir ?? config.memoryDir;
    this.storeDir = path6.join(this.baseDir, EPISODIC_SUBDIR);
    this.store = new JsonlStore({
      baseDir: this.storeDir,
      filePrefix: EPISODIC_FILE_PREFIX,
      entrySchema: episodicEntrySchema,
      entryToMemory,
      getEntryId: (entry) => entry.id,
      isDeleteEntry: (entry) => entry.action === "delete",
      isEmbeddingEntry: (entry) => entry.action === "embedding",
      getEmbedding: (entry) => entry.action === "embedding" ? entry.embedding : null
    });
  }
  /**
   * Initialize the store (loads existing data)
   */
  async initialize() {
    await this.store.load();
  }
  /**
   * Create a new memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input) {
    logger.memory.debug(`Creating episodic memory: "${input.subject}"`);
    const validated = createMemoryInputSchema.parse(input);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const occurredAt = validated.occurred_at ?? now;
    const contentHash = computeContentHash(validated.content);
    const existing = await this.findDuplicate(occurredAt, contentHash);
    if (existing) {
      logger.memory.info(`Duplicate memory found (${existing.id}), skipping creation`);
      return existing;
    }
    const id = v4_default();
    const memory = {
      id,
      subject: validated.subject,
      keywords: validated.keywords,
      applies_to: validated.applies_to,
      occurred_at: occurredAt,
      content_hash: contentHash,
      content: validated.content
    };
    const entry = {
      action: "add",
      id: memory.id,
      subject: memory.subject,
      keywords: memory.keywords,
      applies_to: memory.applies_to,
      occurred_at: memory.occurred_at,
      content_hash: memory.content_hash,
      content: memory.content,
      timestamp: now
    };
    await this.store.appendEntry(entry);
    logger.memory.info(`Created episodic memory ${id}: "${memory.subject}"`);
    return memory;
  }
  /**
   * Get a memory by ID
   */
  async getMemory(id) {
    return this.store.getMemory(id);
  }
  /**
   * Delete a memory by ID
   */
  async deleteMemory(id) {
    const exists = await this.store.has(id);
    if (!exists) {
      return false;
    }
    const entry = {
      action: "delete",
      id,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.store.appendEntry(entry);
    logger.memory.info(`Deleted episodic memory ${id}`);
    return true;
  }
  /**
   * List all memories with optional filtering
   */
  async listMemories(filter) {
    let memories = await this.store.listMemories();
    if (filter?.scope) {
      memories = memories.filter((m) => m.applies_to === filter.scope);
    }
    if (filter?.keyword) {
      memories = memories.filter((m) => m.keywords.includes(filter.keyword));
    }
    memories.sort(
      (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
    );
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? memories.length;
    return memories.slice(offset, offset + limit);
  }
  /**
   * Find a duplicate memory by occurred_at and content_hash
   */
  async findDuplicate(occurredAt, contentHash) {
    const memories = await this.store.listMemories();
    return memories.find(
      (m) => m.occurred_at === occurredAt && m.content_hash === contentHash
    ) ?? null;
  }
  /**
   * Store an embedding for a memory
   */
  async storeEmbedding(id, embedding) {
    const exists = await this.store.has(id);
    if (!exists) {
      logger.memory.warn(`Cannot store embedding: memory ${id} not found`);
      return;
    }
    const entry = {
      action: "embedding",
      id,
      embedding,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.store.appendEntry(entry);
    logger.memory.debug(`Stored embedding for memory ${id}`);
  }
  /**
   * Get embedding for a memory
   */
  async getEmbedding(id) {
    return this.store.getEmbeddingForMemory(id);
  }
  /**
   * Get all embeddings
   */
  async getAllEmbeddings() {
    return this.store.getAllEmbeddings();
  }
  /**
   * Get memories that don't have embeddings yet
   */
  async getMemoriesNeedingEmbeddings() {
    return this.store.getMemoriesWithoutEmbeddings();
  }
  /**
   * Get the number of active memories
   */
  async count() {
    return this.store.count();
  }
  /**
   * Check if compaction is needed
   */
  async needsCompaction() {
    const status = await this.store.needsCompaction();
    return status.needsCompaction;
  }
  /**
   * Compact the JSONL file
   */
  async compact() {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return this.store.compact(
      // Create add entry from memory
      (memory) => ({
        action: "add",
        id: memory.id,
        subject: memory.subject,
        keywords: memory.keywords,
        applies_to: memory.applies_to,
        occurred_at: memory.occurred_at,
        content_hash: memory.content_hash,
        content: memory.content,
        timestamp: now
      }),
      // Create embedding entry
      (id, embedding) => ({
        action: "embedding",
        id,
        embedding,
        timestamp: now
      })
    );
  }
  /**
   * Clear the in-memory cache
   */
  clearCache() {
    this.store.clearCache();
  }
  /**
   * Get the base directory
   */
  getBaseDir() {
    return this.baseDir;
  }
  /**
   * Get the JSONL file path
   */
  getFilePath() {
    return this.store.getFilePath();
  }
};

// src/core/memory.ts
var MemoryManager = class {
  _baseDir;
  store;
  constructor(baseDir) {
    const config = getConfig();
    this._baseDir = baseDir ?? config.memoryDir;
    this.store = new EpisodicJsonlStore({ baseDir: this._baseDir });
  }
  /**
   * Get the base directory used by this manager
   */
  get baseDir() {
    return this._baseDir;
  }
  /**
   * Initialize the manager (ensures directory and gitignore exist)
   */
  async initialize() {
    await ensureGitignore(this._baseDir);
    await this.store.initialize();
  }
  /**
   * Check if a memory with the same occurred_at and content_hash already exists
   */
  async findDuplicate(occurredAt, contentHash) {
    return this.store.findDuplicate(occurredAt, contentHash);
  }
  /**
   * Create a new memory (idempotent - returns existing if duplicate)
   */
  async createMemory(input) {
    const memory = await this.store.createMemory(input);
    try {
      const vectorStore = getVectorStore({ baseDir: this._baseDir });
      await vectorStore.add(memory);
    } catch (error) {
      logger.memory.warn(`Failed to add memory to vector store: ${error}`);
    }
    return memory;
  }
  /**
   * Get a memory by ID
   */
  async getMemory(id) {
    return this.store.getMemory(id);
  }
  /**
   * List all memories with optional filtering
   */
  async listMemories(filter) {
    return this.store.listMemories(filter);
  }
  /**
   * Delete a memory by ID
   */
  async deleteMemory(id) {
    const deleted = await this.store.deleteMemory(id);
    if (deleted) {
      try {
        const vectorStore = getVectorStore({ baseDir: this._baseDir });
        await vectorStore.remove(id);
      } catch (error) {
        logger.memory.warn(`Failed to remove memory from vector store: ${error}`);
      }
    }
    return deleted;
  }
  /**
   * Store an embedding for a memory in the JSONL file
   */
  async storeEmbedding(id, embedding) {
    await this.store.storeEmbedding(id, embedding);
  }
  /**
   * Get embedding for a memory from the JSONL file
   */
  async getEmbedding(id) {
    return this.store.getEmbedding(id);
  }
  /**
   * Get all embeddings from the JSONL file
   */
  async getAllEmbeddings() {
    return this.store.getAllEmbeddings();
  }
  /**
   * Get memories that don't have embeddings yet
   */
  async getMemoriesNeedingEmbeddings() {
    return this.store.getMemoriesNeedingEmbeddings();
  }
  /**
   * Get the number of active memories
   */
  async count() {
    return this.store.count();
  }
  /**
   * Check if compaction is needed
   */
  async needsCompaction() {
    return this.store.needsCompaction();
  }
  /**
   * Compact the JSONL file
   */
  async compact() {
    return this.store.compact();
  }
  /**
   * Clear the in-memory cache (forces reload on next access)
   */
  clearCache() {
    this.store.clearCache();
  }
  /**
   * Get the JSONL file path
   */
  getFilePath() {
    return this.store.getFilePath();
  }
};

// src/utils/markdown.ts
var import_gray_matter = __toESM(require_gray_matter(), 1);
var STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "here",
  "there",
  "then",
  "once",
  "if",
  "else",
  "because",
  "while",
  "although",
  "though",
  "after",
  "before",
  "above",
  "below",
  "between",
  "into",
  "through",
  "during",
  "about",
  "against",
  "without",
  "within",
  "along",
  "following",
  "across",
  "behind",
  "beyond",
  "plus",
  "except",
  "up",
  "out",
  "around",
  "down",
  "off",
  "over",
  "under",
  "again",
  "further",
  "any",
  "our",
  "your",
  "my",
  "his",
  "her",
  "their",
  "me",
  "him",
  "us",
  "them",
  "myself",
  "yourself",
  "himself",
  "herself",
  "itself",
  "ourselves",
  "themselves",
  "being",
  "having",
  "doing",
  "get",
  "got",
  "getting",
  "let",
  "lets",
  "make",
  "made",
  "making",
  "take",
  "took",
  "taking",
  "come",
  "came",
  "coming",
  "go",
  "went",
  "going",
  "see",
  "saw",
  "seeing",
  "know",
  "knew",
  "knowing",
  "think",
  "thought",
  "thinking",
  "say",
  "said",
  "saying",
  "tell",
  "told",
  "telling",
  "ask",
  "asked",
  "asking",
  "use",
  "using",
  "try",
  "tried",
  "trying",
  "want",
  "wanted",
  "wanting",
  "look",
  "looked",
  "looking",
  "give",
  "gave",
  "giving",
  "keep",
  "kept",
  "keeping",
  "put",
  "putting"
]);
function extractKeywordsFromText(text, options2 = {}) {
  const maxKeywords = options2.maxKeywords ?? 10;
  const minLength = options2.minLength ?? 3;
  const additionalStops = new Set(
    (options2.additionalStopWords ?? []).map((w) => w.toLowerCase())
  );
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(
    (word) => word.length >= minLength && !STOP_WORDS.has(word) && !additionalStops.has(word) && !/^\d+$/.test(word)
    // Exclude pure numbers
  );
  const frequency = /* @__PURE__ */ new Map();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }
  return [...frequency.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxKeywords).map(([word]) => word);
}

// src/utils/transcript.ts
function extractTextFromBlocks(blocks) {
  return blocks.filter((block) => block.type === "text").map((block) => block.text).join("\n");
}
function extractThinkingFromBlocks(blocks) {
  return blocks.filter((block) => block.type === "thinking").map((block) => block.thinking).join("\n");
}
function generateSubject(content, maxLength = 200) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  const newlineIndex = trimmed.indexOf("\n");
  let subject;
  if (newlineIndex !== -1) {
    subject = trimmed.substring(0, newlineIndex).trim();
  } else {
    const periodIndex = trimmed.indexOf(".");
    subject = periodIndex !== -1 ? trimmed.substring(0, periodIndex) : trimmed;
  }
  if (subject.length <= maxLength) {
    return subject;
  }
  return subject.substring(0, maxLength - 3) + "...";
}
function detectScope(content) {
  const fileMatch = content.match(/(?:in|file|at)\s+[`"']?([^`"'\s]+\.[a-z]{1,4})[`"']?/i);
  if (fileMatch?.[1] && !fileMatch[1].includes("*")) {
    return `file:${fileMatch[1]}`;
  }
  const areaPatterns = [
    /(?:in|for)\s+the\s+(\w+)\s+(?:component|module|service|area|section)/i,
    /(?:the\s+)?(\w+)\s+(?:system|subsystem|layer)/i
  ];
  for (const pattern of areaPatterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return `area:${match[1].toLowerCase()}`;
    }
  }
  return "global";
}
function analyzeForMemories(messages) {
  const memories = [];
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    if (message.thinking?.trim()) {
      memories.push({
        subject: generateSubject(message.thinking),
        keywords: extractKeywordsFromText(message.thinking, { maxKeywords: 5, minLength: 3 }),
        applies_to: detectScope(message.thinking),
        content: message.thinking,
        occurred_at: message.timestamp
      });
    }
    if (message.content.trim()) {
      const lines = message.content.trim().split("\n").filter((line) => line.trim());
      if (lines.length >= 2) {
        memories.push({
          subject: generateSubject(message.content),
          keywords: extractKeywordsFromText(message.content, { maxKeywords: 5, minLength: 3 }),
          applies_to: detectScope(message.content),
          content: message.content,
          occurred_at: message.timestamp
        });
      }
    }
  }
  return memories;
}
function parseTranscriptForMemories(rawContent) {
  const lines = rawContent.split("\n").filter((line) => line.trim());
  const messages = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.type !== "user" && entry.type !== "assistant") {
        continue;
      }
      const role = entry.type;
      const timestamp = entry.timestamp ?? (/* @__PURE__ */ new Date()).toISOString();
      const rawContent2 = entry.message?.content;
      let content = "";
      let thinking;
      if (typeof rawContent2 === "string") {
        content = rawContent2;
      } else if (Array.isArray(rawContent2)) {
        content = extractTextFromBlocks(rawContent2);
        thinking = extractThinkingFromBlocks(rawContent2) || void 0;
      } else {
        continue;
      }
      messages.push({ role, content, thinking, timestamp });
    } catch {
    }
  }
  return analyzeForMemories(messages);
}
var STDIN_TIMEOUT_MS = 1e4;
async function readStdin(timeoutMs = STDIN_TIMEOUT_MS) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    if (process.stdin.readableEnded) {
      resolve("");
      return;
    }
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for stdin"));
    }, timeoutMs);
    function cleanup() {
      process.stdin.off("data", onData);
      process.stdin.off("end", onEnd);
      process.stdin.off("error", onError);
      clearTimeout(timeout);
    }
    function onData(chunk) {
      chunks.push(chunk);
    }
    function onEnd() {
      cleanup();
      resolve(Buffer.concat(chunks).toString("utf-8"));
    }
    function onError(err) {
      cleanup();
      reject(err);
    }
    process.stdin.on("data", onData);
    process.stdin.on("end", onEnd);
    process.stdin.on("error", onError);
  });
}

// src/hooks/stop.ts
async function main() {
  try {
    logger.hooks.info("Stop hook fired");
    const inputRaw = await readStdin();
    if (!inputRaw.trim()) {
      logger.hooks.warn("Stop hook: No stdin input received, exiting");
      process.exit(0);
    }
    let input;
    try {
      input = JSON.parse(inputRaw);
      logger.hooks.info(`Stop hook input received: ${JSON.stringify(input, null, 2)}`);
    } catch {
      logger.hooks.error(`Stop hook: Failed to parse stdin input: ${inputRaw}`);
      process.exit(0);
    }
    const projectDir = input.cwd ?? process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
    logger.hooks.debug(`Stop hook: Using project directory: ${projectDir}`);
    process.env["LOCAL_RECALL_DIR"] = `${projectDir}/local-recall`;
    await loadConfig();
    logger.hooks.debug("Stop hook: Configuration loaded");
    if (!input.transcript_path) {
      logger.hooks.warn("Stop hook: No transcript_path provided");
      console.error("No transcript_path provided");
      process.exit(0);
    }
    logger.hooks.debug(`Stop hook: Reading transcript from ${input.transcript_path}`);
    let transcriptContent;
    try {
      transcriptContent = await fs5.readFile(input.transcript_path, "utf-8");
    } catch (error) {
      logger.hooks.error(`Stop hook: Could not read transcript file: ${String(error)}`);
      console.error("Could not read transcript file:", error);
      process.exit(0);
    }
    logger.hooks.debug("Stop hook: Parsing transcript for memories");
    const suggestedMemories = parseTranscriptForMemories(transcriptContent);
    if (suggestedMemories.length === 0) {
      logger.hooks.info("Stop hook completed: No memory-worthy content found");
      process.exit(0);
    }
    logger.hooks.info(`Stop hook: Found ${suggestedMemories.length} potential memories`);
    const memoryManager = new MemoryManager();
    const created = [];
    for (const memoryData of suggestedMemories) {
      try {
        logger.hooks.debug(`Stop hook: Creating memory "${memoryData.subject}"`);
        const memory = await memoryManager.createMemory({
          subject: memoryData.subject,
          keywords: memoryData.keywords,
          applies_to: memoryData.applies_to,
          content: memoryData.content,
          occurred_at: memoryData.occurred_at
        });
        created.push(memory.id);
        logger.hooks.debug(`Stop hook: Created memory ${memory.id}`);
      } catch (error) {
        logger.hooks.error(`Stop hook: Failed to create memory: ${String(error)}`);
        console.error("Failed to create memory:", String(error));
      }
    }
    if (created.length > 0) {
      logger.hooks.info(`Stop hook completed: Created ${created.length} new memories`);
      console.error(`Local Recall: Created ${created.length} new memories`);
    } else {
      logger.hooks.info("Stop hook completed: No memories created");
    }
    process.exit(0);
  } catch (error) {
    logger.hooks.error(`Stop hook error: ${String(error)}`);
    console.error("Local Recall stop hook error:", error);
    process.exit(0);
  }
}
main();
/*! Bundled license information:

is-extendable/index.js:
  (*!
   * is-extendable <https://github.com/jonschlinkert/is-extendable>
   *
   * Copyright (c) 2015, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

strip-bom-string/index.js:
  (*!
   * strip-bom-string <https://github.com/jonschlinkert/strip-bom-string>
   *
   * Copyright (c) 2015, 2017, Jon Schlinkert.
   * Released under the MIT License.
   *)
*/
