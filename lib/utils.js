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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var compose_1 = __importDefault(require("./compose"));
var noop = function () { };
var Null = function () { return null; };
function bindChildProps(props) {
    var schema = props.schema, onChange = props.onChange, schemaPath = props.schemaPath, dataPath = props.dataPath;
    var data = props.data || {};
    if (typeof schema === 'boolean')
        return null;
    if (schema.type === 'object' && schema.properties) {
        var properties_1 = schema.properties;
        return function (key) { return (__assign(__assign({}, props), { schema: properties_1[key], data: data[key], onChange: function (value) {
                var _a;
                return onChange(__assign(__assign({}, data), (_a = {}, _a[key] = value, _a)));
            }, schemaPath: __spreadArrays(schemaPath, ['properties', key]), dataPath: __spreadArrays(dataPath, [key]), parent: props, next: Null })); };
    }
    else if (schema.type === 'array' && Array.isArray(schema.items)) {
        var items_1 = schema.items;
        return function (key) { return (__assign(__assign({}, props), { schema: items_1[key], data: data[key], onChange: function (value) { return onChange(__spreadArrays(data.slice(0, +key), [value], data.slice(+key + 1))); }, schemaPath: __spreadArrays(schemaPath, ['items', key]), dataPath: __spreadArrays(dataPath, [key]), parent: props, next: Null })); };
    }
    return null;
}
exports.bindChildProps = bindChildProps;
function useAdditional(props, AdditionalItemTemplate) {
    var schema = props.schema, schemaPath = props.schemaPath, dataPath = props.dataPath, onChange = props.onChange, MiddlewareComponent = props.MiddlewareComponent;
    if (!schema || typeof schema === 'boolean' || typeof schema.items === 'boolean')
        return { onAdd: null, arrayBody: null };
    var data = props.data || Array.from(Array.isArray(schema.items) ? { length: schema.items.length } : []);
    var onAdd = function (newData) { return onChange(__spreadArrays(data, [newData])); };
    var onMove = function (from, to) {
        if (to < 0 || to >= data.length) {
            onChange(__spreadArrays(data.slice(0, from), data.slice(from + 1)));
        }
        else if (from < to) {
            onChange(__spreadArrays(data.slice(0, from), data.slice(from + 1, to + 1), [data[from]], data.slice(to + 1)));
        }
        else if (from > to) {
            onChange(__spreadArrays(data.slice(0, to), [data[from]], data.slice(to, from), data.slice(from + 1)));
        }
    };
    var _a = Array.isArray(schema.items)
        ? [schema.additionalItems, schema.items.length]
        : [schema.items, 0], itemSchema = _a[0], minIndex = _a[1];
    if (!itemSchema)
        return { onAdd: null, arrayBody: null };
    var childNext = function (props) { return react_1.default.createElement(MiddlewareComponent, __assign({}, props, { next: Null })); };
    var bindChildProps = function (i) { return (__assign(__assign({}, props), { onChange: function (value) {
            onChange(__spreadArrays(data.slice(0, i), [value], data.slice(i + 1)));
        }, schema: itemSchema, data: data[i], schemaPath: __spreadArrays(schemaPath, ['items', i]), dataPath: __spreadArrays(dataPath, [i]), parent: props })); };
    var arrayBody = [];
    var _loop_1 = function (i) {
        arrayBody.push(AdditionalItemTemplate ? (react_1.default.createElement(AdditionalItemTemplate, __assign({ key: i }, bindChildProps(i), { onMove: function (newIndex) {
                if (newIndex < 0 || (newIndex >= minIndex && newIndex < data.length)) {
                    onMove(i, newIndex);
                }
            }, next: childNext }))) : (react_1.default.createElement(MiddlewareComponent, __assign({ key: i }, bindChildProps(i), { next: childNext }))));
    };
    for (var i = minIndex; i < data.length; i += 1) {
        _loop_1(i);
    }
    return {
        onAdd: onAdd,
        arrayBody: arrayBody,
    };
}
exports.useAdditional = useAdditional;
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
exports.FixedObjectArrayMiddleware = function (props) {
    var schema = props.schema, next = props.next, MiddlewareComponent = props.MiddlewareComponent;
    var getChildProps = bindChildProps(props);
    if (!getChildProps)
        return next(props);
    if (typeof schema === 'boolean')
        return next(props);
    var children = schema.properties || schema.items;
    if (!children)
        return next(props);
    return (react_1.default.createElement(react_1.default.Fragment, null, Object.keys(children).map(function (key) { return (react_1.default.createElement(MiddlewareComponent, __assign({ key: key }, getChildProps(key)))); })));
};
exports.FormCore = function (_a) {
    var data = _a.data, middlewares = _a.middlewares, onChange = _a.onChange, rest = __rest(_a, ["data", "middlewares", "onChange"]);
    var Composed = react_1.default.useMemo(function () { return (Array.isArray(middlewares) ? compose_1.default(middlewares) : middlewares); }, [
        middlewares,
    ]);
    return (react_1.default.createElement(Composed, __assign({}, rest, { onChange: onChange || noop, data: data, schemaPath: [], dataPath: [], parent: null, next: Null, MiddlewareComponent: Composed })));
};
exports.default = exports.FormCore;

//# sourceMappingURL=utils.js.map

//# sourceMappingURL=utils.js.map
