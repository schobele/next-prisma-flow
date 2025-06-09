#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@prisma/generator-helper/dist/chunk-EOPVK4AE.js
var require_chunk_EOPVK4AE = __commonJS((exports, module) => {
  var __create2 = Object.create;
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __getProtoOf2 = Object.getPrototypeOf;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target, mod));
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_EOPVK4AE_exports = {};
  __export(chunk_EOPVK4AE_exports, {
    LineStream: () => LineStream,
    byline: () => byline,
    createLineStream: () => createLineStream,
    createStream: () => createStream
  });
  module.exports = __toCommonJS(chunk_EOPVK4AE_exports);
  var import_stream = __toESM2(__require("stream"));
  var import_util = __toESM2(__require("util"));
  function byline(readStream, options) {
    return createStream(readStream, options);
  }
  function createStream(readStream, options) {
    if (readStream) {
      return createLineStream(readStream, options);
    } else {
      return new LineStream(options);
    }
  }
  function createLineStream(readStream, options) {
    if (!readStream) {
      throw new Error("expected readStream");
    }
    if (!readStream.readable) {
      throw new Error("readStream must be readable");
    }
    const ls = new LineStream(options);
    readStream.pipe(ls);
    return ls;
  }
  function LineStream(options) {
    import_stream.default.Transform.call(this, options);
    options = options || {};
    this._readableState.objectMode = true;
    this._lineBuffer = [];
    this._keepEmptyLines = options.keepEmptyLines || false;
    this._lastChunkEndedWithCR = false;
    this.on("pipe", function(src) {
      if (!this.encoding) {
        if (src instanceof import_stream.default.Readable) {
          this.encoding = src._readableState.encoding;
        }
      }
    });
  }
  import_util.default.inherits(LineStream, import_stream.default.Transform);
  LineStream.prototype._transform = function(chunk, encoding, done) {
    encoding = encoding || "utf8";
    if (Buffer.isBuffer(chunk)) {
      if (encoding == "buffer") {
        chunk = chunk.toString();
        encoding = "utf8";
      } else {
        chunk = chunk.toString(encoding);
      }
    }
    this._chunkEncoding = encoding;
    const lines = chunk.split(/\r\n|\r|\n/g);
    if (this._lastChunkEndedWithCR && chunk[0] == `
`) {
      lines.shift();
    }
    if (this._lineBuffer.length > 0) {
      this._lineBuffer[this._lineBuffer.length - 1] += lines[0];
      lines.shift();
    }
    this._lastChunkEndedWithCR = chunk[chunk.length - 1] == "\r";
    this._lineBuffer = this._lineBuffer.concat(lines);
    this._pushBuffer(encoding, 1, done);
  };
  LineStream.prototype._pushBuffer = function(encoding, keep, done) {
    while (this._lineBuffer.length > keep) {
      const line = this._lineBuffer.shift();
      if (this._keepEmptyLines || line.length > 0) {
        if (!this.push(this._reencode(line, encoding))) {
          const self = this;
          setImmediate(function() {
            self._pushBuffer(encoding, keep, done);
          });
          return;
        }
      }
    }
    done();
  };
  LineStream.prototype._flush = function(done) {
    this._pushBuffer(this._chunkEncoding, 0, done);
  };
  LineStream.prototype._reencode = function(line, chunkEncoding) {
    if (this.encoding && this.encoding != chunkEncoding) {
      return Buffer.from(line, chunkEncoding).toString(this.encoding);
    } else if (this.encoding) {
      return line;
    } else {
      return Buffer.from(line, chunkEncoding);
    }
  };
});

// node_modules/@prisma/generator-helper/dist/chunk-KEYE2GFS.js
var require_chunk_KEYE2GFS = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_KEYE2GFS_exports = {};
  __export(chunk_KEYE2GFS_exports, {
    isErrorResponse: () => isErrorResponse
  });
  module.exports = __toCommonJS(chunk_KEYE2GFS_exports);
  function isErrorResponse(response) {
    return response.error !== undefined;
  }
});

// node_modules/@prisma/generator-helper/dist/chunk-QGM4M3NI.js
var require_chunk_QGM4M3NI = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_QGM4M3NI_exports = {};
  __export(chunk_QGM4M3NI_exports, {
    __commonJS: () => __commonJS2,
    __require: () => __require2,
    __toESM: () => __toESM2
  });
  module.exports = __toCommonJS(chunk_QGM4M3NI_exports);
  var __create2 = Object.create;
  var __defProp22 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames22 = Object.getOwnPropertyNames;
  var __getProtoOf2 = Object.getPrototypeOf;
  var __hasOwnProp22 = Object.prototype.hasOwnProperty;
  var __require2 = /* @__PURE__ */ ((x) => __require)(function(x) {
    if (true)
      return __require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS2 = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames22(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps2 = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames22(from))
        if (!__hasOwnProp22.call(to, key) && key !== except)
          __defProp22(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp22(target, "default", { value: mod, enumerable: true }) : target, mod));
});

// node_modules/@prisma/debug/dist/index.js
var require_dist = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    Debug: () => Debug,
    clearLogs: () => clearLogs,
    default: () => index_default,
    getLogs: () => getLogs
  });
  module.exports = __toCommonJS(index_exports);
  var colors_exports = {};
  __export(colors_exports, {
    $: () => $,
    bgBlack: () => bgBlack,
    bgBlue: () => bgBlue,
    bgCyan: () => bgCyan,
    bgGreen: () => bgGreen,
    bgMagenta: () => bgMagenta,
    bgRed: () => bgRed,
    bgWhite: () => bgWhite,
    bgYellow: () => bgYellow,
    black: () => black,
    blue: () => blue,
    bold: () => bold,
    cyan: () => cyan,
    dim: () => dim,
    gray: () => gray,
    green: () => green,
    grey: () => grey,
    hidden: () => hidden,
    inverse: () => inverse,
    italic: () => italic,
    magenta: () => magenta,
    red: () => red,
    reset: () => reset,
    strikethrough: () => strikethrough,
    underline: () => underline,
    white: () => white,
    yellow: () => yellow
  });
  var FORCE_COLOR;
  var NODE_DISABLE_COLORS;
  var NO_COLOR;
  var TERM;
  var isTTY = true;
  if (typeof process !== "undefined") {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
  }
  var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
  };
  function init(x, y) {
    let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
    let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
    return function(txt) {
      if (!$.enabled || txt == null)
        return txt;
      return open + (~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
    };
  }
  var reset = init(0, 0);
  var bold = init(1, 22);
  var dim = init(2, 22);
  var italic = init(3, 23);
  var underline = init(4, 24);
  var inverse = init(7, 27);
  var hidden = init(8, 28);
  var strikethrough = init(9, 29);
  var black = init(30, 39);
  var red = init(31, 39);
  var green = init(32, 39);
  var yellow = init(33, 39);
  var blue = init(34, 39);
  var magenta = init(35, 39);
  var cyan = init(36, 39);
  var white = init(37, 39);
  var gray = init(90, 39);
  var grey = init(90, 39);
  var bgBlack = init(40, 49);
  var bgRed = init(41, 49);
  var bgGreen = init(42, 49);
  var bgYellow = init(43, 49);
  var bgBlue = init(44, 49);
  var bgMagenta = init(45, 49);
  var bgCyan = init(46, 49);
  var bgWhite = init(47, 49);
  var MAX_ARGS_HISTORY = 100;
  var COLORS = ["green", "yellow", "blue", "magenta", "cyan", "red"];
  var argsHistory = [];
  var lastTimestamp = Date.now();
  var lastColor = 0;
  var processEnv = typeof process !== "undefined" ? process.env : {};
  globalThis.DEBUG ??= processEnv.DEBUG ?? "";
  globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
  var topProps = {
    enable(namespace) {
      if (typeof namespace === "string") {
        globalThis.DEBUG = namespace;
      }
    },
    disable() {
      const prev = globalThis.DEBUG;
      globalThis.DEBUG = "";
      return prev;
    },
    enabled(namespace) {
      const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
        return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      });
      const isListened = listenedNamespaces.some((listenedNamespace) => {
        if (listenedNamespace === "" || listenedNamespace[0] === "-")
          return false;
        return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
      });
      const isExcluded = listenedNamespaces.some((listenedNamespace) => {
        if (listenedNamespace === "" || listenedNamespace[0] !== "-")
          return false;
        return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
      });
      return isListened && !isExcluded;
    },
    log: (...args) => {
      const [namespace, format, ...rest] = args;
      const logWithFormatting = console.warn ?? console.log;
      logWithFormatting(`${namespace} ${format}`, ...rest);
    },
    formatters: {}
  };
  function debugCreate(namespace) {
    const instanceProps = {
      color: COLORS[lastColor++ % COLORS.length],
      enabled: topProps.enabled(namespace),
      namespace,
      log: topProps.log,
      extend: () => {}
    };
    const debugCall = (...args) => {
      const { enabled, namespace: namespace2, color, log } = instanceProps;
      if (args.length !== 0) {
        argsHistory.push([namespace2, ...args]);
      }
      if (argsHistory.length > MAX_ARGS_HISTORY) {
        argsHistory.shift();
      }
      if (topProps.enabled(namespace2) || enabled) {
        const stringArgs = args.map((arg) => {
          if (typeof arg === "string") {
            return arg;
          }
          return safeStringify(arg);
        });
        const ms = `+${Date.now() - lastTimestamp}ms`;
        lastTimestamp = Date.now();
        if (globalThis.DEBUG_COLORS) {
          log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
        } else {
          log(namespace2, ...stringArgs, ms);
        }
      }
    };
    return new Proxy(debugCall, {
      get: (_, prop) => instanceProps[prop],
      set: (_, prop, value) => instanceProps[prop] = value
    });
  }
  var Debug = new Proxy(debugCreate, {
    get: (_, prop) => topProps[prop],
    set: (_, prop, value) => topProps[prop] = value
  });
  function safeStringify(value, indent = 2) {
    const cache = /* @__PURE__ */ new Set;
    return JSON.stringify(value, (key, value2) => {
      if (typeof value2 === "object" && value2 !== null) {
        if (cache.has(value2)) {
          return `[Circular *]`;
        }
        cache.add(value2);
      } else if (typeof value2 === "bigint") {
        return value2.toString();
      }
      return value2;
    }, indent);
  }
  function getLogs(numChars = 7500) {
    const logs = argsHistory.map(([namespace, ...args]) => {
      return `${namespace} ${args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        } else {
          return JSON.stringify(arg);
        }
      }).join(" ")}`;
    }).join(`
`);
    if (logs.length < numChars) {
      return logs;
    }
    return logs.slice(-numChars);
  }
  function clearLogs() {
    argsHistory.length = 0;
  }
  var index_default = Debug;
});

