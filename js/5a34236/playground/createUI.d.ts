/// <reference types="react" />
export interface UI {
    /** Show a text modal, with some buttons */
    showModal: (message: string, postFocalElement: HTMLElement, subtitle?: string, buttons?: {
        [text: string]: string;
    }, event?: React.MouseEvent) => void;
    /** A quick flash of some text */
    flashInfo: (message: string, time?: number) => void;
    /** Creates a modal container which you can put your own DOM elements inside */
    createModalOverlay: (postFocalElement: HTMLElement, classes?: string) => HTMLDivElement;
}
export declare const createUI: () => UI;
