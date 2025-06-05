#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@prisma/generator-helper/dist/chunk-EOPVK4AE.js
var require_chunk_EOPVK4AE = __commonJS((exports, module) => {
  var __create2 = Object.create;
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target, mod));
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_EOPVK4AE_exports = {};
  __export(chunk_EOPVK4AE_exports, {
    LineStream: () => LineStream,
    byline: () => byline,
    createLineStream: () => createLineStream,
    createStream: () => createStream
  });
  module.exports = __toCommonJS2(chunk_EOPVK4AE_exports);
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

// node_modules/@prisma/generator-helper/dist/chunk-QGM4M3NI.js
var require_chunk_QGM4M3NI = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_QGM4M3NI_exports = {};
  __export(chunk_QGM4M3NI_exports, {
    __commonJS: () => __commonJS2,
    __require: () => __require2,
    __toESM: () => __toESM2
  });
  module.exports = __toCommonJS2(chunk_QGM4M3NI_exports);
  var __create2 = Object.create;
  var __defProp22 = Object.defineProperty;
  var __getOwnPropDesc22 = Object.getOwnPropertyDescriptor;
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
          __defProp22(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc22(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps2(isNodeMode || !mod || !mod.__esModule ? __defProp22(target, "default", { value: mod, enumerable: true }) : target, mod));
});

// node_modules/@prisma/debug/dist/index.js
var require_dist = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var src_exports = {};
  __export(src_exports, {
    Debug: () => Debug,
    clearLogs: () => clearLogs,
    default: () => src_default,
    getLogs: () => getLogs
  });
  module.exports = __toCommonJS2(src_exports);
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
  var src_default = Debug;
});

