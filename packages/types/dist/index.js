"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundConfigSchema = exports.ApiRequestSchema = exports.ServiceInfoSchema = exports.ServiceMethodSchema = void 0;
const zod_1 = require("zod");
// Zod schemas for validation
exports.ServiceMethodSchema = zod_1.z.enum([
    'find',
    'get',
    'create',
    'patch',
    'remove',
]);
exports.ServiceInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    methods: zod_1.z.array(exports.ServiceMethodSchema),
    schema: zod_1.z.any().optional(),
    description: zod_1.z.string().optional(),
});
exports.ApiRequestSchema = zod_1.z.object({
    method: exports.ServiceMethodSchema,
    servicePath: zod_1.z.string(),
    query: zod_1.z.record(zod_1.z.any()).optional(),
    data: zod_1.z.any().optional(),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
});
exports.PlaygroundConfigSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    exposeSchemas: zod_1.z.boolean().optional(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    apiUrl: zod_1.z.string().optional(),
    cors: zod_1.z.boolean().optional(),
    authentication: zod_1.z
        .object({
        enabled: zod_1.z.boolean(),
        strategies: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
