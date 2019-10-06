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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
function compose(widgets) {
    var Composed = function (props) {
        var dispatch = function (nextProps, i) {
            var Widget = widgets[i];
            if (i >= widgets.length)
                return props.next ? props.next(nextProps) : null;
            var pp = __assign(__assign({}, nextProps), { next: function (_props) { return dispatch(_props, i + 1); } });
            return react_1.default.createElement(Widget, __assign({}, pp));
        };
        return dispatch(props, 0);
    };
    return Composed;
}
exports.default = compose;

//# sourceMappingURL=compose.js.map

//# sourceMappingURL=compose.js.map
