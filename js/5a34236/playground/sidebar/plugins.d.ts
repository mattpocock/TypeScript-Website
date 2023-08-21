import { PluginFactory } from "..";
/** Whether the playground should actively reach out to an existing plugin */
export declare const allowConnectingToLocalhost: () => boolean;
export declare const activePlugins: () => {
    id: string;
}[];
export declare const addCustomPlugin: (mod: string) => void;
export declare const optionsPlugin: PluginFactory;
