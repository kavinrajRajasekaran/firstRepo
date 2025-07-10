"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userModel_1 = require("./userModel");
const router = (0, express_1.Router)();
const client_1 = require("./client");
const workflows_1 = require("./workflows");
const jwtToken_1 = require("./jwtToken");
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const auth0TokenGenerator_1 = require("./auth0TokenGenerator");
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        res.status(400).json({
            "error": "invalid fields"
        });
    }
    try {
        let user = yield userModel_1.UserModel.findOne({ email });
        if (user) {
            res.status(409).json("User already exists");
            return;
        }
    }
    catch (err) {
        res.status(500).send({ "error": err.message });
        return;
    }
    let user = yield userModel_1.UserModel.create({
        name: name,
        email,
        password
    });
    let temporalClient = yield (0, client_1.getClient)();
    yield temporalClient.workflow.start(workflows_1.signupWorkflow, {
        taskQueue: 'user-management',
        workflowId: `signup-${user._id}`,
        args: [user.name, user.email, user.password, user._id],
    });
    res.status(200).json({ "token": (0, jwtToken_1.generateToken)(user._id) });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        res.status(400).json({
            "error": "invalid fields"
        });
    }
    try {
        let user = yield userModel_1.UserModel.findOne({ email });
        if (!user) {
            res.status(404).json("User notexists");
            return;
        }
        if (user && user.password !== password) {
            res.status(401).json("Unauthorized access");
            return;
        }
        else {
            res.status(200).json({ "token": (0, jwtToken_1.generateToken)(user._id) });
        }
    }
    catch (err) {
        res.status(500).send({ "error": err.message });
        return;
    }
}));
router.patch("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).send("InvalidToken");
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwtToken_1.verifyToken)(token);
    if (!decoded) {
        return res.status(400).send("InvalidToken");
    }
    const { username, password } = req.body;
    if (!username && !password) {
        return res.status(400).send("No fields to update");
    }
    try {
        const userId = new mongoose_1.default.Types.ObjectId(decoded.userId);
        const updateFields = {};
        if (username)
            updateFields.name = username;
        if (password)
            updateFields.password = password;
        const user = yield userModel_1.UserModel.findByIdAndUpdate(userId, updateFields, {
            new: true,
        });
        if (!user) {
            return res.status(404).send("User not found");
        }
        if (!user.authId) {
            return res.status(500).send("authId is missing for this user.");
        }
        const client = yield (0, client_1.getClient)();
        yield client.workflow.start(workflows_1.updateWorkflow, {
            args: [user.authId, user._id, username, password],
            taskQueue: 'user-management',
            workflowId: `update-${Date.now()}`,
        });
        return res.status(200).json({ message: "User update initiated", user });
    }
    catch (error) {
        console.error('Update error:', error);
        return res.status(500).send("Server error");
    }
}));
router.patch("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).send("InvalidToken");
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwtToken_1.verifyToken)(token);
    if (!decoded) {
        return res.status(400).send("InvalidToken");
    }
    const { username, password } = req.body;
    if (!username && !password) {
        return res.status(400).send("No fields to update");
    }
    try {
        const userId = new mongoose_1.default.Types.ObjectId(decoded.userId);
        const user = yield userModel_1.UserModel.findByIdAndUpdate(userId, { status: "deleting" }, {
            new: true,
        });
        if (!user) {
            return res.status(404).send("User not found");
        }
        if (!user.authId) {
            return res.status(500).send("authId is missing for this user.");
        }
        const client = yield (0, client_1.getClient)();
        yield client.workflow.start(workflows_1.deleteUserInfoWorkflow, {
            args: [user.authId, user._id],
            taskQueue: 'user-management',
            workflowId: `update-${Date.now()}`,
        });
        return res.status(200).json({ message: "User deletion  initiated", user });
    }
    catch (error) {
        console.error('Update error:', error);
        return res.status(500).send("Server error");
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const token = yield (0, auth0TokenGenerator_1.getToken)();
        const response = yield axios_1.default.get('https://kavinraj.us.auth0.com/api/v2/users', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        res.status(200).json(response.data);
    }
    catch (error) {
        console.error(' Error fetching users from Auth0:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            message: 'Failed to fetch users from Auth0',
            details: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message,
        });
    }
}));
exports.default = router;
