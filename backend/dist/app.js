"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const comments_1 = __importDefault(require("./routes/comments"));
const likes_1 = __importDefault(require("./routes/likes"));
const rants_1 = __importDefault(require("./routes/rants"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, body_parser_1.urlencoded)({ extended: true }));
app.use((0, cors_1.default)());
app.use("/api/users", users_1.default);
app.use("/api/rants", rants_1.default);
app.use("/api/likes", likes_1.default);
app.use("/api/comments", comments_1.default);
app.get("/", (req, res) => {
    res.send("server is running");
});
//@tsignore
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Route loaded: ${r.route.path}`);
    }
});
app.listen(8000, () => {
    console.log("listening on 8000");
});
