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
import { join as join14 } from "node:path";

// node_modules/change-case/dist/index.js
var SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
var SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;
var SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;
var DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
var SPLIT_REPLACE_VALUE = "$1\x00$2";
var DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
function split(value) {
  let result = value.trim();
  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  result = result.replace(DEFAULT_STRIP_REGEXP, "\x00");
  let start = 0;
  let end = result.length;
  while (result.charAt(start) === "\x00")
    start++;
  if (start === end)
    return [];
  while (result.charAt(end - 1) === "\x00")
    end--;
  return result.slice(start, end).split(/\0/g);
}
function splitSeparateNumbers(value) {
  const words = split(value);
  for (let i = 0;i < words.length; i++) {
    const word = words[i];
    const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match) {
      const offset = match.index + (match[1] ?? match[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}
function camelCase(input, options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  const lower = lowerFactory(options?.locale);
  const upper = upperFactory(options?.locale);
  const transform = options?.mergeAmbiguousCharacters ? capitalCaseTransformFactory(lower, upper) : pascalCaseTransformFactory(lower, upper);
  return prefix + words.map((word, index) => {
    if (index === 0)
      return lower(word);
    return transform(word, index);
  }).join(options?.delimiter ?? "") + suffix;
}
function lowerFactory(locale) {
  return locale === false ? (input) => input.toLowerCase() : (input) => input.toLocaleLowerCase(locale);
}
function upperFactory(locale) {
  return locale === false ? (input) => input.toUpperCase() : (input) => input.toLocaleUpperCase(locale);
}
function capitalCaseTransformFactory(lower, upper) {
  return (word) => `${upper(word[0])}${lower(word.slice(1))}`;
}
function pascalCaseTransformFactory(lower, upper) {
  return (word, index) => {
    const char0 = word[0];
    const initial = index > 0 && char0 >= "0" && char0 <= "9" ? "_" + char0 : upper(char0);
    return initial + lower(word.slice(1));
  };
}
function splitPrefixSuffix(input, options = {}) {
  const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;
  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char))
      break;
    prefixIndex++;
  }
  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char))
      break;
    suffixIndex = index;
  }
  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex)
  ];
}

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
  let models;
  if (config.models === "all") {
    models = options.dmmf.datamodel.models.map((m) => m.name);
  } else {
    models = Array.isArray(config.models) ? config.models : config.models.split(",").map((m) => m.trim());
  }
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
function validateConfig(config, modelNames) {
  const isUsingAllModels = config.models.length === modelNames.length && config.models.every((model) => modelNames.includes(model));
  if (!isUsingAllModels) {
    const invalidModels = config.models.filter((modelName) => !modelNames.includes(modelName));
    if (invalidModels.length > 0) {
      throw new ModelNotFoundError(`Unknown models specified in config: ${invalidModels.join(", ")}`);
    }
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
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function camelCase2(str) {
  return camelCase(str);
}
function plural2(word) {
  return pluralize.plural(word);
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
    if (!currentModelRels) {
      throw new Error(`Model ${model.name} not found in modelRelationships`);
    }
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
      if (relatedModelRels && isOwning && backReferenceField) {
        const reverseRelationType = backReferenceField.isList ? "one-to-many" : "one-to-one";
        relatedModelRels.referencedBy.push({
          fieldName: backReferenceField.name,
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
async function generateServerActions(modelInfo, _context, modelDir) {
  const { name: modelName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}"use server";

import { createModelActions } from "../shared/actions/factory";
import { modelPrismaClient, select } from "./config";
import { schemas } from "./schemas";
import type { ModelType } from "./types";

const modelActions = createModelActions<ModelType, typeof schemas, typeof select>(modelPrismaClient, schemas, select);

export const {
	findUnique,
	findMany,
	findFirst,
	create,
	createMany,
	update,
	updateMany,
	upsert,
	remove,
	removeMany,
	count,
} = modelActions;
`;
  const filePath = join2(modelDir, "actions.ts");
  await writeFile(filePath, template);
}

// src/templates/atoms.ts
import { join as join3 } from "node:path";
async function generateJotaiAtoms(modelInfo, _context, modelDir) {
  const { name: modelName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { ModelType } from "./types";

/** Source-of-truth — keyed by primary id */
export const entitiesAtom = atom<Record<string, ModelType>>({});

/** Pending optimistic operations */
export const pendingPatchesAtom = atom<Record<string, { type: "create" | "update" | "delete" | "upsert" }>>({});

/** Last error surfaced by any action */
export const errorAtom = atom<null | { message: string; code: string; details?: any }>(null);

/** Fine-grained atom per entity */
export const entityAtomFamily = atomFamily((id: string) =>
	atom(
		(get) => get(entitiesAtom)[id],
		(_get, set, next: ModelType) => set(entitiesAtom, (m) => ({ ...m, [id]: next })),
	),
);
`;
  const filePath = join3(modelDir, "atoms.ts");
  await writeFile(filePath, template);
}

// src/templates/config.ts
import { join as join4 } from "node:path";
async function generateModelConfig(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, camelCaseName, selectFields } = modelInfo;
  const selectObject = createSelectObject(modelInfo, context);
  const template = `${formatGeneratedFileHeader()}import { prisma } from "../prisma";
import type { SelectInput } from "./types";

export const model = "${camelCaseName}" as const;
export const modelPrismaClient = prisma[model];
export const select: SelectInput = ${selectObject};
`;
  const filePath = join4(modelDir, "config.ts");
  await writeFile(filePath, template);
}
function createSelectObject(modelInfo, context) {
  const { selectFields, analyzed } = modelInfo;
  if (!selectFields || selectFields.length === 0) {
    return "true";
  }
  return buildSelectObject(modelInfo, context, new Set).trimmedResult;
}
function buildSelectObject(modelInfo, context, visited) {
  const { selectFields, analyzed, name: currentModelName } = modelInfo;
  if (!selectFields || selectFields.length === 0) {
    return { trimmedResult: "true", fullResult: "true" };
  }
  const newVisited = new Set([...visited, currentModelName]);
  const selectEntries = [];
  for (const field of selectFields) {
    const relationField = [...analyzed.relationships?.owns || [], ...analyzed.relationships?.referencedBy || []].find((rel) => rel.fieldName === field);
    if (relationField) {
      const relatedModelName = relationField.relatedModel;
      if (visited.has(relatedModelName)) {
        continue;
      }
      const relatedModelConfig = getModelConfig(relatedModelName, context);
      const relatedSelectFields = getSelectFieldsForModel(relatedModelName, relatedModelConfig, context);
      if (relatedSelectFields.length === 0) {
        selectEntries.push(`	${field}: true`);
      } else {
        const relatedModel = context.dmmf.datamodel.models.find((m) => m.name === relatedModelName);
        if (relatedModel) {
          const schemaRelationships = analyzeSchemaRelationships(context.dmmf);
          const relatedModelRelationships = schemaRelationships.get(relatedModelName);
          const relatedRelationshipInfo = relatedModelRelationships ? {
            owns: relatedModelRelationships.ownsRelations,
            referencedBy: relatedModelRelationships.referencedBy,
            relatedModels: Array.from(relatedModelRelationships.relatedModels)
          } : undefined;
          const relatedAnalyzed = analyzeModel(relatedModel, relatedRelationshipInfo);
          const relatedModelInfo = {
            name: relatedModelName,
            lowerName: relatedModelName.toLowerCase(),
            camelCaseName: camelCase2(relatedModelName),
            pluralName: "",
            lowerPluralName: "",
            config: relatedModelConfig,
            model: relatedModel,
            selectFields: relatedSelectFields,
            analyzed: relatedAnalyzed,
            validationRules: []
          };
          const nestedSelect = buildSelectObject(relatedModelInfo, context, newVisited);
          if (nestedSelect.trimmedResult === "true") {
            selectEntries.push(`	${field}: true`);
          } else {
            selectEntries.push(`	${field}: {
		select: ${nestedSelect.trimmedResult},
	}`);
          }
        } else {
          selectEntries.push(`	${field}: true`);
        }
      }
    } else {
      selectEntries.push(`	${field}: true`);
    }
  }
  const result = selectEntries.length > 0 ? `{
${selectEntries.join(`,
`)},
}` : "{}";
  return { trimmedResult: result, fullResult: result };
}
function getModelConfig(modelName, context) {
  const lowerModelName = modelName.toLowerCase();
  return context.config[lowerModelName] || {};
}
function getSelectFieldsForModel(modelName, modelConfig, context) {
  if (modelConfig.select && Array.isArray(modelConfig.select)) {
    return modelConfig.select;
  }
  const model = context.dmmf.datamodel.models.find((m) => m.name === modelName);
  if (model) {
    return model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name);
  }
  return [];
}

// src/templates/derived.ts
import { join as join5 } from "node:path";
async function generateDerivedAtoms(modelInfo, _context, modelDir) {
  const { name: modelName, analyzed } = modelInfo;
  const searchableFields = analyzed.stringFields.map((field) => field.name).filter((name) => !["id", "password", "hash", "token"].includes(name.toLowerCase()));
  const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import Fuse, { type IFuseOptions } from "fuse.js";
import { entitiesAtom, entityAtomFamily, pendingPatchesAtom } from "./atoms";
import type { ModelType } from "./types";

export const listAtom = atom<ModelType[]>((g) => Object.values(g(entitiesAtom)));
export const loadingAtom = atom((g) => Object.keys(g(pendingPatchesAtom)).length > 0);
export const listLoadable = loadable(listAtom);
export const countAtom = atom((get) => get(listAtom).length);
export const hasAnyAtom = atom((get) => get(countAtom) > 0);

/** Loadable wrapper around a single entity */
export const entityLoadableFamily = atomFamily((id: string) => loadable(entityAtomFamily(id)));

/** true if loadable is loading **or** optimistic patch in flight */
export const entityBusyFamily = atomFamily((id: string) =>
	atom((get) => {
		const load = get(entityLoadableFamily(id));
		const isFetching = load.state === "loading";
		const isOptimistic = Boolean(get(pendingPatchesAtom)[id]);
		return isFetching || isOptimistic;
	}),
);

/* selection helpers */
export const selectedIdAtom = atom<string | null>(null);
export const selectedAtom = atom<ModelType | null>((get) => {
	const id = get(selectedIdAtom);
	if (!id) return null;
	return get(entitiesAtom)[id] ?? null;
});

/** Creates a family of count atoms keyed by an arbitrary property value. */
export const countByFieldAtomFamily = <K extends keyof ModelType>(field: K) =>
	atomFamily((value: ModelType[K]) => atom((get) => get(listAtom).filter((item) => item[field] === value).length));

/** Family that returns a *list* of entities matching a given field value. */
export const listByFieldAtomFamily = <K extends keyof ModelType>(field: K) =>
	atomFamily((value: ModelType[K]) => atom<ModelType[]>((get) => get(listAtom).filter((item) => item[field] === value)));

/* simple paging */
export const pagedAtom = atomFamily(({ page, pageSize }: { page: number; pageSize: number }) =>
	atom<ModelType[]>((get) => {
		const list = get(listAtom);
		const start = (page - 1) * pageSize;
		return list.slice(start, start + pageSize);
	}),
);

/* Enhanced search with Fuse.js */
interface SearchParams {
	query: string;
	options?: IFuseOptions<ModelType>;
}

// Default search keys - all string fields commonly searched
const defaultSearchKeys = ${JSON.stringify(searchableFields)};

// Cache Fuse instances to avoid recreation
interface FuseCache {
	fuse: Fuse<ModelType>;
	list: ModelType[];
}
const fuseCache = new Map<string, FuseCache>();

export const searchAtom = atomFamily(
	(params: SearchParams | string) => 
		atom<ModelType[]>((get) => {
			const list = get(listAtom);
			
			// Handle backward compatibility for string-only parameter
			const { query, options } = typeof params === "string" 
				? { query: params, options: undefined }
				: params;
			
			// Return all items if query is empty
			if (!query || query.trim() === "") {
				return list;
			}
			
			// Create cache key based on options
			const cacheKey = JSON.stringify(options?.keys || defaultSearchKeys);
			
			// Get or create Fuse instance
			let cached = fuseCache.get(cacheKey);
			if (!cached || cached.list !== list) {
				const fuseOptions: IFuseOptions<ModelType> = {
					keys: defaultSearchKeys,
					threshold: 0.3,
					ignoreLocation: true,
					...options,
				};
				const fuse = new Fuse(list, fuseOptions);
				cached = { fuse, list };
				fuseCache.set(cacheKey, cached);
			}
			
			// Perform search
			const results = cached.fuse.search(query);
			
			// Return just the items (not the Fuse result objects)
			return results.map(result => result.item);
		}),
	// Custom equality function to ensure stable keys
	(a, b) => {
		const aKey = typeof a === "string" ? a : JSON.stringify(a);
		const bKey = typeof b === "string" ? b : JSON.stringify(b);
		return aKey === bKey;
	}
);
`;
  const filePath = join5(modelDir, "derived.ts");
  await writeFile(filePath, template);
}

// src/templates/fx.ts
import { join as join6 } from "node:path";
async function generateEffectAtoms(modelInfo, _context, modelDir) {
  const { name: modelName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { unwrap } from "../shared/actions/unwrap";
import * as actions from "./actions";
import { entitiesAtom, errorAtom, pendingPatchesAtom } from "./atoms";
import type { CreateInput, ModelType, Options, UpdateInput, WhereInput, WhereUniqueInput } from "./types";

/* ---------- create ---------- */
export const createAtom = atom(null, async (_get, set, data: CreateInput) => {
	const tempId = crypto.randomUUID();
	set(entitiesAtom, (m) => ({ ...m, [tempId]: { ...data, id: tempId } as unknown as ModelType }));
	set(pendingPatchesAtom, (p) => ({ ...p, [tempId]: { type: "create" } }));

	try {
		const created = unwrap(await actions.create(data));
		set(entitiesAtom, (m) => {
			const { [tempId]: _, ...rest } = m;
			return { ...rest, [created.id]: created };
		});
	} catch (err: any) {
		set(errorAtom, err);
		// rollback
		set(entitiesAtom, (m) => {
			const { [tempId]: _, ...rest } = m;
			return rest;
		});
	} finally {
		set(pendingPatchesAtom, (p) => {
			const { [tempId]: _, ...rest } = p;
			return rest;
		});
	}
});

/* ---------- update ---------- */
export const updateAtom = atom(null, async (get, set, { id, data }: { id: string; data: UpdateInput }) => {
	set(pendingPatchesAtom, (p) => ({ ...p, [id]: { type: "update" } }));
	const prev = get(entitiesAtom)[id] ?? ({} as ModelType);
	set(entitiesAtom, (m) => ({ ...m, [id]: { ...prev, ...data } as unknown as ModelType }));

	try {
		const updated = unwrap(await actions.update({ id }, data));
		set(entitiesAtom, (m) => ({ ...m, [id]: updated }));
	} catch (err: any) {
		set(errorAtom, err);
		// rollback
		if (prev) {
			set(entitiesAtom, (m) => ({ ...m, [id]: prev }));
		}
	} finally {
		set(pendingPatchesAtom, (p) => {
			const { [id]: _, ...rest } = p;
			return rest;
		});
	}
});

/* ---------- upsert ---------- */
export const upsertAtom = atom(
	null,
	async (get, set, selector: WhereUniqueInput, payload: { create: CreateInput; update: UpdateInput }) => {
		const tempId = selector.id ?? crypto.randomUUID();
		let committedId = tempId;
		const prev = get(entitiesAtom)[tempId] ?? ({} as ModelType);

		/* optimistic */
		set(pendingPatchesAtom, (p) => ({ ...p, [tempId]: { type: "upsert" } }));
		set(entitiesAtom, (m) => ({ ...m, [tempId]: { ...prev, ...payload.update } as unknown as ModelType }));

		try {
			const updated = unwrap(await actions.upsert(selector, payload.create, payload.update));
			committedId = updated.id;

			set(entitiesAtom, (m) =>
				committedId === tempId
					? { ...m, [tempId]: updated }
					: { ...Object.fromEntries(Object.entries(m).filter(([k]) => k !== tempId)), [committedId]: updated },
			);
		} catch (err: any) {
			set(errorAtom, err);
			set(entitiesAtom, (m) => ({ ...m, [committedId]: prev }));
		} finally {
			set(pendingPatchesAtom, (p) => {
				const { [tempId]: _, [committedId]: __, ...rest } = p;
				return rest;
			});
		}
	},
);

/* ---------- delete ---------- */
export const deleteAtom = atom(null, async (get, set, id: string) => {
	set(pendingPatchesAtom, (p) => ({ ...p, [id]: { type: "delete" } }));
	const prev = get(entitiesAtom)[id];
	set(entitiesAtom, (m) => {
		const { [id]: _, ...rest } = m;
		return rest;
	});

	try {
		unwrap(await actions.remove({ id }));
	} catch (err: any) {
		set(errorAtom, err);
		// rollback
		if (prev) {
			set(entitiesAtom, (m) => ({ ...m, [id]: prev }));
		}
	} finally {
		set(pendingPatchesAtom, (p) => {
			const { [id]: _, ...rest } = p;
			return rest;
		});
	}
});

/* ---------- load helpers ---------- */
export const loadsListAtom = atom(null, async (_get, set, filter: WhereInput = {}, options: Options = {}) => {
	try {
		const list = unwrap(await actions.findMany(filter, options));
		const map = list.reduce<Record<string, ModelType>>((acc, p) => {
			acc[p.id] = p;
			return acc;
		}, {});
		set(entitiesAtom, map);
	} catch (err: any) {
		set(errorAtom, err);
	}
});

export const loadEntityAtom = atom(null, async (_get, set, selector: WhereUniqueInput) => {
	try {
		const single = unwrap(await actions.findUnique(selector));
		if (single) set(entitiesAtom, (m) => ({ ...m, [single.id]: single }));
	} catch (err: any) {
		set(errorAtom, err);
	}
});
`;
  const filePath = join6(modelDir, "fx.ts");
  await writeFile(filePath, template);
}

// src/templates/hooks.ts
import { join as join7 } from "node:path";
async function generateReactHooks(modelInfo, _context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import { useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { IFuseOptions } from "fuse.js";
import { entityAtomFamily, errorAtom, pendingPatchesAtom } from "./atoms";
import {
	countAtom,
	countByFieldAtomFamily,
	entityBusyFamily,
	entityLoadableFamily,
	hasAnyAtom,
	listByFieldAtomFamily,
	listLoadable,
	loadingAtom,
	pagedAtom,
	searchAtom,
	selectedAtom,
	selectedIdAtom,
} from "./derived";

import { makeRelationHelpers } from "../shared/hooks/relation-helper";
import { createFormActions, makeUseFormHook, type UseFormOptions } from "../shared/hooks/use-form-factory";
import { useAutoload } from "../shared/hooks/useAutoload";
import { createAtom, deleteAtom, loadEntityAtom, loadsListAtom, updateAtom, upsertAtom } from "./fx";
import { schemas } from "./schemas";
import type { CreateInput, ModelType, Relationships, UpdateInput } from "./types";

/**
 * Hook for managing the complete ${lowerPluralName} collection with comprehensive state management.
 *
 * Provides access to the full ${lowerPluralName} list along with loading states, error handling,
 * and all necessary CRUD operations. This hook manages the global state for ${lowerPluralName}
 * and automatically handles loading indicators and error states.
 *
 * @param {Object} opts - Configuration options
 * @param {boolean} [opts.autoLoad=true] - Whether to automatically load data when component mounts
 *
 * @returns {Object} Complete ${lowerPluralName} management interface
 * @returns {Array} data - Array of ${lowerPluralName} (empty array when loading or on error)
 * @returns {number} count - Total number of ${lowerPluralName} available
 * @returns {boolean} hasAny - Quick check if any ${lowerPluralName} exist
 * @returns {boolean} loading - True when fetching data or performing operations
 * @returns {Error|null} error - Last error that occurred, null if no errors
 * @returns {Function} create${modelName} - Creates a new ${lowerName}
 * @returns {Function} update${modelName} - Updates an existing ${lowerName}
 * @returns {Function} upsert${modelName} - Upserts a ${lowerName}
 * @returns {Function} delete${modelName} - Deletes a ${lowerName} by ID
 * @returns {Function} fetchAll - Refreshes the entire ${lowerPluralName} list
 *
 * @example
 * \`\`\`tsx
 * function ${pluralName}List() {
 *   const { data, loading, error, create${modelName}, update${modelName}, delete${modelName} } = use${pluralName}List();
 *
 *   if (loading) return <div>Loading ${lowerPluralName}...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data.map(${lowerName} => (
 *         <${modelName}Item key={${lowerName}.id} ${lowerName}={${lowerName}} onUpdate={update${modelName}} onDelete={delete${modelName}} />
 *       ))}
 *     </div>
 *   );
 * }
 * \`\`\`
 */
export function use${pluralName}List(opts: { autoLoad?: boolean } = { autoLoad: true }) {
	const loadable = useAtomValue(listLoadable);
	const busy = useAtomValue(loadingAtom);
	const count = useAtomValue(countAtom);
	const hasAny = useAtomValue(hasAnyAtom);
	const lastError = useAtomValue(errorAtom);

	const create${modelName} = useSetAtom(createAtom);
	const update${modelName} = useSetAtom(updateAtom);
	const delete${modelName} = useSetAtom(deleteAtom);
	const upsert${modelName} = useSetAtom(upsertAtom);
	const fetchAll = useSetAtom(loadsListAtom);
	const fetchById = useSetAtom(loadEntityAtom);

	useAutoload(
		() => opts.autoLoad !== false && !busy && !hasAny,
		() => fetchAll(),
	);

	return {
		/* data */
		data: loadable.state === "hasData" ? loadable.data : [],
		count,
		hasAny,

		/* meta */
		loading: busy || loadable.state === "loading",
		error: loadable.state === "hasError" ? loadable.error : lastError,

		/* actions */
		create${modelName},
		update${modelName},
		delete${modelName},
		upsert${modelName},
		fetchAll,
		fetchById,
	};
}

/**
 * Hook for managing a specific ${lowerName} by ID with optimistic updates and error handling.
 *
 * Provides granular control over individual ${lowerPluralName}, including fetching, updating, and deleting.
 * The hook automatically manages loading states and errors specific to this ${lowerName} instance.
 * Actions are pre-bound with the ${lowerName} ID for convenience.
 *
 * @param {string} id - The unique identifier of the ${lowerName} to manage
 * @param {Object} opts - Configuration options
 * @param {boolean} [opts.autoLoad=true] - Whether to automatically load data when component mounts
 *
 * @returns {Object} Single ${lowerName} management interface
 * @returns {Object|null} data - The ${lowerName} data object, null if not found or loading
 * @returns {boolean} loading - True when fetching or performing operations on this ${lowerName}
 * @returns {Error|null} error - Last error related to operations on this ${lowerName}
 * @returns {Function} update${modelName} - Updates this specific ${lowerName} with provided data
 * @returns {Function} delete${modelName} - Deletes this specific ${lowerName}
 * @returns {Function} fetch - Fetches/refreshes this specific ${lowerName} from the server
 * @returns {Object} relations - relationship helpers
 *
 * @example
 * \`\`\`tsx
 * function ${modelName}Detail({ ${lowerName}Id }: { ${lowerName}Id: string }) {
 *   const { data, loading, error, update${modelName}, delete${modelName} } = use${modelName}(${lowerName}Id);
 *
 *   if (loading) return <div>Loading ${lowerName}...</div>;
 *   if (error) return <div>Error loading ${lowerName}: {error.message}</div>;
 *   if (!data) return <div>${modelName} not found</div>;
 *
 *   const handleSave = (formData) => {
 *     update${modelName}(formData); // ID is automatically included
 *   };
 *
 *   return (
 *     <div>
 *       <h1>{data.title}</h1>
 *       <p>{data.content}</p>
 *       <button onClick={() => delete${modelName}()}>Delete</button>
 *     </div>
 *   );
 * }
 * \`\`\`
 */
export function use${modelName}(id: string, opts: { autoLoad?: boolean } = { autoLoad: true }) {
	const ${lowerName} = useAtomValue(entityAtomFamily(id));
	const loadable = useAtomValue(entityLoadableFamily(id));
	const busyItem = useAtomValue(entityBusyFamily(id));
	const lastError = useAtomValue(errorAtom);
	const pendingPatches = useAtomValue(pendingPatchesAtom);

	const update${modelName} = useSetAtom(updateAtom);
	const delete${modelName} = useSetAtom(deleteAtom);
	const fetch = useSetAtom(loadEntityAtom);

	const relations = makeRelationHelpers<Relationships>(id, update${modelName});

	useAutoload(
		() =>
			opts.autoLoad !== false &&
			!busyItem &&
			!${lowerName} &&
			!pendingPatches[id],
		() => fetch({ id }),
	);

	return {
		/* data */
		data: ${lowerName},

		/* meta */
		loading: busyItem || loadable.state === "loading",
		error: lastError,

		/* actions */
		update${modelName}: (data: UpdateInput) => update${modelName}({ id, data }),
		delete${modelName}: () => delete${modelName}(id),
		fetch: () => fetch({ id }),

		/* relations */
		relations,
	};
}

/**
 * Enhanced form hook with integrated CRUD operations and optimistic updates.
 * 
 * Automatically detects create vs update mode based on whether an instance is provided.
 * Integrates directly with the ${lowerName} atoms for seamless state management.
 *
 * @param {ModelType} [instance] - ${modelName} instance for update mode, undefined for create mode
 * @param {Object} [options] - Form options and callbacks
 * @param {Function} [options.onSuccess] - Callback fired on successful submission
 * @param {Function} [options.onError] - Callback fired on submission error
 * @param {boolean} [options.resetOnSuccess=true] - Whether to reset form after successful creation
 * @param {Object} [options.transform] - Data transformation functions
 *
 * @returns {Object} Enhanced form interface with submission handling
 * @returns {Function} handleSubmit - Form submission handler
 * @returns {boolean} isSubmitting - Whether form is currently submitting
 * @returns {boolean} isCreating - Whether form is in create mode and submitting
 * @returns {boolean} isUpdating - Whether form is in update mode and submitting
 * @returns {string} mode - Current form mode: 'create' | 'update'
 * @returns {any} submitError - Last submission error, if any
 * @returns {*} ...formMethods - All react-hook-form methods and state
 *
 * @example
 * \`\`\`tsx
 * function ${modelName}Form({ ${lowerName}, onClose }) {
 *   const form = use${modelName}Form(${lowerName}, {
 *     onSuccess: () => onClose(),
 *     onError: (error) => toast.error(error.message),
 *     transform: {
 *       toCreateInput: (data) => ({
 *         ...data,
 *         authorId: data.author?.id || data.authorId,
 *         categoryId: data.category?.id || data.categoryId,
 *       }),
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input {...form.register('title')} placeholder="Title" />
 *       <textarea {...form.register('description')} placeholder="Description" />
 *       <button type="submit" disabled={form.isSubmitting}>
 *         {form.isSubmitting 
 *           ? (form.mode === 'create' ? 'Creating...' : 'Updating...') 
 *           : (form.mode === 'create' ? 'Create ${modelName}' : 'Update ${modelName}')
 *         }
 *       </button>
 *     </form>
 *   );
 * }
 * \`\`\`
 */
export function use${modelName}Form(instance?: ModelType, options: UseFormOptions<ModelType> = {}) {
	const create${modelName}Action = useSetAtom(createAtom);
	const update${modelName}Action = useSetAtom(updateAtom);
	
	const formActions = createFormActions(create${modelName}Action, update${modelName}Action);
	
	return makeUseFormHook<ModelType, CreateInput, UpdateInput>(
		{
			create: schemas.createInput,
			update: schemas.updateInput,
		},
		formActions
	)(instance, options);
}

export const useSelectedId = () => useAtomValue(selectedIdAtom);
export const useSelected = () => useAtomValue(selectedAtom);
export const useSetSelectedId = () => useSetAtom(selectedIdAtom);

export function useListByFieldValue<K extends keyof ModelType>(field: K, value: ModelType[K]) {
	const fam = listByFieldAtomFamily(field);
	return useAtomValue(fam(value));
}

export function usePagedList(page: number, pageSize = 10) {
	return useAtomValue(pagedAtom({ page, pageSize }));
}

// Type helper to extract all string paths from a type
type PathsToStringProps<T, P extends string = ""> = T extends string | number | boolean | Date | null | undefined
	? P
	: T extends Array<infer U>
	? PathsToStringProps<U, P>
	: T extends object
	? {
			[K in keyof T]: PathsToStringProps<T[K], P extends "" ? K & string : \`\${P}.\${K & string}\`>
	  }[keyof T]
	: never;

// Get all valid search keys for ModelType
type SearchKeys = PathsToStringProps<ModelType>;

interface UseSearchOptions extends Omit<IFuseOptions<ModelType>, 'keys'> {
	keys?: SearchKeys[];
}

interface UseSearchReturn<T> {
	search: (query: string) => void;
	results: T[];
	query: string;
}

export function useSearch(options?: UseSearchOptions): UseSearchReturn<ModelType> {
	const [query, setQuery] = useState("");
	const results = useAtomValue(searchAtom({ query, options }));
	
	const search = useCallback((newQuery: string) => {
		setQuery(newQuery);
	}, []);
	
	return {
		search,
		results,
		query,
	};
}

export function useCountByFieldValue<K extends keyof ModelType>(field: K, value: ModelType[K]) {
	const fam = countByFieldAtomFamily(field);
	return useAtomValue(fam(value));
}
`;
  const filePath = join7(modelDir, "hooks.ts");
  await writeFile(filePath, template);
}

// src/templates/index.ts
import { join as join8 } from "node:path";
async function generateModelIndex(modelInfo, _context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import * as Actions from "./actions";
import * as baseAtoms from "./atoms";
import * as derived from "./derived";
import * as fx from "./fx";
import * as Hooks from "./hooks";
import * as Schemas from "./schemas";
import * as Types from "./types";

export type { CreateInput, ModelType as ${modelName}, UpdateInput, WhereUniqueInput } from "./types";

const Atoms = {
	...baseAtoms,
	...derived,
	...fx,
};

export const ${lowerPluralName} = {
	atoms: Atoms,
	hooks: Hooks,
	actions: Actions,
	schemas: Schemas,
	types: Types,
} as const;

export const { use${pluralName}List, use${modelName}, use${modelName}Form } = Hooks;
`;
  const filePath = join8(modelDir, "index.ts");
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

// src/templates/root-index.ts
import { join as join9 } from "node:path";
async function generateRootIndex(context) {
  const { config } = context;
  const modelImports = config.models.map((modelName) => {
    const lowerModelName = modelName.toLowerCase();
    const pluralName = plural2(lowerModelName);
    return `import { ${pluralName} } from "./${lowerModelName}";`;
  }).join(`
`);
  const typeImports = config.models.map((modelName) => {
    const lowerModelName = modelName.toLowerCase();
    return `import type { ModelType as ${modelName} } from "./${lowerModelName}/types";`;
  }).join(`
`);
  const modelExports = config.models.map((modelName) => {
    const lowerModelName = modelName.toLowerCase();
    const pluralName = plural2(lowerModelName);
    return `	${pluralName},`;
  }).join(`
`);
  const typeExports = config.models.map((modelName) => {
    return `	type ${modelName},`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}${modelImports}

${typeImports}

// Export all models
export {
${modelExports}
};

// Export all types
export {
${typeExports}
};

// Export shared utilities
export { prisma } from "./prisma";
export * as zod from "./zod";
`;
  const filePath = join9(context.outputDir, "index.ts");
  await writeFile(filePath, template);
}

// src/templates/schemas.ts
import { join as join10 } from "node:path";
async function generateSchemas(modelInfo, _context, modelDir) {
  const { name: modelName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import {
	${modelName}CreateManyInputSchema,
	${modelName}FindFirstArgsSchema,
	${modelName}FindManyArgsSchema,
	${modelName}UncheckedCreateInputSchema,
	${modelName}UncheckedUpdateInputSchema,
	${modelName}WhereInputSchema,
	${modelName}WhereUniqueInputSchema,
} from "../zod";

export const schemas = {
	whereUnique: ${modelName}WhereUniqueInputSchema,
	where: ${modelName}WhereInputSchema,
	createInput: ${modelName}UncheckedCreateInputSchema,
	createManyInput: ${modelName}CreateManyInputSchema,
	updateInput: ${modelName}UncheckedUpdateInputSchema,
	findFirstArgs: ${modelName}FindFirstArgsSchema,
	findManyArgs: ${modelName}FindManyArgsSchema,
};
`;
  const filePath = join10(modelDir, "schemas.ts");
  await writeFile(filePath, template);
}

// src/templates/shared.ts
import { join as join11 } from "node:path";
async function generateSharedInfrastructure(context) {
  const sharedDir = join11(context.outputDir, "shared");
  const actionsDir = join11(sharedDir, "actions");
  const hooksDir = join11(sharedDir, "hooks");
  await ensureDirectory(sharedDir);
  await ensureDirectory(actionsDir);
  await ensureDirectory(hooksDir);
  const _baselineSharedPath = join11(process.cwd(), "baseline", "shared");
  const factoryContent = `import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: { message: string; code: string; details?: any } };

export const handleAction = async <T>(operation: () => Promise<T>): Promise<ActionResult<T>> => {
	try {
		const data = await operation();
		return {
			success: true,
			data,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: {
					message: error.message,
					code: "VALIDATION_ERROR",
					details: error.errors,
				},
			};
		} else if (error instanceof PrismaClientKnownRequestError) {
			return {
				success: false,
				error: {
					message: error.message,
					code: error.code,
					details: error.meta,
				},
			};
		}
		return {
			success: false,
			error: { message: "Unknown error", code: "UNKNOWN_ERROR" },
		};
	}
};

// Schema types for validation
export type ModelSchemas = {
	whereUnique: z.ZodSchema<any>;
	where: z.ZodSchema<any>;
	createInput: z.ZodSchema<any>;
	createManyInput: z.ZodSchema<any>;
	updateInput: z.ZodSchema<any>;
	findFirstArgs?: z.ZodSchema<any>;
	findManyArgs?: z.ZodSchema<any>;
};

// Generic CRUD operations factory
export function createModelActions<T, S extends ModelSchemas, Select>(model: any, schemas: S, select: Select) {
	return {
		findUnique: async (filter: z.infer<S["whereUnique"]>): Promise<ActionResult<T | null>> => {
			return handleAction(async () => {
				const parsed = schemas.whereUnique.parse(filter);
				const result = await model.findUniqueOrThrow({
					where: parsed,
					select,
				});
				return result as T | null;
			});
		},

		findMany: async (
			filter: z.infer<S["where"]>,
			options?: S["findManyArgs"] extends z.ZodSchema ? z.infer<S["findManyArgs"]> : any,
		): Promise<ActionResult<T[]>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(filter);
				const result = await model.findMany({
					...options,
					where: parsed,
					select,
				});
				return result as T[];
			});
		},

		findFirst: async (
			filter: z.infer<S["where"]>,
			options?: S["findFirstArgs"] extends z.ZodSchema ? z.infer<S["findFirstArgs"]> : any,
		): Promise<ActionResult<T | null>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(filter);
				const result = await model.findFirst({
					...options,
					where: parsed,
					select,
				});
				return result as T | null;
			});
		},

		create: async (data: z.infer<S["createInput"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsed = schemas.createInput.parse(data);
				const result = await model.create({
					data: parsed,
					select,
				});
				return result as T;
			});
		},

		createMany: async (data: z.infer<S["createManyInput"]>[]): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsed = data.map((item) => schemas.createManyInput.parse(item));
				const result = await model.createMany({
					data: parsed,
				});
				return result;
			});
		},

		update: async (where: z.infer<S["whereUnique"]>, data: z.infer<S["updateInput"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.whereUnique.parse(where);
				const parsedData = schemas.updateInput.parse(data);
				const result = await model.update({
					where: parsedWhere,
					data: parsedData,
					select,
				});
				return result as T;
			});
		},

		updateMany: async (
			where: z.infer<S["where"]>,
			data: z.infer<S["updateInput"]>,
		): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.where.parse(where);
				const parsedData = schemas.updateInput.parse(data);
				const result = await model.updateMany({
					where: parsedWhere,
					data: parsedData,
				});
				return result;
			});
		},

		upsert: async (
			where: z.infer<S["whereUnique"]>,
			create: z.infer<S["createInput"]>,
			update: z.infer<S["updateInput"]>,
		): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.whereUnique.parse(where);
				const parsedCreate = schemas.createInput.parse(create);
				const parsedUpdate = schemas.updateInput.parse(update);
				const result = await model.upsert({
					where: parsedWhere,
					create: parsedCreate,
					update: parsedUpdate,
					select,
				});
				return result as T;
			});
		},

		remove: async (where: z.infer<S["whereUnique"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsed = schemas.whereUnique.parse(where);
				const result = await model.delete({
					where: parsed,
					select,
				});
				return result as T;
			});
		},

		removeMany: async (where: z.infer<S["where"]>): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(where);
				const result = await model.deleteMany({
					where: parsed,
				});
				return result;
			});
		},

		count: async (where?: z.infer<S["where"]>): Promise<ActionResult<number>> => {
			return handleAction(async () => {
				const parsed = where ? schemas.where.parse(where) : undefined;
				const result = await model.count({
					where: parsed,
				});
				return result;
			});
		},
	};
}
`;
  await writeFile(join11(actionsDir, "factory.ts"), factoryContent);
  const unwrapContent = `import type { ActionResult } from "./factory";