// node_modules/@prisma/generator-helper/dist/chunk-MXZE5TCU.js
var require_chunk_MXZE5TCU = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_MXZE5TCU_exports = {};
  __export(chunk_MXZE5TCU_exports, {
    GeneratorError: () => GeneratorError,
    GeneratorProcess: () => GeneratorProcess
  });
  module.exports = __toCommonJS(chunk_MXZE5TCU_exports);
  var import_chunk_EOPVK4AE = require_chunk_EOPVK4AE();
  var import_chunk_KEYE2GFS = require_chunk_KEYE2GFS();
  var import_chunk_QGM4M3NI = require_chunk_QGM4M3NI();
  var import_node_child_process = __require("node:child_process");
  var import_debug = require_dist();
  var require_windows = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js"(exports2, module2) {
      module2.exports = isexe;
      isexe.sync = sync;
      var fs = (0, import_chunk_QGM4M3NI.__require)("fs");
      function checkPathExt(path, options) {
        var pathext = options.pathExt !== undefined ? options.pathExt : process.env.PATHEXT;
        if (!pathext) {
          return true;
        }
        pathext = pathext.split(";");
        if (pathext.indexOf("") !== -1) {
          return true;
        }
        for (var i = 0;i < pathext.length; i++) {
          var p = pathext[i].toLowerCase();
          if (p && path.substr(-p.length).toLowerCase() === p) {
            return true;
          }
        }
        return false;
      }
      function checkStat(stat, path, options) {
        if (!stat.isSymbolicLink() && !stat.isFile()) {
          return false;
        }
        return checkPathExt(path, options);
      }
      function isexe(path, options, cb) {
        fs.stat(path, function(er, stat) {
          cb(er, er ? false : checkStat(stat, path, options));
        });
      }
      function sync(path, options) {
        return checkStat(fs.statSync(path), path, options);
      }
    }
  });
  var require_mode = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js"(exports2, module2) {
      module2.exports = isexe;
      isexe.sync = sync;
      var fs = (0, import_chunk_QGM4M3NI.__require)("fs");
      function isexe(path, options, cb) {
        fs.stat(path, function(er, stat) {
          cb(er, er ? false : checkStat(stat, options));
        });
      }
      function sync(path, options) {
        return checkStat(fs.statSync(path), options);
      }
      function checkStat(stat, options) {
        return stat.isFile() && checkMode(stat, options);
      }
      function checkMode(stat, options) {
        var mod = stat.mode;
        var uid = stat.uid;
        var gid = stat.gid;
        var myUid = options.uid !== undefined ? options.uid : process.getuid && process.getuid();
        var myGid = options.gid !== undefined ? options.gid : process.getgid && process.getgid();
        var u = parseInt("100", 8);
        var g = parseInt("010", 8);
        var o = parseInt("001", 8);
        var ug = u | g;
        var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
        return ret;
      }
    }
  });
  var require_isexe = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js"(exports2, module2) {
      var fs = (0, import_chunk_QGM4M3NI.__require)("fs");
      var core;
      if (process.platform === "win32" || global.TESTING_WINDOWS) {
        core = require_windows();
      } else {
        core = require_mode();
      }
      module2.exports = isexe;
      isexe.sync = sync;
      function isexe(path, options, cb) {
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (!cb) {
          if (typeof Promise !== "function") {
            throw new TypeError("callback not provided");
          }
          return new Promise(function(resolve, reject) {
            isexe(path, options || {}, function(er, is) {
              if (er) {
                reject(er);
              } else {
                resolve(is);
              }
            });
          });
        }
        core(path, options || {}, function(er, is) {
          if (er) {
            if (er.code === "EACCES" || options && options.ignoreErrors) {
              er = null;
              is = false;
            }
          }
          cb(er, is);
        });
      }
      function sync(path, options) {
        try {
          return core.sync(path, options || {});
        } catch (er) {
          if (options && options.ignoreErrors || er.code === "EACCES") {
            return false;
          } else {
            throw er;
          }
        }
      }
    }
  });
  var require_which = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/which@2.0.2/node_modules/which/which.js"(exports2, module2) {
      var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
      var path = (0, import_chunk_QGM4M3NI.__require)("path");
      var COLON = isWindows ? ";" : ":";
      var isexe = require_isexe();
      var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
      var getPathInfo = (cmd, opt) => {
        const colon = opt.colon || COLON;
        const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
          ...isWindows ? [process.cwd()] : [],
          ...(opt.path || process.env.PATH || "").split(colon)
        ];
        const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
        const pathExt = isWindows ? pathExtExe.split(colon) : [""];
        if (isWindows) {
          if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
            pathExt.unshift("");
        }
        return {
          pathEnv,
          pathExt,
          pathExtExe
        };
      };
      var which = (cmd, opt, cb) => {
        if (typeof opt === "function") {
          cb = opt;
          opt = {};
        }
        if (!opt)
          opt = {};
        const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
        const found = [];
        const step = (i) => new Promise((resolve, reject) => {
          if (i === pathEnv.length)
            return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
          const ppRaw = pathEnv[i];
          const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
          const pCmd = path.join(pathPart, cmd);
          const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
          resolve(subStep(p, i, 0));
        });
        const subStep = (p, i, ii) => new Promise((resolve, reject) => {
          if (ii === pathExt.length)
            return resolve(step(i + 1));
          const ext = pathExt[ii];
          isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
            if (!er && is) {
              if (opt.all)
                found.push(p + ext);
              else
                return resolve(p + ext);
            }
            return resolve(subStep(p, i, ii + 1));
          });
        });
        return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
      };
      var whichSync = (cmd, opt) => {
        opt = opt || {};
        const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
        const found = [];
        for (let i = 0;i < pathEnv.length; i++) {
          const ppRaw = pathEnv[i];
          const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
          const pCmd = path.join(pathPart, cmd);
          const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
          for (let j = 0;j < pathExt.length; j++) {
            const cur = p + pathExt[j];
            try {
              const is = isexe.sync(cur, { pathExt: pathExtExe });
              if (is) {
                if (opt.all)
                  found.push(cur);
                else
                  return cur;
              }
            } catch (ex) {}
          }
        }
        if (opt.all && found.length)
          return found;
        if (opt.nothrow)
          return null;
        throw getNotFoundError(cmd);
      };
      module2.exports = which;
      which.sync = whichSync;
    }
  });
  var require_path_key = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js"(exports2, module2) {
      var pathKey = (options = {}) => {
        const environment = options.env || process.env;
        const platform = options.platform || process.platform;
        if (platform !== "win32") {
          return "PATH";
        }
        return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
      };
      module2.exports = pathKey;
      module2.exports.default = pathKey;
    }
  });
  var require_resolveCommand = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/resolveCommand.js"(exports2, module2) {
      var path = (0, import_chunk_QGM4M3NI.__require)("path");
      var which = require_which();
      var getPathKey = require_path_key();
      function resolveCommandAttempt(parsed, withoutPathExt) {
        const env = parsed.options.env || process.env;
        const cwd = process.cwd();
        const hasCustomCwd = parsed.options.cwd != null;
        const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled;
        if (shouldSwitchCwd) {
          try {
            process.chdir(parsed.options.cwd);
          } catch (err) {}
        }
        let resolved;
        try {
          resolved = which.sync(parsed.command, {
            path: env[getPathKey({ env })],
            pathExt: withoutPathExt ? path.delimiter : undefined
          });
        } catch (e) {} finally {
          if (shouldSwitchCwd) {
            process.chdir(cwd);
          }
        }
        if (resolved) {
          resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
        }
        return resolved;
      }
      function resolveCommand(parsed) {
        return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
      }
      module2.exports = resolveCommand;
    }
  });
  var require_escape = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/escape.js"(exports2, module2) {
      var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
      function escapeCommand(arg) {
        arg = arg.replace(metaCharsRegExp, "^$1");
        return arg;
      }
      function escapeArgument(arg, doubleEscapeMetaChars) {
        arg = `${arg}`;
        arg = arg.replace(/(?=(\\+?)?)\1"/g, "$1$1\\\"");
        arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
        arg = `"${arg}"`;
        arg = arg.replace(metaCharsRegExp, "^$1");
        if (doubleEscapeMetaChars) {
          arg = arg.replace(metaCharsRegExp, "^$1");
        }
        return arg;
      }
      module2.exports.command = escapeCommand;
      module2.exports.argument = escapeArgument;
    }
  });
  var require_shebang_regex = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js"(exports2, module2) {
      module2.exports = /^#!(.*)/;
    }
  });
  var require_shebang_command = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js"(exports2, module2) {
      var shebangRegex = require_shebang_regex();
      module2.exports = (string = "") => {
        const match = string.match(shebangRegex);
        if (!match) {
          return null;
        }
        const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
        const binary = path.split("/").pop();
        if (binary === "env") {
          return argument;
        }
        return argument ? `${binary} ${argument}` : binary;
      };
    }
  });
  var require_readShebang = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/readShebang.js"(exports2, module2) {
      var fs = (0, import_chunk_QGM4M3NI.__require)("fs");
      var shebangCommand = require_shebang_command();
      function readShebang(command) {
        const size = 150;
        const buffer = Buffer.alloc(size);
        let fd;
        try {
          fd = fs.openSync(command, "r");
          fs.readSync(fd, buffer, 0, size, 0);
          fs.closeSync(fd);
        } catch (e) {}
        return shebangCommand(buffer.toString());
      }
      module2.exports = readShebang;
    }
  });
  var require_parse = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/parse.js"(exports2, module2) {
      var path = (0, import_chunk_QGM4M3NI.__require)("path");
      var resolveCommand = require_resolveCommand();
      var escape = require_escape();
      var readShebang = require_readShebang();
      var isWin = process.platform === "win32";
      var isExecutableRegExp = /\.(?:com|exe)$/i;
      var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
      function detectShebang(parsed) {
        parsed.file = resolveCommand(parsed);
        const shebang = parsed.file && readShebang(parsed.file);
        if (shebang) {
          parsed.args.unshift(parsed.file);
          parsed.command = shebang;
          return resolveCommand(parsed);
        }
        return parsed.file;
      }
      function parseNonShell(parsed) {
        if (!isWin) {
          return parsed;
        }
        const commandFile = detectShebang(parsed);
        const needsShell = !isExecutableRegExp.test(commandFile);
        if (parsed.options.forceShell || needsShell) {
          const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
          parsed.command = path.normalize(parsed.command);
          parsed.command = escape.command(parsed.command);
          parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
          const shellCommand = [parsed.command].concat(parsed.args).join(" ");
          parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
          parsed.command = process.env.comspec || "cmd.exe";
          parsed.options.windowsVerbatimArguments = true;
        }
        return parsed;
      }
      function parse(command, args, options) {
        if (args && !Array.isArray(args)) {
          options = args;
          args = null;
        }
        args = args ? args.slice(0) : [];
        options = Object.assign({}, options);
        const parsed = {
          command,
          args,
          options,
          file: undefined,
          original: {
            command,
            args
          }
        };
        return options.shell ? parsed : parseNonShell(parsed);
      }
      module2.exports = parse;
    }
  });
  var require_enoent = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/enoent.js"(exports2, module2) {
      var isWin = process.platform === "win32";
      function notFoundError(original, syscall) {
        return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
          code: "ENOENT",
          errno: "ENOENT",
          syscall: `${syscall} ${original.command}`,
          path: original.command,
          spawnargs: original.args
        });
      }
      function hookChildProcess(cp, parsed) {
        if (!isWin) {
          return;
        }
        const originalEmit = cp.emit;
        cp.emit = function(name, arg1) {
          if (name === "exit") {
            const err = verifyENOENT(arg1, parsed);
            if (err) {
              return originalEmit.call(cp, "error", err);
            }
          }
          return originalEmit.apply(cp, arguments);
        };
      }
      function verifyENOENT(status, parsed) {
        if (isWin && status === 1 && !parsed.file) {
          return notFoundError(parsed.original, "spawn");
        }
        return null;
      }
      function verifyENOENTSync(status, parsed) {
        if (isWin && status === 1 && !parsed.file) {
          return notFoundError(parsed.original, "spawnSync");
        }
        return null;
      }
      module2.exports = {
        hookChildProcess,
        verifyENOENT,
        verifyENOENTSync,
        notFoundError
      };
    }
  });
  var require_cross_spawn = (0, import_chunk_QGM4M3NI.__commonJS)({
    "../../node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/index.js"(exports2, module2) {
      var cp = (0, import_chunk_QGM4M3NI.__require)("child_process");
      var parse = require_parse();
      var enoent = require_enoent();
      function spawn2(command, args, options) {
        const parsed = parse(command, args, options);
        const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
        enoent.hookChildProcess(spawned, parsed);
        return spawned;
      }
      function spawnSync(command, args, options) {
        const parsed = parse(command, args, options);
        const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
        result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
        return result;
      }
      module2.exports = spawn2;
      module2.exports.spawn = spawn2;
      module2.exports.sync = spawnSync;
      module2.exports._parse = parse;
      module2.exports._enoent = enoent;
    }
  });
  var import_cross_spawn = (0, import_chunk_QGM4M3NI.__toESM)(require_cross_spawn());
  var FORCE_COLOR;
  var NODE_DISABLE_COLORS;
  var NO_COLOR;
  var TERM;
  var isTTY = true;
  if (typeof process !== "undefined") {
    ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
    isTTY = process.stdout && process.stdout.isTTY;
  }
  var $ = {
    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
  };
  function init(x, y) {
    let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
    let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
    return function(txt) {
      if (!$.enabled || txt == null)
        return txt;
      return open + (~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
    };
  }
  var reset = init(0, 0);
  var bold = init(1, 22);
  var dim = init(2, 22);
  var italic = init(3, 23);
  var underline = init(4, 24);
  var inverse = init(7, 27);
  var hidden = init(8, 28);
  var strikethrough = init(9, 29);
  var black = init(30, 39);
  var red = init(31, 39);
  var green = init(32, 39);
  var yellow = init(33, 39);
  var blue = init(34, 39);
  var magenta = init(35, 39);
  var cyan = init(36, 39);
  var white = init(37, 39);
  var gray = init(90, 39);
  var grey = init(90, 39);
  var bgBlack = init(40, 49);
  var bgRed = init(41, 49);
  var bgGreen = init(42, 49);
  var bgYellow = init(43, 49);
  var bgBlue = init(44, 49);
  var bgMagenta = init(45, 49);
  var bgCyan = init(46, 49);
  var bgWhite = init(47, 49);
  var debug = (0, import_debug.Debug)("prisma:GeneratorProcess");
  var globalMessageId = 1;
  var GeneratorError = class extends Error {
    constructor(message, code, data) {
      super(message);
      this.code = code;
      this.data = data;
      if (data?.stack) {
        this.stack = data.stack;
      }
    }
    name = "GeneratorError";
  };
  var GeneratorProcess = class {
    constructor(pathOrCommand, { isNode = false } = {}) {
      this.pathOrCommand = pathOrCommand;
      this.isNode = isNode;
    }
    child;
    handlers = {};
    initPromise;
    isNode;
    errorLogs = "";
    pendingError;
    exited = false;
    async init() {
      if (!this.initPromise) {
        this.initPromise = this.initSingleton();
      }
      return this.initPromise;
    }
    initSingleton() {
      return new Promise((resolve, reject) => {
        if (this.isNode) {
          this.child = (0, import_node_child_process.fork)(this.pathOrCommand, [], {
            stdio: ["pipe", "inherit", "pipe", "ipc"],
            env: {
              ...process.env,
              PRISMA_GENERATOR_INVOCATION: "true"
            },
            execArgv: ["--max-old-space-size=8096"]
          });
        } else {
          this.child = (0, import_cross_spawn.spawn)(this.pathOrCommand, {
            stdio: ["pipe", "inherit", "pipe"],
            env: {
              ...process.env,
              PRISMA_GENERATOR_INVOCATION: "true"
            },
            shell: true
          });
        }
        this.child.on("exit", (code, signal) => {
          debug(`child exited with code ${code} on signal ${signal}`);
          this.exited = true;
          if (code) {
            const error = new GeneratorError(`Generator ${JSON.stringify(this.pathOrCommand)} failed:

${this.errorLogs}`);
            this.pendingError = error;
            this.rejectAllHandlers(error);
          }
        });
        this.child.stdin.on("error", () => {});
        this.child.on("error", (error) => {
          debug(error);
          this.pendingError = error;
          if (error.code === "EACCES") {
            reject(new Error(`The executable at ${this.pathOrCommand} lacks the right permissions. Please use ${bold(`chmod +x ${this.pathOrCommand}`)}`));
          } else {
            reject(error);
          }
          this.rejectAllHandlers(error);
        });
        (0, import_chunk_EOPVK4AE.byline)(this.child.stderr).on("data", (line) => {
          const response = String(line);
          let data;
          try {
            data = JSON.parse(response);
          } catch (e) {
            this.errorLogs += response + `
`;
            debug(response);
          }
          if (data) {
            this.handleResponse(data);
          }
        });
        this.child.on("spawn", resolve);
      });
    }
    rejectAllHandlers(error) {
      for (const id of Object.keys(this.handlers)) {
        this.handlers[id].reject(error);
        delete this.handlers[id];
      }
    }
    handleResponse(data) {
      if (data.jsonrpc && data.id) {
        if (typeof data.id !== "number") {
          throw new Error(`message.id has to be a number. Found value ${data.id}`);
        }
        if (this.handlers[data.id]) {
          if ((0, import_chunk_KEYE2GFS.isErrorResponse)(data)) {
            const error = new GeneratorError(data.error.message, data.error.code, data.error.data);
            this.handlers[data.id].reject(error);
          } else {
            this.handlers[data.id].resolve(data.result);
          }
          delete this.handlers[data.id];
        }
      }
    }
    sendMessage(message, callback) {
      if (!this.child) {
        callback(new GeneratorError("Generator process has not started yet"));
        return;
      }
      if (!this.child.stdin.writable) {
        callback(new GeneratorError("Cannot send data to the generator process, process already exited"));
        return;
      }
      this.child.stdin.write(JSON.stringify(message) + `
`, (error) => {
        if (!error) {
          return callback();
        }
        if (error.code === "EPIPE") {
          return callback();
        }
        callback(error);
      });
    }
    getMessageId() {
      return globalMessageId++;
    }
    stop() {
      if (this.child && !this.child?.killed) {
        this.child.kill("SIGTERM");
        const timeoutMs = 2000;
        const intervalMs = 200;
        let interval;
        let timeout;
        Promise.race([
          new Promise((resolve) => {
            timeout = setTimeout(resolve, timeoutMs);
          }),
          new Promise((resolve) => {
            interval = setInterval(() => {
              if (this.exited) {
                return resolve("exited");
              }
            }, intervalMs);
          })
        ]).then((result) => {
          if (result !== "exited") {
            this.child?.kill("SIGKILL");
          }
        }).finally(() => {
          clearInterval(interval);
          clearTimeout(timeout);
        });
      }
    }
    rpcMethod(method, mapResult = (x) => x) {
      return (params) => new Promise((resolve, reject) => {
        if (this.pendingError) {
          reject(this.pendingError);
          return;
        }
        const messageId = this.getMessageId();
        this.handlers[messageId] = {
          resolve: (result) => resolve(mapResult(result)),
          reject
        };
        this.sendMessage({
          jsonrpc: "2.0",
          method,
          params,
          id: messageId
        }, (error) => {
          if (error)
            reject(error);
        });
      });
    }
    getManifest = this.rpcMethod("getManifest", (result) => result.manifest ?? null);
    generate = this.rpcMethod("generate");
  };
});

// node_modules/@prisma/generator-helper/dist/chunk-ZLSWUBWT.js
var require_chunk_ZLSWUBWT = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_ZLSWUBWT_exports = {};
  __export(chunk_ZLSWUBWT_exports, {
    generatorHandler: () => generatorHandler
  });
  module.exports = __toCommonJS(chunk_ZLSWUBWT_exports);
  var import_chunk_EOPVK4AE = require_chunk_EOPVK4AE();
  function generatorHandler(handler) {
    (0, import_chunk_EOPVK4AE.byline)(process.stdin).on("data", async (line) => {
      const json = JSON.parse(String(line));
      if (json.method === "generate" && json.params) {
        try {
          const result = await handler.onGenerate(json.params);
          respond({
            jsonrpc: "2.0",
            result,
            id: json.id
          });
        } catch (_e) {
          const e = _e;
          respond({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: e.message,
              data: {
                stack: e.stack
              }
            },
            id: json.id
          });
        }
      }
      if (json.method === "getManifest") {
        if (handler.onManifest) {
          try {
            const manifest = await handler.onManifest(json.params);
            respond({
              jsonrpc: "2.0",
              result: {
                manifest
              },
              id: json.id
            });
          } catch (_e) {
            const e = _e;
            respond({
              jsonrpc: "2.0",
              error: {
                code: -32000,
                message: e.message,
                data: {
                  stack: e.stack
                }
              },
              id: json.id
            });
          }
        } else {
          respond({
            jsonrpc: "2.0",
            result: {
              manifest: null
            },
            id: json.id
          });
        }
      }
    });
    process.stdin.resume();
  }
  function respond(response) {
    console.error(JSON.stringify(response));
  }
});

// node_modules/@prisma/generator-helper/dist/index.js
var require_dist2 = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames2 = Object.getOwnPropertyNames;
  var __hasOwnProp2 = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp2(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames2(from))
        if (!__hasOwnProp2.call(to, key) && key !== except)
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var index_exports = {};
  __export(index_exports, {
    GeneratorError: () => import_chunk_MXZE5TCU.GeneratorError,
    GeneratorProcess: () => import_chunk_MXZE5TCU.GeneratorProcess,
    generatorHandler: () => import_chunk_ZLSWUBWT.generatorHandler
  });
  module.exports = __toCommonJS(index_exports);
  var import_chunk_MXZE5TCU = require_chunk_MXZE5TCU();
  var import_chunk_ZLSWUBWT = require_chunk_ZLSWUBWT();
  var import_chunk_EOPVK4AE = require_chunk_EOPVK4AE();
  var import_chunk_KEYE2GFS = require_chunk_KEYE2GFS();
  var import_chunk_QGM4M3NI = require_chunk_QGM4M3NI();
});

// node_modules/pluralize/pluralize.js
var require_pluralize = __commonJS((exports, module) => {
  (function(root, pluralize) {
    if (typeof exports === "object" && typeof module === "object") {
      module.exports = pluralize();
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return pluralize();
      });
    } else {
      root.pluralize = pluralize();
    }
  })(exports, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index) {
        return args[index] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match, index) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len = rules.length;
      while (len--) {
        var rule = rules[len];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
    pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
    pluralize.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize.addPluralRule(word, "$0");
      pluralize.addSingularRule(word, "$0");
    };
    pluralize.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      ["genus", "genera"],
      ["viscus", "viscera"],
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize.addSingularRule(rule[0], rule[1]);
    });
    [
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      /[^aeiou]ese$/i,
      /deer$/i,
      /fish$/i,
      /measles$/i,
      /o[iu]s$/i,
      /pox$/i,
      /sheep$/i
    ].forEach(pluralize.addUncountableRule);
    return pluralize;
  });
});

// index.ts
var import_generator_helper = __toESM(require_dist2(), 1);
import { join as join11 } from "node:path";

// src/utils.ts
var pluralize = __toESM(require_pluralize(), 1);
import { dirname as dirname2, join, relative as relative2, resolve as resolve2 } from "node:path";

// src/config.ts
import * as path from "node:path";

// src/errors.ts
class FlowGeneratorError extends Error {
  cause;
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = "FlowGeneratorError";
  }
}

class ConfigurationError extends FlowGeneratorError {
  configKey;
  constructor(message, configKey) {
    super(message);
    this.configKey = configKey;
    this.name = "ConfigurationError";
  }
}

class ModelNotFoundError extends FlowGeneratorError {
  constructor(modelName) {
    super(`Model "${modelName}" not found in Prisma schema`);
    this.name = "ModelNotFoundError";
  }
}
class TemplateGenerationError extends FlowGeneratorError {
  constructor(templateName, modelName, cause) {
    super(`Failed to generate ${templateName} template for model "${modelName}"`);
    this.name = "TemplateGenerationError";
    this.cause = cause;
  }
}

class FileSystemError extends FlowGeneratorError {
  constructor(operation, filePath, cause) {
    super(`Failed to ${operation} file at "${filePath}"`);
    this.name = "FileSystemError";
    this.cause = cause;
  }
}

// src/config.ts
function parseGeneratorConfig(options) {
  const config = options.generator.config;
  const output = options.generator.output?.value ?? "./generated/flow";
  if (!output) {
    throw new ConfigurationError('Missing required "output" configuration', "output");
  }
  if (!config.models) {
    throw new ConfigurationError('Missing required "models" configuration', "models");
  }
  const models = Array.isArray(config.models) ? config.models : config.models.split(",").map((m) => m.trim());
  const resolvedPrismaImport = resolvePrismaImportPath(options, config.prismaImport || "@prisma/client");
  const parsedConfig = {
    output,
    prismaImport: resolvedPrismaImport,
    models
  };
  if (config.prismaClientPath) {
    parsedConfig.prismaClientPath = config.prismaClientPath;
  }
  if (config.serverPath) {
    parsedConfig.serverPath = config.serverPath;
  }
  if (config.cacheUtilsPath) {
    parsedConfig.cacheUtilsPath = config.cacheUtilsPath;
  }
  for (const modelName of models) {
    const lowerModelName = modelName.toLowerCase();
    const modelConfig = parseModelConfigFromFlatKeys(config, modelName);
    if (Object.keys(modelConfig).length > 0) {
      parsedConfig[lowerModelName] = modelConfig;
    }
  }
  return parsedConfig;
}
function parseModelConfigFromFlatKeys(config, modelName) {
  const modelConfig = {};
  const lowerModelName = modelName.toLowerCase();
  const selectKey = `${lowerModelName}Select`;
  if (config[selectKey]) {
    const selectValue = config[selectKey];
    modelConfig.select = Array.isArray(selectValue) ? selectValue : selectValue.split(",").map((f) => f.trim());
  }
  const optimisticKey = `${lowerModelName}Optimistic`;
  if (config[optimisticKey]) {
    const optimisticValue = config[optimisticKey];
    if (!["merge", "overwrite", "manual"].includes(optimisticValue)) {
      throw new ConfigurationError(`Invalid optimistic strategy for ${modelName}: ${optimisticValue}. Must be one of: merge, overwrite, manual`, optimisticKey);
    }
    modelConfig.optimistic = optimisticValue;
  }
  const paginationKey = `${lowerModelName}Pagination`;
  if (config[paginationKey] !== undefined) {
    const paginationValue = config[paginationKey];
    modelConfig.pagination = paginationValue === "true" || paginationValue === true;
  }
  return modelConfig;
}
function resolvePrismaImportPath(options, importPath) {
  if (!importPath.startsWith(".")) {
    return importPath;
  }
  const schemaDir = path.dirname(options.schemaPath);
  const outputDir = options.generator.output?.value ?? "./generated/flow";
  const absoluteImportPath = path.resolve(schemaDir, importPath);
  const relativeFromOutput = path.relative(outputDir, absoluteImportPath);
  return relativeFromOutput.replace(/\\/g, "/").replace(/\.ts$/, "");
}
function getPrismaImportForNesting(basePrismaImport, nestingLevel) {
  if (!basePrismaImport.startsWith(".")) {
    return basePrismaImport;
  }
  const additionalLevels = "../".repeat(nestingLevel);
  return additionalLevels + basePrismaImport;
}
function validateConfig(config, modelNames) {
  const invalidModels = config.models.filter((modelName) => !modelNames.includes(modelName));
  if (invalidModels.length > 0) {
    throw new ModelNotFoundError(`Unknown models specified in config: ${invalidModels.join(", ")}`);
  }
  for (const modelName of config.models) {
    const lowerModelName = modelName.toLowerCase();
    const modelConfig = config[lowerModelName];
    if (modelConfig?.select && !Array.isArray(modelConfig.select)) {
      throw new ConfigurationError(`Model ${modelName}: select must be an array of field names`, "select");
    }
  }
}

