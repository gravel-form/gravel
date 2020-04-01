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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
function compose(widgets) {
    var Composed = function (props) {
        var dispatch = function (nextProps, i) {
            var Widget = widgets[i];
            if (i >= widgets.length)
                return props.next ? props.next(nextProps) : null;
            var pp = __assign(__assign({}, nextProps), { next: function (_props) { return dispatch(_props, i + 1); } });
            return React.createElement(Widget, __assign({}, pp));
        };
        return dispatch(props, 0);
    };
    return Composed;
}
exports.default = compose;

//# sourceMappingURL=compose.js.map

//# sourceMappingURL=compose.js.map
