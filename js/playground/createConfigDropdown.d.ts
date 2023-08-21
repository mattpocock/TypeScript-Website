type Sandbox = import("@typescript/sandbox").Sandbox;
type Monaco = typeof import("monaco-editor");
export declare const createConfigDropdown: (sandbox: Sandbox, monaco: Monaco) => void;
export declare const updateConfigDropdownForCompilerOptions: (sandbox: Sandbox, monaco: Monaco) => void;
export declare const setupJSONToggleForConfig: (sandbox: Sandbox) => void;
export {};