// src/model-analyzer.ts
function analyzeModel(dmmfModel, relationshipInfo) {
  const fields = dmmfModel.fields.map((field) => {
    const attributes = parsePrismaAttributes(field);
    const analyzed = {
      name: field.name,
      type: field.type,
      isRequired: field.isRequired,
      isOptional: !field.isRequired,
      isList: field.isList,
      isId: field.isId,
      isUnique: field.isUnique,
      defaultValue: field.default,
      documentation: field.documentation,
      hasDefaultValue: attributes.hasDefaultValue,
      defaultValueType: attributes.defaultValueType,
      defaultValueExpression: attributes.defaultValueExpression,
      isAutoIncrement: attributes.isAutoIncrement,
      isUpdatedAt: attributes.isUpdatedAt,
      isCreatedAt: attributes.isCreatedAt,
      needsOptimisticValue: false,
      optimisticValueGenerator: undefined
    };
    if (field.relationName) {
      analyzed.relationName = field.relationName;
      analyzed.relationFromFields = field.relationFromFields ? [...field.relationFromFields] : undefined;
      analyzed.relationToFields = field.relationToFields ? [...field.relationToFields] : undefined;
      if (field.isList) {
        analyzed.relationType = "one-to-many";
      } else if (field.relationFromFields && field.relationFromFields.length > 0) {
        analyzed.relationType = "many-to-one";
      } else {
        analyzed.relationType = "one-to-one";
      }
    }
    const isForeignKeyField = dmmfModel.fields.some((otherField) => otherField.relationFromFields?.includes(field.name));
    analyzed.isForeignKey = isForeignKeyField;
    analyzed.isScalarRelation = isForeignKeyField;
    if (field.type === "String" && field.documentation) {
      const lengthMatch = field.documentation.match(/@db\.VarChar\((\d+)\)/);
      if (lengthMatch?.[1]) {
        analyzed.maxLength = Number.parseInt(lengthMatch[1], 10);
      }
    }
    const needsOptimisticValue = analyzed.isId || analyzed.isCreatedAt || analyzed.isUpdatedAt || analyzed.hasDefaultValue;
    if (needsOptimisticValue) {
      analyzed.needsOptimisticValue = true;
      analyzed.optimisticValueGenerator = generateOptimisticValue(analyzed);
    }
    return analyzed;
  });
  const autoGeneratedFields = ["id", "createdAt", "updatedAt"];
  const requiredFields = fields.filter((f) => f.isRequired && !f.relationName && !autoGeneratedFields.includes(f.name) && !f.defaultValue);
  const optionalFields = fields.filter((f) => f.isOptional);
  const relationFields = fields.filter((f) => f.relationName);
  const scalarFields = fields.filter((f) => !f.relationName);
  const foreignKeyFields = fields.filter((f) => f.isForeignKey);
  const nestedRelationFields = fields.filter((f) => f.relationName && !f.isForeignKey);
  const idField = fields.find((f) => f.isId);
  const stringFields = fields.filter((f) => f.type === "String" && !f.relationName);
  const dateFields = fields.filter((f) => f.type === "DateTime");
  const numberFields = fields.filter((f) => ["Int", "Float", "Decimal"].includes(f.type));
  const booleanFields = fields.filter((f) => f.type === "Boolean");
  return {
    name: dmmfModel.name,
    fields,
    requiredFields,
    optionalFields,
    relationFields,
    scalarFields,
    foreignKeyFields,
    nestedRelationFields,
    idField,
    stringFields,
    dateFields,
    numberFields,
    booleanFields,
    relationships: relationshipInfo || {
      owns: [],
      referencedBy: [],
      relatedModels: []
    }
  };
}
function generateValidationRules(model) {
  const rules = [];
  for (const field of model.requiredFields) {
    if (field.type === "String") {
      rules.push({
        field: field.name,
        type: "required",
        message: `${field.name} is required`
      });
    }
  }
  for (const field of model.stringFields) {
    if (field.maxLength) {
      rules.push({
        field: field.name,
        type: "maxLength",
        value: field.maxLength,
        message: `${field.name} must be less than ${field.maxLength} characters`
      });
    }
  }
  const emailField = model.stringFields.find((f) => f.name.toLowerCase() === "email");
  if (emailField) {
    rules.push({
      field: emailField.name,
      type: "email",
      message: "Please enter a valid email address"
    });
  }
  const urlField = model.stringFields.find((f) => f.name.toLowerCase().includes("url") || f.name.toLowerCase().includes("website"));
  if (urlField) {
    rules.push({
      field: urlField.name,
      type: "url",
      message: "Please enter a valid URL"
    });
  }
  return rules;
}
function parsePrismaAttributes(field) {
  const hasDefaultValue = field.hasDefaultValue;
  let defaultValueType = "none";
  let defaultValueExpression;
  let isAutoIncrement = false;
  let isUpdatedAt = false;
  let isCreatedAt = false;
  if (field.isUpdatedAt) {
    isUpdatedAt = true;
  }
  if (field.name.toLowerCase().includes("createdat") || field.name.toLowerCase().includes("created_at")) {
    isCreatedAt = true;
  }
  if (hasDefaultValue && field.default) {
    if (typeof field.default === "object" && field.default !== null) {
      if ("name" in field.default) {
        defaultValueType = "function";
        defaultValueExpression = field.default.name;
        if (field.default.name === "autoincrement") {
          isAutoIncrement = true;
        }
      } else if ("args" in field.default) {
        defaultValueType = "function";
        defaultValueExpression = JSON.stringify(field.default);
      }
    } else {
      defaultValueType = "literal";
      if (typeof field.default === "string") {
        defaultValueExpression = `"${field.default}"`;
      } else {
        defaultValueExpression = String(field.default);
      }
    }
  }
  return {
    hasDefaultValue,
    defaultValueType,
    defaultValueExpression,
    isAutoIncrement,
    isUpdatedAt,
    isCreatedAt
  };
}
function generateOptimisticValue(field) {
  if (field.isId) {
    if (field.isAutoIncrement) {
      return "tempId";
    }
    if (field.hasDefaultValue && field.defaultValueExpression) {
      if (field.defaultValueExpression === "uuid()" || field.defaultValueExpression === "cuid()") {
        return "tempId";
      }
    }
    return "tempId";
  }
  if (field.isUpdatedAt || field.isCreatedAt) {
    return "new Date()";
  }
  if (field.hasDefaultValue) {
    if (field.defaultValueType === "function") {
      switch (field.defaultValueExpression) {
        case "now()":
          return "new Date()";
        case "uuid()":
        case "cuid()":
          return "crypto.randomUUID()";
        case "autoincrement()":
          return "tempId";
        default:
          if (field.type === "DateTime")
            return "new Date()";
          if (field.type === "String")
            return '""';
          return "undefined";
      }
    } else if (field.defaultValueType === "literal") {
      return field.defaultValueExpression || "undefined";
    }
  }
  if (field.isOptional) {
    return "null";
  }
  return getTypeDefaultValue(field.type);
}
function getTypeDefaultValue(type) {
  switch (type) {
    case "String":
      return '""';
    case "Int":
    case "Float":
    case "Decimal":
      return "0";
    case "Boolean":
      return "false";
    case "DateTime":
      return "new Date()";
    case "Json":
      return "null";
    default:
      return "null";
  }
}
function generateOptimisticCreateFields(model) {
  const fieldAssignments = [];
  for (const field of model.fields) {
    if (field.relationName && !field.isForeignKey) {
      continue;
    }
    if (field.needsOptimisticValue) {
      fieldAssignments.push(`		${field.name}: ${field.optimisticValueGenerator},`);
    }
  }
  return fieldAssignments.join(`
`);
}
function generateOptimisticUpdateFields(model) {
  const fieldAssignments = [];
  for (const field of model.fields) {
    if (field.isUpdatedAt) {
      fieldAssignments.push(`		${field.name}: new Date(),`);
    }
  }
  return fieldAssignments.join(`
`);
}

