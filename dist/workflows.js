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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupWorkflow = signupWorkflow;
exports.updateWorkflow = updateWorkflow;
exports.deleteUserInfoWorkflow = deleteUserInfoWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { userCreationAuth0, updateUserInAuth0, deleteUserInAuth0, deleteIndb } = (0, workflow_1.proxyActivities)({
    retry: {
        maximumAttempts: 5,
        maximumInterval: "30 seconds",
        backoffCoefficient: 2,
    },
    startToCloseTimeout: '2 minutes'
});
const { updateStatus } = (0, workflow_1.proxyActivities)({
    retry: {
        maximumAttempts: 5,
        maximumInterval: "5 seconds",
        backoffCoefficient: 2,
    },
    startToCloseTimeout: '2 minutes'
});
function signupWorkflow(name, email, password, _id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authId = yield userCreationAuth0(name, email, password);
            yield updateStatus(_id, "succeed", undefined, authId);
        }
        catch (err) {
            yield updateStatus(_id, "failed", "failed while updating to auth0", undefined);
        }
    });
}
function updateWorkflow(authId, _id, name, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield updateUserInAuth0(authId, name, password);
            yield updateStatus(_id, "succeed", undefined, undefined);
        }
        catch (err) {
            yield updateStatus(_id, "failed", "failed while updating to auth0", undefined);
        }
    });
}
function deleteUserInfoWorkflow(authId, _id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield deleteUserInAuth0(authId);
            yield deleteIndb(authId);
        }
        catch (err) {
            yield updateStatus(_id, "failed", "failed while deletion  to auth0", undefined);
        }
    });
}
