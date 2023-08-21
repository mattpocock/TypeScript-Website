define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDesignSystem = void 0;
    const el = (str, elementType, container) => {
        const el = document.createElement(elementType);
        el.innerHTML = str;
        container.appendChild(el);
        return el;
    };
    // The Playground Plugin design system
    const createDesignSystem = (sandbox) => {
        const ts = sandbox.ts;
        return (container) => {
            const clear = () => {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            };
            let decorations = [];
            let decorationLock = false;
            const clearDeltaDecorators = (force) => {
                // console.log(`clearing, ${decorations.length}}`)
                // console.log(sandbox.editor.getModel()?.getAllDecorations())
                if (force) {
                    sandbox.editor.deltaDecorations(decorations, []);
                    decorations = [];
                    decorationLock = false;
                }
                else if (!decorationLock) {
                    sandbox.editor.deltaDecorations(decorations, []);
                    decorations = [];
                }
            };
            /** Lets a HTML Element hover to highlight code in the editor  */
            const addEditorHoverToElement = (element, pos, config) => {
                element.onmouseenter = () => {
                    if (!decorationLock) {
                        const model = sandbox.getModel();
                        const start = model.getPositionAt(pos.start);
                        const end = model.getPositionAt(pos.end);
                        decorations = sandbox.editor.deltaDecorations(decorations, [
                            {
                                range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                options: { inlineClassName: "highlight-" + config.type },
                            },
                        ]);
                    }
                };
                element.onmouseleave = () => {
                    clearDeltaDecorators();
                };
            };
            const declareRestartRequired = (i) => {
                if (document.getElementById("restart-required"))
                    return;
                const localize = i || window.i;
                const li = document.createElement("li");
                li.id = "restart-required";
                const a = document.createElement("a");
                a.style.color = "#c63131";
                a.textContent = localize("play_sidebar_options_restart_required");
                a.href = "#";
                a.onclick = () => document.location.reload();
                const nav = document.getElementsByClassName("navbar-right")[0];
                li.appendChild(a);
                nav.insertBefore(li, nav.firstChild);
            };
            const localStorageOption = (setting) => {
                // Think about this as being something which you want enabled by default and can suppress whether
                // it should do something.
                const invertedLogic = setting.emptyImpliesEnabled;
                const li = document.createElement("li");
                const label = document.createElement("label");
                const split = setting.oneline ? "" : "<br/>";
                label.innerHTML = `<span>${setting.display}</span>${split}${setting.blurb}`;
                const key = setting.flag;
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = key;
                input.checked = invertedLogic ? !localStorage.getItem(key) : !!localStorage.getItem(key);
                input.onchange = () => {
                    if (input.checked) {
                        if (!invertedLogic)
                            localStorage.setItem(key, "true");
                        else
                            localStorage.removeItem(key);
                    }
                    else {
                        if (invertedLogic)
                            localStorage.setItem(key, "true");
                        else
                            localStorage.removeItem(key);
                    }
                    if (setting.onchange) {
                        setting.onchange(!!localStorage.getItem(key));
                    }
                    if (setting.requireRestart) {
                        declareRestartRequired();
                    }
                };
                label.htmlFor = input.id;
                li.appendChild(input);
                li.appendChild(label);
                container.appendChild(li);
                return li;
            };
            const button = (settings) => {
                const join = document.createElement("input");
                join.type = "button";
                join.value = settings.label;
                if (settings.onclick) {
                    join.onclick = settings.onclick;
                }
                container.appendChild(join);
                return join;
            };
            const code = (code) => {
                const createCodePre = document.createElement("pre");
                createCodePre.setAttribute("tabindex", "0");
                const codeElement = document.createElement("code");
                codeElement.innerHTML = code;
                createCodePre.appendChild(codeElement);
                container.appendChild(createCodePre);
                // When <pre> focused, Ctrl+A should select only code pre instead of the entire document
                createCodePre.addEventListener("keydown", e => {
                    if (e.key.toUpperCase() === "A" && (e.ctrlKey || e.metaKey)) {
                        const selection = window.getSelection();
                        if (!selection)
                            return;
                        selection.selectAllChildren(createCodePre);
                        e.preventDefault();
                    }
                });
                return codeElement;
            };
            const showEmptyScreen = (message) => {
                clear();
                const noErrorsMessage = document.createElement("div");
                noErrorsMessage.id = "empty-message-container";
                const messageDiv = document.createElement("div");
                messageDiv.textContent = message;
                messageDiv.classList.add("empty-plugin-message");
                noErrorsMessage.appendChild(messageDiv);
                container.appendChild(noErrorsMessage);
                return noErrorsMessage;
            };
            const createTabBar = () => {
                const tabBar = document.createElement("div");
                tabBar.classList.add("playground-plugin-tabview");
                /** Support left/right in the tab bar for accessibility */
                let tabFocus = 0;
                tabBar.addEventListener("keydown", e => {
                    const tabs = tabBar.querySelectorAll('[role="tab"]');
                    // Move right
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        tabs[tabFocus].setAttribute("tabindex", "-1");
                        if (e.key === "ArrowRight") {
                            tabFocus++;
                            // If we're at the end, go to the start
                            if (tabFocus >= tabs.length) {
                                tabFocus = 0;
                            }
                            // Move left
                        }
                        else if (e.key === "ArrowLeft") {
                            tabFocus--;
                            // If we're at the start, move to the end
                            if (tabFocus < 0) {
                                tabFocus = tabs.length - 1;
                            }
                        }
                        tabs[tabFocus].setAttribute("tabindex", "0");
                        tabs[tabFocus].focus();
                    }
                });
                container.appendChild(tabBar);
                return tabBar;
            };
            const createTabButton = (text) => {
                const element = document.createElement("button");
                element.setAttribute("role", "tab");
                element.textContent = text;
                return element;
            };
            const listDiags = (model, diags) => {
                const errorUL = document.createElement("ul");
                errorUL.className = "compiler-diagnostics";
                errorUL.onmouseleave = ev => {
                    clearDeltaDecorators();
                };
                container.appendChild(errorUL);
                diags.forEach(diag => {
                    const li = document.createElement("li");
                    li.classList.add("diagnostic");
                    switch (diag.category) {
                        case 0:
                            li.classList.add("warning");
                            break;
                        case 1:
                            li.classList.add("error");
                            break;
                        case 2:
                            li.classList.add("suggestion");
                            break;
                        case 3:
                            li.classList.add("message");
                            break;
                    }
                    if (typeof diag === "string") {
                        li.textContent = diag;
                    }
                    else {
                        li.textContent = sandbox.ts.flattenDiagnosticMessageText(diag.messageText, "\n", 4);
                    }
                    errorUL.appendChild(li);
                    if (diag.start && diag.length) {
                        addEditorHoverToElement(li, { start: diag.start, end: diag.start + diag.length }, { type: "error" });
                    }
                    li.onclick = () => {
                        if (diag.start && diag.length) {
                            const start = model.getPositionAt(diag.start);
                            sandbox.editor.revealLine(start.lineNumber);
                            const end = model.getPositionAt(diag.start + diag.length);
                            decorations = sandbox.editor.deltaDecorations(decorations, [
                                {
                                    range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                    options: { inlineClassName: "error-highlight", isWholeLine: true },
                                },
                            ]);
                            decorationLock = true;
                            setTimeout(() => {
                                decorationLock = false;
                                sandbox.editor.deltaDecorations(decorations, []);
                            }, 300);
                        }
                    };
                });
                return errorUL;
            };
            const showOptionList = (options, style) => {
                const ol = document.createElement("ol");
                ol.className = style.style === "separated" ? "playground-options" : "playground-options tight";
                options.forEach(option => {
                    if (style.style === "rows")
                        option.oneline = true;
                    if (style.requireRestart)
                        option.requireRestart = true;
                    const settingButton = localStorageOption(option);
                    ol.appendChild(settingButton);
                });
                container.appendChild(ol);
            };
            const createASTTree = (node, settings) => {
                const autoOpen = !settings || !settings.closedByDefault;
                const div = document.createElement("div");
                div.className = "ast";
                const infoForNode = (node) => {
                    const name = ts.SyntaxKind[node.kind];
                    return {
                        name,
                    };
                };
                const renderLiteralField = (key, value, info) => {
                    const li = document.createElement("li");
                    const typeofSpan = `ast-node-${typeof value}`;
                    let suffix = "";
                    if (key === "kind") {
                        suffix = ` (SyntaxKind.${info.name})`;
                    }
                    li.innerHTML = `${key}: <span class='${typeofSpan}'>${value}</span>${suffix}`;
                    return li;
                };
                const renderSingleChild = (key, value, depth) => {
                    const li = document.createElement("li");
                    li.innerHTML = `${key}: `;
                    renderItem(li, value, depth + 1);
                    return li;
                };
                const renderManyChildren = (key, nodes, depth) => {
                    const children = document.createElement("div");
                    children.classList.add("ast-children");
                    const li = document.createElement("li");
                    li.innerHTML = `${key}: [<br/>`;
                    children.appendChild(li);
                    nodes.forEach(node => {
                        renderItem(children, node, depth + 1);
                    });
                    const liEnd = document.createElement("li");
                    liEnd.innerHTML += "]";
                    children.appendChild(liEnd);
                    return children;
                };
                const renderItem = (parentElement, node, depth) => {
                    const itemDiv = document.createElement("div");
                    parentElement.appendChild(itemDiv);
                    itemDiv.className = "ast-tree-start";
                    itemDiv.attributes.setNamedItem;
                    // @ts-expect-error
                    itemDiv.dataset.pos = node.pos;
                    // @ts-expect-error
                    itemDiv.dataset.end = node.end;
                    // @ts-expect-error
                    itemDiv.dataset.depth = depth;
                    if (depth === 0 && autoOpen)
                        itemDiv.classList.add("open");
                    const info = infoForNode(node);
                    const a = document.createElement("a");
                    a.classList.add("node-name");
                    a.textContent = info.name;
                    itemDiv.appendChild(a);
                    a.onclick = _ => a.parentElement.classList.toggle("open");
                    addEditorHoverToElement(a, { start: node.pos, end: node.end }, { type: "info" });
                    const properties = document.createElement("ul");
                    properties.className = "ast-tree";
                    itemDiv.appendChild(properties);
                    Object.keys(node).forEach(field => {
                        if (typeof field === "function")
                            return;
                        if (field === "parent" || field === "flowNode")
                            return;
                        const value = node[field];
                        if (typeof value === "object" && Array.isArray(value) && value[0] && "pos" in value[0] && "end" in value[0]) {
                            //  Is an array of Nodes
                            properties.appendChild(renderManyChildren(field, value, depth));
                        }
                        else if (typeof value === "object" && "pos" in value && "end" in value) {
                            // Is a single child property
                            properties.appendChild(renderSingleChild(field, value, depth));
                        }
                        else {
                            properties.appendChild(renderLiteralField(field, value, info));
                        }
                    });
                };
                renderItem(div, node, 0);
                container.append(div);
                return div;
            };
            const createTextInput = (config) => {
                const form = document.createElement("form");
                const textbox = document.createElement("input");
                textbox.id = config.id;
                textbox.placeholder = config.placeholder;
                textbox.autocomplete = "off";
                textbox.autocapitalize = "off";
                textbox.spellcheck = false;
                // @ts-ignore
                textbox.autocorrect = "off";
                const localStorageKey = "playground-input-" + config.id;
                if (config.value) {
                    textbox.value = config.value;
                }
                else if (config.keepValueAcrossReloads) {
                    const storedQuery = localStorage.getItem(localStorageKey);
                    if (storedQuery)
                        textbox.value = storedQuery;
                }
                if (config.isEnabled) {
                    const enabled = config.isEnabled(textbox);
                    textbox.classList.add(enabled ? "good" : "bad");
                }
                else {
                    textbox.classList.add("good");
                }
                const textUpdate = (e) => {
                    const href = e.target.value.trim();
                    if (config.keepValueAcrossReloads) {
                        localStorage.setItem(localStorageKey, href);
                    }
                    if (config.onChanged)
                        config.onChanged(e.target.value, textbox);
                };
                textbox.style.width = "90%";
                textbox.style.height = "2rem";
                textbox.addEventListener("input", textUpdate);
                // Suppress the enter key
                textbox.onkeydown = (evt) => {
                    if (evt.key === "Enter" || evt.code === "Enter") {
                        config.onEnter(textbox.value, textbox);
                        return false;
                    }
                };
                form.appendChild(textbox);
                container.appendChild(form);
                return form;
            };
            const createSubDesignSystem = () => {
                const div = document.createElement("div");
                container.appendChild(div);
                const ds = (0, exports.createDesignSystem)(sandbox)(div);
                return ds;
            };
            return {
                /** The element of the design system */
                container,
                /** Clear the sidebar */
                clear,
                /** Present code in a pre > code  */
                code,
                /** Ideally only use this once, and maybe even prefer using subtitles everywhere */
                title: (title) => el(title, "h3", container),
                /** Used to denote sections, give info etc */
                subtitle: (subtitle) => el(subtitle, "h4", container),
                /** Used to show a paragraph */
                p: (subtitle) => el(subtitle, "p", container),
                /** When you can't do something, or have nothing to show */
                showEmptyScreen,
                /**
                 * Shows a list of hoverable, and selectable items (errors, highlights etc) which have code representation.
                 * The type is quite small, so it should be very feasible for you to massage other data to fit into this function
                 */
                listDiags,
                /** Lets you remove the hovers from listDiags etc */
                clearDeltaDecorators,
                /** Shows a single option in local storage (adds an li to the container BTW) */
                localStorageOption,
                /** Uses localStorageOption to create a list of options */
                showOptionList,
                /** Shows a full-width text input */
                createTextInput,
                /** Renders an AST tree */
                createASTTree,
                /** Creates an input button */
                button,
                /** Used to re-create a UI like the tab bar at the top of the plugins section */
                createTabBar,
                /** Used with createTabBar to add buttons */
                createTabButton,
                /** A general "restart your browser" message  */
                declareRestartRequired,
                /** Create a new Design System instance and add it to the container. You'll need to cast
                 * this after usage, because otherwise the type-system circularly references itself
                 */
                createSubDesignSystem,
            };
        };
    };
    exports.createDesignSystem = createDesignSystem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRGVzaWduU3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcGxheWdyb3VuZC9zcmMvZHMvY3JlYXRlRGVzaWduU3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFtQkEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFXLEVBQUUsV0FBbUIsRUFBRSxTQUFrQixFQUFFLEVBQUU7UUFDbEUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUM5QyxFQUFFLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQTtRQUNsQixTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pCLE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQyxDQUFBO0lBSUQsc0NBQXNDO0lBQy9CLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxPQUFnQixFQUFFLEVBQUU7UUFDckQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQTtRQUVyQixPQUFPLENBQUMsU0FBa0IsRUFBRSxFQUFFO1lBQzVCLE1BQU0sS0FBSyxHQUFHLEdBQUcsRUFBRTtnQkFDakIsT0FBTyxTQUFTLENBQUMsVUFBVSxFQUFFO29CQUMzQixTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtpQkFDNUM7WUFDSCxDQUFDLENBQUE7WUFDRCxJQUFJLFdBQVcsR0FBYSxFQUFFLENBQUE7WUFDOUIsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFBO1lBRTFCLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtnQkFDNUMsa0RBQWtEO2dCQUNsRCw4REFBOEQ7Z0JBQzlELElBQUksS0FBSyxFQUFFO29CQUNULE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFBO29CQUNoRCxXQUFXLEdBQUcsRUFBRSxDQUFBO29C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O2dCQUMvQixDQUFDLEVBQUUsQ0FBQyxRQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUM7Z0JBQ3JELDJEQUEyRDtnQkFDM0QsZUFBZTtnQkFDZjs7O21CQUdHO2dCQUNILFNBQVM7Z0JBQ1Qsb0RBQW9EO2dCQUNwRCxvQkFBb0I7Z0JBQ3BCLCtFQUErRTtnQkFDL0Usa0JBQWtCO2dCQUNsQiwwREFBMEQ7Z0JBQzFELGNBQWM7Z0JBQ2Qsb0NBQW9DO2dCQUNwQyxlQUFlO2dCQUNmLDBCQUEwQjtnQkFDMUIsYUFBYTtnQkFDYiw4QkFBOEI7Z0JBQzlCLE1BQU07Z0JBQ04sZ0ZBQWdGO2dCQUNoRixZQUFZO2dCQUNaLDRDQUE0QztnQkFDNUMsZUFBZTtnQkFDZixnREFBZ0Q7Z0JBQ2hELHNCQUFzQjtnQkFDdEI7O21CQUVHO2dCQUNILHFCQUFxQjthQUN0QixDQUFBO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBaGZZLFFBQUEsa0JBQWtCLHNCQWdmOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNhbmRib3ggfSBmcm9tIFwiQHR5cGVzY3JpcHQvc2FuZGJveFwiXG5pbXBvcnQgdHlwZSB7IERpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb24sIE5vZGUgfSBmcm9tIFwidHlwZXNjcmlwdFwiXG5cbmV4cG9ydCB0eXBlIExvY2FsU3RvcmFnZU9wdGlvbiA9IHtcbiAgYmx1cmI6IHN0cmluZ1xuICBmbGFnOiBzdHJpbmdcbiAgZGlzcGxheTogc3RyaW5nXG5cbiAgZW1wdHlJbXBsaWVzRW5hYmxlZD86IHRydWVcbiAgb25lbGluZT86IHRydWVcbiAgcmVxdWlyZVJlc3RhcnQ/OiB0cnVlXG4gIG9uY2hhbmdlPzogKG5ld1ZhbHVlOiBib29sZWFuKSA9PiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIE9wdGlvbnNMaXN0Q29uZmlnID0ge1xuICBzdHlsZTogXCJzZXBhcmF0ZWRcIiB8IFwicm93c1wiXG4gIHJlcXVpcmVSZXN0YXJ0PzogdHJ1ZVxufVxuXG5jb25zdCBlbCA9IChzdHI6IHN0cmluZywgZWxlbWVudFR5cGU6IHN0cmluZywgY29udGFpbmVyOiBFbGVtZW50KSA9PiB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50VHlwZSlcbiAgZWwuaW5uZXJIVE1MID0gc3RyXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbClcbiAgcmV0dXJuIGVsXG59XG5cbmV4cG9ydCB0eXBlIERlc2lnblN5c3RlbSA9IFJldHVyblR5cGU8UmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlRGVzaWduU3lzdGVtPj5cblxuLy8gVGhlIFBsYXlncm91bmQgUGx1Z2luIGRlc2lnbiBzeXN0ZW1cbmV4cG9ydCBjb25zdCBjcmVhdGVEZXNpZ25TeXN0ZW0gPSAoc2FuZGJveDogU2FuZGJveCkgPT4ge1xuICBjb25zdCB0cyA9IHNhbmRib3gudHNcblxuICByZXR1cm4gKGNvbnRhaW5lcjogRWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IGNsZWFyID0gKCkgPT4ge1xuICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZClcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGRlY29yYXRpb25zOiBzdHJpbmdbXSA9IFtdXG4gICAgbGV0IGRlY29yYXRpb25Mb2NrID0gZmFsc2VcblxuICAgIGNvbnN0IGNsZWFyRGVsdGFEZWNvcmF0b3JzID0gKGZvcmNlPzogdHJ1ZSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coYGNsZWFyaW5nLCAke2RlY29yYXRpb25zLmxlbmd0aH19YClcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNhbmRib3guZWRpdG9yLmdldE1vZGVsKCk/LmdldEFsbERlY29yYXRpb25zKCkpXG4gICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgc2FuZGJveC5lZGl0b3IuZGVsdGFEZWNvcmF0aW9ucyhkZWNvcmF0aW9ucywgW10pXG4gICAgICAgIGRlY29yYXRpb25zID0gW11cbiAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSBmYWxzZVxuICAgICAgfSBlbHNlIGlmICghZGVjb3JhdGlvbkxvY2spIHtcbiAgICAgICAgc2FuZGJveC5lZGl0b3IuZGVsdGFEZWNvcmF0aW9ucyhkZWNvcmF0aW9ucywgW10pXG4gICAgICAgIGRlY29yYXRpb25zID0gW11cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogTGV0cyBhIEhUTUwgRWxlbWVudCBob3ZlciB0byBoaWdobGlnaHQgY29kZSBpbiB0aGUgZWRpdG9yICAqL1xuICAgIGNvbnN0IGFkZEVkaXRvckhvdmVyVG9FbGVtZW50ID0gKFxuICAgICAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgICBwb3M6IHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfSxcbiAgICAgIGNvbmZpZzogeyB0eXBlOiBcImVycm9yXCIgfCBcImluZm9cIiB9XG4gICAgKSA9PiB7XG4gICAgICBlbGVtZW50Lm9ubW91c2VlbnRlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFkZWNvcmF0aW9uTG9jaykge1xuICAgICAgICAgIGNvbnN0IG1vZGVsID0gc2FuZGJveC5nZXRNb2RlbCgpXG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KHBvcy5zdGFydClcbiAgICAgICAgICBjb25zdCBlbmQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KHBvcy5lbmQpXG5cbiAgICAgICAgICBkZWNvcmF0aW9ucyA9IHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcmFuZ2U6IG5ldyBzYW5kYm94Lm1vbmFjby5SYW5nZShzdGFydC5saW5lTnVtYmVyLCBzdGFydC5jb2x1bW4sIGVuZC5saW5lTnVtYmVyLCBlbmQuY29sdW1uKSxcbiAgICAgICAgICAgICAgb3B0aW9uczogeyBpbmxpbmVDbGFzc05hbWU6IFwiaGlnaGxpZ2h0LVwiICsgY29uZmlnLnR5cGUgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50Lm9ubW91c2VsZWF2ZSA9ICgpID0+IHtcbiAgICAgICAgY2xlYXJEZWx0YURlY29yYXRvcnMoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGRlY2xhcmVSZXN0YXJ0UmVxdWlyZWQgPSAoaT86IChrZXk6IHN0cmluZykgPT4gc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0YXJ0LXJlcXVpcmVkXCIpKSByZXR1cm5cbiAgICAgIGNvbnN0IGxvY2FsaXplID0gaSB8fCAod2luZG93IGFzIGFueSkuaVxuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgIGxpLmlkID0gXCJyZXN0YXJ0LXJlcXVpcmVkXCJcblxuICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICBhLnN0eWxlLmNvbG9yID0gXCIjYzYzMTMxXCJcbiAgICAgIGEudGV4dENvbnRlbnQgPSBsb2NhbGl6ZShcInBsYXlfc2lkZWJhcl9vcHRpb25zX3Jlc3RhcnRfcmVxdWlyZWRcIilcbiAgICAgIGEuaHJlZiA9IFwiI1wiXG4gICAgICBhLm9uY2xpY2sgPSAoKSA9PiBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuXG4gICAgICBjb25zdCBuYXYgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibmF2YmFyLXJpZ2h0XCIpWzBdXG4gICAgICBsaS5hcHBlbmRDaGlsZChhKVxuICAgICAgbmF2Lmluc2VydEJlZm9yZShsaSwgbmF2LmZpcnN0Q2hpbGQpXG4gICAgfVxuXG4gICAgY29uc3QgbG9jYWxTdG9yYWdlT3B0aW9uID0gKHNldHRpbmc6IExvY2FsU3RvcmFnZU9wdGlvbikgPT4ge1xuICAgICAgLy8gVGhpbmsgYWJvdXQgdGhpcyBhcyBiZWluZyBzb21ldGhpbmcgd2hpY2ggeW91IHdhbnQgZW5hYmxlZCBieSBkZWZhdWx0IGFuZCBjYW4gc3VwcHJlc3Mgd2hldGhlclxuICAgICAgLy8gaXQgc2hvdWxkIGRvIHNvbWV0aGluZy5cbiAgICAgIGNvbnN0IGludmVydGVkTG9naWMgPSBzZXR0aW5nLmVtcHR5SW1wbGllc0VuYWJsZWRcblxuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpXG4gICAgICBjb25zdCBzcGxpdCA9IHNldHRpbmcub25lbGluZSA/IFwiXCIgOiBcIjxici8+XCJcbiAgICAgIGxhYmVsLmlubmVySFRNTCA9IGA8c3Bhbj4ke3NldHRpbmcuZGlzcGxheX08L3NwYW4+JHtzcGxpdH0ke3NldHRpbmcuYmx1cmJ9YFxuXG4gICAgICBjb25zdCBrZXkgPSBzZXR0aW5nLmZsYWdcbiAgICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpXG4gICAgICBpbnB1dC50eXBlID0gXCJjaGVja2JveFwiXG4gICAgICBpbnB1dC5pZCA9IGtleVxuXG4gICAgICBpbnB1dC5jaGVja2VkID0gaW52ZXJ0ZWRMb2dpYyA/ICFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpIDogISFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpXG5cbiAgICAgIGlucHV0Lm9uY2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAoaW5wdXQuY2hlY2tlZCkge1xuICAgICAgICAgIGlmICghaW52ZXJ0ZWRMb2dpYykgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBcInRydWVcIilcbiAgICAgICAgICBlbHNlIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaW52ZXJ0ZWRMb2dpYykgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBcInRydWVcIilcbiAgICAgICAgICBlbHNlIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5nLm9uY2hhbmdlKSB7XG4gICAgICAgICAgc2V0dGluZy5vbmNoYW5nZSghIWxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNldHRpbmcucmVxdWlyZVJlc3RhcnQpIHtcbiAgICAgICAgICBkZWNsYXJlUmVzdGFydFJlcXVpcmVkKClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsYWJlbC5odG1sRm9yID0gaW5wdXQuaWRcblxuICAgICAgbGkuYXBwZW5kQ2hpbGQoaW5wdXQpXG4gICAgICBsaS5hcHBlbmRDaGlsZChsYWJlbClcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChsaSlcbiAgICAgIHJldHVybiBsaVxuICAgIH1cblxuICAgIGNvbnN0IGJ1dHRvbiA9IChzZXR0aW5nczogeyBsYWJlbDogc3RyaW5nOyBvbmNsaWNrPzogKGV2OiBNb3VzZUV2ZW50KSA9PiB2b2lkIH0pID0+IHtcbiAgICAgIGNvbnN0IGpvaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgICAgIGpvaW4udHlwZSA9IFwiYnV0dG9uXCJcbiAgICAgIGpvaW4udmFsdWUgPSBzZXR0aW5ncy5sYWJlbFxuICAgICAgaWYgKHNldHRpbmdzLm9uY2xpY2spIHtcbiAgICAgICAgam9pbi5vbmNsaWNrID0gc2V0dGluZ3Mub25jbGlja1xuICAgICAgfVxuXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoam9pbilcbiAgICAgIHJldHVybiBqb2luXG4gICAgfVxuXG4gICAgY29uc3QgY29kZSA9IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgIGNvbnN0IGNyZWF0ZUNvZGVQcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJlXCIpXG4gICAgICBjcmVhdGVDb2RlUHJlLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiMFwiKVxuICAgICAgY29uc3QgY29kZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY29kZVwiKVxuXG4gICAgICBjb2RlRWxlbWVudC5pbm5lckhUTUwgPSBjb2RlXG5cbiAgICAgIGNyZWF0ZUNvZGVQcmUuYXBwZW5kQ2hpbGQoY29kZUVsZW1lbnQpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ29kZVByZSlcblxuICAgICAgLy8gV2hlbiA8cHJlPiBmb2N1c2VkLCBDdHJsK0Egc2hvdWxkIHNlbGVjdCBvbmx5IGNvZGUgcHJlIGluc3RlYWQgb2YgdGhlIGVudGlyZSBkb2N1bWVudFxuICAgICAgY3JlYXRlQ29kZVByZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHtcbiAgICAgICAgaWYgKGUua2V5LnRvVXBwZXJDYXNlKCkgPT09IFwiQVwiICYmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSkge1xuICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICBpZiAoIXNlbGVjdGlvbikgcmV0dXJuO1xuICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RBbGxDaGlsZHJlbihjcmVhdGVDb2RlUHJlKVxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIGNvZGVFbGVtZW50XG4gICAgfVxuXG4gICAgY29uc3Qgc2hvd0VtcHR5U2NyZWVuID0gKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgY2xlYXIoKVxuXG4gICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBub0Vycm9yc01lc3NhZ2UuaWQgPSBcImVtcHR5LW1lc3NhZ2UtY29udGFpbmVyXCJcblxuICAgICAgY29uc3QgbWVzc2FnZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIG1lc3NhZ2VEaXYudGV4dENvbnRlbnQgPSBtZXNzYWdlXG4gICAgICBtZXNzYWdlRGl2LmNsYXNzTGlzdC5hZGQoXCJlbXB0eS1wbHVnaW4tbWVzc2FnZVwiKVxuICAgICAgbm9FcnJvcnNNZXNzYWdlLmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpXG5cbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub0Vycm9yc01lc3NhZ2UpXG4gICAgICByZXR1cm4gbm9FcnJvcnNNZXNzYWdlXG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlVGFiQmFyID0gKCkgPT4ge1xuICAgICAgY29uc3QgdGFiQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgdGFiQmFyLmNsYXNzTGlzdC5hZGQoXCJwbGF5Z3JvdW5kLXBsdWdpbi10YWJ2aWV3XCIpXG5cbiAgICAgIC8qKiBTdXBwb3J0IGxlZnQvcmlnaHQgaW4gdGhlIHRhYiBiYXIgZm9yIGFjY2Vzc2liaWxpdHkgKi9cbiAgICAgIGxldCB0YWJGb2N1cyA9IDBcbiAgICAgIHRhYkJhci5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBlID0+IHtcbiAgICAgICAgY29uc3QgdGFicyA9IHRhYkJhci5xdWVyeVNlbGVjdG9yQWxsKCdbcm9sZT1cInRhYlwiXScpXG4gICAgICAgIC8vIE1vdmUgcmlnaHRcbiAgICAgICAgaWYgKGUua2V5ID09PSBcIkFycm93UmlnaHRcIiB8fCBlLmtleSA9PT0gXCJBcnJvd0xlZnRcIikge1xuICAgICAgICAgIHRhYnNbdGFiRm9jdXNdLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIilcbiAgICAgICAgICBpZiAoZS5rZXkgPT09IFwiQXJyb3dSaWdodFwiKSB7XG4gICAgICAgICAgICB0YWJGb2N1cysrXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgZW5kLCBnbyB0byB0aGUgc3RhcnRcbiAgICAgICAgICAgIGlmICh0YWJGb2N1cyA+PSB0YWJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICB0YWJGb2N1cyA9IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1vdmUgbGVmdFxuICAgICAgICAgIH0gZWxzZSBpZiAoZS5rZXkgPT09IFwiQXJyb3dMZWZ0XCIpIHtcbiAgICAgICAgICAgIHRhYkZvY3VzLS1cbiAgICAgICAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSBzdGFydCwgbW92ZSB0byB0aGUgZW5kXG4gICAgICAgICAgICBpZiAodGFiRm9jdXMgPCAwKSB7XG4gICAgICAgICAgICAgIHRhYkZvY3VzID0gdGFicy5sZW5ndGggLSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGFic1t0YWJGb2N1c10uc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCIwXCIpXG4gICAgICAgICAgOyh0YWJzW3RhYkZvY3VzXSBhcyBhbnkpLmZvY3VzKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRhYkJhcilcbiAgICAgIHJldHVybiB0YWJCYXJcbiAgICB9XG5cbiAgICBjb25zdCBjcmVhdGVUYWJCdXR0b24gPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKVxuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwidGFiXCIpXG4gICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gdGV4dFxuICAgICAgcmV0dXJuIGVsZW1lbnRcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0RGlhZ3MgPSAobW9kZWw6IGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikuZWRpdG9yLklUZXh0TW9kZWwsIGRpYWdzOiBEaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10pID0+IHtcbiAgICAgIGNvbnN0IGVycm9yVUwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidWxcIilcbiAgICAgIGVycm9yVUwuY2xhc3NOYW1lID0gXCJjb21waWxlci1kaWFnbm9zdGljc1wiXG4gICAgICBlcnJvclVMLm9ubW91c2VsZWF2ZSA9IGV2ID0+IHtcbiAgICAgICAgY2xlYXJEZWx0YURlY29yYXRvcnMoKVxuICAgICAgfVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVycm9yVUwpXG5cbiAgICAgIGRpYWdzLmZvckVhY2goZGlhZyA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJkaWFnbm9zdGljXCIpXG4gICAgICAgIHN3aXRjaCAoZGlhZy5jYXRlZ29yeSkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJ3YXJuaW5nXCIpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJlcnJvclwiKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwic3VnZ2VzdGlvblwiKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwibWVzc2FnZVwiKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZGlhZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gZGlhZ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gc2FuZGJveC50cy5mbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VUZXh0KGRpYWcubWVzc2FnZVRleHQsIFwiXFxuXCIsIDQpXG4gICAgICAgIH1cbiAgICAgICAgZXJyb3JVTC5hcHBlbmRDaGlsZChsaSlcblxuICAgICAgICBpZiAoZGlhZy5zdGFydCAmJiBkaWFnLmxlbmd0aCkge1xuICAgICAgICAgIGFkZEVkaXRvckhvdmVyVG9FbGVtZW50KGxpLCB7IHN0YXJ0OiBkaWFnLnN0YXJ0LCBlbmQ6IGRpYWcuc3RhcnQgKyBkaWFnLmxlbmd0aCB9LCB7IHR5cGU6IFwiZXJyb3JcIiB9KVxuICAgICAgICB9XG5cbiAgICAgICAgbGkub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoZGlhZy5zdGFydCAmJiBkaWFnLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KGRpYWcuc3RhcnQpXG4gICAgICAgICAgICBzYW5kYm94LmVkaXRvci5yZXZlYWxMaW5lKHN0YXJ0LmxpbmVOdW1iZXIpXG5cbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IG1vZGVsLmdldFBvc2l0aW9uQXQoZGlhZy5zdGFydCArIGRpYWcubGVuZ3RoKVxuICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByYW5nZTogbmV3IHNhbmRib3gubW9uYWNvLlJhbmdlKHN0YXJ0LmxpbmVOdW1iZXIsIHN0YXJ0LmNvbHVtbiwgZW5kLmxpbmVOdW1iZXIsIGVuZC5jb2x1bW4pLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgaW5saW5lQ2xhc3NOYW1lOiBcImVycm9yLWhpZ2hsaWdodFwiLCBpc1dob2xlTGluZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSB0cnVlXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSBmYWxzZVxuICAgICAgICAgICAgICBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXSlcbiAgICAgICAgICAgIH0sIDMwMClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICByZXR1cm4gZXJyb3JVTFxuICAgIH1cblxuICAgIGNvbnN0IHNob3dPcHRpb25MaXN0ID0gKG9wdGlvbnM6IExvY2FsU3RvcmFnZU9wdGlvbltdLCBzdHlsZTogT3B0aW9uc0xpc3RDb25maWcpID0+IHtcbiAgICAgIGNvbnN0IG9sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpXG4gICAgICBvbC5jbGFzc05hbWUgPSBzdHlsZS5zdHlsZSA9PT0gXCJzZXBhcmF0ZWRcIiA/IFwicGxheWdyb3VuZC1vcHRpb25zXCIgOiBcInBsYXlncm91bmQtb3B0aW9ucyB0aWdodFwiXG5cbiAgICAgIG9wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGUgPT09IFwicm93c1wiKSBvcHRpb24ub25lbGluZSA9IHRydWVcbiAgICAgICAgaWYgKHN0eWxlLnJlcXVpcmVSZXN0YXJ0KSBvcHRpb24ucmVxdWlyZVJlc3RhcnQgPSB0cnVlXG5cbiAgICAgICAgY29uc3Qgc2V0dGluZ0J1dHRvbiA9IGxvY2FsU3RvcmFnZU9wdGlvbihvcHRpb24pXG4gICAgICAgIG9sLmFwcGVuZENoaWxkKHNldHRpbmdCdXR0b24pXG4gICAgICB9KVxuXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQob2wpXG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlQVNUVHJlZSA9IChub2RlOiBOb2RlLCBzZXR0aW5ncz86IHsgY2xvc2VkQnlEZWZhdWx0PzogdHJ1ZSB9KSA9PiB7XG4gICAgICBjb25zdCBhdXRvT3BlbiA9ICFzZXR0aW5ncyB8fCAhc2V0dGluZ3MuY2xvc2VkQnlEZWZhdWx0XG5cbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGRpdi5jbGFzc05hbWUgPSBcImFzdFwiXG5cbiAgICAgIGNvbnN0IGluZm9Gb3JOb2RlID0gKG5vZGU6IE5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRzLlN5bnRheEtpbmRbbm9kZS5raW5kXVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0eXBlIE5vZGVJbmZvID0gUmV0dXJuVHlwZTx0eXBlb2YgaW5mb0Zvck5vZGU+XG5cbiAgICAgIGNvbnN0IHJlbmRlckxpdGVyYWxGaWVsZCA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgaW5mbzogTm9kZUluZm8pID0+IHtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgICAgY29uc3QgdHlwZW9mU3BhbiA9IGBhc3Qtbm9kZS0ke3R5cGVvZiB2YWx1ZX1gXG4gICAgICAgIGxldCBzdWZmaXggPSBcIlwiXG4gICAgICAgIGlmIChrZXkgPT09IFwia2luZFwiKSB7XG4gICAgICAgICAgc3VmZml4ID0gYCAoU3ludGF4S2luZC4ke2luZm8ubmFtZX0pYFxuICAgICAgICB9XG4gICAgICAgIGxpLmlubmVySFRNTCA9IGAke2tleX06IDxzcGFuIGNsYXNzPScke3R5cGVvZlNwYW59Jz4ke3ZhbHVlfTwvc3Bhbj4ke3N1ZmZpeH1gXG4gICAgICAgIHJldHVybiBsaVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZW5kZXJTaW5nbGVDaGlsZCA9IChrZXk6IHN0cmluZywgdmFsdWU6IE5vZGUsIGRlcHRoOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgICAgbGkuaW5uZXJIVE1MID0gYCR7a2V5fTogYFxuXG4gICAgICAgIHJlbmRlckl0ZW0obGksIHZhbHVlLCBkZXB0aCArIDEpXG4gICAgICAgIHJldHVybiBsaVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZW5kZXJNYW55Q2hpbGRyZW4gPSAoa2V5OiBzdHJpbmcsIG5vZGVzOiBOb2RlW10sIGRlcHRoOiBudW1iZXIpID0+IHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgIGNoaWxkcmVuLmNsYXNzTGlzdC5hZGQoXCJhc3QtY2hpbGRyZW5cIilcblxuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKVxuICAgICAgICBsaS5pbm5lckhUTUwgPSBgJHtrZXl9OiBbPGJyLz5gXG4gICAgICAgIGNoaWxkcmVuLmFwcGVuZENoaWxkKGxpKVxuXG4gICAgICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgcmVuZGVySXRlbShjaGlsZHJlbiwgbm9kZSwgZGVwdGggKyAxKVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IGxpRW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIGxpRW5kLmlubmVySFRNTCArPSBcIl1cIlxuICAgICAgICBjaGlsZHJlbi5hcHBlbmRDaGlsZChsaUVuZClcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlbmRlckl0ZW0gPSAocGFyZW50RWxlbWVudDogRWxlbWVudCwgbm9kZTogTm9kZSwgZGVwdGg6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBpdGVtRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKGl0ZW1EaXYpXG4gICAgICAgIGl0ZW1EaXYuY2xhc3NOYW1lID0gXCJhc3QtdHJlZS1zdGFydFwiXG4gICAgICAgIGl0ZW1EaXYuYXR0cmlidXRlcy5zZXROYW1lZEl0ZW1cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBpdGVtRGl2LmRhdGFzZXQucG9zID0gbm9kZS5wb3NcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBpdGVtRGl2LmRhdGFzZXQuZW5kID0gbm9kZS5lbmRcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBpdGVtRGl2LmRhdGFzZXQuZGVwdGggPSBkZXB0aFxuXG4gICAgICAgIGlmIChkZXB0aCA9PT0gMCAmJiBhdXRvT3BlbikgaXRlbURpdi5jbGFzc0xpc3QuYWRkKFwib3BlblwiKVxuXG4gICAgICAgIGNvbnN0IGluZm8gPSBpbmZvRm9yTm9kZShub2RlKVxuXG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgICBhLmNsYXNzTGlzdC5hZGQoXCJub2RlLW5hbWVcIilcbiAgICAgICAgYS50ZXh0Q29udGVudCA9IGluZm8ubmFtZVxuICAgICAgICBpdGVtRGl2LmFwcGVuZENoaWxkKGEpXG4gICAgICAgIGEub25jbGljayA9IF8gPT4gYS5wYXJlbnRFbGVtZW50IS5jbGFzc0xpc3QudG9nZ2xlKFwib3BlblwiKVxuICAgICAgICBhZGRFZGl0b3JIb3ZlclRvRWxlbWVudChhLCB7IHN0YXJ0OiBub2RlLnBvcywgZW5kOiBub2RlLmVuZCB9LCB7IHR5cGU6IFwiaW5mb1wiIH0pXG5cbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKVxuICAgICAgICBwcm9wZXJ0aWVzLmNsYXNzTmFtZSA9IFwiYXN0LXRyZWVcIlxuICAgICAgICBpdGVtRGl2LmFwcGVuZENoaWxkKHByb3BlcnRpZXMpXG5cbiAgICAgICAgT2JqZWN0LmtleXMobm9kZSkuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBmaWVsZCA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm5cbiAgICAgICAgICBpZiAoZmllbGQgPT09IFwicGFyZW50XCIgfHwgZmllbGQgPT09IFwiZmxvd05vZGVcIikgcmV0dXJuXG5cbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IChub2RlIGFzIGFueSlbZmllbGRdXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZVswXSAmJiBcInBvc1wiIGluIHZhbHVlWzBdICYmIFwiZW5kXCIgaW4gdmFsdWVbMF0pIHtcbiAgICAgICAgICAgIC8vICBJcyBhbiBhcnJheSBvZiBOb2Rlc1xuICAgICAgICAgICAgcHJvcGVydGllcy5hcHBlbmRDaGlsZChyZW5kZXJNYW55Q2hpbGRyZW4oZmllbGQsIHZhbHVlLCBkZXB0aCkpXG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgXCJwb3NcIiBpbiB2YWx1ZSAmJiBcImVuZFwiIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBJcyBhIHNpbmdsZSBjaGlsZCBwcm9wZXJ0eVxuICAgICAgICAgICAgcHJvcGVydGllcy5hcHBlbmRDaGlsZChyZW5kZXJTaW5nbGVDaGlsZChmaWVsZCwgdmFsdWUsIGRlcHRoKSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvcGVydGllcy5hcHBlbmRDaGlsZChyZW5kZXJMaXRlcmFsRmllbGQoZmllbGQsIHZhbHVlLCBpbmZvKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJlbmRlckl0ZW0oZGl2LCBub2RlLCAwKVxuICAgICAgY29udGFpbmVyLmFwcGVuZChkaXYpXG4gICAgICByZXR1cm4gZGl2XG4gICAgfVxuXG4gICAgdHlwZSBUZXh0SW5wdXRDb25maWcgPSB7XG4gICAgICBpZDogc3RyaW5nXG4gICAgICBwbGFjZWhvbGRlcjogc3RyaW5nXG5cbiAgICAgIG9uQ2hhbmdlZD86ICh0ZXh0OiBzdHJpbmcsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB2b2lkXG4gICAgICBvbkVudGVyOiAodGV4dDogc3RyaW5nLCBpbnB1dDogSFRNTElucHV0RWxlbWVudCkgPT4gdm9pZFxuXG4gICAgICB2YWx1ZT86IHN0cmluZ1xuICAgICAga2VlcFZhbHVlQWNyb3NzUmVsb2Fkcz86IHRydWVcbiAgICAgIGlzRW5hYmxlZD86IChpbnB1dDogSFRNTElucHV0RWxlbWVudCkgPT4gYm9vbGVhblxuICAgIH1cblxuICAgIGNvbnN0IGNyZWF0ZVRleHRJbnB1dCA9IChjb25maWc6IFRleHRJbnB1dENvbmZpZykgPT4ge1xuICAgICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJmb3JtXCIpXG5cbiAgICAgIGNvbnN0IHRleHRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgICAgIHRleHRib3guaWQgPSBjb25maWcuaWRcbiAgICAgIHRleHRib3gucGxhY2Vob2xkZXIgPSBjb25maWcucGxhY2Vob2xkZXJcbiAgICAgIHRleHRib3guYXV0b2NvbXBsZXRlID0gXCJvZmZcIlxuICAgICAgdGV4dGJveC5hdXRvY2FwaXRhbGl6ZSA9IFwib2ZmXCJcbiAgICAgIHRleHRib3guc3BlbGxjaGVjayA9IGZhbHNlXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0ZXh0Ym94LmF1dG9jb3JyZWN0ID0gXCJvZmZcIlxuXG4gICAgICBjb25zdCBsb2NhbFN0b3JhZ2VLZXkgPSBcInBsYXlncm91bmQtaW5wdXQtXCIgKyBjb25maWcuaWRcblxuICAgICAgaWYgKGNvbmZpZy52YWx1ZSkge1xuICAgICAgICB0ZXh0Ym94LnZhbHVlID0gY29uZmlnLnZhbHVlXG4gICAgICB9IGVsc2UgaWYgKGNvbmZpZy5rZWVwVmFsdWVBY3Jvc3NSZWxvYWRzKSB7XG4gICAgICAgIGNvbnN0IHN0b3JlZFF1ZXJ5ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0obG9jYWxTdG9yYWdlS2V5KVxuICAgICAgICBpZiAoc3RvcmVkUXVlcnkpIHRleHRib3gudmFsdWUgPSBzdG9yZWRRdWVyeVxuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLmlzRW5hYmxlZCkge1xuICAgICAgICBjb25zdCBlbmFibGVkID0gY29uZmlnLmlzRW5hYmxlZCh0ZXh0Ym94KVxuICAgICAgICB0ZXh0Ym94LmNsYXNzTGlzdC5hZGQoZW5hYmxlZCA/IFwiZ29vZFwiIDogXCJiYWRcIilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHRib3guY2xhc3NMaXN0LmFkZChcImdvb2RcIilcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGV4dFVwZGF0ZSA9IChlOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgaHJlZiA9IGUudGFyZ2V0LnZhbHVlLnRyaW0oKVxuICAgICAgICBpZiAoY29uZmlnLmtlZXBWYWx1ZUFjcm9zc1JlbG9hZHMpIHtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShsb2NhbFN0b3JhZ2VLZXksIGhyZWYpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZy5vbkNoYW5nZWQpIGNvbmZpZy5vbkNoYW5nZWQoZS50YXJnZXQudmFsdWUsIHRleHRib3gpXG4gICAgICB9XG5cbiAgICAgIHRleHRib3guc3R5bGUud2lkdGggPSBcIjkwJVwiXG4gICAgICB0ZXh0Ym94LnN0eWxlLmhlaWdodCA9IFwiMnJlbVwiXG4gICAgICB0ZXh0Ym94LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0ZXh0VXBkYXRlKVxuXG4gICAgICAvLyBTdXBwcmVzcyB0aGUgZW50ZXIga2V5XG4gICAgICB0ZXh0Ym94Lm9ua2V5ZG93biA9IChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2dC5rZXkgPT09IFwiRW50ZXJcIiB8fCBldnQuY29kZSA9PT0gXCJFbnRlclwiKSB7XG4gICAgICAgICAgY29uZmlnLm9uRW50ZXIodGV4dGJveC52YWx1ZSwgdGV4dGJveClcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3JtLmFwcGVuZENoaWxkKHRleHRib3gpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSlcbiAgICAgIHJldHVybiBmb3JtXG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlU3ViRGVzaWduU3lzdGVtID0gKCk6IGFueSA9PiB7XG4gICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KVxuICAgICAgY29uc3QgZHMgPSBjcmVhdGVEZXNpZ25TeXN0ZW0oc2FuZGJveCkoZGl2KVxuICAgICAgcmV0dXJuIGRzXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKiBUaGUgZWxlbWVudCBvZiB0aGUgZGVzaWduIHN5c3RlbSAqL1xuICAgICAgY29udGFpbmVyLFxuICAgICAgLyoqIENsZWFyIHRoZSBzaWRlYmFyICovXG4gICAgICBjbGVhcixcbiAgICAgIC8qKiBQcmVzZW50IGNvZGUgaW4gYSBwcmUgPiBjb2RlICAqL1xuICAgICAgY29kZSxcbiAgICAgIC8qKiBJZGVhbGx5IG9ubHkgdXNlIHRoaXMgb25jZSwgYW5kIG1heWJlIGV2ZW4gcHJlZmVyIHVzaW5nIHN1YnRpdGxlcyBldmVyeXdoZXJlICovXG4gICAgICB0aXRsZTogKHRpdGxlOiBzdHJpbmcpID0+IGVsKHRpdGxlLCBcImgzXCIsIGNvbnRhaW5lciksXG4gICAgICAvKiogVXNlZCB0byBkZW5vdGUgc2VjdGlvbnMsIGdpdmUgaW5mbyBldGMgKi9cbiAgICAgIHN1YnRpdGxlOiAoc3VidGl0bGU6IHN0cmluZykgPT4gZWwoc3VidGl0bGUsIFwiaDRcIiwgY29udGFpbmVyKSxcbiAgICAgIC8qKiBVc2VkIHRvIHNob3cgYSBwYXJhZ3JhcGggKi9cbiAgICAgIHA6IChzdWJ0aXRsZTogc3RyaW5nKSA9PiBlbChzdWJ0aXRsZSwgXCJwXCIsIGNvbnRhaW5lciksXG4gICAgICAvKiogV2hlbiB5b3UgY2FuJ3QgZG8gc29tZXRoaW5nLCBvciBoYXZlIG5vdGhpbmcgdG8gc2hvdyAqL1xuICAgICAgc2hvd0VtcHR5U2NyZWVuLFxuICAgICAgLyoqXG4gICAgICAgKiBTaG93cyBhIGxpc3Qgb2YgaG92ZXJhYmxlLCBhbmQgc2VsZWN0YWJsZSBpdGVtcyAoZXJyb3JzLCBoaWdobGlnaHRzIGV0Yykgd2hpY2ggaGF2ZSBjb2RlIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICogVGhlIHR5cGUgaXMgcXVpdGUgc21hbGwsIHNvIGl0IHNob3VsZCBiZSB2ZXJ5IGZlYXNpYmxlIGZvciB5b3UgdG8gbWFzc2FnZSBvdGhlciBkYXRhIHRvIGZpdCBpbnRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgbGlzdERpYWdzLFxuICAgICAgLyoqIExldHMgeW91IHJlbW92ZSB0aGUgaG92ZXJzIGZyb20gbGlzdERpYWdzIGV0YyAqL1xuICAgICAgY2xlYXJEZWx0YURlY29yYXRvcnMsXG4gICAgICAvKiogU2hvd3MgYSBzaW5nbGUgb3B0aW9uIGluIGxvY2FsIHN0b3JhZ2UgKGFkZHMgYW4gbGkgdG8gdGhlIGNvbnRhaW5lciBCVFcpICovXG4gICAgICBsb2NhbFN0b3JhZ2VPcHRpb24sXG4gICAgICAvKiogVXNlcyBsb2NhbFN0b3JhZ2VPcHRpb24gdG8gY3JlYXRlIGEgbGlzdCBvZiBvcHRpb25zICovXG4gICAgICBzaG93T3B0aW9uTGlzdCxcbiAgICAgIC8qKiBTaG93cyBhIGZ1bGwtd2lkdGggdGV4dCBpbnB1dCAqL1xuICAgICAgY3JlYXRlVGV4dElucHV0LFxuICAgICAgLyoqIFJlbmRlcnMgYW4gQVNUIHRyZWUgKi9cbiAgICAgIGNyZWF0ZUFTVFRyZWUsXG4gICAgICAvKiogQ3JlYXRlcyBhbiBpbnB1dCBidXR0b24gKi9cbiAgICAgIGJ1dHRvbixcbiAgICAgIC8qKiBVc2VkIHRvIHJlLWNyZWF0ZSBhIFVJIGxpa2UgdGhlIHRhYiBiYXIgYXQgdGhlIHRvcCBvZiB0aGUgcGx1Z2lucyBzZWN0aW9uICovXG4gICAgICBjcmVhdGVUYWJCYXIsXG4gICAgICAvKiogVXNlZCB3aXRoIGNyZWF0ZVRhYkJhciB0byBhZGQgYnV0dG9ucyAqL1xuICAgICAgY3JlYXRlVGFiQnV0dG9uLFxuICAgICAgLyoqIEEgZ2VuZXJhbCBcInJlc3RhcnQgeW91ciBicm93c2VyXCIgbWVzc2FnZSAgKi9cbiAgICAgIGRlY2xhcmVSZXN0YXJ0UmVxdWlyZWQsXG4gICAgICAvKiogQ3JlYXRlIGEgbmV3IERlc2lnbiBTeXN0ZW0gaW5zdGFuY2UgYW5kIGFkZCBpdCB0byB0aGUgY29udGFpbmVyLiBZb3UnbGwgbmVlZCB0byBjYXN0XG4gICAgICAgKiB0aGlzIGFmdGVyIHVzYWdlLCBiZWNhdXNlIG90aGVyd2lzZSB0aGUgdHlwZS1zeXN0ZW0gY2lyY3VsYXJseSByZWZlcmVuY2VzIGl0c2VsZlxuICAgICAgICovXG4gICAgICBjcmVhdGVTdWJEZXNpZ25TeXN0ZW0sXG4gICAgfVxuICB9XG59XG4iXX0=