// src/utils.ts
function createGeneratorContext(config, dmmf, outputPath) {
  return {
    config,
    dmmf,
    outputDir: resolve2(outputPath),
    zodDir: join(resolve2(outputPath), "zod"),
    prismaImport: config.prismaImport || "@prisma/client"
  };
}
function getPrismaImportPath(context, nestingLevel = 0) {
  return getPrismaImportForNesting(context.prismaImport, nestingLevel);
}
function getZodImportPath(nestingLevel = 0) {
  const relativePath = nestingLevel === 0 ? "./zod" : "../zod";
  return relativePath;
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function plural2(word) {
  return pluralize.plural(word);
}
function createSelectObjectWithRelations(modelInfo, context, visited = new Set) {
  const selectEntries = [];
  visited.add(modelInfo.name);
  for (const fieldName of modelInfo.selectFields) {
    const field = modelInfo.model.fields.find((f) => f.name === fieldName);
    if (!field) {
      selectEntries.push(`${fieldName}: true`);
      continue;
    }
    if (field.kind === "object") {
      const relatedModelName = field.type;
      if (visited.has(relatedModelName)) {
        continue;
      }
      const relatedModelConfig = getModelConfigFromContext(relatedModelName, context);
      if (relatedModelConfig?.selectFields) {
        const filteredFields = filterFieldsForCircularReference(relatedModelConfig.selectFields, relatedModelConfig, modelInfo.name);
        if (filteredFields.length > 0) {
          const nestedSelect = createSelectObjectWithCircularPrevention(filteredFields, relatedModelConfig, context, new Set(visited));
          selectEntries.push(`${fieldName}: { select: ${nestedSelect} }`);
        }
      } else {
        selectEntries.push(`${fieldName}: true`);
      }
    } else {
      selectEntries.push(`${fieldName}: true`);
    }
  }
  return `{ ${selectEntries.join(", ")} }`;
}
function filterFieldsForCircularReference(fields, relatedModelConfig, parentModelName) {
  return fields.filter((fieldName) => {
    const field = relatedModelConfig.model.fields.find((f) => f.name === fieldName);
    if (!field || field.kind !== "object") {
      return true;
    }
    if (field.type === parentModelName) {
      return false;
    }
    if (field.isList) {
      const relationshipModel = field.type;
      return false;
    }
    return true;
  });
}
function createSelectObjectWithCircularPrevention(fields, modelInfo, context, visited) {
  const selectEntries = [];
  for (const fieldName of fields) {
    const field = modelInfo.model.fields.find((f) => f.name === fieldName);
    if (!field) {
      selectEntries.push(`${fieldName}: true`);
      continue;
    }
    if (field.kind === "object") {
      const relatedModelName = field.type;
      if (visited.has(relatedModelName)) {
        continue;
      }
      selectEntries.push(`${fieldName}: true`);
    } else {
      selectEntries.push(`${fieldName}: true`);
    }
  }
  return `{ ${selectEntries.join(", ")} }`;
}
function getModelConfigFromContext(modelName, context) {
  if (!context.config.models.includes(modelName)) {
    return null;
  }
  const model = context.dmmf.datamodel.models.find((m) => m.name === modelName);
  if (!model) {
    return null;
  }
  const lowerModelName = modelName.toLowerCase();
  const modelConfig = context.config[lowerModelName] || {};
  const analyzedModel = analyzeModel(model);
  const validationRules = generateValidationRules(analyzedModel);
  return {
    name: modelName,
    lowerName: lowerModelName,
    pluralName: capitalize(plural2(modelName)),
    lowerPluralName: plural2(lowerModelName),
    config: modelConfig,
    model,
    selectFields: modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name),
    analyzed: analyzedModel,
    validationRules
  };
}
function formatGeneratedFileHeader() {
  return `// This file is auto-generated by Next Prisma Flow Generator.
// Do not edit this file manually as it will be overwritten.
// Generated at: ${new Date().toISOString()}

`;
}
async function writeFile(filePath, content) {
  const { writeFile: fsWriteFile } = await import("node:fs/promises");
  await ensureDirectory(dirname2(filePath));
  await fsWriteFile(filePath, content, "utf-8");
}
async function readFile(filePath) {
  const { readFile: fsReadFile } = await import("node:fs/promises");
  return await fsReadFile(filePath, "utf-8");
}
async function fileExists(filePath) {
  const { access } = await import("node:fs/promises");
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
async function deleteFile(filePath) {
  const { unlink } = await import("node:fs/promises");
  await unlink(filePath);
}
async function ensureDirectory(dirPath) {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(dirPath, { recursive: true });
}

// src/relationship-analyzer.ts
function analyzeSchemaRelationships(dmmf) {
  const modelRelationships = new Map;
  for (const model of dmmf.datamodel.models) {
    modelRelationships.set(model.name, {
      modelName: model.name,
      ownsRelations: [],
      referencedBy: [],
      relatedModels: new Set
    });
  }
  for (const model of dmmf.datamodel.models) {
    const currentModelRels = modelRelationships.get(model.name);
    for (const field of model.fields) {
      if (!field.relationName)
        continue;
      const relatedModel = field.type;
      const isOwning = !!field.relationFromFields && field.relationFromFields.length > 0;
      const isRequired = field.isRequired;
      const isList = field.isList;
      let relationType;
      if (isList) {
        relationType = isOwning ? "many-to-many" : "one-to-many";
      } else {
        relationType = isOwning ? "many-to-one" : "one-to-one";
      }
      const relatedModelDef = dmmf.datamodel.models.find((m) => m.name === relatedModel);
      const backReferenceField = relatedModelDef?.fields.find((f) => f.relationName === field.relationName && f.name !== field.name);
      const relationshipInfo = {
        fieldName: field.name,
        relatedModel,
        type: relationType,
        isRequired,
        isOwning,
        foreignKeys: field.relationFromFields ? [...field.relationFromFields] : undefined,
        backReference: backReferenceField?.name
      };
      if (isOwning) {
        currentModelRels.ownsRelations.push(relationshipInfo);
      }
      currentModelRels.relatedModels.add(relatedModel);
      const relatedModelRels = modelRelationships.get(relatedModel);
      if (relatedModelRels && !isOwning) {
        const reverseRelationType = isList ? "many-to-one" : "one-to-one";
        relatedModelRels.referencedBy.push({
          fieldName: backReferenceField?.name || model.name.toLowerCase(),
          relatedModel: model.name,
          type: reverseRelationType,
          isRequired: false,
          isOwning: false,
          backReference: field.name
        });
        relatedModelRels.relatedModels.add(model.name);
      }
    }
  }
  return modelRelationships;
}

// src/templates/actions.ts
import { join as join2 } from "node:path";
async function generateServerActions(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName, selectFields, analyzed } = modelInfo;
  const selectObject = createSelectObjectWithRelations(modelInfo, context);
  const relationshipImports = analyzed.relationships.relatedModels.map((model) => `${model}WhereUniqueInput`).sort();
  const foreignKeyCacheTags = analyzed.foreignKeyFields.map((field) => `if (data.${field.name}) {
			tags.push(\`\${MODEL_NAME}:${field.name}:\${data.${field.name}}\`);
		}`).join(`
		`);
  const relationshipMethods = analyzed.relationships.owns.filter((rel) => !rel.isScalarField).map((rel) => {
    const relationKey = rel.fieldName;
    const relatedModel = rel.relatedModel;
    const isList = rel.type === "one-to-many" || rel.type === "many-to-many";
    return `
/**
 * Connect ${relationKey} relation for ${lowerName}
 */
export async function connect${relationKey.charAt(0).toUpperCase() + relationKey.slice(1)}(
	id: string,
	${relationKey}Ids: string${isList ? "[]" : ""},
): Promise<${modelName}> {
	return withErrorHandling(
		"connect${relationKey}",
		async () => {
			const result = await prisma.${lowerName}.update({
				where: { id },
				data: {
					${relationKey}: {
						${isList ? "connect: " + relationKey + "Ids.map(id => ({ id }))" : "connect: { id: " + relationKey + "Ids }"}
					}
				},
				select: ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ id, ${relationKey}Ids },
	);
}

/**
 * Disconnect ${relationKey} relation for ${lowerName}
 */
export async function disconnect${relationKey.charAt(0).toUpperCase() + relationKey.slice(1)}(
	id: string,
	${relationKey}Ids: string${isList ? "[]" : ""},
): Promise<${modelName}> {
	return withErrorHandling(
		"disconnect${relationKey}",
		async () => {
			const result = await prisma.${lowerName}.update({
				where: { id },
				data: {
					${relationKey}: {
						${isList ? "disconnect: " + relationKey + "Ids.map(id => ({ id }))" : "disconnect: { id: " + relationKey + "Ids }"}
					}
				},
				select: ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ id, ${relationKey}Ids },
	);
}`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}"use server";

import { revalidateTag } from "next/cache";
import { prisma, type Prisma } from "../prisma";
import {
	${modelName}CreateInputSchema,
	${modelName}CreateManyInputSchema,
	${lowerName}Select,
	${modelName}UpdateInputSchema,
} from "./types";
import type {
	${modelName},
	${modelName}CreateInput,
	${modelName}CreateManyInput,
	${modelName}UpdateInput,
	${modelName}WhereInput,
	${modelName}WhereUniqueInput,${relationshipImports.length > 0 ? `
	${relationshipImports.join(`,
	`)},` : ""}
} from "./types";

// ============================================================================
// CACHE MANAGEMENT - Dynamic cache invalidation
// ============================================================================

const MODEL_NAME = "${modelName}" as const;

function generateCacheTags(data: Partial<${modelName}>): string[] {
	const tags: string[] = [MODEL_NAME];

	if (data.id) {
		tags.push(\`\${MODEL_NAME}:\${data.id}\`);
	}

	${foreignKeyCacheTags}

	return tags;
}

function invalidateCache(data: Partial<${modelName}>): void {
	const tags = generateCacheTags(data);
	for (const tag of tags) {
		revalidateTag(tag);
	}
}

// ============================================================================
// ERROR HANDLING - Prisma-aware error management
// ============================================================================

class ${modelName}Error extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 400,
		public readonly context?: Record<string, any>,
	) {
		super(message);
		this.name = "${modelName}Error";
	}
}

async function withErrorHandling<T>(
	operation: string,
	fn: () => Promise<T>,
	context?: Record<string, any>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		console.error(\`\${MODEL_NAME} \${operation} error:\`, error, context);

		if (error instanceof ${modelName}Error) {
			throw error;
		}

		if (typeof error === "object" && error !== null && "code" in error) {
			const prismaError = error as { code: string; message: string };

			switch (prismaError.code) {
				case "P2002":
					throw new ${modelName}Error("Unique constraint violation", "DUPLICATE", 409, context);
				case "P2025":
					throw new ${modelName}Error("Record not found", "NOT_FOUND", 404, context);
				case "P2003":
					throw new ${modelName}Error("Foreign key constraint violation", "INVALID_REFERENCE", 400, context);
				case "P2014":
					throw new ${modelName}Error("Invalid relation reference", "INVALID_RELATION", 400, context);
				default:
					throw new ${modelName}Error(\`Database error: \${prismaError.message}\`, "DATABASE_ERROR", 500, context);
			}
		}

		if (error instanceof Error && error.message.includes("validation")) {
			throw new ${modelName}Error(\`Validation failed: \${error.message}\`, "VALIDATION_ERROR", 400, context);
		}

		const message = error instanceof Error ? error.message : "Unknown error occurred";
		throw new ${modelName}Error(message, "UNKNOWN_ERROR", 500, context);
	}
}

// ============================================================================
// CORE CRUD OPERATIONS - Full Prisma API parity
// ============================================================================

/**
 * Find many ${lowerPluralName} with Prisma options
 */
export async function findMany(
	args?: Prisma.${modelName}FindManyArgs,
): Promise<${modelName}[]> {
	return withErrorHandling(
		"findMany",
		async () => {
			const result = await prisma.${lowerName}.findMany({
				...args,
				select: args?.select || ${lowerName}Select,
			});

			return result as ${modelName}[];
		},
		{ args },
	);
}

/**
 * Find unique ${lowerName} by unique constraint
 */
export async function findUnique(
	args: Prisma.${modelName}FindUniqueArgs,
): Promise<${modelName} | null> {
	return withErrorHandling(
		"findUnique",
		async () => {
			const result = await prisma.${lowerName}.findUnique({
				...args,
				select: args.select || ${lowerName}Select,
			});

			return result as ${modelName} | null;
		},
		{ args },
	);
}

/**
 * Find unique ${lowerName} or throw error if not found
 */
export async function findUniqueOrThrow(
	args: Prisma.${modelName}FindUniqueArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"findUniqueOrThrow",
		async () => {
			const result = await prisma.${lowerName}.findUniqueOrThrow({
				...args,
				select: args.select || ${lowerName}Select,
			});

			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Find first ${lowerName} matching criteria
 */
export async function findFirst(
	args?: Prisma.${modelName}FindFirstArgs,
): Promise<${modelName} | null> {
	return withErrorHandling(
		"findFirst",
		async () => {
			const result = await prisma.${lowerName}.findFirst({
				...args,
				select: args?.select || ${lowerName}Select,
			});

			return result as ${modelName} | null;
		},
		{ args },
	);
}

/**
 * Find first ${lowerName} or throw error if not found
 */
export async function findFirstOrThrow(
	args?: Prisma.${modelName}FindFirstArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"findFirstOrThrow",
		async () => {
			const result = await prisma.${lowerName}.findFirstOrThrow({
				...args,
				select: args?.select || ${lowerName}Select,
			});

			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Create a new ${lowerName}
 */
export async function create(
	args: Prisma.${modelName}CreateArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"create",
		async () => {
			const data = ${modelName}CreateInputSchema.parse(args.data);
			const result = await prisma.${lowerName}.create({
				...args,
				data,
				select: args.select || ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Create multiple ${lowerPluralName}
 */
export async function createMany(
	args: Prisma.${modelName}CreateManyArgs,
): Promise<Prisma.BatchPayload> {
	return withErrorHandling(
		"createMany",
		async () => {
			const data = Array.isArray(args.data) 
				? args.data.map(item => ${modelName}CreateManyInputSchema.parse(item))
				: ${modelName}CreateManyInputSchema.parse(args.data);
			
			const result = await prisma.${lowerName}.createMany({
				...args,
				data,
			});

			revalidateTag(MODEL_NAME);
			return result;
		},
		{ args },
	);
}

/**
 * Update an existing ${lowerName}
 */
export async function update(
	args: Prisma.${modelName}UpdateArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"update",
		async () => {
			const data = ${modelName}UpdateInputSchema.parse(args.data);
			const result = await prisma.${lowerName}.update({
				...args,
				data,
				select: args.select || ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Update multiple ${lowerPluralName}
 */
export async function updateMany(
	args: Prisma.${modelName}UpdateManyArgs,
): Promise<Prisma.BatchPayload> {
	return withErrorHandling(
		"updateMany",
		async () => {
			const data = ${modelName}UpdateInputSchema.parse(args.data);
			const result = await prisma.${lowerName}.updateMany({
				...args,
				data,
			});

			revalidateTag(MODEL_NAME);
			return result;
		},
		{ args },
	);
}

/**
 * Upsert a ${lowerName} (create or update)
 */
export async function upsert(
	args: Prisma.${modelName}UpsertArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"upsert",
		async () => {
			const createData = ${modelName}CreateInputSchema.parse(args.create);
			const updateData = ${modelName}UpdateInputSchema.parse(args.update);

			const result = await prisma.${lowerName}.upsert({
				...args,
				create: createData,
				update: updateData,
				select: args.select || ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Delete a ${lowerName}
 */
export async function deleteRecord(
	args: Prisma.${modelName}DeleteArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"delete",
		async () => {
			const existing = await prisma.${lowerName}.findUnique({
				where: args.where,
				select: ${lowerName}Select,
			});

			const result = await prisma.${lowerName}.delete({
				...args,
				select: args.select || ${lowerName}Select,
			});

			if (existing) {
				invalidateCache(existing as ${modelName});
			}
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Delete multiple ${lowerPluralName}
 */
export async function deleteMany(
	args: Prisma.${modelName}DeleteManyArgs,
): Promise<Prisma.BatchPayload> {
	return withErrorHandling(
		"deleteMany",
		async () => {
			const result = await prisma.${lowerName}.deleteMany(args);
			revalidateTag(MODEL_NAME);
			return result;
		},
		{ args },
	);
}

// ============================================================================
// AGGREGATION & ANALYSIS OPERATIONS
// ============================================================================

/**
 * Count ${lowerPluralName} matching criteria
 */
export async function count(
	args?: Prisma.${modelName}CountArgs,
): Promise<number> {
	return withErrorHandling(
		"count",
		async () => {
			return await prisma.${lowerName}.count(args);
		},
		{ args },
	);
}

/**
 * Aggregate ${lowerPluralName} data
 */
export async function aggregate(
	args: Prisma.${modelName}AggregateArgs,
): Promise<Prisma.Get${modelName}AggregateType<typeof args>> {
	return withErrorHandling(
		"aggregate",
		async () => {
			return await prisma.${lowerName}.aggregate(args) as any;
		},
		{ args },
	);
}

/**
 * Group ${lowerPluralName} by field values
 */
export async function groupBy(
	args: Prisma.${modelName}GroupByArgs,
): Promise<any> {
	return withErrorHandling(
		"groupBy",
		async () => {
			return await prisma.${lowerName}.groupBy(args);
		},
		{ args },
	);
}

// ============================================================================
// CONVENIENCE UTILITY METHODS
// ============================================================================

/**
 * Check if a ${lowerName} exists
 */
export async function exists(where: ${modelName}WhereUniqueInput): Promise<boolean> {
	return withErrorHandling(
		"exists",
		async () => {
			const result = await prisma.${lowerName}.findUnique({
				where,
				select: { id: true },
			});
			return result !== null;
		},
		{ where },
	);
}

/**
 * Check if any ${lowerPluralName} exist matching criteria
 */
export async function existsWhere(where: ${modelName}WhereInput): Promise<boolean> {
	return withErrorHandling(
		"existsWhere",
		async () => {
			const result = await prisma.${lowerName}.findFirst({
				where,
				select: { id: true },
			});
			return result !== null;
		},
		{ where },
	);
}

/**
 * Find ${lowerName} by ID (convenience method)
 */
export async function findById(id: string): Promise<${modelName} | null> {
	return findUnique({ where: { id } });
}

/**
 * Find ${lowerName} by ID or throw error
 */
export async function findByIdOrThrow(id: string): Promise<${modelName}> {
	return findUniqueOrThrow({ where: { id } });
}

/**
 * Update ${lowerName} by ID (convenience method)
 */
export async function updateById(
	id: string,
	data: ${modelName}UpdateInput,
): Promise<${modelName}> {
	return update({ where: { id }, data });
}

/**
 * Delete ${lowerName} by ID (convenience method)
 */
export async function deleteById(id: string): Promise<${modelName}> {
	return deleteRecord({ where: { id } });
}

/**
 * Find ${lowerPluralName} with pagination
 */
export async function findWithPagination(args: {
	where?: ${modelName}WhereInput;
	orderBy?: Prisma.${modelName}OrderByWithRelationInput;
	page: number;
	pageSize: number;
}): Promise<{
	data: ${modelName}[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}> {
	return withErrorHandling(
		"findWithPagination",
		async () => {
			const { where, orderBy, page, pageSize } = args;
			const skip = (page - 1) * pageSize;

			const [data, total] = await Promise.all([
				prisma.${lowerName}.findMany({
					where,
					orderBy,
					skip,
					take: pageSize,
					select: ${lowerName}Select,
				}),
				prisma.${lowerName}.count({ where }),
			]);

			return {
				data: data as ${modelName}[],
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			};
		},
		{ args },
	);
}

/**
 * Search ${lowerPluralName} across text fields
 */
export async function search(
	query: string,
	options?: {
		fields?: Prisma.${modelName}ScalarFieldEnum[];
		where?: ${modelName}WhereInput;
		orderBy?: Prisma.${modelName}OrderByWithRelationInput;
		take?: number;
	},
): Promise<${modelName}[]> {
	return withErrorHandling(
		"search",
		async () => {
			// Default to searching common text fields
			const searchFields = options?.fields || ['title', 'name', 'description'].filter(
				field => field in ${lowerName}Select
			) as Prisma.${modelName}ScalarFieldEnum[];

			const searchConditions = searchFields.map(field => ({
				[field]: {
					contains: query,
					mode: 'insensitive' as const,
				},
			}));

			const where: ${modelName}WhereInput = {
				AND: [
					options?.where || {},
					searchConditions.length > 0 ? { OR: searchConditions } : {},
				],
			};

			return await findMany({
				where,
				orderBy: options?.orderBy,
				take: options?.take,
			});
		},
		{ query, options },
	);
}

${relationshipMethods ? `// ============================================================================
// RELATIONSHIP OPERATIONS - Dynamic based on schema
// ============================================================================
${relationshipMethods}` : ""}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk create ${lowerPluralName} and return created records
 */
export async function bulkCreate(data: ${modelName}CreateInput[]): Promise<${modelName}[]> {
	return withErrorHandling(
		"bulkCreate",
		async () => {
			const results: ${modelName}[] = [];
			
			for (const item of data) {
				const created = await create({ data: item });
				results.push(created);
			}
			
			return results;
		},
		{ data },
	);
}

/**
 * Bulk upsert operations
 */
export async function bulkUpsert(operations: Array<{
	where: ${modelName}WhereUniqueInput;
	create: ${modelName}CreateInput;
	update: ${modelName}UpdateInput;
}>): Promise<${modelName}[]> {
	return withErrorHandling(
		"bulkUpsert",
		async () => {
			const results: ${modelName}[] = [];
			
			for (const op of operations) {
				const result = await upsert({
					where: op.where,
					create: op.create,
					update: op.update,
				});
				results.push(result);
			}
			
			return results;
		},
		{ operations },
	);
}
`;
  const filePath = join2(modelDir, "actions.ts");
  await writeFile(filePath, template);
}

// src/templates/atoms.ts
import { join as join3 } from "node:path";
async function generateJotaiAtoms(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName, analyzed } = modelInfo;
  const optimisticCreateFields = generateOptimisticCreateFields(analyzed);
  const optimisticUpdateFields = generateOptimisticUpdateFields(analyzed);
  const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import * as ${modelName}Actions from "./actions";
import type { ${modelName}, ${modelName}CreateInput, ${modelName}OptimisticUpdate, ${modelName}UpdateInput } from "./types";

// ============================================================================
// BASE STATE ATOMS - Core data storage with normalization
// ============================================================================

/**
 * Base atom storing all ${lowerPluralName} by ID for efficient lookups and updates.
 * Using atomWithImmer for complex state updates with immutability.
 */
export const base${pluralName}Atom = atomWithImmer<Record<string, ${modelName}>>({});

/**
 * Derived atom providing ${lowerPluralName} as an array.
 * Automatically updates when base${pluralName}Atom changes.
 */
export const ${lowerName}ListAtom = atom((get) => {
	const ${lowerPluralName}Map = get(base${pluralName}Atom);
	return Object.values(${lowerPluralName}Map).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// ============================================================================
// LOADING STATE ATOMS - Granular loading indicators
// ============================================================================

/** Global loading state for batch operations */
export const ${lowerPluralName}LoadingAtom = atom<boolean>(false);

/** Loading state for create operations */
export const ${lowerName}CreatingAtom = atom<boolean>(false);

/** Loading states for individual ${lowerName} updates by ID */
export const ${lowerName}UpdatingAtom = atom<Record<string, boolean>>({});

/** Loading states for individual ${lowerName} deletions by ID */
export const ${lowerName}DeletingAtom = atom<Record<string, boolean>>({});

/** Loading state for pagination operations */
export const ${lowerPluralName}PaginationLoadingAtom = atom<boolean>(false);

// ============================================================================
// ERROR STATE ATOMS - Comprehensive error tracking
// ============================================================================

/** Global error state for general operations */
export const ${lowerPluralName}ErrorAtom = atom<string | null>(null);

/** Error states for individual operations by ${lowerName} ID */
export const ${lowerName}ErrorsAtom = atom<Record<string, string>>({});

/** Last error context for debugging */
export const lastErrorContextAtom = atom<{
	operation: string;
	timestamp: number;
	context?: Record<string, any>;
} | null>(null);

// ============================================================================
// OPTIMISTIC UPDATE TRACKING - State for managing optimistic updates
// ============================================================================

/** Track active optimistic updates */
export const optimisticUpdatesAtom = atom<Record<string, ${modelName}OptimisticUpdate>>({});

/** Track temporary IDs for optimistic creates */
export const temp${modelName}IdsAtom = atom<Set<string>>(new Set<string>());

// ============================================================================
// METADATA ATOMS - Additional state information
// ============================================================================

/** Timestamp of last successful fetch */
export const lastFetchTimestampAtom = atom<number | null>(null);

/** Cache metadata for staleness checking */
export const cacheMetadataAtom = atom<{
	lastFetch: number | null;
	isStale: boolean;
	ttl: number;
}>({
	lastFetch: null,
	isStale: false,
	ttl: 300000, // 5 minutes
});

// ============================================================================
// DERIVED ATOMS - Computed state based on base atoms
// ============================================================================

/** Count of ${lowerPluralName} */
export const ${lowerName}CountAtom = atom((get) => {
	const ${lowerPluralName} = get(${lowerName}ListAtom);
	return ${lowerPluralName}.length;
});

/** Whether the ${lowerPluralName} list is empty */
export const is${pluralName}EmptyAtom = atom((get) => {
	const count = get(${lowerName}CountAtom);
	return count === 0;
});

/** Whether any operation is currently loading */
export const isAnyLoadingAtom = atom((get) => {
	const globalLoading = get(${lowerPluralName}LoadingAtom);
	const creating = get(${lowerName}CreatingAtom);
	const updating = get(${lowerName}UpdatingAtom);
	const deleting = get(${lowerName}DeletingAtom);
	const paginationLoading = get(${lowerPluralName}PaginationLoadingAtom);

	return (
		globalLoading ||
		creating ||
		paginationLoading ||
		Object.values(updating).some(Boolean) ||
		Object.values(deleting).some(Boolean)
	);
});

/** Whether there are any errors */
export const hasAnyErrorAtom = atom((get) => {
	const globalError = get(${lowerPluralName}ErrorAtom);
	const individualErrors = get(${lowerName}ErrorsAtom);

	return !!globalError || Object.keys(individualErrors).length > 0;
});

// ============================================================================
// INDIVIDUAL ${modelName.toUpperCase()} ATOMS - Factory functions for specific ${lowerPluralName}
// ============================================================================

/**
 * Get atom for a specific ${lowerName} by ID
 * Returns null if ${lowerName} doesn't exist
 */
export const ${lowerName}ByIdAtom = (id: string) =>
	atom((get) => {
		const ${lowerPluralName}Map = get(base${pluralName}Atom);
		return ${lowerPluralName}Map[id] || null;
	});

/**
 * Check if a specific ${lowerName} exists
 */
export const ${lowerName}ExistsAtom = (id: string) =>
	atom((get) => {
		const ${lowerName} = get(${lowerName}ByIdAtom(id));
		return !!${lowerName};
	});

/**
 * Get loading state for a specific ${lowerName}
 */
export const ${lowerName}LoadingStateAtom = (id: string) =>
	atom((get) => {
		const updating = get(${lowerName}UpdatingAtom)[id] || false;
		const deleting = get(${lowerName}DeletingAtom)[id] || false;
		const optimistic = get(optimisticUpdatesAtom)[id];

		return {
			updating,
			deleting,
			hasOptimisticUpdate: !!optimistic,
			isLoading: updating || deleting,
		};
	});

/**
 * Get individual error atom for a specific ${lowerName}
 */
export const clear${modelName}ErrorAtom = (id: string) =>
	atom(null, (get, set) => {
		set(${lowerName}ErrorsAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	});

/**
 * Clear all errors atom
 */
export const clearAllErrorsAtom = atom(null, (get, set) => {
	set(${lowerPluralName}ErrorAtom, null);
	set(${lowerName}ErrorsAtom, {});
	set(lastErrorContextAtom, null);
});

// ============================================================================
// ACTION ATOMS - Write-only atoms for mutations
// ============================================================================

/**
 * Refresh ${lowerPluralName} from server
 * Handles loading states and error management
 */
export const refresh${pluralName}Atom = atom(null, async (get, set, force = false) => {
	// Check if refresh is needed (unless forced)
	if (!force) {
		const cacheMetadata = get(cacheMetadataAtom);
		const now = Date.now();

		if (cacheMetadata.lastFetch && now - cacheMetadata.lastFetch < cacheMetadata.ttl) {
			return; // Skip refresh if cache is still fresh
		}
	}

	set(${lowerPluralName}LoadingAtom, true);
	set(${lowerPluralName}ErrorAtom, null);
	set(lastErrorContextAtom, null);

	try {
		const ${lowerPluralName} = await ${modelName}Actions.findMany();
		const ${lowerPluralName}Map = Object.fromEntries(${lowerPluralName}.map((${lowerName}) => [${lowerName}.id, ${lowerName}]));

		set(base${pluralName}Atom, (draft) => {
			Object.assign(draft, ${lowerPluralName}Map);
		});
		set(lastFetchTimestampAtom, Date.now());
		set(cacheMetadataAtom, {
			lastFetch: Date.now(),
			isStale: false,
			ttl: 300000,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to fetch ${lowerPluralName}";
		set(${lowerPluralName}ErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "refresh",
			timestamp: Date.now(),
			context: { error, force },
		});
	} finally {
		set(${lowerPluralName}LoadingAtom, false);
	}
});

/**
 * Optimistic create atom with comprehensive rollback support
 */
export const optimisticCreate${modelName}Atom = atom(null, async (get, set, ${lowerName}Data: ${modelName}CreateInput) => {
	const tempId = \`temp-\${Date.now()}-\${Math.random().toString(36).substring(2)}\`;

	// Create optimistic ${lowerName} with dynamic field handling
	const optimistic${modelName} = {
${optimisticCreateFields}
		// Merge input data, allowing overrides
		...${lowerName}Data,
	} as ${modelName};

	// Track optimistic update
	const optimisticUpdate: ${modelName}OptimisticUpdate = {
		id: tempId,
		data: optimistic${modelName},
		timestamp: Date.now(),
		operation: "create",
	};

	// Apply optimistic update
	set(base${pluralName}Atom, (draft) => {
		draft[tempId] = optimistic${modelName};
	});
	set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => ({
		...prev,
		[tempId]: optimisticUpdate,
	}));
	set(temp${modelName}IdsAtom, (prev: Set<string>) => new Set([...Array.from(prev), tempId]));
	set(${lowerName}CreatingAtom, true);
	set(${lowerPluralName}ErrorAtom, null);

	try {
		const created${modelName} = await ${modelName}Actions.create({ data: ${lowerName}Data });

		// Replace optimistic entry with real data
		set(base${pluralName}Atom, (draft) => {
			delete draft[tempId];
			draft[created${modelName}.id] = created${modelName};
		});

		// Clean up optimistic tracking
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [tempId]: _, ...rest } = prev;
			return rest;
		});
		set(temp${modelName}IdsAtom, (prev: Set<string>) => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});

		return created${modelName};
	} catch (error) {
		// Rollback optimistic update
		set(base${pluralName}Atom, (draft) => {
			delete draft[tempId];
		});
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [tempId]: _, ...rest } = prev;
			return rest;
		});
		set(temp${modelName}IdsAtom, (prev: Set<string>) => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to create ${lowerName}";
		set(${lowerPluralName}ErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "create",
			timestamp: Date.now(),
			context: { error, ${lowerName}Data },
		});
		throw error;
	} finally {
		set(${lowerName}CreatingAtom, false);
	}
});

/**
 * Optimistic update atom with rollback support
 */
export const optimisticUpdate${modelName}Atom = atom(
	null,
	async (get, set, { id, data }: { id: string; data: ${modelName}UpdateInput }) => {
		const current${modelName} = get(base${pluralName}Atom)[id];
		if (!current${modelName}) {
			throw new Error("${modelName} not found");
		}

		// Create optimistic update with dynamic field handling
		const optimistic${modelName} = {
			...current${modelName},
			...data,
${optimisticUpdateFields}
		} as ${modelName};

		const optimisticUpdate: ${modelName}OptimisticUpdate = {
			id,
			data: optimistic${modelName},
			timestamp: Date.now(),
			operation: "update",
			originalData: current${modelName},
		};

		// Apply optimistic update
		set(base${pluralName}Atom, (draft) => {
			draft[id] = optimistic${modelName};
		});
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => ({
			...prev,
			[id]: optimisticUpdate,
		}));
		set(${lowerName}UpdatingAtom, (prev) => ({ ...prev, [id]: true }));
		set(${lowerPluralName}ErrorAtom, null);

		try {
			const updated${modelName} = await ${modelName}Actions.update({ where: { id }, data });

			// Update with server response
			set(base${pluralName}Atom, (draft) => {
				draft[id] = updated${modelName};
			});

			// Clean up optimistic tracking
			set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});

			return updated${modelName};
		} catch (error) {
			// Rollback optimistic update
			set(base${pluralName}Atom, (draft) => {
				draft[id] = current${modelName};
			});
			set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});

			const errorMessage = error instanceof Error ? error.message : "Failed to update ${lowerName}";
			set(${lowerPluralName}ErrorAtom, errorMessage);
			set(${lowerName}ErrorsAtom, (prev) => ({ ...prev, [id]: errorMessage }));
			set(lastErrorContextAtom, {
				operation: "update",
				timestamp: Date.now(),
				context: { error, id, data },
			});
			throw error;
		} finally {
			set(${lowerName}UpdatingAtom, (prev) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});
		}
	}
);

/**
 * Optimistic delete atom with rollback support
 */
export const optimisticDelete${modelName}Atom = atom(null, async (get, set, id: string) => {
	const ${lowerName}ToDelete = get(base${pluralName}Atom)[id];
	if (!${lowerName}ToDelete) {
		throw new Error("${modelName} not found");
	}

	const optimisticUpdate: ${modelName}OptimisticUpdate = {
		id,
		data: {},
		timestamp: Date.now(),
		operation: "delete",
		originalData: ${lowerName}ToDelete,
	};

	// Apply optimistic deletion
	set(base${pluralName}Atom, (draft) => {
		delete draft[id];
	});
	set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => ({
		...prev,
		[id]: optimisticUpdate,
	}));
	set(${lowerName}DeletingAtom, (prev) => ({ ...prev, [id]: true }));
	set(${lowerPluralName}ErrorAtom, null);

	try {
		await ${modelName}Actions.deleteRecord({ where: { id } });

		// Clean up optimistic tracking
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	} catch (error) {
		// Rollback: restore the deleted item
		set(base${pluralName}Atom, (draft) => {
			draft[id] = ${lowerName}ToDelete;
		});
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to delete ${lowerName}";
		set(${lowerPluralName}ErrorAtom, errorMessage);
		set(${lowerName}ErrorsAtom, (prev) => ({ ...prev, [id]: errorMessage }));
		set(lastErrorContextAtom, {
			operation: "delete",
			timestamp: Date.now(),
			context: { error, id },
		});
		throw error;
	} finally {
		set(${lowerName}DeletingAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	}
});

// ============================================================================
// BATCH OPERATION ATOMS - For bulk operations
// ============================================================================

/**
 * Batch create ${lowerPluralName} atom
 */
export const batchCreate${pluralName}Atom = atom(
	null,
	async (get, set, ${lowerPluralName}Data: ${modelName}CreateInput[]) => {
		set(${lowerName}CreatingAtom, true);
		set(${lowerPluralName}ErrorAtom, null);

		try {
			const result = await ${modelName}Actions.createMany({ data: ${lowerPluralName}Data });
			
			// Refresh data after batch create
			await set(refresh${pluralName}Atom, true);
			
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create ${lowerPluralName}";
			set(${lowerPluralName}ErrorAtom, errorMessage);
			set(lastErrorContextAtom, {
				operation: "batchCreate",
				timestamp: Date.now(),
				context: { error, ${lowerPluralName}Data },
			});
			throw error;
		} finally {
			set(${lowerName}CreatingAtom, false);
		}
	}
);

/**
 * Batch delete ${lowerPluralName} atom
 */
export const batchDelete${pluralName}Atom = atom(
	null,
	async (get, set, ids: string[]) => {
		// Store items for potential rollback
		const itemsToDelete = ids.map(id => get(base${pluralName}Atom)[id]).filter(Boolean);
		
		// Apply optimistic deletions
		set(base${pluralName}Atom, (draft) => {
			for (const id of ids) {
				delete draft[id];
			}
		});
		
		// Set loading states
		const loadingStates = Object.fromEntries(ids.map(id => [id, true]));
		set(${lowerName}DeletingAtom, (prev) => ({ ...prev, ...loadingStates }));
		set(${lowerPluralName}ErrorAtom, null);

		try {
			const result = await ${modelName}Actions.deleteMany({ where: { id: { in: ids } } });
			return result;
		} catch (error) {
			// Rollback: restore deleted items
			set(base${pluralName}Atom, (draft) => {
				for (const item of itemsToDelete) {
					draft[item.id] = item;
				}
			});

			const errorMessage = error instanceof Error ? error.message : "Failed to delete ${lowerPluralName}";
			set(${lowerPluralName}ErrorAtom, errorMessage);
			set(lastErrorContextAtom, {
				operation: "batchDelete",
				timestamp: Date.now(),
				context: { error, ids },
			});
			throw error;
		} finally {
			// Clear loading states
			set(${lowerName}DeletingAtom, (prev) => {
				const newState = { ...prev };
				for (const id of ids) {
					delete newState[id];
				}
				return newState;
			});
		}
	}
);
`;
  const filePath = join3(modelDir, "atoms.ts");
  await writeFile(filePath, template);
}

// src/templates/barrel.ts
import { join as join4 } from "node:path";
async function generateBarrelExports(config, context) {
  await Promise.all([
    generateEnhancedMainIndex(config, context),
    generateNamespacedTypes(config, context),
    generateStoreSetup(config, context)
  ]);
}
async function generateModelBarrelExport(modelName, context) {
  const lowerName = modelName.toLowerCase();
  const pluralName = capitalize(plural2(modelName));
  const lowerPluralName = plural2(lowerName);
  const template = `${formatGeneratedFileHeader()}// Barrel export for ${modelName} module

// Export namespace as default
export { ${lowerPluralName} } from './namespace';

// Export all individual pieces for direct import
export * from './types';
export * from './actions';
export * from './atoms';
export * from './hooks';
// Note: routes are not exported to avoid naming conflicts in barrel exports

// Named exports for convenience
export {
  // Types
  type ${modelName},
  type ${modelName}CreateInput,
  type ${modelName}UpdateInput,
  type ${modelName}FormData,
  
  // Schemas
  ${modelName}CreateInputSchema,
  ${modelName}UpdateInputSchema,
} from './types';

export {
  // Core CRUD actions
  findMany,
  findUnique,
  findFirst,
  create,
  update,
  deleteRecord,
  upsert,
  createMany,
  updateMany,
  deleteMany,
  
  // Utility actions
  exists,
  count,
  aggregate,
  groupBy,
} from './actions';

export {
  // Hooks
  use${pluralName},
  use${modelName},
  use${modelName}Form,
} from './hooks';

`;
  const filePath = join4(context.outputDir, lowerName, "index.ts");
  await writeFile(filePath, template);
}
async function generateEnhancedMainIndex(config, context) {
  await Promise.all(config.models.map(async (modelName) => {
    await generateModelBarrelExport(modelName, context);
  }));
  const modelExports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const lowerPluralName = plural2(lowerName);
    return `// ${modelName} namespace export
import { ${lowerPluralName} } from './${lowerName}/namespace';
export { ${lowerPluralName} };
export { ${lowerPluralName} as ${lowerName} }; // Convenience alias`;
  }).join(`

`);
  const template = `${formatGeneratedFileHeader()}// Enhanced Next Prisma Flow v0.2.0 - Model-specific namespace exports
// Modern, intuitive developer experience with smart API patterns

${modelExports}

// Global utilities
export * from './store';
export * from './types';

// Flow Provider for SSR, state management, and error handling
export { 
  FlowProvider,
  useFlowContext,
  useFlowConfig,
  useFlowUser,
  useFlowStore,
  useFlowErrorBoundary,
  useFlowDebug
} from './flow-provider';
export type { 
  FlowProviderProps
} from './flow-provider';
export type { 
  FlowContextValue,
  FlowDebugInfo,
  FlowErrorBoundaryRef
} from './flow-context';
export type { 
  FlowConfig,
  DEFAULT_FLOW_CONFIG,
  createFlowConfig,
  validateFlowConfig
} from './flow-config';
`;
  const filePath = join4(context.outputDir, "index.ts");
  await writeFile(filePath, template);
}
async function generateNamespacedTypes(config, context) {
  const typeExports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    return `export * from './${lowerName}/types';`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}// Consolidated type exports for all models

${typeExports}

// Common utility types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
}

export interface ListApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MutationResponse<T = any> extends ApiResponse<T> {
  // Specific to mutations
}

export interface BatchResponse extends ApiResponse {
  count: number;
}

// Form types
export interface FormField<T = any> {
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  error?: string;
  required: boolean;
  name: string;
}

export interface FormState<T = any> {
  data: Partial<T>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  loading: boolean;
  error: Error | null;
}

// Optimistic update types
export interface OptimisticUpdate<T = any> {
  id: string;
  data: Partial<T>;
  timestamp: number;
  operation: 'create' | 'update' | 'delete';
}

// State management types
export interface LoadingStates {
  [key: string]: boolean;
}

export interface EntityState<T = any> {
  items: Record<string, T>;
  loading: boolean;
  creating: boolean;
  updating: LoadingStates;
  deleting: LoadingStates;
  error: string | null;
  optimisticUpdates: Record<string, OptimisticUpdate<T>>;
}
`;
  const filePath = join4(context.outputDir, "types.ts");
  await writeFile(filePath, template);
}
async function generateStoreSetup(config, context) {
  const atomImports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `import {
  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,
} from './${lowerName}/atoms';`;
  }).join(`
`);
  const atomExports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `  ${lowerName}: {
    data: base${pluralName}Atom,
    loading: ${lowerPluralName}LoadingAtom,
    error: ${lowerPluralName}ErrorAtom,
  },`;
  }).join(`
`);
  const clearDataStatements = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `  flowStore.set(base${pluralName}Atom, {});
  flowStore.set(${lowerPluralName}LoadingAtom, false);
  flowStore.set(${lowerPluralName}ErrorAtom, null);`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}// Enhanced store setup for all Flow atoms
// Provides utilities for global state management and debugging

import { createStore } from 'jotai';
${atomImports}

// Create a store instance for SSR/testing if needed
export const flowStore = createStore();

// Organized atom access by model
export const flowAtoms = {
${atomExports}
};

// Utility function to clear all data (useful for logout, testing, etc.)
export function clearAllFlowData() {
${clearDataStatements}
}

// Utility function to check if any data is loading
export function isAnyFlowDataLoading(): boolean {
  return Object.values(flowAtoms).some(model => 
    flowStore.get(model.loading)
  );
}

// Utility function to get all errors
export function getAllFlowErrors(): Record<string, string | null> {
  return Object.fromEntries(
    Object.entries(flowAtoms).map(([modelName, atoms]) => [
      modelName,
      flowStore.get(atoms.error)
    ])
  );
}

// Enhanced debugging utilities
export function getFlowDebugInfo() {
  const errors = getAllFlowErrors();
  const isLoading = isAnyFlowDataLoading();
  const hasErrors = Object.values(errors).some(Boolean);
  
  return {
    isLoading,
    hasErrors,
    errors,
    models: Object.keys(flowAtoms),
    timestamp: new Date().toISOString(),
  };
}

// Development helpers
export function logFlowState() {
  if (process.env.NODE_ENV === 'development') {
    console.group('\uD83C\uDF0A Flow State Debug');
    console.log('Debug Info:', getFlowDebugInfo());
    console.log('Store:', flowStore);
    console.groupEnd();
  }
}

// Type for the complete state shape
export interface FlowState {
${config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `  ${lowerPluralName}: ReturnType<typeof base${pluralName}Atom['read']>;
  ${lowerPluralName}Loading: boolean;
  ${lowerPluralName}Error: string | null;`;
  }).join(`
`)}
}

// Utility to get complete state snapshot
export function getFlowSnapshot(): FlowState {
  return {
${config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `    ${lowerPluralName}: flowStore.get(base${pluralName}Atom),
    ${lowerPluralName}Loading: flowStore.get(${lowerPluralName}LoadingAtom),
    ${lowerPluralName}Error: flowStore.get(${lowerPluralName}ErrorAtom),`;
  }).join(`
`)}
  };
}

// React DevTools integration (if available)
if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  (window as any).__FLOW_DEBUG__ = {
    store: flowStore,
    atoms: flowAtoms,
    getState: getFlowSnapshot,
    getDebugInfo: getFlowDebugInfo,
    clearAll: clearAllFlowData,
  };
}
`;
  const filePath = join4(context.outputDir, "store.ts");
  await writeFile(filePath, template);
}

// src/templates/cache.ts
function generateCacheTemplate(context) {
  const { config } = context;
  if (config.cacheUtilsPath?.trim()) {
    return `export * from "${config.cacheUtilsPath}";
`;
  }
  return `export const invalidateTag = (tag: string) => {
	console.log("invalidating tag", tag);
};
`;
}

// src/templates/flow-provider.ts
import { join as join5 } from "node:path";
async function generateFlowProvider(config, context) {
  await Promise.all([
    generateFlowProviderComponent(config, context),
    generateFlowContext(config, context),
    generateFlowConfig(config, context)
  ]);
}
async function generateFlowProviderComponent(config, context) {
  const modelAtomImports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `import {
  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,
} from './${lowerName}/atoms';`;
  }).join(`
`);
  const initialDataTypes = config.models.map((modelName) => `${modelName.toLowerCase()}: Record<string, ${modelName}>`).join(`;
  `);
  const storeInitialization = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `  // Initialize ${modelName} state
  if (initialData?.${lowerPluralName}) {
    store.set(base${pluralName}Atom, initialData.${lowerPluralName});
  }`;
  }).join(`
`);
  const debugAtoms = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(lowerName);
    return `    ${lowerName}: {
      data: base${pluralName}Atom,
      loading: ${lowerPluralName}LoadingAtom,
      error: ${lowerPluralName}ErrorAtom,
    },`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { DevTools } from 'jotai-devtools';
${modelAtomImports}
import type { FlowConfig, FlowContextValue, FlowState, FlowErrorBoundaryRef } from './flow-config';

// ============================================================================
// PROVIDER PROPS & CONTEXT
// ============================================================================

export interface FlowProviderProps {
  children: React.ReactNode;
  
  // SSR/Initial state support
  initialData?: Partial<FlowState>;
  
  // Global configuration
  config?: Partial<FlowConfig>;
  
  // Auth/User context
  user?: any | null;
  
  // Global event handlers
  onError?: (error: Error, context: string, modelName?: string) => void;
  onLoading?: (isLoading: boolean, modelName?: string) => void;
  
  // Store customization (for testing/SSR)
  store?: ReturnType<typeof createStore>;
}

const FlowContext = createContext<FlowContextValue | null>(null);

// ============================================================================
// FLOW PROVIDER COMPONENT
// ============================================================================

export function FlowProvider({
  children,
  initialData,
  config: userConfig,
  user,
  onError,
  onLoading,
  store: externalStore,
}: FlowProviderProps) {
  // Create or use provided store
  const store = useMemo(() => {
    const storeInstance = externalStore || createStore();
    
${storeInitialization}
    
    return storeInstance;
  }, [externalStore, initialData]);

  // Merge user config with defaults
  const config = useMemo((): FlowConfig => ({
    errorBoundary: true,
    devTools: process.env.NODE_ENV === 'development',
    autoRefresh: false,
    refreshInterval: 30000,
    ssrSafe: true,
    batchUpdates: true,
    optimisticUpdates: true,
    ...userConfig,
  }), [userConfig]);

  // Error boundary ref for programmatic error handling
  const errorBoundaryRef = useRef<FlowErrorBoundaryRef | null>(null);

  // Global error handler
  const handleError = useMemo(() => (error: Error, context: string, modelName?: string) => {
    console.error(\`[Flow Error] \${context}\${modelName ? \` (\${modelName})\` : ''}\`, error);
    
    if (onError) {
      onError(error, context, modelName);
    }
    
    // You could also report to error tracking service here
    // reportError(error, { context, modelName, user: user?.id });
  }, [onError, user]);

  // Context value
  const contextValue = useMemo((): FlowContextValue => ({
    config,
    user,
    store,
    onError: handleError,
    onLoading,
    errorBoundaryRef,
    // Utility methods
    clearAllData: () => {
${config.models.map((modelName) => {
    const pluralName = capitalize(plural2(modelName));
    const lowerPluralName = plural2(modelName.toLowerCase());
    return `      store.set(base${pluralName}Atom, {});
      store.set(${lowerPluralName}LoadingAtom, false);
      store.set(${lowerPluralName}ErrorAtom, null);`;
  }).join(`
`)}
    },
    getDebugInfo: () => ({
      config,
      user: user ? { id: user.id, email: user.email } : null,
      hasErrors: Object.values({
${config.models.map((modelName) => {
    const lowerPluralName = plural2(modelName.toLowerCase());
    return `        ${modelName.toLowerCase()}: store.get(${lowerPluralName}ErrorAtom),`;
  }).join(`
`)}
      }).some(Boolean),
      isLoading: Object.values({
${config.models.map((modelName) => {
    const lowerPluralName = plural2(modelName.toLowerCase());
    return `        ${modelName.toLowerCase()}: store.get(${lowerPluralName}LoadingAtom),`;
  }).join(`
`)}
      }).some(Boolean),
      timestamp: new Date().toISOString(),
    }),
  }), [config, user, store, handleError, onLoading]);

  // Development helpers
  useEffect(() => {
    if (config.devTools && typeof window !== 'undefined') {
      // Expose debug utilities to window for development
      (window as any).__FLOW_DEBUG__ = {
        store,
        context: contextValue,
        atoms: {
${debugAtoms}
        },
      };
      
      console.log('\uD83C\uDF0A Flow Provider initialized with debug tools');
      console.log('Available at: window.__FLOW_DEBUG__');
    }
  }, [config.devTools, store, contextValue]);

  return (
    <FlowContext.Provider value={contextValue}>
      <JotaiProvider store={store}>
        {config.errorBoundary ? (
          <FlowErrorBoundary 
            ref={errorBoundaryRef}
            onError={handleError}
            fallback={config.errorFallback}
          >
            {config.devTools && <DevTools />}
            {children}
          </FlowErrorBoundary>
        ) : (
          <>
            {config.devTools && <DevTools />}
            {children}
          </>
        )}
      </JotaiProvider>
    </FlowContext.Provider>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface FlowErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error, context: string) => void;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

const FlowErrorBoundary = forwardRef<FlowErrorBoundaryRef, FlowErrorBoundaryProps>(
  function FlowErrorBoundary(props, ref) {
    const [state, setState] = React.useState<{ hasError: boolean; error: Error | null }>({
      hasError: false,
      error: null,
    });

    const reset = React.useCallback(() => {
      setState({ hasError: false, error: null });
    }, []);

    useImperativeHandle(ref, () => ({
      reset,
    }), [reset]);

    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        setState({ hasError: true, error: new Error(event.message) });
        props.onError(new Error(event.message), 'Global Error Handler');
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        setState({ hasError: true, error });
        props.onError(error, 'Unhandled Promise Rejection');
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, [props]);

    if (state.hasError && state.error) {
      const FallbackComponent = props.fallback || DefaultErrorFallback;
      return React.createElement(FallbackComponent, { error: state.error, reset });
    }

    return React.createElement(React.Fragment, null, props.children);
  }
);

// Default error fallback component
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      padding: '2rem',
      margin: '1rem',
      border: '2px solid #ef4444',
      borderRadius: '0.5rem',
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    }}>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Something went wrong
      </h2>
      <details style={{ marginBottom: '1rem' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
          Error details
        </summary>
        <pre style={{ 
          fontSize: '0.875rem', 
          overflow: 'auto', 
          padding: '0.5rem',
          backgroundColor: '#fee2e2',
          borderRadius: '0.25rem'
        }}>
          {error.message}
        </pre>
      </details>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}

// ============================================================================
// CONTEXT HOOKS
// ============================================================================

export function useFlowContext(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
}

export function useFlowConfig(): FlowConfig {
  return useFlowContext().config;
}

export function useFlowUser<T = any>(): T | null {
  return useFlowContext().user;
}

export function useFlowStore() {
  return useFlowContext().store;
}

export function useFlowErrorBoundary() {
  const { errorBoundaryRef, onError } = useFlowContext();
  
  return {
    reset: () => errorBoundaryRef.current?.reset?.(),
    reportError: (error: Error, context: string) => onError(error, context),
  };
}

// Development helper hook
export function useFlowDebug() {
  const context = useFlowContext();
  
  return {
    getDebugInfo: context.getDebugInfo,
    clearAllData: context.clearAllData,
    store: context.store,
    config: context.config,
  };
}
`;
  const filePath = join5(context.outputDir, "flow-provider.tsx");
  await writeFile(filePath, template);
}
async function generateFlowContext(config, context) {
  const template = `${formatGeneratedFileHeader()}// Flow context type definitions and utilities

import type { createStore } from 'jotai';
import type { FlowConfig, FlowState } from './flow-config';

// ============================================================================
// ERROR BOUNDARY REF TYPE
// ============================================================================

export interface FlowErrorBoundaryRef {
  reset: () => void;
}

// ============================================================================
// CONTEXT VALUE TYPE
// ============================================================================

export interface FlowContextValue {
  // Configuration
  config: FlowConfig;
  
  // User/Auth context
  user: any | null;
  
  // Jotai store instance
  store: ReturnType<typeof createStore>;
  
  // Event handlers
  onError: (error: Error, context: string, modelName?: string) => void;
  onLoading?: (isLoading: boolean, modelName?: string) => void;
  
  // Error boundary ref
  errorBoundaryRef: React.MutableRefObject<FlowErrorBoundaryRef | null>;
  
  // Utility methods
  clearAllData: () => void;
  getDebugInfo: () => FlowDebugInfo;
}

// ============================================================================
// DEBUG INFO TYPE
// ============================================================================

export interface FlowDebugInfo {
  config: FlowConfig;
  user: { id: string; email?: string } | null;
  hasErrors: boolean;
  isLoading: boolean;
  timestamp: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FlowErrorHandler = (error: Error, context: string, modelName?: string) => void;
export type FlowLoadingHandler = (isLoading: boolean, modelName?: string) => void;

export interface FlowErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export type FlowErrorFallbackComponent = React.ComponentType<FlowErrorFallbackProps>;
`;
  const filePath = join5(context.outputDir, "flow-context.ts");
  await writeFile(filePath, template);
}
async function generateFlowConfig(config, context) {
  const stateTypeFields = config.models.map((modelName) => {
    const lowerPluralName = plural2(modelName.toLowerCase());
    return `  ${lowerPluralName}: Record<string, ${modelName}>;
  ${lowerPluralName}Loading: boolean;
  ${lowerPluralName}Error: string | null;`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}// Flow configuration types and state definitions

import type React from 'react';
${config.models.map((model) => `import type { ${model} } from './${model.toLowerCase()}/types';`).join(`
`)}

// ============================================================================
// FLOW CONFIGURATION
// ============================================================================

export interface FlowConfig {
  // Error handling
  errorBoundary: boolean;
  errorFallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  
  // Development tools
  devTools: boolean;
  
  // Auto-refresh configuration
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  
  // SSR/Hydration
  ssrSafe: boolean;
  
  // Performance optimizations
  batchUpdates: boolean;
  optimisticUpdates: boolean;
  
  // Custom settings
  [key: string]: any;
}

// ============================================================================
// FLOW STATE TYPE
// ============================================================================

export interface FlowState {
${stateTypeFields}
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_FLOW_CONFIG: FlowConfig = {
  errorBoundary: true,
  devTools: process.env.NODE_ENV === 'development',
  autoRefresh: false,
  refreshInterval: 30000,
  ssrSafe: true,
  batchUpdates: true,
  optimisticUpdates: true,
};

// ============================================================================
// CONFIGURATION HELPERS
// ============================================================================

export function createFlowConfig(userConfig?: Partial<FlowConfig>): FlowConfig {
  return {
    ...DEFAULT_FLOW_CONFIG,
    ...userConfig,
  };
}

export function validateFlowConfig(config: Partial<FlowConfig>): string[] {
  const errors: string[] = [];
  
  if (config.refreshInterval !== undefined && config.refreshInterval < 1000) {
    errors.push('refreshInterval must be at least 1000ms');
  }
  
  if (config.errorBoundary === false && config.errorFallback) {
    errors.push('errorFallback requires errorBoundary to be true');
  }
  
  return errors;
}

// ============================================================================
// TYPE EXPORTS FOR CONVENIENCE
// ============================================================================

export type { FlowContextValue, FlowDebugInfo, FlowErrorBoundaryRef } from './flow-context';
`;
  const filePath = join5(context.outputDir, "flow-config.ts");
  await writeFile(filePath, template);
}

// src/templates/hooks.ts
import { join as join6 } from "node:path";
async function generateReactHooks(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import * as React from "react";
import {
	batchCreate${pluralName}Atom,
	batchDelete${pluralName}Atom,
	clearAllErrorsAtom,
	clear${modelName}ErrorAtom,
	hasAnyErrorAtom,
	isAnyLoadingAtom,
	is${pluralName}EmptyAtom,
	optimisticCreate${modelName}Atom,
	optimisticDelete${modelName}Atom,
	optimisticUpdate${modelName}Atom,
	// Action atoms
	refresh${pluralName}Atom,
	// Individual ${lowerName} atoms
	${lowerName}ByIdAtom,
	// Derived atoms
	${lowerName}CountAtom,
	${lowerName}CreatingAtom,
	${lowerName}DeletingAtom,
	${lowerName}ErrorsAtom,
	${lowerName}ExistsAtom,
	${lowerName}ListAtom,
	${lowerName}LoadingStateAtom,
	// Error atoms
	${lowerPluralName}ErrorAtom,
	// Loading atoms
	${lowerPluralName}LoadingAtom,
	${lowerName}UpdatingAtom,
} from "./atoms";
import type {
	${modelName},
	${modelName}CreateInput,
	${modelName}UpdateInput,
	Use${modelName}Result,
	Use${pluralName}Result,
} from "./types";

// ============================================================================
// UNIFIED ${pluralName.toUpperCase()} HOOK - Primary interface for ${modelName} management
// ============================================================================

/**
 * Unified hook providing comprehensive ${modelName} management functionality.
 * This is the primary hook developers should use for most ${modelName} operations.
 *
 * @returns Complete ${modelName} management interface with CRUD operations
 */
export function use${pluralName}(): Use${pluralName}Result {
	// Data atoms
	const data = useAtomValue(${lowerName}ListAtom);
	const count = useAtomValue(${lowerName}CountAtom);
	const isEmpty = useAtomValue(is${pluralName}EmptyAtom);

	// Loading state atoms
	const loading = useAtomValue(${lowerPluralName}LoadingAtom);
	const isCreating = useAtomValue(${lowerName}CreatingAtom);
	const updating = useAtomValue(${lowerName}UpdatingAtom);
	const deleting = useAtomValue(${lowerName}DeletingAtom);
	const isAnyLoading = useAtomValue(isAnyLoadingAtom);

	// Error state atoms
	const error = useAtomValue(${lowerPluralName}ErrorAtom);
	const hasError = useAtomValue(hasAnyErrorAtom);

	// Action atoms
	const refresh = useSetAtom(refresh${pluralName}Atom);
	const create${modelName}Action = useSetAtom(optimisticCreate${modelName}Atom);
	const update${modelName}Action = useSetAtom(optimisticUpdate${modelName}Atom);
	const delete${modelName}Action = useSetAtom(optimisticDelete${modelName}Atom);
	const batchCreateAction = useSetAtom(batchCreate${pluralName}Atom);
	const batchDeleteAction = useSetAtom(batchDelete${pluralName}Atom);
	const clearError = useSetAtom(clearAllErrorsAtom);

	// Memoized CRUD operations
	const create${modelName} = useCallback(
		async (input: ${modelName}CreateInput): Promise<${modelName}> => {
			return await create${modelName}Action(input);
		},
		[create${modelName}Action],
	);

	const update${modelName} = useCallback(
		async (id: string, input: ${modelName}UpdateInput): Promise<${modelName}> => {
			return await update${modelName}Action({ id, data: input });
		},
		[update${modelName}Action],
	);

	const delete${modelName} = useCallback(
		async (id: string): Promise<void> => {
			await delete${modelName}Action(id);
		},
		[delete${modelName}Action],
	);

	// Memoized batch operations
	const createMany = useCallback(
		async (inputs: ${modelName}CreateInput[]): Promise<{ count: number }> => {
			return await batchCreateAction(inputs);
		},
		[batchCreateAction],
	);

	const deleteMany = useCallback(
		async (ids: string[]): Promise<{ count: number }> => {
			return await batchDeleteAction(ids);
		},
		[batchDeleteAction],
	);

	// Loading state helpers
	const isUpdating = useCallback((id: string): boolean => updating[id] || false, [updating]);

	const isDeleting = useCallback((id: string): boolean => deleting[id] || false, [deleting]);

	// Auto-refresh on mount
	useEffect(() => {
		refresh();
	}, [refresh]);

	// Memoized optimistic updates info
	const optimisticUpdates = useMemo(() => {
		const result: Record<string, boolean> = {};
		for (const id of Object.keys(updating)) {
			result[id] = updating[id] || false;
		}
		for (const id of Object.keys(deleting)) {
			result[id] = deleting[id] || false;
		}
		return result;
	}, [updating, deleting]);

	return {
		// Data
		data,
		loading,
		error,
		count,
		isEmpty,

		// CRUD operations
		create${modelName},
		update${modelName},
		delete${modelName},

		// Batch operations
		createMany,
		deleteMany,

		// State management
		refresh: () => refresh(true), // Force refresh
		clearError,

		// Loading states for individual operations
		isCreating,
		isUpdating,
		isDeleting,

		// Optimistic updates info
		optimisticUpdates,
	};
}

// ============================================================================
// INDIVIDUAL ${modelName.toUpperCase()} HOOK - For working with specific ${lowerPluralName}
// ============================================================================

/**
 * Hook for managing a specific ${modelName} by ID.
 * Provides focused operations for individual ${lowerPluralName}.
 *
 * @param id - ${modelName} ID to manage
 * @returns Individual ${modelName} management interface
 */
export function use${modelName}(id: string): Use${modelName}Result {
	// Data atoms for this specific ${lowerName}
	const data = useAtomValue(${lowerName}ByIdAtom(id));
	const exists = useAtomValue(${lowerName}ExistsAtom(id));
	const loadingState = useAtomValue(${lowerName}LoadingStateAtom(id));
	const error = useAtomValue(${lowerName}ErrorsAtom)[id] || null;

	// Action atoms
	const update${modelName}Action = useSetAtom(optimisticUpdate${modelName}Atom);
	const delete${modelName}Action = useSetAtom(optimisticDelete${modelName}Atom);
	const clear${modelName}Error = useSetAtom(clear${modelName}ErrorAtom(id));

	// Memoized operations
	const update = useCallback(
		async (input: ${modelName}UpdateInput): Promise<${modelName}> => {
			return await update${modelName}Action({ id, data: input });
		},
		[id, update${modelName}Action],
	);

	const delete${modelName} = useCallback(async (): Promise<void> => {
		await delete${modelName}Action(id);
	}, [id, delete${modelName}Action]);

	return {
		// Data
		data,
		loading: loadingState.isLoading,
		error,
		exists,

		// Operations
		update,
		delete: delete${modelName},

		// State
		isUpdating: loadingState.updating,
		isDeleting: loadingState.deleting,
		isOptimistic: loadingState.hasOptimisticUpdate,
	};
}

// ============================================================================
// REACT HOOK FORM INTEGRATION
// ============================================================================

/**
 * React Hook Form wrapper with sensible defaults and Flow integration.
 * Provides a clean API for form handling while allowing full customization.
 *
 * @param operation - The operation type: 'create' or 'update'
 * @param config - Optional react-hook-form configuration
 * @param options - Additional Flow-specific options
 * @returns Enhanced useForm hook with Flow integration
 */
export function use${modelName}Form(
	operation: 'create' | 'update',
	config?: any,
	options?: {
		onSuccess?: (data: ${modelName}) => void;
		onError?: (error: Error) => void;
		autoSubmit?: boolean;
		optimisticUpdates?: boolean;
	}
) {
	// Action atoms
	const create${modelName}Action = useSetAtom(optimisticCreate${modelName}Atom);
	const update${modelName}Action = useSetAtom(optimisticUpdate${modelName}Atom);
	
	// Loading and error states
	const isCreating = useAtomValue(${lowerName}CreatingAtom);
	const updating = useAtomValue(${lowerName}UpdatingAtom);
	const globalError = useAtomValue(${lowerPluralName}ErrorAtom);

	// Default form configuration with Flow-specific defaults
	const defaultConfig = {
		mode: 'onBlur' as const,
		defaultValues: operation === 'create' ? {} : undefined,
		...config,
	};

	// Import useForm dynamically to avoid build errors if react-hook-form isn't installed
	const [useForm, setUseForm] = React.useState<any>(null);
	
	React.useEffect(() => {
		import('react-hook-form').then((rhf) => {
			setUseForm(() => rhf.useForm);
		}).catch(() => {
			console.warn(
				'react-hook-form is not installed. Please install it to use ${modelName}Form: npm install react-hook-form'
			);
		});
	}, []);

	const form = useForm ? useForm(defaultConfig) : null;

	// Enhanced submit handler with Flow integration
	const handleSubmit = React.useCallback(
		async (data: any) => {
			if (!form) return;
			
			try {
				let result: ${modelName};
				
				if (operation === 'create') {
					result = await create${modelName}Action(data);
				} else {
					// For updates, we need the ID from the form data or options
					const id = data.id || config?.defaultValues?.id;
					if (!id) {
						throw new Error('ID is required for update operations');
					}
					result = await update${modelName}Action({ id, data });
				}
				
				options?.onSuccess?.(result);
				
				// Reset form on successful create
				if (operation === 'create') {
					form.reset();
				}
				
				return result;
			} catch (error) {
				const errorObj = error instanceof Error ? error : new Error(String(error));
				options?.onError?.(errorObj);
				throw errorObj;
			}
		},
		[form, operation, create${modelName}Action, update${modelName}Action, options, config]
	);

	if (!form) {
		return {
			loading: true,
			error: new Error('react-hook-form is loading or not installed'),
			form: null,
			handleSubmit: () => Promise.reject(new Error('Form not ready')),
		};
	}

	return {
		// Pass through the react-hook-form instance
		...form,
		
		// Enhanced with Flow-specific properties
		loading: operation === 'create' ? isCreating : updating[config?.defaultValues?.id] || false,
		error: globalError ? new Error(globalError) : null,
		
		// Enhanced submit handler
		handleSubmit: form.handleSubmit(handleSubmit),
		
		// Convenience methods
		submitWithFlow: handleSubmit,
		operation,
	};
}

// ============================================================================
// UTILITY HOOKS - Helper hooks for specific use cases
// ============================================================================

/**
 * Hook to check if any ${lowerPluralName} are currently loading
 */
export function useIsAny${modelName}Loading(): boolean {
	return useAtomValue(isAnyLoadingAtom);
}

/**
 * Hook to check if there are any ${lowerName} errors
 */
export function useHas${modelName}Errors(): boolean {
	return useAtomValue(hasAnyErrorAtom);
}

/**
 * Hook to get ${lowerName} count
 */
export function use${modelName}Count(): number {
	return useAtomValue(${lowerName}CountAtom);
}

/**
 * Hook to check if ${lowerPluralName} list is empty
 */
export function useIs${pluralName}Empty(): boolean {
	return useAtomValue(is${pluralName}EmptyAtom);
}

// ============================================================================
// SPECIALIZED FORM HOOKS - Convenience wrappers for common use cases
// ============================================================================

/**
 * Specialized hook for creating ${lowerPluralName}
 * Convenience wrapper around useForm with create operation
 */
export function useCreate${modelName}Form(
	config?: any,
	options?: {
		onSuccess?: (data: ${modelName}) => void;
		onError?: (error: Error) => void;
		autoSubmit?: boolean;
		optimisticUpdates?: boolean;
	}
) {
	return use${modelName}Form('create', config, options);
}

/**
 * Specialized hook for updating ${lowerPluralName}
 * Convenience wrapper around useForm with update operation
 */
export function useUpdate${modelName}Form(
	id: string,
	initialData?: Partial<${modelName}>,
	config?: any,
	options?: {
		onSuccess?: (data: ${modelName}) => void;
		onError?: (error: Error) => void;
		autoSubmit?: boolean;
		optimisticUpdates?: boolean;
	}
) {
	const formConfig = {
		...config,
		defaultValues: {
			id,
			...initialData,
			...config?.defaultValues,
		},
	};
	
	return use${modelName}Form('update', formConfig, options);
}
`;
  const filePath = join6(modelDir, "hooks.ts");
  await writeFile(filePath, template);
}

// src/templates/namespace.ts
import { join as join7 } from "node:path";

// src/relationship-functions.ts
function getRelationshipExportNames(ownsRelations, referencedBy) {
  const exports = [];
  for (const rel of ownsRelations) {
    const functionNameSuffix = rel.relatedModel;
    if (rel.type === "many-to-one" || rel.type === "one-to-one") {
      exports.push(`set${functionNameSuffix}`);
      if (!rel.isRequired) {
        exports.push(`remove${functionNameSuffix}`);
      }
    } else if (rel.type === "many-to-many") {
      exports.push(`add${functionNameSuffix}s`);
      exports.push(`set${functionNameSuffix}s`);
      exports.push(`remove${functionNameSuffix}s`);
      exports.push(`clear${functionNameSuffix}s`);
    }
  }
  return exports;
}

// src/templates/namespace.ts
async function generateNamespaceExports(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName, analyzed } = modelInfo;
  const relationshipExports = getRelationshipExportNames(analyzed.relationships.owns, analyzed.relationships.referencedBy);
  const template = `${formatGeneratedFileHeader()}// ============================================================================
// IMPORT ALL MODULES - Centralized imports for re-export
// ============================================================================

// Action imports
import * as ${modelName}ActionsModule from "./actions";

// Atom imports
import * as ${modelName}AtomsModule from "./atoms";

// Hook imports
import * as ${modelName}HooksModule from "./hooks";

// Type imports
import * as ${modelName}TypesModule from "./types";

// Route function imports (these would be used in actual route files)
import * as ${modelName}RoutesModule from "./routes";

// ============================================================================
// ACTIONS NAMESPACE - Server actions for data operations
// ============================================================================

export const actions = {
	// Read operations
	findMany: ${modelName}ActionsModule.findMany,
	findUnique: ${modelName}ActionsModule.findUnique,
	findFirst: ${modelName}ActionsModule.findFirst,
	count: ${modelName}ActionsModule.count,
	exists: ${modelName}ActionsModule.exists,

	// Create operations
	create: ${modelName}ActionsModule.create,
	createMany: ${modelName}ActionsModule.createMany,

	// Update operations
	update: ${modelName}ActionsModule.update,
	updateMany: ${modelName}ActionsModule.updateMany,

	// Delete operations
	deleteRecord: ${modelName}ActionsModule.deleteRecord,
	deleteMany: ${modelName}ActionsModule.deleteMany,

	// Upsert operations
	upsert: ${modelName}ActionsModule.upsert${relationshipExports.length > 0 ? `,

	// Relationship operations
	${relationshipExports.map((exportName) => `${exportName}: ${modelName}ActionsModule.${exportName}`).join(`,
	`)}` : ""},
} as const;

// ============================================================================
// ATOMS NAMESPACE - Jotai state management atoms
// ============================================================================

/**
 * Jotai atoms for ${modelName} state management with optimistic updates.
 * Provides reactive state with automatic UI synchronization.
 */
export const atoms = {
	// Base state atoms
	base: ${modelName}AtomsModule.base${pluralName}Atom,
	list: ${modelName}AtomsModule.${lowerName}ListAtom,

	// Loading state atoms
	loading: {
		global: ${modelName}AtomsModule.${lowerPluralName}LoadingAtom,
		creating: ${modelName}AtomsModule.${lowerName}CreatingAtom,
		updating: ${modelName}AtomsModule.${lowerName}UpdatingAtom,
		deleting: ${modelName}AtomsModule.${lowerName}DeletingAtom,
		pagination: ${modelName}AtomsModule.${lowerPluralName}PaginationLoadingAtom,
		any: ${modelName}AtomsModule.isAnyLoadingAtom,
	},

	// Error state atoms
	errors: {
		global: ${modelName}AtomsModule.${lowerPluralName}ErrorAtom,
		individual: ${modelName}AtomsModule.${lowerName}ErrorsAtom,
		lastContext: ${modelName}AtomsModule.lastErrorContextAtom,
		hasAny: ${modelName}AtomsModule.hasAnyErrorAtom,
	},

	// Derived state atoms
	derived: {
		count: ${modelName}AtomsModule.${lowerName}CountAtom,
		isEmpty: ${modelName}AtomsModule.is${pluralName}EmptyAtom,
	},

	// Individual ${lowerName} atom factories
	individual: {
		byId: ${modelName}AtomsModule.${lowerName}ByIdAtom,
		exists: ${modelName}AtomsModule.${lowerName}ExistsAtom,
		loadingState: ${modelName}AtomsModule.${lowerName}LoadingStateAtom,
	},

	// Action atoms for mutations
	actions: {
		refresh: ${modelName}AtomsModule.refresh${pluralName}Atom,
		optimisticCreate: ${modelName}AtomsModule.optimisticCreate${modelName}Atom,
		optimisticUpdate: ${modelName}AtomsModule.optimisticUpdate${modelName}Atom,
		optimisticDelete: ${modelName}AtomsModule.optimisticDelete${modelName}Atom,
		batchCreate: ${modelName}AtomsModule.batchCreate${pluralName}Atom,
		batchDelete: ${modelName}AtomsModule.batchDelete${pluralName}Atom,
	},

	// Utility atoms
	utils: {
		clearAllErrors: ${modelName}AtomsModule.clearAllErrorsAtom,
		clearTodoError: ${modelName}AtomsModule.clear${modelName}ErrorAtom,
	},

	// Metadata atoms
	metadata: {
		lastFetch: ${modelName}AtomsModule.lastFetchTimestampAtom,
		cache: ${modelName}AtomsModule.cacheMetadataAtom,
		optimisticUpdates: ${modelName}AtomsModule.optimisticUpdatesAtom,
		tempIds: ${modelName}AtomsModule.temp${modelName}IdsAtom,
	},
} as const;

// ============================================================================
// HOOKS NAMESPACE - React hooks for component integration
// ============================================================================

/**
 * React hooks for ${modelName} management with optimistic updates and form integration.
 * Provides declarative state management for React components.
 */
export const hooks = {
	// Primary hooks for most use cases
	use${pluralName}: ${modelName}HooksModule.use${pluralName},
	use${modelName}: ${modelName}HooksModule.use${modelName},

	// React Hook Form integration
	useForm: ${modelName}HooksModule.use${modelName}Form,
	
	// Specialized form hooks
	useCreate${modelName}Form: ${modelName}HooksModule.useCreate${modelName}Form,
	useUpdate${modelName}Form: ${modelName}HooksModule.useUpdate${modelName}Form,

	// Utility hooks for specific states
	utils: {
		useIsAnyLoading: ${modelName}HooksModule.useIsAny${modelName}Loading,
		useHasErrors: ${modelName}HooksModule.useHas${modelName}Errors,
		useCount: ${modelName}HooksModule.use${modelName}Count,
		useIsEmpty: ${modelName}HooksModule.useIs${pluralName}Empty,
	},
} as const;

// ============================================================================
// TYPES NAMESPACE - TypeScript type definitions
// ============================================================================

/**
 * TypeScript types for ${modelName} entities and operations.
 * Provides complete type safety for all ${modelName}-related code.
 */
export const types = {
	// Core entity types
	entity: {
		${modelName}: {} as ${modelName}TypesModule.${modelName},
		${modelName}Id: {} as ${modelName}TypesModule.${modelName}Id,
	},

	// Input types for operations
	input: {
		create: {} as ${modelName}TypesModule.${modelName}CreateInput,
		update: {} as ${modelName}TypesModule.${modelName}UpdateInput,
		createMany: {} as ${modelName}TypesModule.${modelName}CreateManyInput,
	},

	// Array and collection types
	collections: {
		array: {} as ${modelName}TypesModule.${modelName}Array,
		createInputArray: {} as ${modelName}TypesModule.${modelName}CreateInputArray,
		createManyInputArray: {} as ${modelName}TypesModule.${modelName}CreateManyInputArray,
	},

	// API and response types
	api: {
		response: {} as ${modelName}TypesModule.${modelName}ApiResponse,
		listResponse: {} as ${modelName}TypesModule.${modelName}ListApiResponse,
		mutationResponse: {} as ${modelName}TypesModule.${modelName}MutationResponse,
		batchResponse: {} as ${modelName}TypesModule.${modelName}BatchResponse,
	},

	// Search and filtering types
	search: {
		params: {} as ${modelName}TypesModule.${modelName}SearchParams,
		filterParams: {} as ${modelName}TypesModule.${modelName}FilterParams,
	},

	// State management types
	state: {
		${lowerName}State: {} as ${modelName}TypesModule.${modelName}State,
		optimisticUpdate: {} as ${modelName}TypesModule.${modelName}OptimisticUpdate,
	},

	// Hook result types
	hooks: {
		use${pluralName}Result: {} as ${modelName}TypesModule.Use${pluralName}Result,
		use${modelName}Result: {} as ${modelName}TypesModule.Use${modelName}Result,
		useFormResult: {} as ${modelName}TypesModule.Use${modelName}FormResult,
	},

	// Form and validation types
	forms: {
		formData: {} as ${modelName}TypesModule.${modelName}FormData,
		updateFormData: {} as ${modelName}TypesModule.${modelName}UpdateFormData,
		formOptions: {} as ${modelName}TypesModule.Use${modelName}FormOptions,
	},

	// Validation types
	validation: {
		error: {} as ${modelName}TypesModule.${modelName}ValidationError,
		errors: {} as ${modelName}TypesModule.${modelName}ValidationErrors,
		success: {} as ${modelName}TypesModule.${modelName}ValidationSuccess,
		result: {} as ${modelName}TypesModule.${modelName}ValidationResult,
	},

	// Configuration types
	config: {
		${lowerName}: {} as ${modelName}TypesModule.${modelName}Config,
		optimistic: {} as ${modelName}TypesModule.${modelName}OptimisticConfig,
		cache: {} as ${modelName}TypesModule.${modelName}CacheConfig,
	},

	// Event types
	events: {
		change: {} as ${modelName}TypesModule.${modelName}ChangeEvent,
	},

	// Prisma integration types
	prisma: {
		whereInput: {} as ${modelName}TypesModule.${modelName}WhereInput,
		whereUniqueInput: {} as ${modelName}TypesModule.${modelName}WhereUniqueInput,
		orderByInput: {} as ${modelName}TypesModule.${modelName}OrderByInput,
	},
} as const;

// ============================================================================
// SCHEMAS NAMESPACE - Zod validation schemas
// ============================================================================

/**
 * Zod schemas for runtime validation and type inference.
 * Ensures data integrity and provides parsing capabilities.
 */
export const schemas = {
	// Primary schemas
	${lowerName}: ${modelName}TypesModule.${lowerName}Schema,
	create: ${modelName}TypesModule.${modelName}CreateInputSchema,
	update: ${modelName}TypesModule.${modelName}UpdateInputSchema,
	createMany: ${modelName}TypesModule.${modelName}CreateManyInputSchema,

	// Configuration objects
	select: ${modelName}TypesModule.${lowerName}Select,
} as const;

// ============================================================================
// ROUTES NAMESPACE - API route handlers
// ============================================================================

export const routes = ${modelName}RoutesModule.routesHandlers;

// ============================================================================
// UTILITIES NAMESPACE - Helper functions and constants
// ============================================================================

/**
 * Utility functions and constants for ${modelName} operations.
 * Provides helper functions and default configurations.
 */
export const utils = {
	// Type guards
	guards: {
		is${modelName}: ${modelName}TypesModule.is${modelName},
		is${modelName}CreateInput: ${modelName}TypesModule.is${modelName}CreateInput,
		is${modelName}ValidationError: ${modelName}TypesModule.is${modelName}ValidationError,
	},

	// Default configurations
	defaults: {
		config: ${modelName}TypesModule.DEFAULT_${modelName.toUpperCase()}_CONFIG,
		searchParams: ${modelName}TypesModule.DEFAULT_SEARCH_PARAMS,
	},

	// Select object for Prisma queries
	select: ${modelName}TypesModule.${lowerName}Select,
} as const;

// ============================================================================
// MAIN EXPORT - Complete ${modelName} namespace
// ============================================================================

/**
 * Complete ${modelName} namespace with all functionality organized by concern.
 * This is the main export that developers will import and use.
 */
export const ${lowerPluralName} = {
	actions,
	atoms,
	hooks,
	types,
	schemas,
	routes,
	utils,
} as const;

// ============================================================================
// CONVENIENCE RE-EXPORTS - Direct access to commonly used items
// ============================================================================

// Re-export primary types for convenience
export type {
	${modelName},
	${modelName}CreateInput,
	${modelName}UpdateInput,
	${modelName}Id,
	Use${pluralName}Result,
	Use${modelName}Result,
} from "./types";

// Re-export primary schemas for convenience
export {
	${lowerName}Schema,
	${modelName}CreateInputSchema,
	${modelName}UpdateInputSchema,
	${lowerName}Select,
} from "./types";

// Re-export primary hooks for convenience
export {
	use${pluralName},
	use${modelName},
	use${modelName}Form,
	useCreate${modelName}Form,
	useUpdate${modelName}Form,
} from "./hooks";
`;
  const filePath = join7(modelDir, "namespace.ts");
  await writeFile(filePath, template);
}

// src/templates/prisma.ts
function generatePrismaTemplate(context) {
  const { config } = context;
  if (config.prismaClientPath?.trim()) {
    return `export * from "${config.prismaClientPath}";
`;
  }
  return `import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

export const prisma = new PrismaClient();
`;
}

// src/templates/routes.ts
import { join as join8 } from "node:path";
async function generateApiRoutes(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import { type NextRequest, NextResponse } from '../server';
import * as ${modelName}Actions from './actions';

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await ${modelName}Actions.findUnique({ id });
      if (!result) {
        return NextResponse.json(
          { error: '${modelName} not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    } else {
      const results = await ${modelName}Actions.findMany();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('GET /${lowerName} error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await ${modelName}Actions.create(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /${lowerName} error:', error);
    const status = (error as any)?.code === 'P2002' ? 409 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status }
    );
  }
}

async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id in request body' },
        { status: 400 }
      );
    }
    
    const result = await ${modelName}Actions.update({ id }, updateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PATCH /${lowerName} error:', error);
    let status = 400;
    if ((error as any)?.code === 'P2025') status = 404;
    if ((error as any)?.code === 'P2002') status = 409;
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status }
    );
  }
}

async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }
    
    await ${modelName}Actions.deleteRecord({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /${lowerName} error:', error);
    const status = (error as any)?.code === 'P2025' ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status }
    );
  }
}

