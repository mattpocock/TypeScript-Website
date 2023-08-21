import { PluginFactory } from "..";
export declare const runPlugin: PluginFactory;
export declare const clearLogs: () => void;
export declare const runWithCustomLogs: (closure: Promise<string>, i: Function) => void;
