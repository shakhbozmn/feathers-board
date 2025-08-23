import { z } from 'zod';
export type ServiceMethod = 'find' | 'get' | 'create' | 'patch' | 'remove';
export interface JSONSchema {
    type?: string;
    properties?: Record<string, JSONSchema>;
    items?: JSONSchema;
    required?: string[];
    description?: string;
    enum?: any[];
    format?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    additionalProperties?: boolean | JSONSchema;
    [key: string]: any;
}
export interface ServiceInfo {
    name: string;
    path: string;
    methods: ServiceMethod[];
    schema?: JSONSchema;
    description?: string;
}
export interface ApiRequest {
    method: ServiceMethod;
    servicePath: string;
    query?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    id?: string | number;
}
export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}
export interface ApiError {
    message: string;
    code?: string | number;
    className?: string;
    data?: any;
    errors?: any;
}
export interface PlaygroundConfig {
    path?: string;
    exposeSchemas?: boolean;
    title?: string;
    description?: string;
    version?: string;
    apiUrl?: string;
    cors?: boolean;
    authentication?: {
        enabled: boolean;
        strategies?: string[];
    };
}
export interface RequestFormData {
    method: ServiceMethod;
    query: string;
    data: string;
    headers: string;
    authToken?: string;
    id?: string;
}
export declare const ServiceMethodSchema: z.ZodEnum<["find", "get", "create", "patch", "remove"]>;
export declare const ServiceInfoSchema: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    methods: z.ZodArray<z.ZodEnum<["find", "get", "create", "patch", "remove"]>, "many">;
    schema: z.ZodOptional<z.ZodAny>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    path: string;
    methods: ("find" | "get" | "create" | "patch" | "remove")[];
    schema?: any;
    description?: string | undefined;
}, {
    name: string;
    path: string;
    methods: ("find" | "get" | "create" | "patch" | "remove")[];
    schema?: any;
    description?: string | undefined;
}>;
export declare const ApiRequestSchema: z.ZodObject<{
    method: z.ZodEnum<["find", "get", "create", "patch", "remove"]>;
    servicePath: z.ZodString;
    query: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    data: z.ZodOptional<z.ZodAny>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strip", z.ZodTypeAny, {
    method: "find" | "get" | "create" | "patch" | "remove";
    servicePath: string;
    query?: Record<string, any> | undefined;
    data?: any;
    headers?: Record<string, string> | undefined;
    id?: string | number | undefined;
}, {
    method: "find" | "get" | "create" | "patch" | "remove";
    servicePath: string;
    query?: Record<string, any> | undefined;
    data?: any;
    headers?: Record<string, string> | undefined;
    id?: string | number | undefined;
}>;
export declare const PlaygroundConfigSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    exposeSchemas: z.ZodOptional<z.ZodBoolean>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    apiUrl: z.ZodOptional<z.ZodString>;
    cors: z.ZodOptional<z.ZodBoolean>;
    authentication: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        strategies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        strategies?: string[] | undefined;
    }, {
        enabled: boolean;
        strategies?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    path?: string | undefined;
    description?: string | undefined;
    exposeSchemas?: boolean | undefined;
    title?: string | undefined;
    version?: string | undefined;
    apiUrl?: string | undefined;
    cors?: boolean | undefined;
    authentication?: {
        enabled: boolean;
        strategies?: string[] | undefined;
    } | undefined;
}, {
    path?: string | undefined;
    description?: string | undefined;
    exposeSchemas?: boolean | undefined;
    title?: string | undefined;
    version?: string | undefined;
    apiUrl?: string | undefined;
    cors?: boolean | undefined;
    authentication?: {
        enabled: boolean;
        strategies?: string[] | undefined;
    } | undefined;
}>;