export const routesHandlers = {
	GET,
	POST,
	PATCH,
	DELETE,
};
`;
  const filePath = join8(modelDir, "routes.ts");
  await writeFile(filePath, template);
}

// src/templates/server.ts
function generateServerTemplate(context) {
  const { config } = context;
  if (config.serverPath?.trim()) {
    return `export * from "${config.serverPath}";
`;
  }
  return `export { NextRequest, NextResponse } from "next/server";
`;
}

// src/templates/types.ts
import { join as join9 } from "node:path";
async function generateTypes(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, model } = modelInfo;
  const selectObject = createSelectObjectWithRelations(modelInfo, context);
  const zodImportPath = getZodImportPath(1);
  const prismaImportPath = getPrismaImportPath(context, 1);
  const isDefaultPrismaClient = prismaImportPath === "@prisma/client";
  const prismaImports = isDefaultPrismaClient ? `import type { Prisma } from '@prisma/client';` : `import type { Prisma } from '${prismaImportPath}';`;
  const relatedModelTypes = new Set;
  for (const field of model.fields) {
    if (field.kind === "object" && field.type !== modelName) {
      const relatedModelName = field.type.replace("[]", "");
      relatedModelTypes.add(`${relatedModelName}WhereUniqueInput`);
    }
  }
  if (modelName === "Todo") {
    relatedModelTypes.add("TagWhereUniqueInput");
  }
  const template = `${formatGeneratedFileHeader()}import { z } from "zod";
