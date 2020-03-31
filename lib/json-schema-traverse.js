"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var keywords = ['additionalItems', 'items', 'contains', 'additionalProperties', 'propertyNames', 'not', 'if', 'then', 'else'];
var arrayKeywords = [
    'items',
    'allOf',
    'anyOf',
    'oneOf',
];
var propsKeywords = ['definitions', 'properties', 'patternProperties', 'dependencies'];
function parseLocalJSONPointer(pointer) {
    return pointer
        .slice(2)
        .split('/')
        .map(function (str) {
        return decodeURIComponent(str)
            .replace(/~1/g, '/')
            .replace(/~0/g, '~');
    });
}
function _getSchema(schema, path) {
    var e_1, _a, e_2, _b, e_3, _c;
    var _schema;
    var next = schema;
    var i = 0;
    while (i < path.length) {
        _schema = next;
        next = undefined;
        if (!_schema || typeof _schema !== 'object')
            return null;
        try {
            for (var propsKeywords_1 = (e_1 = void 0, __values(propsKeywords)), propsKeywords_1_1 = propsKeywords_1.next(); !propsKeywords_1_1.done; propsKeywords_1_1 = propsKeywords_1.next()) {
                var key = propsKeywords_1_1.value;
                if (key !== path[i])
                    continue;
                var sch = _schema[key];
                if (!sch || typeof sch !== 'object')
                    return null;
                var _next = sch[path[i + 1]];
                if (Array.isArray(_next))
                    break;
                next = _next;
                i += 2;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (propsKeywords_1_1 && !propsKeywords_1_1.done && (_a = propsKeywords_1.return)) _a.call(propsKeywords_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (next)
            continue;
        try {
            for (var arrayKeywords_1 = (e_2 = void 0, __values(arrayKeywords)), arrayKeywords_1_1 = arrayKeywords_1.next(); !arrayKeywords_1_1.done; arrayKeywords_1_1 = arrayKeywords_1.next()) {
                var key = arrayKeywords_1_1.value;
                if (key !== path[i])
                    continue;
                var sch = _schema[key];
                if (!Array.isArray(sch))
                    break;
                next = sch[+path[i + 2]];
                i += 2;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (arrayKeywords_1_1 && !arrayKeywords_1_1.done && (_b = arrayKeywords_1.return)) _b.call(arrayKeywords_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (next)
            continue;
        try {
            for (var keywords_1 = (e_3 = void 0, __values(keywords)), keywords_1_1 = keywords_1.next(); !keywords_1_1.done; keywords_1_1 = keywords_1.next()) {
                var key = keywords_1_1.value;
                if (key !== path[i])
                    continue;
                var sch = _schema[key];
                if (!sch || Array.isArray(sch))
                    return null;
                next = sch;
                i += 1;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (keywords_1_1 && !keywords_1_1.done && (_c = keywords_1.return)) _c.call(keywords_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    return next || null;
}
function getSchemaByPointer(schema, jsonPointer) {
    var path = parseLocalJSONPointer(jsonPointer);
    var sch = _getSchema(schema, path);
    return sch ? { schema: sch, path: path } : null;
}
exports.getSchemaByPointer = getSchemaByPointer;
function _traverse(schema, path) {
    var propsKeywords_2, propsKeywords_2_1, key, sch, _a, _b, _i, prop, child, e_4_1, arrayKeywords_2, arrayKeywords_2_1, key, sch, _c, _d, _e, i, e_5_1, keywords_2, keywords_2_1, key, sch, e_6_1;
    var e_4, _f, e_5, _g, e_6, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                if (!(schema && typeof schema === 'object' && !Array.isArray(schema))) return [3 /*break*/, 27];
                return [4 /*yield*/, { schema: schema, path: path }];
            case 1:
                _j.sent();
                _j.label = 2;
            case 2:
                _j.trys.push([2, 9, 10, 11]);
                propsKeywords_2 = __values(propsKeywords), propsKeywords_2_1 = propsKeywords_2.next();
                _j.label = 3;
            case 3:
                if (!!propsKeywords_2_1.done) return [3 /*break*/, 8];
                key = propsKeywords_2_1.value;
                sch = schema[key];
                if (!(sch && typeof sch == 'object')) return [3 /*break*/, 7];
                _a = [];
                for (_b in sch)
                    _a.push(_b);
                _i = 0;
                _j.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                prop = _a[_i];
                child = sch[prop];
                if (Array.isArray(child) || typeof child !== 'object')
                    return [3 /*break*/, 6];
                return [5 /*yield**/, __values(_traverse(child, __spread(path, [key, prop])))];
            case 5:
                _j.sent();
                _j.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7:
                propsKeywords_2_1 = propsKeywords_2.next();
                return [3 /*break*/, 3];
            case 8: return [3 /*break*/, 11];
            case 9:
                e_4_1 = _j.sent();
                e_4 = { error: e_4_1 };
                return [3 /*break*/, 11];
            case 10:
                try {
                    if (propsKeywords_2_1 && !propsKeywords_2_1.done && (_f = propsKeywords_2.return)) _f.call(propsKeywords_2);
                }
                finally { if (e_4) throw e_4.error; }
                return [7 /*endfinally*/];
            case 11:
                _j.trys.push([11, 18, 19, 20]);
                arrayKeywords_2 = __values(arrayKeywords), arrayKeywords_2_1 = arrayKeywords_2.next();
                _j.label = 12;
            case 12:
                if (!!arrayKeywords_2_1.done) return [3 /*break*/, 17];
                key = arrayKeywords_2_1.value;
                sch = schema[key];
                if (!Array.isArray(sch))
                    return [3 /*break*/, 16];
                _c = [];
                for (_d in sch)
                    _c.push(_d);
                _e = 0;
                _j.label = 13;
            case 13:
                if (!(_e < _c.length)) return [3 /*break*/, 16];
                i = _c[_e];
                return [5 /*yield**/, __values(_traverse(sch[i], __spread(path, [key, i])))];
            case 14:
                _j.sent();
                _j.label = 15;
            case 15:
                _e++;
                return [3 /*break*/, 13];
            case 16:
                arrayKeywords_2_1 = arrayKeywords_2.next();
                return [3 /*break*/, 12];
            case 17: return [3 /*break*/, 20];
            case 18:
                e_5_1 = _j.sent();
                e_5 = { error: e_5_1 };
                return [3 /*break*/, 20];
            case 19:
                try {
                    if (arrayKeywords_2_1 && !arrayKeywords_2_1.done && (_g = arrayKeywords_2.return)) _g.call(arrayKeywords_2);
                }
                finally { if (e_5) throw e_5.error; }
                return [7 /*endfinally*/];
            case 20:
                _j.trys.push([20, 25, 26, 27]);
                keywords_2 = __values(keywords), keywords_2_1 = keywords_2.next();
                _j.label = 21;
            case 21:
                if (!!keywords_2_1.done) return [3 /*break*/, 24];
                key = keywords_2_1.value;
                sch = schema[key];
                if (!sch || Array.isArray(sch))
                    return [3 /*break*/, 23];
                return [5 /*yield**/, __values(_traverse(sch, __spread(path, [key])))];
            case 22:
                _j.sent();
                _j.label = 23;
            case 23:
                keywords_2_1 = keywords_2.next();
                return [3 /*break*/, 21];
            case 24: return [3 /*break*/, 27];
            case 25:
                e_6_1 = _j.sent();
                e_6 = { error: e_6_1 };
                return [3 /*break*/, 27];
            case 26:
                try {
                    if (keywords_2_1 && !keywords_2_1.done && (_h = keywords_2.return)) _h.call(keywords_2);
                }
                finally { if (e_6) throw e_6.error; }
                return [7 /*endfinally*/];
            case 27: return [2 /*return*/];
        }
    });
}
function traverse(schema) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [5 /*yield**/, __values(_traverse(schema, []))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.traverse = traverse;
exports.default = traverse;

//# sourceMappingURL=json-schema-traverse.js.map

//# sourceMappingURL=json-schema-traverse.js.map
