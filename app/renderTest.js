"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const App_1 = __importDefault(require("./src/App"));
try {
    const html = (0, server_1.renderToString)((0, jsx_runtime_1.jsx)(App_1.default, {}));
    console.log("RENDER SUCCESS. HTML length:", html.length);
}
catch (err) {
    console.error("RENDER ERROR:", err);
}