${prismaImports}

export {
	${modelName}UncheckedCreateInputSchema as ${modelName}CreateInputSchema,
	${modelName}CreateManyInputSchema,
	${modelName}Schema as ${lowerName}Schema,
	${modelName}UncheckedUpdateInputSchema as ${modelName}UpdateInputSchema,
} from "${zodImportPath}";

import type { ${modelName}CreateManyInputSchema, ${modelName}UncheckedCreateInputSchema, ${modelName}UncheckedUpdateInputSchema } from "${zodImportPath}";

// ============================================================================
// CORE TYPES - Inferred from Zod schemas for consistency
// ============================================================================

/** Input type for creating a new ${modelName} */
export type ${modelName}CreateInput = z.infer<typeof ${modelName}UncheckedCreateInputSchema>;

/** Input type for updating an existing ${modelName} */
export type ${modelName}UpdateInput = z.infer<typeof ${modelName}UncheckedUpdateInputSchema>;

/** Input type for batch creating ${pluralName} */
export type ${modelName}CreateManyInput = z.infer<typeof ${modelName}CreateManyInputSchema>;

// ============================================================================
// PRISMA WHERE TYPES - Direct exports from Prisma for flexible querying
// ============================================================================

/** Where conditions for filtering ${lowerName}s */
export type ${modelName}WhereInput = Prisma.${modelName}WhereInput;