export function unwrap<T>(result: ActionResult<T>): T {
	if (result.success) {
		return result.data;
	}
	
	const error = new Error(result.error.message);
	(error as any).code = result.error.code;
	(error as any).details = result.error.details;
	
	throw error;
}
`;
  await writeFile(join11(actionsDir, "unwrap.ts"), unwrapContent);
  const relationHelperContent = `/**
 * Build a typed relation-helper object
 */
export function makeRelationHelpers<R extends Record<string, { where: any; many: boolean }>>(
	id: string,
	update: (arg: { id: string; data: any }) => Promise<unknown>,
) {
	type Helpers = {
		[K in keyof R]: R[K] extends { where: infer Where; many: infer M }
			? M extends true
				? {
						connect: (where: Where | Where[]) => Promise<void>;
						disconnect: (where: Where | Where[]) => Promise<void>;
						set: (where: Where[]) => Promise<void>;
						clear: () => Promise<void>;
					}
				: {
						connect: (where: Where) => Promise<void>;
						disconnect: () => Promise<void>;
					}
			: never;
	};

	const factory = {} as Helpers;

	for (const key of Object.keys({}) as (keyof R)[]) {
		const relation = key as string;

		(factory as any)[relation] = {
			connect: (where: any) => update({ id, data: { [relation]: { connect: where } } }),
			disconnect: (arg?: any) => {
				const disconnectPayload = Array.isArray(arg) || arg ? { disconnect: arg } : { disconnect: true };
				return update({ id, data: { [relation]: disconnectPayload } });
			},
			set: (whereArr: any[]) => update({ id, data: { [relation]: { set: whereArr } } }),
			clear: () => update({ id, data: { [relation]: { set: [] } } }),
		};
	}

	return factory as Helpers;
}
`;
  await writeFile(join11(hooksDir, "relation-helper.ts"), relationHelperContent);
  const useFormFactoryContent = `// @ts-nocheck
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