// node_modules/@prisma/generator-helper/dist/chunk-XSSRFZR7.js
var require_chunk_XSSRFZR7 = __commonJS((exports, module) => {
  var __create2 = Object.create;
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create2(__getProtoOf2(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target, mod));
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_XSSRFZR7_exports = {};
  __export(chunk_XSSRFZR7_exports, {
    GeneratorError: () => GeneratorError,
    GeneratorProcess: () => GeneratorProcess
  });
  module.exports = __toCommonJS2(chunk_XSSRFZR7_exports);
  var import_chunk_EOPVK4AE = require_chunk_EOPVK4AE();
  var import_chunk_QGM4M3NI = require_chunk_QGM4M3NI();
  var import_debug = __toESM2(require_dist());
  var import_child_process = __require("child_process");
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
    "../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/resolveCommand.js"(exports2, module2) {
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
    "../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/escape.js"(exports2, module2) {
      var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
      function escapeCommand(arg) {
        arg = arg.replace(metaCharsRegExp, "^$1");
        return arg;
      }
      function escapeArgument(arg, doubleEscapeMetaChars) {
        arg = `${arg}`;
        arg = arg.replace(/(\\*)"/g, "$1$1\\\"");
        arg = arg.replace(/(\\*)$/, "$1$1");
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
    "../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/readShebang.js"(exports2, module2) {
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
    "../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/parse.js"(exports2, module2) {
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
    "../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/enoent.js"(exports2, module2) {
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
            const err = verifyENOENT(arg1, parsed, "spawn");
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
    "../../node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/index.js"(exports2, module2) {
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
  var debug = (0, import_debug.default)("prisma:GeneratorProcess");
  var globalMessageId = 1;
  var GeneratorError = class extends Error {
    constructor(message, code, data) {
      super(message);
      this.code = code;
      this.data = data;
      this.name = "GeneratorError";
      if (data?.stack) {
        this.stack = data.stack;
      }
    }
  };
  var GeneratorProcess = class {
    constructor(pathOrCommand, { isNode = false } = {}) {
      this.pathOrCommand = pathOrCommand;
      this.handlers = {};
      this.errorLogs = "";
      this.exited = false;
      this.getManifest = this.rpcMethod("getManifest", (result) => result.manifest ?? null);
      this.generate = this.rpcMethod("generate");
      this.isNode = isNode;
    }
    async init() {
      if (!this.initPromise) {
        this.initPromise = this.initSingleton();
      }
      return this.initPromise;
    }
    initSingleton() {
      return new Promise((resolve, reject) => {
        if (this.isNode) {
          this.child = (0, import_child_process.fork)(this.pathOrCommand, [], {
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
          if (isErrorResponse(data)) {
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
  };
  function isErrorResponse(response) {
    return response.error !== undefined;
  }
});

// node_modules/@prisma/generator-helper/dist/chunk-UFMBEGJ3.js
var require_chunk_UFMBEGJ3 = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_UFMBEGJ3_exports = {};
  __export(chunk_UFMBEGJ3_exports, {
    DMMF: () => DMMF
  });
  module.exports = __toCommonJS2(chunk_UFMBEGJ3_exports);
  var DMMF;
  ((DMMF2) => {
    let ModelAction;
    ((ModelAction2) => {
      ModelAction2["findUnique"] = "findUnique";
      ModelAction2["findUniqueOrThrow"] = "findUniqueOrThrow";
      ModelAction2["findFirst"] = "findFirst";
      ModelAction2["findFirstOrThrow"] = "findFirstOrThrow";
      ModelAction2["findMany"] = "findMany";
      ModelAction2["create"] = "create";
      ModelAction2["createMany"] = "createMany";
      ModelAction2["createManyAndReturn"] = "createManyAndReturn";
      ModelAction2["update"] = "update";
      ModelAction2["updateMany"] = "updateMany";
      ModelAction2["upsert"] = "upsert";
      ModelAction2["delete"] = "delete";
      ModelAction2["deleteMany"] = "deleteMany";
      ModelAction2["groupBy"] = "groupBy";
      ModelAction2["count"] = "count";
      ModelAction2["aggregate"] = "aggregate";
      ModelAction2["findRaw"] = "findRaw";
      ModelAction2["aggregateRaw"] = "aggregateRaw";
    })(ModelAction = DMMF2.ModelAction || (DMMF2.ModelAction = {}));
  })(DMMF || (DMMF = {}));
});

// node_modules/@prisma/generator-helper/dist/chunk-NAG6CCUN.js
var require_chunk_NAG6CCUN = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var chunk_NAG6CCUN_exports = {};
  __export(chunk_NAG6CCUN_exports, {
    generatorHandler: () => generatorHandler
  });
  module.exports = __toCommonJS2(chunk_NAG6CCUN_exports);
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
            const manifest = handler.onManifest(json.params);
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

// node_modules/@prisma/generator-helper/dist/chunk-6F4PWJZI.js
var exports_chunk_6F4PWJZI = {};

// node_modules/@prisma/generator-helper/dist/index.js
var require_dist2 = __commonJS((exports, module) => {
  var __defProp2 = Object.defineProperty;
  var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
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
          __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS2 = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
  var dist_exports = {};
  __export(dist_exports, {
    DMMF: () => import_chunk_UFMBEGJ3.DMMF,
    GeneratorError: () => import_chunk_XSSRFZR7.GeneratorError,
    GeneratorProcess: () => import_chunk_XSSRFZR7.GeneratorProcess,
    generatorHandler: () => import_chunk_NAG6CCUN.generatorHandler
  });
  module.exports = __toCommonJS2(dist_exports);
  var import_chunk_XSSRFZR7 = require_chunk_XSSRFZR7();
  var import_chunk_UFMBEGJ3 = require_chunk_UFMBEGJ3();
  var import_chunk_NAG6CCUN = require_chunk_NAG6CCUN();
  var import_chunk_EOPVK4AE = require_chunk_EOPVK4AE();
  var import_chunk_QGM4M3NI = require_chunk_QGM4M3NI();
  var import_chunk_6F4PWJZI = __toCommonJS(exports_chunk_6F4PWJZI);
});

// index.ts
var import_generator_helper = __toESM(require_dist2(), 1);
import fs11 from "node:fs/promises";
import path13 from "node:path";

// src/config.ts
import path from "node:path";

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

// src/templates/actions.ts
import fs from "node:fs/promises";
import path3 from "node:path";

// src/utils.ts
import path2 from "node:path";
function createGeneratorContext(config, dmmf, outputPath) {
  return {
    config,
    dmmf,
    outputDir: path2.resolve(outputPath),
    zodDir: path2.join(path2.resolve(outputPath), "zod"),
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
  return {
    name: modelName,
    lowerName: lowerModelName,
    pluralName: capitalize(pluralize(modelName)),
    lowerPluralName: pluralize(lowerModelName),
    config: modelConfig,
    model,
    selectFields: modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name)
  };
}
function formatGeneratedFileHeader() {
  return `// This file is auto-generated by Next Prisma Flow Generator.
// Do not edit this file manually as it will be overwritten.
// Generated at: ${new Date().toISOString()}

`;
}
function pluralize(word) {
  const irregulars = {
    person: "people",
    child: "children",
    foot: "feet",
    tooth: "teeth",
    mouse: "mice",
    goose: "geese",
    man: "men",
    woman: "women",
    ox: "oxen",
    sheep: "sheep",
    deer: "deer",
    fish: "fish",
    species: "species",
    series: "series",
    todo: "todos",
    photo: "photos",
    piano: "pianos",
    halo: "halos"
  };
  const lowerWord = word.toLowerCase();
  if (irregulars[lowerWord]) {
    return irregulars[lowerWord];
  }
  const irregular = Object.entries(irregulars).find(([singular]) => singular.toLowerCase() === lowerWord);
  if (irregular) {
    return irregular[1];
  }
  if (lowerWord.endsWith("y")) {
    if (lowerWord.length > 1 && !"aeiou".includes(lowerWord[lowerWord.length - 2])) {
      return `${word.slice(0, -1)}ies`;
    }
    return `${word}s`;
  }
  if (lowerWord.endsWith("s") || lowerWord.endsWith("sh") || lowerWord.endsWith("ch") || lowerWord.endsWith("x") || lowerWord.endsWith("z")) {
    return `${word}es`;
  }
  if (lowerWord.endsWith("f")) {
    return `${word.slice(0, -1)}ves`;
  }
  if (lowerWord.endsWith("fe")) {
    return `${word.slice(0, -2)}ves`;
  }
  if (lowerWord.endsWith("o")) {
    if (lowerWord.length > 1 && !"aeiou".includes(lowerWord[lowerWord.length - 2])) {
      return `${word}es`;
    }
    return `${word}s`;
  }
  return `${word}s`;
}

// src/templates/actions.ts
async function generateServerActions(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName, selectFields } = modelInfo;
  const selectObject = createSelectObjectWithRelations(modelInfo, context);
  const prismaImportPath = getPrismaImportPath(context, 1);
  const isDefaultPrismaClient = prismaImportPath === "@prisma/client";
  const prismaImport = isDefaultPrismaClient ? `import { prisma } from '../prisma-client';` : `import { prisma } from '${prismaImportPath}';`;
  const template = `${formatGeneratedFileHeader()}'use server';

${prismaImport}
import { revalidateTag } from 'next/cache';
import { 
  ${lowerName}Schema, 
  type ${modelName}, 
  type ${modelName}CreateInput, 
  type ${modelName}UpdateInput,
  type ${modelName}CreateManyInput,
  ${modelName}CreateInputSchema,
  ${modelName}UpdateInputSchema,
  ${modelName}CreateManyInputSchema
} from './types';

const ${lowerName}Select = ${selectObject};

export async function getAll${pluralName}(): Promise<${modelName}[]> {
  const ${lowerPluralName} = await prisma.${lowerName}.findMany({ 
    select: ${lowerName}Select 
  });
  return ${lowerPluralName} as ${modelName}[];
}

export async function get${modelName}(id: string): Promise<${modelName} | null> {
  const ${lowerName} = await prisma.${lowerName}.findUnique({ 
    where: { id }, 
    select: ${lowerName}Select 
  });
  return ${lowerName} as ${modelName} | null;
}

export async function create${modelName}(input: ${modelName}CreateInput): Promise<${modelName}> {
  const data = ${modelName}CreateInputSchema.parse(input);
  const new${modelName} = await prisma.${lowerName}.create({ 
    data, 
    select: ${lowerName}Select 
  });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  
  return new${modelName} as ${modelName};
}

export async function update${modelName}(
  id: string, 
  input: ${modelName}UpdateInput
): Promise<${modelName}> {
  const data = ${modelName}UpdateInputSchema.parse(input);
  const updated${modelName} = await prisma.${lowerName}.update({
    where: { id },
    data,
    select: ${lowerName}Select,
  });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  revalidateTag(\`${modelName}:\${id}\`);
  
  return updated${modelName} as ${modelName};
}

export async function delete${modelName}(id: string): Promise<void> {
  await prisma.${lowerName}.delete({ where: { id } });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  revalidateTag(\`${modelName}:\${id}\`);
}

// Batch operations
export async function createMany${pluralName}(
  inputs: ${modelName}CreateManyInput[]
): Promise<{ count: number }> {
  const data = inputs.map(input => ${modelName}CreateManyInputSchema.parse(input));
  const result = await prisma.${lowerName}.createMany({ data });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  
  return result;
}

export async function deleteMany${pluralName}(ids: string[]): Promise<{ count: number }> {
  const result = await prisma.${lowerName}.deleteMany({
    where: { id: { in: ids } }
  });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  ids.forEach(id => revalidateTag(\`${modelName}:\${id}\`));
  
  return result;
}
`;
  const filePath = path3.join(modelDir, "actions.ts");
  await fs.writeFile(filePath, template, "utf-8");
}

// src/templates/atoms.ts
import fs2 from "node:fs/promises";
import path4 from "node:path";
async function generateJotaiAtoms(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import type { ${modelName} } from './types';
import * as ${modelName}Actions from './actions';

// Base atom to store all ${lowerPluralName} by ID for efficient updates
export const base${pluralName}Atom = atomWithImmer<Record<string, ${modelName}>>({});

// Derived atom for the list of ${lowerPluralName}
export const ${lowerName}ListAtom = atom((get) => {
  const ${lowerPluralName}Map = get(base${pluralName}Atom);
  return Object.values(${lowerPluralName}Map);
});

// Loading state atoms
export const ${lowerPluralName}LoadingAtom = atom<boolean>(false);
export const ${lowerName}CreatingAtom = atom<boolean>(false);
export const ${lowerName}UpdatingAtom = atom<Record<string, boolean>>({});
export const ${lowerName}DeletingAtom = atom<Record<string, boolean>>({});

// Error state atoms
export const ${lowerPluralName}ErrorAtom = atom<string | null>(null);

// Refresh action atom - when written to, fetches fresh data
export const refresh${pluralName}Atom = atom(
  null,
  async (_get, set) => {
    set(${lowerPluralName}LoadingAtom, true);
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      const ${lowerPluralName} = await ${modelName}Actions.getAll${pluralName}();
      const ${lowerPluralName}Map = Object.fromEntries(
        ${lowerPluralName}.map(${lowerName} => [${lowerName}.id, ${lowerName}])
      );
      set(base${pluralName}Atom, ${lowerPluralName}Map);
    } catch (error) {
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to fetch ${lowerPluralName}');
    } finally {
      set(${lowerPluralName}LoadingAtom, false);
    }
  }
);

// Individual ${lowerName} atom by ID
export const ${lowerName}ByIdAtom = (id: string) => atom((get) => {
  const ${lowerPluralName}Map = get(base${pluralName}Atom);
  return ${lowerPluralName}Map[id] || null;
});

// Optimistic create atom
export const optimisticCreate${modelName}Atom = atom(
  null,
  async (get, set, ${lowerName}Data: Parameters<typeof ${modelName}Actions.create${modelName}>[0]) => {
    const tempId = \`temp-\${Date.now()}-\${Math.random()}\`;
    
    // Create optimistic model with defaults for required fields
    const scalarFields = Object.fromEntries(
      Object.entries(${lowerName}Data).filter(([key, value]) => 
        typeof value !== 'object' || value instanceof Date || value === null
      )
    );
    
    const optimistic${modelName} = { 
      ...scalarFields,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any; // Will be replaced with server response
    
    // Optimistic update
    set(base${pluralName}Atom, (draft) => {
      draft[tempId] = optimistic${modelName} as ${modelName};
    });
    set(${lowerName}CreatingAtom, true);
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      const created${modelName} = await ${modelName}Actions.create${modelName}(${lowerName}Data);
      
      // Replace optimistic entry with real data
      set(base${pluralName}Atom, (draft) => {
        delete draft[tempId];
        draft[created${modelName}.id] = created${modelName};
      });
      
      return created${modelName};
    } catch (error) {
      // Rollback optimistic update
      set(base${pluralName}Atom, (draft) => {
        delete draft[tempId];
      });
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to create ${lowerName}');
      throw error;
    } finally {
      set(${lowerName}CreatingAtom, false);
    }
  }
);

// Optimistic update atom
export const optimisticUpdate${modelName}Atom = atom(
  null,
  async (get, set, { id, data }: { id: string; data: Parameters<typeof ${modelName}Actions.update${modelName}>[1] }) => {
    const current${modelName} = get(base${pluralName}Atom)[id];
    if (!current${modelName}) {
      throw new Error('${modelName} not found');
    }
    
    // Set loading state
    set(${lowerName}UpdatingAtom, (prev) => ({ ...prev, [id]: true }));
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      const updated${modelName} = await ${modelName}Actions.update${modelName}(id, data);
      
      // Update with server response
      set(base${pluralName}Atom, (draft) => {
        draft[id] = updated${modelName};
      });
      
      return updated${modelName};
    } catch (error) {
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to update ${lowerName}');
      throw error;
    } finally {
      set(${lowerName}UpdatingAtom, (prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  }
);

// Optimistic delete atom
export const optimisticDelete${modelName}Atom = atom(
  null,
  async (get, set, id: string) => {
    const ${lowerName}ToDelete = get(base${pluralName}Atom)[id];
    if (!${lowerName}ToDelete) {
      throw new Error('${modelName} not found');
    }
    
    // Optimistic removal
    set(base${pluralName}Atom, (draft) => {
      delete draft[id];
    });
    set(${lowerName}DeletingAtom, (prev) => ({ ...prev, [id]: true }));
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      await ${modelName}Actions.delete${modelName}(id);
    } catch (error) {
      // Rollback: restore the deleted item
      set(base${pluralName}Atom, (draft) => {
        draft[id] = ${lowerName}ToDelete;
      });
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to delete ${lowerName}');
      throw error;
    } finally {
      set(${lowerName}DeletingAtom, (prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  }
);

// Utility atoms for computed state
export const ${lowerName}CountAtom = atom((get) => {
  const ${lowerPluralName} = get(${lowerName}ListAtom);
  return ${lowerPluralName}.length;
});

export const is${pluralName}EmptyAtom = atom((get) => {
  const count = get(${lowerName}CountAtom);
  return count === 0;
});
`;
  const filePath = path4.join(modelDir, "atoms.ts");
  await fs2.writeFile(filePath, template, "utf-8");
}

// src/templates/enhanced-barrel.ts
import fs3 from "node:fs/promises";
import path5 from "node:path";
async function generateEnhancedBarrelExports(config, context) {
  await Promise.all([
    generateEnhancedMainIndex(config, context),
    generateNamespacedTypes(config, context),
    generateStoreSetup(config, context)
  ]);
}
async function generateModelBarrelExport(modelName, context) {
  const lowerName = modelName.toLowerCase();
  const pluralName = capitalize(pluralize(modelName));
  const lowerPluralName = pluralize(lowerName);
  const template = `${formatGeneratedFileHeader()}// Barrel export for ${modelName} module

// Export namespace as default
export { ${lowerName} } from './namespace';

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
  // Actions
  create${modelName},
  update${modelName},
  delete${modelName},
  getAll${pluralName},
  get${modelName},
  createMany${pluralName},
  deleteMany${pluralName},
} from './actions';

export {
  // Hooks
  use${pluralName},
  use${modelName},
  useCreate${modelName}Form,
  useUpdate${modelName}Form,
  use${modelName}Exists,
} from './hooks';

export {
  // Form Providers
  ${modelName}FormProvider,
  use${modelName}FormContext,
  use${modelName}Field,
  use${modelName}FormSubmit,
  use${modelName}FormState,
} from './form-provider';

export {
  // Smart Form Hook
  use${modelName}SmartForm,
  use${modelName}CreateForm,
  use${modelName}UpdateForm,
} from './smart-form';
`;
  const filePath = path5.join(context.outputDir, lowerName, "index.ts");
  await fs3.writeFile(filePath, template, "utf-8");
}
async function generateEnhancedMainIndex(config, context) {
  await Promise.all(config.models.map(async (modelName) => {
    await generateModelBarrelExport(modelName, context);
  }));
  const modelExports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    return `// ${modelName} namespace export
import { ${lowerName} } from './${lowerName}/namespace';
export { ${lowerName} };`;
  }).join(`

`);
  const namedExports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    return `// ${modelName} direct exports
export * from './${lowerName}';`;
  }).join(`
`);
  const template = `${formatGeneratedFileHeader()}// Enhanced Next Prisma Flow v0.2.0 - Model-specific namespace exports
// Modern, intuitive developer experience with smart API patterns

${modelExports}

// Direct exports for flexibility  
${namedExports}

// Global utilities
export * from './store';
export * from './types';
`;
  const filePath = path5.join(context.outputDir, "index.ts");
  await fs3.writeFile(filePath, template, "utf-8");
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
  const filePath = path5.join(context.outputDir, "types.ts");
  await fs3.writeFile(filePath, template, "utf-8");
}
async function generateStoreSetup(config, context) {
  const atomImports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(pluralize(modelName));
    const lowerPluralName = pluralize(lowerName);
    return `import {
  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,
} from './${lowerName}/atoms';`;
  }).join(`
`);
  const atomExports = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(pluralize(modelName));
    const lowerPluralName = pluralize(lowerName);
    return `  ${lowerName}: {
    data: base${pluralName}Atom,
    loading: ${lowerPluralName}LoadingAtom,
    error: ${lowerPluralName}ErrorAtom,
  },`;
  }).join(`
`);
  const clearDataStatements = config.models.map((modelName) => {
    const lowerName = modelName.toLowerCase();
    const pluralName = capitalize(pluralize(modelName));
    const lowerPluralName = pluralize(lowerName);
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
    const pluralName = capitalize(pluralize(modelName));
    const lowerPluralName = pluralize(lowerName);
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
    const pluralName = capitalize(pluralize(modelName));
    const lowerPluralName = pluralize(lowerName);
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
  const filePath = path5.join(context.outputDir, "store.ts");
  await fs3.writeFile(filePath, template, "utf-8");
}

// src/templates/enhanced-hooks.ts
import fs4 from "node:fs/promises";
import path6 from "node:path";
async function generateEnhancedReactHooks(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  base${pluralName}Atom,
  ${lowerName}ListAtom,
  ${lowerPluralName}LoadingAtom,
  ${lowerName}CreatingAtom,
  ${lowerName}UpdatingAtom,
  ${lowerName}DeletingAtom,
  ${lowerPluralName}ErrorAtom,
  refresh${pluralName}Atom,
  ${lowerName}ByIdAtom,
  optimisticCreate${modelName}Atom,
  optimisticUpdate${modelName}Atom,
  optimisticDelete${modelName}Atom,
  ${lowerName}CountAtom,
  is${pluralName}EmptyAtom,
} from './atoms';
import type { 
  ${modelName}, 
  ${modelName}CreateInput, 
  ${modelName}UpdateInput,
  ${modelName}FormData,
  ${modelName}FieldConfig
} from './types';
import { ${modelName}CreateInputSchema, ${modelName}UpdateInputSchema } from './types';
import * as ${modelName}Actions from './actions';

// ============================================================================
// ENHANCED UNIFIED HOOKS - Everything you need in one hook
// ============================================================================

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
  
  // Loading states for individual operations
  isCreating: boolean;
  isUpdating: (id: string) => boolean;
  isDeleting: (id: string) => boolean;
  
  // Optimistic updates info
  optimisticUpdates: Record<string, boolean>;
}

export function use${pluralName}(autoFetch = true): Use${pluralName}Result {
  const data = useAtomValue(${lowerName}ListAtom);
  const loading = useAtomValue(${lowerPluralName}LoadingAtom);
  const creating = useAtomValue(${lowerName}CreatingAtom);
  const updatingStates = useAtomValue(${lowerName}UpdatingAtom);
  const deletingStates = useAtomValue(${lowerName}DeletingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const count = useAtomValue(${lowerName}CountAtom);
  const isEmpty = useAtomValue(is${pluralName}EmptyAtom);
  const refresh = useSetAtom(refresh${pluralName}Atom);
  
  // Action atoms for optimistic updates
  const create${modelName} = useSetAtom(optimisticCreate${modelName}Atom);
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);
  const delete${modelName} = useSetAtom(optimisticDelete${modelName}Atom);
  
  // Track if we've already attempted to auto-fetch to prevent infinite loops
  const hasFetchedRef = useRef(false);

  // Auto-fetch on mount if enabled and no data exists (only once)
  useEffect(() => {
    if (autoFetch && isEmpty && !loading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [autoFetch, isEmpty, loading, refresh]);

  // Batch operations
  const createMany = useCallback(
    async (inputs: ${modelName}CreateInput[]) => {
      return await ${modelName}Actions.createMany${pluralName}(inputs);
    },
    []
  );

  const deleteMany = useCallback(
    async (ids: string[]) => {
      return await ${modelName}Actions.deleteMany${pluralName}(ids);
    },
    []
  );

  return {
    data,
    loading,
    error,
    count,
    isEmpty,
    create${modelName}: useCallback(
      async (data: ${modelName}CreateInput) => await create${modelName}(data),
      [create${modelName}]
    ),
    update${modelName}: useCallback(
      async (id: string, data: ${modelName}UpdateInput) => 
        await update${modelName}({ id, data }),
      [update${modelName}]
    ),
    delete${modelName}: useCallback(
      async (id: string) => await delete${modelName}(id),
      [delete${modelName}]
    ),
    createMany,
    deleteMany,
    refresh: useCallback(() => refresh(), [refresh]),
    isCreating: creating,
    isUpdating: useCallback((id: string) => updatingStates[id] || false, [updatingStates]),
    isDeleting: useCallback((id: string) => deletingStates[id] || false, [deletingStates]),
    optimisticUpdates: updatingStates,
  };
}

// ============================================================================
// ENHANCED INDIVIDUAL ITEM HOOK - Smart item management with form integration
// ============================================================================

export interface Use${modelName}Result {
  // Data
  data: ${modelName} | null;
  loading: boolean;
  error: string | null;
  
  // Operations
  update: (data: ${modelName}UpdateInput) => Promise<${modelName}>;
  delete: () => Promise<void>;
  
  // State
  isUpdating: boolean;
  isDeleting: boolean;
  isOptimistic: boolean;
  
  // Form integration
  form: UseUpdate${modelName}FormResult;
}

export function use${modelName}(id: string): Use${modelName}Result {
  const data = useAtomValue(${lowerName}ByIdAtom(id));
  const loading = useAtomValue(${lowerPluralName}LoadingAtom);
  const updatingStates = useAtomValue(${lowerName}UpdatingAtom);
  const deletingStates = useAtomValue(${lowerName}DeletingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);
  const delete${modelName} = useSetAtom(optimisticDelete${modelName}Atom);
  
  // Filter data to only include update input fields (remove relations and computed fields)
  const filteredData = data ? Object.fromEntries(
    Object.entries(data).filter(([key]) => 
      // Exclude common relational and computed fields
      !['user', 'category', 'todos', 'posts', 'comments', 'profile'].includes(key)
    )
  ) : undefined;
  
  const form = useUpdate${modelName}Form(id, filteredData);

  return {
    data,
    loading,
    error,
    update: useCallback(
      async (updateData: ${modelName}UpdateInput) => 
        await update${modelName}({ id, data: updateData }),
      [update${modelName}, id]
    ),
    delete: useCallback(
      async () => await delete${modelName}(id),
      [delete${modelName}, id]
    ),
    isUpdating: updatingStates[id] || false,
    isDeleting: deletingStates[id] || false,
    isOptimistic: !!(updatingStates[id] || deletingStates[id]),
    form,
  };
}


// ============================================================================
// SPECIALIZED FORM HOOKS - Dedicated hooks for create and update operations
// ============================================================================

export interface UseCreate${modelName}FormResult {
  // Form state
  data: Partial<${modelName}CreateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  
  // Field helpers with auto-validation
  field: (name: keyof ${modelName}CreateInput) => ${modelName}FieldConfig;
  
  // Form operations
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}CreateInput>) => void;
  
  // Loading states
  loading: boolean;
  error: Error | null;
  
  // Validation
  validate: () => boolean;
  validateField: (field: keyof ${modelName}CreateInput) => boolean;
  
  // Auto-save capabilities
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
}

export function useCreate${modelName}Form(initialData?: Partial<${modelName}CreateInput>): UseCreate${modelName}FormResult {
  const [data, setFormData] = useState<Partial<${modelName}CreateInput>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const create${modelName} = useSetAtom(optimisticCreate${modelName}Atom);
  
  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialData) return Object.keys(data).length > 0;
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);
  
  // Validate individual field
  const validateField = useCallback((fieldName: keyof ${modelName}CreateInput): boolean => {
    try {
      const value = data[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        return true;
      }
      return true;
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        [fieldName as string]: err.errors?.[0]?.message || 'Invalid value'
      }));
      return false;
    }
  }, [data]);
  
  // Validate entire form
  const validate = useCallback((): boolean => {
    try {
      ${modelName}CreateInputSchema.parse(data);
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        if (error.path?.length > 0) {
          newErrors[error.path[0]] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  }, [data]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    try {
      ${modelName}CreateInputSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }, [data]);
  
  // Memoized field helpers to prevent unnecessary re-renders
  const fieldConfigs = useMemo(() => {
    const configs: Record<string, ${modelName}FieldConfig> = {};
    return configs;
  }, []);

  // Field helper function with internal memoization
  const field = useCallback((name: keyof ${modelName}CreateInput): ${modelName}FieldConfig => {
    const cacheKey = \`\${name}-\${data[name]}-\${errors[name as string]}-\${touched[name as string]}\`;
    
    if (!fieldConfigs[cacheKey]) {
      fieldConfigs[cacheKey] = {
        name: name as string,
        value: data[name] ?? '',
        onChange: (value: any) => {
          setFormData(prev => ({ ...prev, [name]: value }));
          
          // Auto-save logic
          if (autoSaveEnabled && autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          if (autoSaveEnabled) {
            const timeout = setTimeout(() => {
              if (isValid) {
                submit();
              }
            }, 1000);
            setAutoSaveTimeout(timeout);
          }
        },
        onBlur: () => {
          setTouched(prev => ({ ...prev, [name]: true }));
          validateField(name);
        },
        error: touched[name as string] ? errors[name as string] : undefined,
        required: true, // TODO: Determine from schema
      };
    }
    
    return fieldConfigs[cacheKey];
  }, [data, errors, touched, validateField, autoSaveEnabled, autoSaveTimeout, isValid, fieldConfigs]);
  
  // Submit form
  const submit = useCallback(async (): Promise<${modelName} | null> => {
    if (!validate()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await create${modelName}(data as ${modelName}CreateInput);
      
      // Reset form on successful create
      setFormData({});
      setTouched({});
      setErrors({});
      
      return result;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data, validate, create${modelName}]);
  
  // Reset form
  const reset = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setTouched({});
    setError(null);
  }, [initialData]);
  
  // Set form data
  const setData = useCallback((newData: Partial<${modelName}CreateInput>) => {
    setFormData(newData);
  }, []);
  
  // Auto-save functionality
  const enableAutoSave = useCallback((debounceMs = 1000) => {
    setAutoSaveEnabled(true);
  }, []);
  
  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [autoSaveTimeout]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    data,
    isValid,
    isDirty,
    errors,
    field,
    submit,
    reset,
    setData,
    loading,
    error,
    validate,
    validateField,
    enableAutoSave,
    disableAutoSave,
  };
}

export interface UseUpdate${modelName}FormResult {
  // Form state
  data: Partial<${modelName}UpdateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  
  // Field helpers with auto-validation
  field: (name: keyof ${modelName}UpdateInput) => ${modelName}FieldConfig;
  
  // Form operations
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}UpdateInput>) => void;
  
  // Loading states
  loading: boolean;
  error: Error | null;
  
  // Validation
  validate: () => boolean;
  validateField: (field: keyof ${modelName}UpdateInput) => boolean;
  
  // Auto-save capabilities
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
  
  // ID for update operations
  id: string;
}

export function useUpdate${modelName}Form(id: string, initialData?: Partial<${modelName}UpdateInput>): UseUpdate${modelName}FormResult {
  const [data, setFormData] = useState<Partial<${modelName}UpdateInput>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);
  
  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialData) return Object.keys(data).length > 0;
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);
  
  // Validate individual field
  const validateField = useCallback((fieldName: keyof ${modelName}UpdateInput): boolean => {
    try {
      const value = data[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        return true;
      }
      return true;
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        [fieldName as string]: err.errors?.[0]?.message || 'Invalid value'
      }));
      return false;
    }
  }, [data]);
  
  // Validate entire form
  const validate = useCallback((): boolean => {
    try {
      ${modelName}UpdateInputSchema.parse(data);
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        if (error.path?.length > 0) {
          newErrors[error.path[0]] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  }, [data]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    try {
      ${modelName}UpdateInputSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }, [data]);
  
  // Memoized field helpers to prevent unnecessary re-renders
  const updateFieldConfigs = useMemo(() => {
    const configs: Record<string, ${modelName}FieldConfig> = {};
    return configs;
  }, []);

  // Field helper function with internal memoization
  const field = useCallback((name: keyof ${modelName}UpdateInput): ${modelName}FieldConfig => {
    const cacheKey = \`\${name}-\${data[name]}-\${errors[name as string]}-\${touched[name as string]}\`;
    
    if (!updateFieldConfigs[cacheKey]) {
      updateFieldConfigs[cacheKey] = {
        name: name as string,
        value: data[name] ?? '',
        onChange: (value: any) => {
          setFormData(prev => ({ ...prev, [name]: value }));
          
          // Auto-save logic
          if (autoSaveEnabled && autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          if (autoSaveEnabled) {
            const timeout = setTimeout(() => {
              if (isValid) {
                submit();
              }
            }, 1000);
            setAutoSaveTimeout(timeout);
          }
        },
        onBlur: () => {
          setTouched(prev => ({ ...prev, [name]: true }));
          validateField(name);
        },
        error: touched[name as string] ? errors[name as string] : undefined,
        required: false, // Update fields are typically optional
      };
    }
    
    return updateFieldConfigs[cacheKey];
  }, [data, errors, touched, validateField, autoSaveEnabled, autoSaveTimeout, isValid, updateFieldConfigs]);
  
  // Submit form
  const submit = useCallback(async (): Promise<${modelName} | null> => {
    if (!validate()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await update${modelName}({ id, data: data as ${modelName}UpdateInput });
      return result;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data, validate, update${modelName}, id]);
  
  // Reset form
  const reset = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setTouched({});
    setError(null);
  }, [initialData]);
  
  // Set form data
  const setData = useCallback((newData: Partial<${modelName}UpdateInput>) => {
    setFormData(newData);
  }, []);
  
  // Auto-save functionality
  const enableAutoSave = useCallback((debounceMs = 1000) => {
    setAutoSaveEnabled(true);
  }, []);
  
  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [autoSaveTimeout]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    data,
    isValid,
    isDirty,
    errors,
    field,
    submit,
    reset,
    setData,
    loading,
    error,
    validate,
    validateField,
    enableAutoSave,
    disableAutoSave,
    id,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function use${modelName}Exists(id: string): boolean {
  const ${lowerName} = useAtomValue(${lowerName}ByIdAtom(id));
  return !!${lowerName};
}

`;
  const filePath = path6.join(modelDir, "hooks.ts");
  await fs4.writeFile(filePath, template, "utf-8");
}

// src/templates/form-providers.ts
import fs5 from "node:fs/promises";
import path7 from "node:path";
async function generateFormProviders(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { 
  useCreate${modelName}Form, 
  useUpdate${modelName}Form,
  type UseCreate${modelName}FormResult,
  type UseUpdate${modelName}FormResult,
} from './hooks';
import type { 
  ${modelName},
  ${modelName}CreateInput,
  ${modelName}UpdateInput,
  ${modelName}FieldConfig
} from './types';

// ============================================================================
// SMART FORM PROVIDER - Handles create/update logic with optimized field access
// ============================================================================

interface ${modelName}FormContextValue {
  // Mode detection
  isCreateMode: boolean;
  isUpdateMode: boolean;
  
  // Form state (unified interface)
  data: Partial<${modelName}CreateInput | ${modelName}UpdateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  loading: boolean;
  error: Error | null;
  
  // Optimized field accessors (memoized internally)
  fields: {
    [K in keyof ${modelName}CreateInput]: () => ${modelName}FieldConfig;
  };
  
  // Actions
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}CreateInput | ${modelName}UpdateInput>) => void;
  
  // Auto-save
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
  
  // Form-specific data (when in update mode)
  id?: string;
}

const ${modelName}FormContext = createContext<${modelName}FormContextValue | null>(null);

export interface ${modelName}FormProviderProps {
  children: React.ReactNode;
  mode?: 'create' | 'update';
  initialData?: Partial<${modelName}> | ${modelName};
  id?: string;
  autoDetectMode?: boolean; // Default true - detect mode from initialData
}

export function ${modelName}FormProvider({
  children,
  mode,
  initialData,
  id,
  autoDetectMode = true,
}: ${modelName}FormProviderProps) {
  // Smart mode detection
  const detectedMode = useMemo(() => {
    if (mode) return mode;
    if (autoDetectMode && initialData && 'id' in initialData && initialData.id) {
      return 'update';
    }
    return 'create';
  }, [mode, initialData, autoDetectMode]);

  const isCreateMode = detectedMode === 'create';
  const isUpdateMode = detectedMode === 'update';

  // Filter initial data to remove read-only fields
  const filteredInitialData = useMemo(() => {
    if (!initialData) return undefined;
    
    // Remove read-only and relational fields
    const { 
      createdAt, 
      updatedAt, 
      user, 
      category, 
      todos, 
      posts, 
      comments, 
      profile,
      ...cleanData 
    } = initialData as any;
    
    return cleanData;
  }, [initialData]);

  // Get the ID for update operations
  const updateId = useMemo(() => {
    if (id) return id;
    if (initialData && 'id' in initialData) return initialData.id as string;
    return 'temp-id'; // Fallback for hooks
  }, [id, initialData]);

  // Always call both hooks (Rules of Hooks compliance)
  const createForm = useCreate${modelName}Form(
    isCreateMode ? filteredInitialData : undefined
  );
  
  const updateForm = useUpdate${modelName}Form(
    updateId,
    isUpdateMode ? filteredInitialData : undefined
  );

  // Select the active form
  const activeForm = isUpdateMode ? updateForm : createForm;

  // Memoized field accessors to prevent unnecessary re-renders
  const fields = useMemo(() => {
    // Create a proxy that generates field accessors on demand
    return new Proxy({}, {
      get: (target: any, fieldName: string | symbol) => {
        if (typeof fieldName === 'string') {
          return () => activeForm.field(fieldName as keyof ${modelName}CreateInput);
        }
        return undefined;
      }
    }) as { [K in keyof ${modelName}CreateInput]: () => ${modelName}FieldConfig };
  }, [activeForm]);

  // Unified submit that works for both create and update
  const submit = useCallback(async () => {
    return await activeForm.submit();
  }, [activeForm.submit]);

  // Unified reset
  const reset = useCallback(() => {
    activeForm.reset();
  }, [activeForm.reset]);

  // Unified setData with type safety
  const setData = useCallback((newData: Partial<${modelName}CreateInput | ${modelName}UpdateInput>) => {
    activeForm.setData(newData as any);
  }, [activeForm.setData]);

  const contextValue: ${modelName}FormContextValue = {
    isCreateMode,
    isUpdateMode,
    data: activeForm.data,
    isValid: activeForm.isValid,
    isDirty: activeForm.isDirty,
    errors: activeForm.errors,
    loading: activeForm.loading,
    error: activeForm.error,
    fields,
    submit,
    reset,
    setData,
    enableAutoSave: activeForm.enableAutoSave,
    disableAutoSave: activeForm.disableAutoSave,
    id: isUpdateMode ? updateId : undefined,
  };

  return (
    <${modelName}FormContext.Provider value={contextValue}>
      {children}
    </${modelName}FormContext.Provider>
  );
}

// ============================================================================
// HOOK FOR CONSUMING FORM CONTEXT
// ============================================================================

export function use${modelName}FormContext(): ${modelName}FormContextValue {
  const context = useContext(${modelName}FormContext);
  if (!context) {
    throw new Error('use${modelName}FormContext must be used within a ${modelName}FormProvider');
  }
  return context;
}

// ============================================================================
// OPTIMIZED FIELD HOOK - Returns stable field configs
// ============================================================================

export function use${modelName}Field(fieldName: keyof ${modelName}CreateInput): ${modelName}FieldConfig {
  const context = use${modelName}FormContext();
  const { isUpdateMode } = context;
  
  // Get the active form directly from hooks
  const createForm = useCreate${modelName}Form(
    !isUpdateMode ? context.data as Partial<${modelName}CreateInput> : undefined
  );
  const updateForm = useUpdate${modelName}Form(
    context.id || 'temp-id',
    isUpdateMode ? context.data as Partial<${modelName}UpdateInput> : undefined
  );
  
  const activeForm = isUpdateMode ? updateForm : createForm;
  
  // Return the field configuration with internal memoization from hooks
  return useMemo(() => activeForm.field(fieldName), [
    activeForm.data[fieldName],
    activeForm.errors[fieldName as string],
    fieldName
  ]);
}

// ============================================================================
// CONVENIENCE HOOKS FOR COMMON PATTERNS
// ============================================================================

export function use${modelName}FormSubmit() {
  const { submit, loading, isValid } = use${modelName}FormContext();
  
  return {
    submit,
    loading,
    isValid,
    canSubmit: isValid && !loading,
  };
}

export function use${modelName}FormState() {
  const { data, isValid, isDirty, errors, loading, error, isCreateMode, isUpdateMode } = use${modelName}FormContext();
  
  return {
    data,
    isValid,
    isDirty,
    errors,
    loading,
    error,
    isCreateMode,
    isUpdateMode,
  };
}
`;
  const filePath = path7.join(modelDir, "form-provider.tsx");
  await fs5.writeFile(filePath, template, "utf-8");
}

// src/templates/namespace.ts
import fs6 from "node:fs/promises";
import path8 from "node:path";
async function generateNamespaceExports(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}// Model-specific namespace export for ${modelName}
// Provides organized access to all ${modelName} functionality

import * as hooks from './hooks';
import * as actions from './actions';
import * as atoms from './atoms';
import * as types from './types';
import * as providers from './form-provider';
import { ${modelName}CreateInputSchema, ${modelName}UpdateInputSchema } from './types';

// Main namespace export
export const ${lowerName} = {
  hooks,
  actions,
  atoms,
  types,
  providers,
  
  schemas: {
    create: ${modelName}CreateInputSchema,
    update: ${modelName}UpdateInputSchema,
  },
} as const;

// Export the namespace as default for convenience
export default ${lowerName};

// Also export all the individual pieces for direct access
export { hooks, actions, atoms, types, providers };
`;
  const filePath = path8.join(modelDir, "namespace.ts");
  await fs6.writeFile(filePath, template, "utf-8");
}

// src/templates/routes.ts
import fs7 from "node:fs/promises";
import path9 from "node:path";
async function generateApiRoutes(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}import { type NextRequest, NextResponse } from 'next/server';
import * as ${modelName}Actions from './actions';

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await ${modelName}Actions.get${modelName}(id);
      if (!result) {
        return NextResponse.json(
          { error: '${modelName} not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    } else {
      const results = await ${modelName}Actions.getAll${pluralName}();
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
    const result = await ${modelName}Actions.create${modelName}(data);
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
    
    const result = await ${modelName}Actions.update${modelName}(id, updateData);
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
    
    await ${modelName}Actions.delete${modelName}(id);
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
  const filePath = path9.join(modelDir, "routes.ts");
  await fs7.writeFile(filePath, template, "utf-8");
}

// src/templates/smart-form-hook.ts
import fs8 from "node:fs/promises";
import path10 from "node:path";
async function generateSmartFormHook(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;
  const template = `${formatGeneratedFileHeader()}'use client';

import { useMemo, useCallback } from 'react';
import { 
  useCreate${modelName}Form, 
  useUpdate${modelName}Form,
  type UseCreate${modelName}FormResult,
  type UseUpdate${modelName}FormResult,
} from './hooks';
import type { 
  ${modelName},
  ${modelName}CreateInput,
  ${modelName}UpdateInput,
  ${modelName}FieldConfig
} from './types';

// ============================================================================
// SMART FORM HOOK - Handles create/update mode detection and field memoization
// ============================================================================

export interface Use${modelName}SmartFormOptions {
  mode?: 'create' | 'update';
  initialData?: any; // Flexible to accept various data shapes
  id?: string;
  autoDetectMode?: boolean; // Default true
}

export interface Use${modelName}SmartFormResult {
  // Mode detection
  isCreateMode: boolean;
  isUpdateMode: boolean;
  
  // Form state (unified interface)
  data: Partial<${modelName}CreateInput | ${modelName}UpdateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  loading: boolean;
  error: Error | null;
  
  // Optimized field accessor (memoized internally)
  field: (name: keyof ${modelName}CreateInput) => ${modelName}FieldConfig;
  
  // Actions
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}CreateInput | ${modelName}UpdateInput>) => void;
  
  // Auto-save
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
  
  // Form-specific data (when in update mode)
  id?: string;
}

export function use${modelName}SmartForm({
  mode,
  initialData,
  id,
  autoDetectMode = true,
}: Use${modelName}SmartFormOptions = {}): Use${modelName}SmartFormResult {
  
  // Smart mode detection
  const detectedMode = useMemo(() => {
    if (mode) return mode;
    if (autoDetectMode && initialData && 'id' in initialData && initialData.id) {
      return 'update';
    }
    return 'create';
  }, [mode, initialData, autoDetectMode]);

  const isCreateMode = detectedMode === 'create';
  const isUpdateMode = detectedMode === 'update';

  // Filter initial data to remove read-only fields
  const filteredInitialData = useMemo(() => {
    if (!initialData) return undefined;
    
    // Remove read-only and relational fields
    const { 
      createdAt, 
      updatedAt, 
      user, 
      category, 
      todos, 
      posts, 
      comments, 
      profile,
      ...cleanData 
    } = initialData as any;
    
    return cleanData;
  }, [initialData]);

  // Get the ID for update operations
  const updateId = useMemo(() => {
    if (id) return id;
    if (initialData && 'id' in initialData) return initialData.id as string;
    return 'temp-id'; // Fallback for hooks
  }, [id, initialData]);

  // Always call both hooks (Rules of Hooks compliance)
  const createForm = useCreate${modelName}Form(
    isCreateMode ? filteredInitialData : undefined
  );
  
  const updateForm = useUpdate${modelName}Form(
    updateId,
    isUpdateMode ? filteredInitialData : undefined
  );

  // Select the active form
  const activeForm = isUpdateMode ? updateForm : createForm;

  // Optimized field accessor with internal memoization
  const field = useCallback((fieldName: keyof ${modelName}CreateInput): ${modelName}FieldConfig => {
    // The hooks already provide internal memoization
    return activeForm.field(fieldName);
  }, [activeForm]);

  // Unified submit that works for both create and update
  const submit = useCallback(async () => {
    return await activeForm.submit();
  }, [activeForm.submit]);

  // Unified reset
  const reset = useCallback(() => {
    activeForm.reset();
  }, [activeForm.reset]);

  // Unified setData with type safety
  const setData = useCallback((newData: Partial<${modelName}CreateInput | ${modelName}UpdateInput>) => {
    activeForm.setData(newData as any);
  }, [activeForm.setData]);

  return {
    isCreateMode,
    isUpdateMode,
    data: activeForm.data,
    isValid: activeForm.isValid,
    isDirty: activeForm.isDirty,
    errors: activeForm.errors,
    loading: activeForm.loading,
    error: activeForm.error,
    field,
    submit,
    reset,
    setData,
    enableAutoSave: activeForm.enableAutoSave,
    disableAutoSave: activeForm.disableAutoSave,
    id: isUpdateMode ? updateId : undefined,
  };
}

// ============================================================================
// CONVENIENCE HOOKS FOR COMMON PATTERNS  
// ============================================================================

export function use${modelName}CreateForm(initialData?: any) {
  return use${modelName}SmartForm({ 
    mode: 'create', 
    initialData, 
    autoDetectMode: false 
  });
}

export function use${modelName}UpdateForm(id: string, initialData?: any) {
  return use${modelName}SmartForm({ 
    mode: 'update', 
    id, 
    initialData, 
    autoDetectMode: false 
  });
}
`;
  const filePath = path10.join(modelDir, "smart-form.ts");
  await fs8.writeFile(filePath, template, "utf-8");
}

// src/templates/types.ts
import fs9 from "node:fs/promises";
import path11 from "node:path";
async function generateTypes(modelInfo, context, modelDir) {
  const { name: modelName, lowerName, selectFields } = modelInfo;
  const selectObject = createSelectObjectWithRelations(modelInfo, context);
  const zodImportPath = getZodImportPath(1);
  const prismaImportPath = getPrismaImportPath(context, 1);
  const isDefaultPrismaClient = prismaImportPath === "@prisma/client";
  const prismaImports = isDefaultPrismaClient ? `import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma-client';` : `import { prisma, type Prisma } from '${prismaImportPath}';`;
  const template = `${formatGeneratedFileHeader()}${prismaImports}
import { z } from 'zod';

// Re-export Zod schemas from zod-prisma-types
export {
  ${modelName}Schema as ${lowerName}Schema,
  ${modelName}UncheckedCreateInputSchema as ${modelName}CreateInputSchema,
  ${modelName}UncheckedUpdateInputSchema as ${modelName}UpdateInputSchema,
  ${modelName}CreateManyInputSchema,
} from '${zodImportPath}';

// Import schemas for type inference
import {
  ${modelName}UncheckedCreateInputSchema,
  ${modelName}UncheckedUpdateInputSchema,
  ${modelName}CreateManyInputSchema,
} from '${zodImportPath}';

// Infer types from Zod schemas
export type ${modelName}CreateInput = z.infer<typeof ${modelName}UncheckedCreateInputSchema>;
export type ${modelName}UpdateInput = z.infer<typeof ${modelName}UncheckedUpdateInputSchema>;
export type ${modelName}CreateManyInput = z.infer<typeof ${modelName}CreateManyInputSchema>;

// Define the select object for this model
export const ${lowerName}Select = ${selectObject} satisfies Prisma.${modelName}Select;

// Generate the exact type based on our select
export type ${modelName} = Prisma.${modelName}GetPayload<{
  select: typeof ${lowerName}Select;
}>;

// Utility types for working with this model
export type ${modelName}Id = ${modelName}['id'];

export type ${modelName}Input = ${modelName}CreateInput;
export type ${modelName}WhereInput = Prisma.${modelName}WhereInput;
export type ${modelName}WhereUniqueInput = Prisma.${modelName}WhereUniqueInput;
export type ${modelName}OrderByInput = Prisma.${modelName}OrderByWithRelationInput;

// For array operations
export type ${modelName}Array = ${modelName}[];
export type ${modelName}CreateInputArray = ${modelName}Input[];
export type ${modelName}CreateManyInputArray = ${modelName}CreateManyInput[];

// For partial updates (useful for forms)
export type Partial${modelName}Input = Partial<${modelName}Input>;

// For search and filtering
export interface ${modelName}SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  orderBy?: keyof ${modelName};
  orderDirection?: 'asc' | 'desc';
}

export interface ${modelName}FilterParams extends ${modelName}SearchParams {
  where?: ${modelName}WhereInput;
}

// Response types for API operations
export interface ${modelName}ApiResponse {
  data: ${modelName};
  success: boolean;
  message?: string;
}

export interface ${modelName}ListApiResponse {
  data: ${modelName}[];
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ${modelName}MutationResponse {
  data?: ${modelName};
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ${modelName}BatchResponse {
  count: number;
  success: boolean;
  message?: string;
}

// State management types for Jotai atoms
export interface ${modelName}State {
  items: Record<string, ${modelName}>;
  loading: boolean;
  creating: boolean;
  updating: Record<string, boolean>;
  deleting: Record<string, boolean>;
  error: string | null;
}

export interface ${modelName}OptimisticUpdate {
  id: string;
  data: Partial<${modelName}>;
  timestamp: number;
}

// Form types (useful for React Hook Form integration)
export type ${modelName}FormData = Omit<${modelName}Input, 'id' | 'createdAt' | 'updatedAt'>;
export type ${modelName}UpdateFormData = Partial<${modelName}FormData>;

// Field configuration for form hooks
export interface ${modelName}FieldConfig {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}

// Event types for custom hooks
export interface ${modelName}ChangeEvent {
  type: 'create' | 'update' | 'delete';
  ${lowerName}: ${modelName};
  previousValue?: ${modelName};
}

// Validation error types
export interface ${modelName}ValidationError {
  field: keyof ${modelName}Input;
  message: string;
  code: string;
}

export interface ${modelName}ValidationErrors {
  errors: ${modelName}ValidationError[];
  message: string;
}
`;
  const filePath = path11.join(modelDir, "types.ts");
  await fs9.writeFile(filePath, template, "utf-8");
}

// src/zod-generator.ts
import { spawn } from "node:child_process";
import fs10 from "node:fs/promises";
import path12 from "node:path";
class ZodGenerationError extends FlowGeneratorError {
  constructor(message, cause) {
    super(`Zod generation failed: ${message}`, cause);
    this.name = "ZodGenerationError";
  }
}
async function generateZodSchemas(options, outputDir, models) {
  console.log("\uD83D\uDCE6 Generating integrated Zod schemas...");
  const zodOutputDir = path12.join(outputDir, "zod");
  try {
    await fs10.mkdir(zodOutputDir, { recursive: true });
  } catch (error) {
    throw new ZodGenerationError(`Failed to create zod output directory: ${zodOutputDir}`, error);
  }
  const tempSchemaPath = await createTempSchemaWithZodGenerator(options, zodOutputDir, models);
  try {
    await executeZodPrismaTypes(tempSchemaPath);
    await validateGeneratedSchemas(zodOutputDir, models);
    console.log("✅ Integrated Zod schemas generated successfully");
  } catch (error) {
    throw new ZodGenerationError("Failed to generate Zod schemas", error);
  } finally {
    try {
      await fs10.unlink(tempSchemaPath);
    } catch {}
  }
}
async function createTempSchemaWithZodGenerator(options, zodOutputDir, models) {
  try {
    const originalSchemaContent = await fs10.readFile(options.schemaPath, "utf-8");
    const schemaWithoutFlowGenerator = originalSchemaContent.replace(/generator\s+flow\s*\{[\s\S]*?\}/g, "");
    const zodGeneratorConfig = `
generator zod {
  provider = "zod-prisma-types"
  output   = "${zodOutputDir}"
}
`;
    const modifiedSchema = `${schemaWithoutFlowGenerator}
${zodGeneratorConfig}`;
    const tempSchemaPath = path12.join(path12.dirname(options.schemaPath), ".temp-zod-schema.prisma");
    await fs10.writeFile(tempSchemaPath, modifiedSchema, "utf-8");
    return tempSchemaPath;
  } catch (error) {
    throw new ZodGenerationError("Failed to create temporary schema file", error);
  }
}
async function executeZodPrismaTypes(schemaPath) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["prisma", "generate", "--schema", schemaPath], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true
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
      if (code === 0) {
        resolve();
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
async function validateGeneratedSchemas(zodOutputDir, models) {
  try {
    const indexPath = path12.join(zodOutputDir, "index.ts");
    const indexExists = await fs10.access(indexPath).then(() => true).catch(() => false);
    if (!indexExists) {
      throw new Error("Zod index file was not generated");
    }
    const indexContent = await fs10.readFile(indexPath, "utf-8");
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
  const filePath = path13.join(context.outputDir, "prisma-client.ts");
  await fs11.writeFile(filePath, template, "utf-8");
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
        await fs11.mkdir(context.outputDir, { recursive: true });
      } catch (error) {
        throw new FileSystemError("create directory", context.outputDir, error);
      }
      try {
        await generateZodSchemas(options, context.outputDir, config.models);
      } catch (error) {
        throw new TemplateGenerationError("zod schemas", "all models", error);
      }
      if (context.prismaImport === "@prisma/client") {
        try {
          await generateSharedPrismaClient(context);
        } catch (error) {
          throw new TemplateGenerationError("shared prisma client", "all models", error);
        }
      }
      for (const modelName of config.models) {
        console.log(`\uD83D\uDCDD Generating code for model: ${modelName}`);
        const model = options.dmmf.datamodel.models.find((m) => m.name === modelName);
        if (!model) {
          throw new ModelNotFoundError(modelName);
        }
        const lowerModelName = modelName.toLowerCase();
        const modelConfig = config[lowerModelName] || {};
        const pluralName = capitalize(pluralize(modelName));
        const lowerPluralName = pluralize(lowerModelName);
        const modelInfo = {
          name: modelName,
          lowerName: lowerModelName,
          pluralName,
          lowerPluralName,
          config: modelConfig,
          model,
          selectFields: modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name)
        };
        const modelDir = path13.join(context.outputDir, lowerModelName);
        try {
          await fs11.mkdir(modelDir, { recursive: true });
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
            generateEnhancedReactHooks(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("hooks", modelName, error);
            }),
            generateFormProviders(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("form-providers", modelName, error);
            }),
            generateSmartFormHook(modelInfo, context, modelDir).catch((error) => {
              throw new TemplateGenerationError("smart-form", modelName, error);
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
        await generateEnhancedBarrelExports(config, context);
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