/** Unique selectors for identifying a specific ${lowerName} */
export type ${modelName}WhereUniqueInput = Prisma.${modelName}WhereUniqueInput;

/** Order by options for sorting ${lowerName}s */
export type ${modelName}OrderByInput = Prisma.${modelName}OrderByWithRelationInput;

// ============================================================================
// RELATED MODEL WHERE TYPES - For relationship operations
// ============================================================================
${Array.from(relatedModelTypes).map((type) => `/** Unique selectors for ${type.replace("WhereUniqueInput", "").toLowerCase()} entities (for relationship operations) */
export type ${type} = Prisma.${type};`).join(`

`)}

// ============================================================================
// PRISMA INTEGRATION - Proper select object and type generation
// ============================================================================

/**
 * Select object that defines exactly which fields are exposed from the database.
 * This serves as a security whitelist and performance optimization.
 */
export const ${lowerName}Select = ${selectObject} satisfies Prisma.${modelName}Select;

/**
 * Generated ${modelName} type based on our select object.
 * This ensures type safety between database queries and TypeScript types.
 */
export type ${modelName} = Prisma.${modelName}GetPayload<{
	select: typeof ${lowerName}Select;
}>;

// ============================================================================
// UTILITY TYPES - Common patterns for working with ${pluralName}
// ============================================================================

/** Strongly typed ${modelName} ID */
export type ${modelName}Id = ${modelName}["id"];

/** Alias for better readability in function signatures */
export type ${modelName}Input = ${modelName}CreateInput;

// Note: Prisma where types are defined above in the PRISMA WHERE TYPES section

// ============================================================================
// ARRAY AND COLLECTION TYPES
// ============================================================================

/** Array of ${modelName} entities */
export type ${modelName}Array = ${modelName}[];

/** Array of create inputs for batch operations */
export type ${modelName}CreateInputArray = ${modelName}Input[];

/** Array of create many inputs for optimized batch inserts */
export type ${modelName}CreateManyInputArray = ${modelName}CreateManyInput[];

/** Partial ${modelName} input for optional updates */
export type Partial${modelName}Input = Partial<${modelName}Input>;

// ============================================================================
// RELATIONSHIP OPERATION TYPES - Types for relationship management
// ============================================================================

/** Parameters for setting a required relationship */
export interface SetRequiredRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Unique selector for the related record to associate */
	relatedWhere: TRelatedWhere;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for setting an optional relationship */
export interface SetOptionalRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Unique selector for the related record to associate */
	relatedWhere: TRelatedWhere;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for removing an optional relationship */
export interface RemoveOptionalRelationParams {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for many-to-many relationship operations */
export interface ManyToManyRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Array of unique selectors for related records */
	relatedWheres: TRelatedWhere[];
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for clearing many-to-many relationships */
export interface ClearManyToManyRelationParams {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

// ============================================================================
// API AND SEARCH TYPES - For query operations and pagination
// ============================================================================

/** Parameters for searching and filtering ${lowerName}s */
export interface ${modelName}SearchParams {
	/** Full-text search query */
	query?: string;

	/** Pagination page number (1-based) */
	page?: number;

	/** Number of items per page */
	limit?: number;

	/** Field to sort by */
	orderBy?: keyof ${modelName};

	/** Sort direction */
	orderDirection?: "asc" | "desc";
}

/** Extended search parameters with Prisma where conditions */
export interface ${modelName}FilterParams extends ${modelName}SearchParams {
	/** Advanced filtering with Prisma where conditions */
	where?: ${modelName}WhereInput;
}

// ============================================================================
// API RESPONSE TYPES - Standardized response formats
// ============================================================================

/** Standard API response for single ${modelName} operations */
export interface ${modelName}ApiResponse {
	data: ${modelName};
	success: boolean;
	message?: string;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** API response for ${modelName} list operations with pagination */
export interface ${modelName}ListApiResponse {
	data: ${modelName}[];
	success: boolean;
	message?: string;
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** Response type for mutations (create, update, delete) */
export interface ${modelName}MutationResponse {
	data?: ${modelName};
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** Response type for batch operations */
export interface ${modelName}BatchResponse {
	count: number;
	success: boolean;
	message?: string;
	errors?: Array<{
		index: number;
		error: string;
	}>;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

// ============================================================================
// STATE MANAGEMENT TYPES - For Jotai atoms and React state
// ============================================================================

/** Complete state shape for ${modelName} management */
export interface ${modelName}State {
	/** Map of ${lowerName}s by ID for efficient updates */
	items: Record<string, ${modelName}>;