/* -----------------------------------------------------------
   Generic schema bundle the generator passes in.
   ----------------------------------------------------------- */
export interface FormSchemas<CreateInput, UpdateInput> {
	create: z.ZodSchema<CreateInput>;
	update: z.ZodSchema<UpdateInput>;
}

/* -----------------------------------------------------------
   Form submission actions interface
   ----------------------------------------------------------- */
export interface FormActions<Model, CreateInput, UpdateInput> {
	create: (data: CreateInput) => Promise<void> | void;
	update: (args: { id: string; data: UpdateInput }) => Promise<void> | void;
}

/* -----------------------------------------------------------
   Form options and callbacks
   ----------------------------------------------------------- */
export interface UseFormOptions<Model> {
	onSuccess?: (result: Model | null) => void;
	onError?: (error: any) => void;
	resetOnSuccess?: boolean;
	mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
	transform?: {
		toCreateInput?: (data: any) => any;
		toUpdateInput?: (data: any) => any;
		fromModelType?: (model: Model) => any;
	};
}

/* -----------------------------------------------------------
   Enhanced form return interface
   ----------------------------------------------------------- */
export interface UseModelFormReturn<CreateInput, UpdateInput> extends UseFormReturn<CreateInput | UpdateInput> {
	handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
	isSubmitting: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	mode: "create" | "update";
	submitError: any;
}

