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
exports.getClient = getClient;
const client_1 = require("@temporalio/client");
let temporalClient = null;
function getClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (temporalClient)
            return temporalClient;
        // Connects to localhost:7233 by default
        const connection = yield client_1.Connection.connect();
        temporalClient = new client_1.Client({ connection });
        return temporalClient;
    });
}