	/** Global loading state */
	loading: boolean;

	/** Creation loading state */
	creating: boolean;

	/** Update loading states by ${lowerName} ID */
	updating: Record<string, boolean>;

	/** Delete loading states by ${lowerName} ID */
	deleting: Record<string, boolean>;

	/** Global error state */
	error: string | null;

	/** Last fetch timestamp for cache management */
	lastFetched?: number;

	/** Optimistic update tracking */
	optimisticUpdates: Record<string, ${modelName}OptimisticUpdate>;
}

/** Tracking data for optimistic updates */
export interface ${modelName}OptimisticUpdate {
	/** Unique ID for the optimistic update */
	id: string;

	/** The optimistic data */
	data: Partial<${modelName}>;

	/** When the optimistic update was created */
	timestamp: number;

	/** Original data for rollback */
	originalData?: ${modelName};

	/** Operation type */
	operation: "create" | "update" | "delete";
}

// ============================================================================
// REACT HOOK FORM INTEGRATION TYPES
// ============================================================================

/** Form data type excluding auto-generated fields */
export type ${modelName}FormData = Omit<${modelName}Input, "id" | "createdAt" | "updatedAt">;

/** Partial form data for updates */
export type ${modelName}UpdateFormData = Partial<${modelName}FormData>;

/** Options for use${modelName}Form hook */
export interface Use${modelName}FormOptions {
	/** Success callback when form submission succeeds */
	onSuccess?: (data: ${modelName}) => void;
	
	/** Error callback when form submission fails */
	onError?: (error: Error) => void;
	
	/** Whether to enable automatic form submission */
	autoSubmit?: boolean;
	
	/** Whether to enable optimistic updates */
	optimisticUpdates?: boolean;
}

/** Result type for use${modelName}Form hook (React Hook Form integration) */
export interface Use${modelName}FormResult {
	/** All react-hook-form properties and methods */
	[key: string]: any;
	
	/** Loading state from Flow actions */
	loading: boolean;
	
	/** Error state from Flow actions */
	error: Error | null;
	
	/** Enhanced submit handler with Flow integration */
	handleSubmit: (onValid: (data: any) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
	
	/** Direct submission with Flow integration */
	submitWithFlow: (data: any) => Promise<${modelName}>;
	
	/** The operation type */
	operation: 'create' | 'update';
}

// ============================================================================
// EVENT TYPES - For custom hooks and event handling
// ============================================================================

/** Event emitted when a ${modelName} changes */
export interface ${modelName}ChangeEvent {
	/** Type of change */
	type: "create" | "update" | "delete";

	/** The ${lowerName} after the change */
	${lowerName}: ${modelName};

	/** The ${lowerName} before the change (for updates) */
	previousValue?: ${modelName};

	/** Timestamp of the change */
	timestamp: number;

	/** Whether this was an optimistic update */
	optimistic: boolean;
}

// ============================================================================
// VALIDATION TYPES - For error handling and validation
// ============================================================================

/** Individual field validation error */
export interface ${modelName}ValidationError {
	/** Field that has the error */
	field: keyof ${modelName}Input;

	/** Human-readable error message */
	message: string;

	/** Error code for programmatic handling */
	code: string;

	/** Additional error context */
	context?: Record<string, any>;
}

/** Collection of validation errors */
export interface ${modelName}ValidationErrors {
	/** Array of field errors */
	errors: ${modelName}ValidationError[];

	/** Overall error message */
	message: string;

	/** Whether validation failed */
	isValid: false;
}

/** Successful validation result */
export interface ${modelName}ValidationSuccess {
	/** Validation passed */
	isValid: true;

	/** Validated data */
	data: ${modelName}Input;
}

/** Union type for validation results */
export type ${modelName}ValidationResult = ${modelName}ValidationSuccess | ${modelName}ValidationErrors;

// ============================================================================
// HOOK RESULT TYPES - Return types for custom hooks
// ============================================================================

/** Result type for use${pluralName} hook */
export interface Use${pluralName}Result {
	// Data
	data: ${modelName}[];
	loading: boolean;
	error: string | null;
	count: number;
	isEmpty: boolean;

	// CRUD operations
	create${modelName}: (data: ${modelName}CreateInput) => Promise<${modelName}>;
	update${modelName}: (id: string, data: ${modelName}UpdateInput) => Promise<${modelName}>;
	delete${modelName}: (id: string) => Promise<void>;

	// Batch operations
	createMany: (data: ${modelName}CreateInput[]) => Promise<{ count: number }>;
	deleteMany: (ids: string[]) => Promise<{ count: number }>;

	// State management
	refresh: () => void;
	clearError: () => void;

	// Loading states for individual operations
	isCreating: boolean;
	isUpdating: (id: string) => boolean;
	isDeleting: (id: string) => boolean;

	// Optimistic updates info
	optimisticUpdates: Record<string, boolean>;
}

/** Result type for use${modelName} hook */
export interface Use${modelName}Result {
	// Data
	data: ${modelName} | null;
	loading: boolean;
	error: string | null;
	exists: boolean;

	// Operations
	update: (data: ${modelName}UpdateInput) => Promise<${modelName}>;
	delete: () => Promise<void>;

	// State
	isUpdating: boolean;
	isDeleting: boolean;
	isOptimistic: boolean;

}

// ============================================================================
// CONFIGURATION TYPES - For customizing behavior
// ============================================================================

/** Configuration for optimistic updates */
export interface ${modelName}OptimisticConfig {
	/** Strategy for handling conflicts */
	conflictResolution: "merge" | "overwrite" | "manual";

	/** Timeout for optimistic updates (ms) */
	timeout: number;

	/** Maximum number of retries */
	maxRetries: number;
}

/** Configuration for caching behavior */
export interface ${modelName}CacheConfig {
	/** Cache TTL in milliseconds */
	ttl: number;

	/** Whether to use stale-while-revalidate */
	staleWhileRevalidate: boolean;

	/** Cache tags for invalidation */
	tags: string[];
}

/** Overall configuration for ${modelName} operations */
export interface ${modelName}Config {
	/** Optimistic update configuration */
	optimistic: ${modelName}OptimisticConfig;

	/** Cache configuration */
	cache: ${modelName}CacheConfig;

	/** Whether to enable debug logging */
	debug: boolean;

	/** Custom error handler */
	onError?: (error: Error, context: string) => void;
}

// ============================================================================
// TYPE GUARDS - Runtime type checking utilities
// ============================================================================

/** Type guard to check if a value is a valid ${modelName} */
export function is${modelName}(value: any): value is ${modelName} {
	return typeof value === "object" && value !== null && typeof value.id === "string";
}

/** Type guard to check if a value is a valid ${modelName}CreateInput */
export function is${modelName}CreateInput(value: any): value is ${modelName}CreateInput {
	return typeof value === "object" && value !== null;
}

/** Type guard to check if a value is a validation error */
export function is${modelName}ValidationError(value: any): value is ${modelName}ValidationErrors {
	return typeof value === "object" && value !== null && value.isValid === false && Array.isArray(value.errors);
}

// ============================================================================
// DEFAULT VALUES - Sensible defaults for various types
// ============================================================================

/** Default configuration values */
export const DEFAULT_${modelName.toUpperCase()}_CONFIG: ${modelName}Config = {
	optimistic: {
		conflictResolution: "merge",
		timeout: 5000,
		maxRetries: 3,
	},
	cache: {
		ttl: 300000, // 5 minutes
		staleWhileRevalidate: true,
		tags: ["${modelName}"],
	},
	debug: process.env.NODE_ENV === "development",
};

/** Default search parameters */
export const DEFAULT_SEARCH_PARAMS: Required<${modelName}SearchParams> = {
	query: "",
	page: 1,
	limit: 10,
	orderBy: "createdAt",
	orderDirection: "desc",
};

// ============================================================================
// UTILITY TYPE HELPERS
// ============================================================================

/** Extract keys that are required in ${modelName}CreateInput */
export type Required${modelName}Fields = {
	[K in keyof ${modelName}CreateInput]-?: ${modelName}CreateInput[K] extends undefined ? never : K;
}[keyof ${modelName}CreateInput];

/** Extract keys that are optional in ${modelName}CreateInput */
export type Optional${modelName}Fields = {
	[K in keyof ${modelName}CreateInput]-?: ${modelName}CreateInput[K] extends undefined ? K : never;
}[keyof ${modelName}CreateInput];

/** Make specific fields required */
export type ${modelName}With<T extends keyof ${modelName}> = ${modelName} & Required<Pick<${modelName}, T>>;

/** Make specific fields optional */
export type ${modelName}Without<T extends keyof ${modelName}> = ${modelName} & Partial<Pick<${modelName}, T>>;
`;
  const filePath = join9(modelDir, "types.ts");
  await writeFile(filePath, template);
}

// src/zod-generator.ts
import { dirname as dirname3, join as join10 } from "node:path";
class ZodGenerationError extends FlowGeneratorError {
  constructor(message, cause) {
    super(`Zod generation failed: ${message}`, cause);
    this.name = "ZodGenerationError";
  }
}
async function generateZodSchemas(options, outputDir, models) {
  console.log("\uD83D\uDCE6 Generating integrated Zod schemas...");
  const zodOutputDir = join10(outputDir, "zod");
  try {
    await ensureDirectory(zodOutputDir);
  } catch (error) {
    throw new ZodGenerationError(`Failed to create zod output directory: ${zodOutputDir}`, error);
  }
  const tempSchemaPath = await createTempSchemaWithZodGenerator(options, zodOutputDir, models);
  try {
    console.log("\uD83D\uDD27 Executing zod-prisma-types generator...");
    console.log("Temp schema path:", tempSchemaPath);
    console.log("Zod output dir:", zodOutputDir);
    await executeZodPrismaTypes(tempSchemaPath);
    console.log("\uD83D\uDD0D Validating generated schemas...");
    await validateGeneratedSchemas(zodOutputDir, models);
    console.log("✅ Integrated Zod schemas generated successfully");
  } catch (error) {
    console.error("❌ Zod generation error:", error);
    throw new ZodGenerationError("Failed to generate Zod schemas", error);
  } finally {
    try {
      await deleteFile(tempSchemaPath);
    } catch {}
  }
}
async function createTempSchemaWithZodGenerator(options, zodOutputDir, models) {
  try {
    console.log("\uD83D\uDCDD Creating temporary schema for zod generation...");
    console.log(`\uD83D\uDD0D Reading original schema... ${options.schemaPath}`);
    const originalSchemaContent = await readFile(options.schemaPath);
    console.log("\uD83D\uDCD6 Original schema read successfully");
    console.log("\uD83D\uDCC4 Schema path:", options.schemaPath);
    console.log(`\uD83D\uDCDD Schema content preview: ${originalSchemaContent.substring(0, 200)}...`);
    const schemaWithoutFlowGenerator = originalSchemaContent.replace(/generator\s+flow\s*\{[\s\S]*?\}/g, "");
    console.log("\uD83E\uDDF9 Removed flow generator from schema");
    const zodGeneratorConfig = `
generator zod {
  provider = "zod-prisma-types"
  output   = "${zodOutputDir}"
}
`;
    const modifiedSchema = `${schemaWithoutFlowGenerator}
${zodGeneratorConfig}`;
    console.log(`\uD83D\uDD27 Modified schema preview: ${modifiedSchema.substring(0, 300)}...`);
    const tempSchemaPath = join10(dirname3(options.schemaPath), ".temp-zod-schema.prisma");
    await writeFile(tempSchemaPath, modifiedSchema);
    console.log("\uD83D\uDCC1 Temporary schema written to:", tempSchemaPath);
    console.log("\uD83D\uDCC2 Temp schema dir:", dirname3(options.schemaPath));
    return tempSchemaPath;
  } catch (error) {
    console.error("❌ Failed to create temp schema:", error);
    throw new ZodGenerationError("Failed to create temporary schema file", error);
  }
}
async function executeZodPrismaTypes(schemaPath) {
  console.log(`\uD83D\uDE80 Starting zod generation with schema: ${schemaPath}`);
  console.log(`\uD83D\uDD0D Runtime check - Bun available: ${typeof Bun !== "undefined"}`);
  console.log(`\uD83D\uDD0D Runtime check - Process version: ${process.version}`);
  if (typeof Bun !== "undefined") {
    try {
      const proc = Bun.spawn(["bunx", "prisma", "generate", "--schema", schemaPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_PATH: `${process.cwd()}/node_modules`
        },
        stdout: "pipe",
        stderr: "pipe"
      });
      const exitCode = await proc.exited;
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      console.log(`\uD83D\uDD27 Zod generation process completed with code: ${exitCode}`);
      console.log(`\uD83D\uDCE4 STDOUT: ${stdout}`);
      console.log(`\uD83D\uDCE5 STDERR: ${stderr}`);
      if (exitCode !== 0) {
        throw new Error(`Zod generation failed with code ${exitCode}:
STDOUT: ${stdout}
STDERR: ${stderr}`);
      }
    } catch (error) {
      throw new Error(`Failed to execute zod generation process: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    const { spawn } = await import("node:child_process");
    return new Promise((resolve3, reject) => {
      const child = spawn("bunx", ["prisma", "generate", "--schema", schemaPath], {
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_PATH: `${process.cwd()}/node_modules`
        }
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });
      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      child.on("close", (code) => {
        console.log(`\uD83D\uDD27 Zod generation process completed with code: ${code}`);
        console.log(`\uD83D\uDCE4 STDOUT: ${stdout}`);
        console.log(`\uD83D\uDCE5 STDERR: ${stderr}`);
        if (code === 0) {
          resolve3();
        } else {
          reject(new Error(`Zod generation failed with code ${code}:
STDOUT: ${stdout}
STDERR: ${stderr}`));
        }
      });
      child.on("error", (error) => {
        reject(new Error(`Failed to spawn zod generation process: ${error.message}`));
      });
    });
  }
}
async function validateGeneratedSchemas(zodOutputDir, models) {
  try {
    const indexPath = join10(zodOutputDir, "index.ts");
    const indexExists = await fileExists(indexPath);
    if (!indexExists) {
      throw new Error("Zod index file was not generated");
    }
    const indexContent = await readFile(indexPath);
    const missingSchemas = [];
    for (const modelName of models) {
      const hasCreateSchema = indexContent.includes(`${modelName}CreateInputSchema`);
      const hasUpdateSchema = indexContent.includes(`${modelName}UpdateInputSchema`);
      if (!hasCreateSchema || !hasUpdateSchema) {
        missingSchemas.push(modelName);
      }
    }
    if (missingSchemas.length > 0) {
      throw new Error(`Missing Zod schemas for models: ${missingSchemas.join(", ")}`);
    }
  } catch (error) {
    throw new ZodGenerationError("Generated Zod schemas validation failed", error);
  }
}

// index.ts
async function generateSharedPrismaClient(context) {
  const template = `// This file is auto-generated by Next Prisma Flow Generator.
// Do not edit this file manually as it will be overwritten.
// Generated at: ${new Date().toISOString()}

import { PrismaClient } from '@prisma/client';

// Create shared Prisma client instance
export const prisma = new PrismaClient();
`;
  const filePath = join11(context.outputDir, "prisma-client.ts");
  await writeFile(filePath, template);
}
import_generator_helper.generatorHandler({
  onManifest() {
    return {
      version: "1.0.0",
      defaultOutput: "./generated/flow",
      prettyName: "Next Prisma Flow Generator",
      requiresGenerators: ["prisma-client-js"]
    };
  },
  async onGenerate(options) {
    try {
      console.log("\uD83D\uDE80 Starting Next Prisma Flow Generator...");
      const config = parseGeneratorConfig(options);
      const modelNames = options.dmmf.datamodel.models.map((m) => m.name);
      validateConfig(config, modelNames);
      const context = createGeneratorContext(config, options.dmmf, config.output);
      try {
        await ensureDirectory(context.outputDir);
      } catch (error) {
        throw new FileSystemError("create directory", context.outputDir, error);
      }
      try {
        console.log("\uD83D\uDE80 Starting Zod schema generation...");
        await generateZodSchemas(options, context.outputDir, config.models);
      } catch (error) {
        console.error("❌ Zod generation failed in main generator:", error);
        throw new TemplateGenerationError("zod schemas", "all models", error);
      }
      if (context.prismaImport === "@prisma/client") {
        try {
          await generateSharedPrismaClient(context);
        } catch (error) {
          throw new TemplateGenerationError("shared prisma client", "all models", error);
        }
      }
      console.log("\uD83D\uDD0D Analyzing schema relationships...");
      const schemaRelationships = analyzeSchemaRelationships(options.dmmf);
      for (const modelName of config.models) {
        console.log(`\uD83D\uDCDD Generating code for model: ${modelName}`);
        const model = options.dmmf.datamodel.models.find((m) => m.name === modelName);
        if (!model) {
          throw new ModelNotFoundError(modelName);
        }
        const lowerModelName = modelName.toLowerCase();
        const modelConfig = config[lowerModelName] || {};
        const pluralName = capitalize(plural2(modelName));
        const lowerPluralName = plural2(lowerModelName);
        const modelRelationships = schemaRelationships.get(modelName);
        const relationshipInfo = modelRelationships ? {
          owns: modelRelationships.ownsRelations,
          referencedBy: modelRelationships.referencedBy,
          relatedModels: Array.from(modelRelationships.relatedModels)
        } : undefined;
        const analyzedModel = analyzeModel(model, relationshipInfo);
        const validationRules = generateValidationRules(analyzedModel);
        const modelInfo = {
          name: modelName,
          lowerName: lowerModelName,
          pluralName,
          lowerPluralName,
          config: modelConfig,
          model,
          selectFields: modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name),
          analyzed: analyzedModel,
          validationRules
        };
        const modelDir = join11(context.outputDir, lowerModelName);
        try {
          await ensureDirectory(modelDir);
        } catch (error) {
          throw new FileSystemError("create directory", modelDir, error);
        }
        try {
          await Promise.all([
            generateApiRoutes(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("routes", modelName, error);
            }),
            generateServerActions(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("actions", modelName, error);
            }),
            generateJotaiAtoms(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("atoms", modelName, error);
            }),
            generateReactHooks(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("hooks", modelName, error);
            }),
            generateTypes(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("types", modelName, error);
            }),
            generateNamespaceExports(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("namespace", modelName, error);
            })
          ]);
        } catch (error) {
          if (error instanceof TemplateGenerationError) {
            throw error;
          }
          throw new TemplateGenerationError("unknown", modelName, error);
        }
      }
      try {
        await generateFlowProvider(config, context);
      } catch (error) {
        throw new TemplateGenerationError("flow provider", "all models", error);
      }
      try {
        const cacheContent = generateCacheTemplate(context);
        await writeFile(join11(context.outputDir, "cache.ts"), cacheContent);
        const prismaContent = generatePrismaTemplate(context);
        await writeFile(join11(context.outputDir, "prisma.ts"), prismaContent);
        const serverContent = generateServerTemplate(context);
        await writeFile(join11(context.outputDir, "server.ts"), serverContent);
      } catch (error) {
        throw new TemplateGenerationError("utility files", "all models", error);
      }
      try {
        await generateBarrelExports(config, context);
      } catch (error) {
        throw new TemplateGenerationError("barrel exports", "all models", error);
      }
      console.log("✅ Next Prisma Flow Generator completed successfully!");
    } catch (error) {
      if (error instanceof FlowGeneratorError) {
        console.error(`❌ ${error.name}: ${error.message}`);
        if (error.cause) {
          console.error(`Caused by: ${error.cause}`);
        }
      } else {
        console.error(`❌ Unexpected error: ${error}`);
      }
      throw error;
    }
  }
});
