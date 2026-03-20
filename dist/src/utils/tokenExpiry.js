"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeExpiresAt = void 0;
const DURATION_RE = /^(\d+)([smhd])$/i;
const computeExpiresAt = (duration) => {
    const trimmed = duration.trim();
    const now = Date.now();
    if (/^\d+$/.test(trimmed)) {
        return new Date(now + Number(trimmed) * 1000);
    }
    const match = trimmed.match(DURATION_RE);
    if (!match) {
        throw new Error(`Unsupported JWT_EXPIRES_IN format: ${duration}`);
    }
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const unitMsMap = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };
    return new Date(now + value * unitMsMap[unit]);
};
exports.computeExpiresAt = computeExpiresAt;
