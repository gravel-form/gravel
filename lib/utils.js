"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var compose_1 = __importDefault(require("./compose"));
var json_schema_traverse_1 = require("./json-schema-traverse");
var noop = function () { };
var Null = function () { return null; };
function toJSONSchemaPath(dataPath) {
    return dataPath.map(function (key) { return (typeof key === 'number' ? "[" + key + "]" : '.' + key); }).join('');
}
exports.toJSONSchemaPath = toJSONSchemaPath;
function isRequired(_a) {
    var parent = _a.parent, dataPath = _a.dataPath;
    var field = dataPath[dataPath.length - 1];
    return !!(parent &&
        typeof parent.schema !== 'boolean' &&
        parent.schema.required &&
        typeof field === 'string' &&
        parent.schema.required.includes(field));
}
exports.isRequired = isRequired;
exports.FixedObjectMw = function (props) {
    var schema = props.schema, schemaPath = props.schemaPath, dataPath = props.dataPath, onChange = props.onChange, MiddlewareComponent = props.MiddlewareComponent, next = props.next;
    if (typeof schema === 'boolean' || schema.type !== 'object')
        return next(props);
    var data = (typeof props.data === 'object' && props.data) || {};
    var properties = schema.properties;
    if (!properties)
        return next(props);
    return (react_1.default.createElement(react_1.default.Fragment, null, Object.keys(properties).map(function (key) { return (react_1.default.createElement(MiddlewareComponent, __assign({ key: key }, props, { schema: properties[key], data: Object.hasOwnProperty.call(data, key) ? data[key] : undefined, onChange: function (value) {
            var _a;
            return onChange(__assign(__assign({}, data), (_a = {}, _a[key] = value, _a)));
        }, schemaPath: __spread(schemaPath, ['properties', key]), dataPath: __spread(dataPath, [key]), parent: props, next: Null }))); })));
};
exports.FixedArrayMw = function (props) {
    var schema = props.schema, schemaPath = props.schemaPath, dataPath = props.dataPath, onChange = props.onChange, MiddlewareComponent = props.MiddlewareComponent, next = props.next;
    if (typeof schema === 'boolean' || schema.type !== 'array' || !schema.items || !Array.isArray(schema.items))
        return next(props);
    var data = (Array.isArray(props.data) && props.data) || [];
    var items = schema.items;
    return (react_1.default.createElement(react_1.default.Fragment, null, items.map(function (item, index) { return (react_1.default.createElement(MiddlewareComponent, __assign({ key: index }, props, { schema: items[index], data: item, onChange: function (value) { return onChange(__spread(data.slice(0, +index), [value], data.slice(+index + 1))); }, schemaPath: __spread(schemaPath, ['items', index]), dataPath: __spread(dataPath, [index]), parent: props, next: Null }))); })));
};
function get(obj, path) {
    var e_1, _a;
    var _obj = obj;
    try {
        for (var path_1 = __values(path), path_1_1 = path_1.next(); !path_1_1.done; path_1_1 = path_1.next()) {
            var key = path_1_1.value;
            if (_obj && Object.prototype.hasOwnProperty.call(_obj, key)) {
                _obj = _obj[key];
            }
            else {
                return _obj;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (path_1_1 && !path_1_1.done && (_a = path_1.return)) _a.call(path_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return _obj;
}
function resolveSchemaRef(rootSchema, refs, ref) {
    var stack = [];
    var result = null;
    var _ref = ref;
    while (!stack.includes(_ref)) {
        if (ref.startsWith('#/')) {
            result = json_schema_traverse_1.getSchemaByPointer(rootSchema, ref);
        }
        else if (ref.startsWith('#')) {
            var id = ref;
            result = refs[id];
        }
        if (!result)
            return null;
        if (typeof result.schema !== 'object' || !result.schema.$ref) {
            return result;
        }
        stack.push(_ref);
        _ref = result.schema.$ref;
        result = null;
    }
    return null;
}
exports.LocalRefMw = function (props) {
    var schema = props.schema, formProps = props.formProps, next = props.next, MiddlewareComponent = props.MiddlewareComponent, localRefs = props.localRefs;
    var refs = react_1.default.useMemo(function () {
        var e_2, _a;
        if (localRefs)
            return localRefs;
        var refs = {};
        try {
            for (var _b = __values(json_schema_traverse_1.traverse(formProps.schema)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var ref = _c.value;
                var $id = ref.schema.$id;
                if (!$id || !$id.startsWith('#'))
                    continue;
                refs[$id] = ref;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return refs;
    }, [formProps.schema, localRefs]);
    var nextProps = refs !== localRefs ? props : __assign(__assign({}, props), { localRefs: refs });
    if (typeof schema === 'boolean' || !schema.$ref || !schema.$ref.startsWith('#'))
        return next(nextProps);
    var child = schema.$ref ? resolveSchemaRef(formProps.schema, refs, schema.$ref) : null;
    //console.log(child);
    //return next(nextProps);
    if (!child || child.schema === schema)
        return next(nextProps);
    return react_1.default.createElement(MiddlewareComponent, __assign({}, nextProps, { schema: child.schema, schemaPath: child.path }));
};
exports.schemaMws = [exports.FixedObjectMw, exports.FixedArrayMw, exports.LocalRefMw];
exports.FormCore = function (props) {
    var schema = props.schema, data = props.data, middlewares = props.middlewares, onChange = props.onChange;
    var Composed = react_1.default.useMemo(function () { return (Array.isArray(middlewares) ? compose_1.default(middlewares) : middlewares); }, [
        middlewares,
    ]);
    return (react_1.default.createElement(Composed, { schema: schema, onChange: onChange || noop, data: data, schemaPath: [], dataPath: [], parent: null, next: Null, MiddlewareComponent: Composed, formProps: props }));
};
exports.default = exports.FormCore;

//# sourceMappingURL=utils.js.map

//# sourceMappingURL=utils.js.map