/* -----------------------------------------------------------
   Default transformation function for common patterns
   ----------------------------------------------------------- */
function defaultModelTypeTransform(instance: any): any {
	if (!instance) return {};

	const { id, createdAt, updatedAt, ...rest } = instance;
	const transformed: any = {};

	// Transform each field
	for (const [key, value] of Object.entries(rest)) {
		if (value && typeof value === 'object' && 'id' in value) {
			// This is a relation object, extract the ID
			transformed[\`\${key}Id\`] = value.id;
		} else if (!Array.isArray(value)) {
			// Regular field (skip arrays like comments)
			transformed[key] = value;
		}
	}

	return transformed;
}

/* -----------------------------------------------------------
   Factory that returns a model-specific hook with integrated actions.
   ----------------------------------------------------------- */
export function makeUseFormHook<Model, CreateInput, UpdateInput>(
	schemas: FormSchemas<CreateInput, UpdateInput>,
	actions: FormActions<Model, CreateInput, UpdateInput>
) {
	return function useModelForm(
		instance?: Model,
		options: UseFormOptions<Model> = {}
	): UseModelFormReturn<CreateInput, UpdateInput> {
		const {
			onSuccess,
			onError,
			resetOnSuccess = true,
			mode = "onChange",
			transform = {},
		} = options;

		const [isSubmitting, setIsSubmitting] = useState(false);
		const [submitError, setSubmitError] = useState<any>(null);

		// Determine form mode and schema
		const isUpdateMode = Boolean(instance);
		const { schema, defaults } = useMemo(() => {
			if (isUpdateMode && instance) {
				// Transform ModelType to UpdateInput format
				const transformedData = transform.fromModelType 
					? transform.fromModelType(instance)
					: defaultModelTypeTransform(instance);

				return {
					schema: schemas.update,
					defaults: transformedData as Partial<UpdateInput>,
				};
			}
			return { schema: schemas.create, defaults: {} };
		}, [instance, isUpdateMode, schemas.create, schemas.update, transform.fromModelType]);

		/* --- Initialize form with proper schema and defaults ---- */
		const form = useForm({
			resolver: zodResolver(schema),
			defaultValues: defaults,
			mode,
		});

		/* --- Keep form in sync with instance changes ------------- */
		useEffect(() => {
			form.reset(defaults);
			setSubmitError(null);
		}, [defaults, form]);

		/* --- Enhanced submit handler with integrated actions ----- */
		const handleSubmit = useCallback(
			async (e?: React.BaseSyntheticEvent) => {
				if (e) {
					e.preventDefault();
					e.stopPropagation();
				}

				return form.handleSubmit(async (data) => {
					setIsSubmitting(true);
					setSubmitError(null);

					try {
						if (isUpdateMode && instance) {
							// Update mode
							const transformedData = transform.toUpdateInput 
								? transform.toUpdateInput(data) 
								: data;
							
							await actions.update({
								id: (instance as any).id,
								data: transformedData as UpdateInput,
							});
						} else {
							// Create mode
							const transformedData = transform.toCreateInput 
								? transform.toCreateInput(data) 
								: data;
							
							await actions.create(transformedData as CreateInput);
						}

						// Handle success
						onSuccess?.(isUpdateMode ? instance : null);
						
						if (resetOnSuccess && !isUpdateMode) {
							form.reset();
						}
					} catch (error) {
						console.error("Form submission error:", error);
						setSubmitError(error);
						onError?.(error);
					} finally {
						setIsSubmitting(false);
					}
				})(e);
			},
			[form, isUpdateMode, instance, actions, transform, onSuccess, onError, resetOnSuccess]
		);

		return {
			...form,
			handleSubmit,
			isSubmitting,
			isCreating: isSubmitting && !isUpdateMode,
			isUpdating: isSubmitting && isUpdateMode,
			mode: isUpdateMode ? "update" : "create",
			submitError,
		};
	};
}

/* -----------------------------------------------------------
   Utility for creating action integration
   ----------------------------------------------------------- */
export function createFormActions<Model, CreateInput, UpdateInput>(
	createAtom: any,
	updateAtom: any
) {
	return {
		create: createAtom,
		update: updateAtom,
	} as FormActions<Model, CreateInput, UpdateInput>;
}`;
  await writeFile(join11(hooksDir, "use-form-factory.ts"), useFormFactoryContent);
  const useAutoloadContent = `import { useEffect, useRef, startTransition } from "react";

/**
 * Fire \`action()\` exactly once per component when \`shouldLoad()\` is true.
 * 
 * This hook provides automatic data loading with the following guarantees:
 * - Only fires once per component instance lifecycle
 * - Respects concurrent mode with startTransition for smoother UX
 * - Prevents loading loops and duplicate requests
 * 
 * @param shouldLoad - Function that returns true when loading should occur
 * @param action - Action to execute (can be sync/async)
 */
export function useAutoload(
	shouldLoad: () => boolean,
	action: () => void | Promise<unknown>,
) {
	const fired = useRef(false);

	useEffect(() => {
		if (!fired.current && shouldLoad()) {
			fired.current = true;
			// Keep UI responsive; polyfills to direct call in non-concurrent envs
			startTransition(() => {
				action();
			});
		}
	}, [shouldLoad, action]);
}`;
  await writeFile(join11(hooksDir, "useAutoload.ts"), useAutoloadContent);
}

// src/templates/types.ts
import { join as join12 } from "node:path";
async function generateTypeDefinitions(modelInfo, context, modelDir) {
  const { name: modelName, analyzed } = modelInfo;
  const selectType = createSelectType(modelInfo, context);
  const relationshipsInterface = generateRelationshipsInterface(analyzed, modelName);
  const template = `${formatGeneratedFileHeader()}import type { Prisma } from "../prisma";

export type CreateInput = Prisma.${modelName}UncheckedCreateInput;
export type CreateManyInput = Prisma.${modelName}CreateManyInput;
export type UpdateInput = Prisma.${modelName}UncheckedUpdateInput;
export type UpdateManyInput = {
	where: Prisma.${modelName}WhereInput;
	data: Prisma.${modelName}UncheckedUpdateManyInput;
	limit?: number;
};
export type WhereInput = Prisma.${modelName}WhereInput;
export type WhereUniqueInput = Prisma.${modelName}WhereUniqueInput;
export type OrderByInput = Prisma.${modelName}OrderByWithRelationInput;
export type SelectInput = Prisma.${modelName}Select;
export type IncludeInput = Prisma.${modelName}Include;

export type ModelType = Prisma.${modelName}GetPayload<{
	select: ${selectType}
}>;

export type Options = {
	orderBy?: OrderByInput;
};

export type CreateManyOptions = {
	include?: IncludeInput;
	select?: SelectInput;
};

${relationshipsInterface}
`;
  const filePath = join12(modelDir, "types.ts");
  await writeFile(filePath, template);
}
function createSelectType(modelInfo, context) {
  const { selectFields, analyzed } = modelInfo;
  if (!selectFields || selectFields.length === 0) {
    return "true";
  }
  return buildSelectObject2(modelInfo, context, new Set).trimmedResult;
}
function buildSelectObject2(modelInfo, context, visited) {
  const { selectFields, analyzed, name: currentModelName } = modelInfo;
  if (!selectFields || selectFields.length === 0) {
    return { trimmedResult: "true", fullResult: "true" };
  }
  const newVisited = new Set([...visited, currentModelName]);
  const selectEntries = [];
  for (const field of selectFields) {
    const relationField = [...analyzed.relationships?.owns || [], ...analyzed.relationships?.referencedBy || []].find((rel) => rel.fieldName === field);
    if (relationField) {
      const relatedModelName = relationField.relatedModel;
      if (visited.has(relatedModelName)) {
        continue;
      }
      const relatedModelConfig = getModelConfig2(relatedModelName, context);
      const relatedSelectFields = getSelectFieldsForModel2(relatedModelName, relatedModelConfig, context);
      if (relatedSelectFields.length === 0) {
        selectEntries.push(`		${field}: true`);
      } else {
        const relatedModel = context.dmmf.datamodel.models.find((m) => m.name === relatedModelName);
        if (relatedModel) {
          const schemaRelationships = analyzeSchemaRelationships(context.dmmf);
          const relatedModelRelationships = schemaRelationships.get(relatedModelName);
          const relatedRelationshipInfo = relatedModelRelationships ? {
            owns: relatedModelRelationships.ownsRelations,
            referencedBy: relatedModelRelationships.referencedBy,
            relatedModels: Array.from(relatedModelRelationships.relatedModels)
          } : undefined;
          const relatedAnalyzed = analyzeModel(relatedModel, relatedRelationshipInfo);
          const relatedModelInfo = {
            name: relatedModelName,
            lowerName: relatedModelName.toLowerCase(),
            camelCaseName: camelCase2(relatedModelName),
            pluralName: "",
            lowerPluralName: "",
            config: relatedModelConfig,
            model: relatedModel,
            selectFields: relatedSelectFields,
            analyzed: relatedAnalyzed,
            validationRules: []
          };
          const nestedSelect = buildSelectObject2(relatedModelInfo, context, newVisited);
          if (nestedSelect.trimmedResult === "true") {
            selectEntries.push(`		${field}: true`);
          } else {
            selectEntries.push(`		${field}: {
			select: ${nestedSelect.trimmedResult};
		}`);
          }
        } else {
          selectEntries.push(`		${field}: true`);
        }
      }
    } else {
      selectEntries.push(`		${field}: true`);
    }
  }
  const result = selectEntries.length > 0 ? `{
${selectEntries.join(`;
`)};
	}` : "{}";
  return { trimmedResult: result, fullResult: result };
}
function getModelConfig2(modelName, context) {
  const lowerModelName = modelName.toLowerCase();
  return context.config[lowerModelName] || {};
}
function getSelectFieldsForModel2(modelName, modelConfig, context) {
  if (modelConfig.select && Array.isArray(modelConfig.select)) {
    return modelConfig.select;
  }
  const model = context.dmmf.datamodel.models.find((m) => m.name === modelName);
  if (model) {
    return model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name);
  }
  return [];
}
function generateRelationshipsInterface(analyzed, _modelName) {
  const allRelationships = [...analyzed.relationships?.owns || [], ...analyzed.relationships?.referencedBy || []];
  if (!allRelationships.length) {
    return `export interface Relationships extends Record<string, { where: any; many: boolean }> {
	// No relationships found for this model
}`;
  }
  const uniqueRelationships = allRelationships.reduce((acc, rel) => {
    if (!acc.find((existing) => existing.fieldName === rel.fieldName)) {
      acc.push(rel);
    }
    return acc;
  }, []);
  const relationEntries = uniqueRelationships.map((rel) => {
    const isList = rel.type === "one-to-many" || rel.type === "many-to-many";
    const relatedModel = rel.relatedModel;
    const whereType = isList ? `Prisma.${relatedModel}WhereUniqueInput[]` : `Prisma.${relatedModel}WhereUniqueInput`;
    return `	${rel.fieldName}: { where: ${whereType}; many: ${isList} }`;
  }).join(`;
`);
  return `export interface Relationships extends Record<string, { where: any; many: boolean }> {
${relationEntries};
}`;
}

// src/zod-generator.ts
import { dirname as dirname3, join as join13 } from "node:path";
class ZodGenerationError extends FlowGeneratorError {
  constructor(message, cause) {
    super(`Zod generation failed: ${message}`, cause);
    this.name = "ZodGenerationError";
  }
}
async function generateZodSchemas(options, outputDir, models) {
  console.log("\uD83D\uDCE6 Generating integrated Zod schemas...");
  const zodOutputDir = join13(outputDir, "zod");
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
async function createTempSchemaWithZodGenerator(options, zodOutputDir, _models) {
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
    const tempSchemaPath = join13(dirname3(options.schemaPath), ".temp-zod-schema.prisma");
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
    const indexPath = join13(zodOutputDir, "index.ts");
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
import_generator_helper.generatorHandler({
  onManifest() {
    return {
      version: "1.0.0",
      defaultOutput: "./generated/flow",
      prettyName: "Prisma Next Flow Generator",
      requiresGenerators: ["prisma-client-js"]
    };
  },
  async onGenerate(options) {
    try {
      console.log("\uD83D\uDE80 Starting Prisma Next Flow Generator...");
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
          camelCaseName: camelCase2(modelName),
          pluralName,
          lowerPluralName,
          config: modelConfig,
          model,
          selectFields: modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name),
          analyzed: analyzedModel,
          validationRules
        };
        const modelDir = join14(context.outputDir, lowerModelName);
        try {
          await ensureDirectory(modelDir);
        } catch (error) {
          throw new FileSystemError("create directory", modelDir, error);
        }
        try {
          await Promise.all([
            generateModelConfig(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("config", modelName, error);
            }),
            generateJotaiAtoms(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("atoms", modelName, error);
            }),
            generateDerivedAtoms(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("derived", modelName, error);
            }),
            generateEffectAtoms(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("fx", modelName, error);
            }),
            generateServerActions(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("actions", modelName, error);
            }),
            generateReactHooks(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("hooks", modelName, error);
            }),
            generateTypeDefinitions(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("types", modelName, error);
            }),
            generateSchemas(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("schemas", modelName, error);
            }),
            generateModelIndex(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("index", modelName, error);
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
        const prismaContent = generatePrismaTemplate(context);
        await writeFile(join14(context.outputDir, "prisma.ts"), prismaContent);
      } catch (error) {
        throw new TemplateGenerationError("utility files", "all models", error);
      }
      try {
        await generateSharedInfrastructure(context);
      } catch (error) {
        throw new TemplateGenerationError("shared infrastructure", "all models", error);
      }
      try {
        await generateRootIndex(context);
      } catch (error) {
        throw new TemplateGenerationError("root index", "all models", error);
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
