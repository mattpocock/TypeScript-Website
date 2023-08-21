define(["require", "exports", "../createUI", "../localizeWithFallback"], function (require, exports, createUI_1, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runWithCustomLogs = exports.clearLogs = exports.runPlugin = void 0;
    let allLogs = [];
    let addedClearAction = false;
    const cancelButtonSVG = `
<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="6" cy="7" r="5" stroke-width="2"/>
<line x1="0.707107" y1="1.29289" x2="11.7071" y2="12.2929" stroke-width="2"/>
</svg>
`;
    const runPlugin = (i, utils) => {
        const plugin = {
            id: "logs",
            displayName: i("play_sidebar_logs"),
            willMount: (sandbox, container) => {
                const ui = (0, createUI_1.createUI)();
                const clearLogsAction = {
                    id: "clear-logs-play",
                    label: "Clear Playground Logs",
                    keybindings: [sandbox.monaco.KeyMod.CtrlCmd | sandbox.monaco.KeyCode.KeyK],
                    contextMenuGroupId: "run",
                    contextMenuOrder: 1.5,
                    run: function () {
                        (0, exports.clearLogs)();
                        ui.flashInfo(i("play_clear_logs"));
                    },
                };
                if (!addedClearAction) {
                    sandbox.editor.addAction(clearLogsAction);
                    addedClearAction = true;
                }
                const errorUL = document.createElement("div");
                errorUL.id = "log-container";
                container.appendChild(errorUL);
                const logs = document.createElement("div");
                logs.id = "log";
                logs.innerHTML = allLogs.join("<hr />");
                errorUL.appendChild(logs);
                const logToolsContainer = document.createElement("div");
                logToolsContainer.id = "log-tools";
                container.appendChild(logToolsContainer);
                const clearLogsButton = document.createElement("div");
                clearLogsButton.id = "clear-logs-button";
                clearLogsButton.innerHTML = cancelButtonSVG;
                clearLogsButton.onclick = e => {
                    e.preventDefault();
                    clearLogsAction.run();
                    const filterTextBox = document.getElementById("filter-logs");
                    filterTextBox.value = "";
                };
                logToolsContainer.appendChild(clearLogsButton);
                const filterTextBox = document.createElement("input");
                filterTextBox.id = "filter-logs";
                filterTextBox.placeholder = i("play_sidebar_tools_filter_placeholder");
                filterTextBox.addEventListener("input", (e) => {
                    const inputText = e.target.value;
                    const eleLog = document.getElementById("log");
                    eleLog.innerHTML = allLogs
                        .filter(log => {
                        const userLoggedText = log.substring(log.indexOf(":") + 1, log.indexOf("&nbsp;<br>"));
                        return userLoggedText.includes(inputText);
                    })
                        .join("<hr />");
                    if (inputText === "") {
                        const logContainer = document.getElementById("log-container");
                        logContainer.scrollTop = logContainer.scrollHeight;
                    }
                });
                logToolsContainer.appendChild(filterTextBox);
                if (allLogs.length === 0) {
                    const noErrorsMessage = document.createElement("div");
                    noErrorsMessage.id = "empty-message-container";
                    container.appendChild(noErrorsMessage);
                    const message = document.createElement("div");
                    message.textContent = (0, localizeWithFallback_1.localize)("play_sidebar_logs_no_logs", "No logs");
                    message.classList.add("empty-plugin-message");
                    noErrorsMessage.appendChild(message);
                    errorUL.style.display = "none";
                    logToolsContainer.style.display = "none";
                }
            },
        };
        return plugin;
    };
    exports.runPlugin = runPlugin;
    const clearLogs = () => {
        allLogs = [];
        const logs = document.getElementById("log");
        if (logs) {
            logs.textContent = "";
        }
    };
    exports.clearLogs = clearLogs;
    const runWithCustomLogs = (closure, i) => {
        const noLogs = document.getElementById("empty-message-container");
        const logContainer = document.getElementById("log-container");
        const logToolsContainer = document.getElementById("log-tools");
        if (noLogs) {
            noLogs.style.display = "none";
            logContainer.style.display = "block";
            logToolsContainer.style.display = "flex";
        }
        rewireLoggingToElement(() => document.getElementById("log"), () => document.getElementById("log-container"), closure, true, i);
    };
    exports.runWithCustomLogs = runWithCustomLogs;
    // Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256
    function rewireLoggingToElement(eleLocator, eleOverflowLocator, closure, autoScroll, i) {
        const rawConsole = console;
        closure.then(js => {
            const replace = {};
            bindLoggingFunc(replace, rawConsole, "log", "LOG");
            bindLoggingFunc(replace, rawConsole, "debug", "DBG");
            bindLoggingFunc(replace, rawConsole, "warn", "WRN");
            bindLoggingFunc(replace, rawConsole, "error", "ERR");
            replace["clear"] = exports.clearLogs;
            const console = Object.assign({}, rawConsole, replace);
            try {
                const safeJS = sanitizeJS(js);
                eval(safeJS);
            }
            catch (error) {
                console.error(i("play_run_js_fail"));
                console.error(error);
                if (error instanceof SyntaxError && /\bexport\b/u.test(error.message)) {
                    console.warn('Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground');
                }
            }
        });
        function bindLoggingFunc(obj, raw, name, id) {
            obj[name] = function (...objs) {
                const output = produceOutput(objs);
                const eleLog = eleLocator();
                const prefix = `[<span class="log-${name}">${id}</span>]: `;
                const eleContainerLog = eleOverflowLocator();
                allLogs.push(`${prefix}${output}<br>`);
                eleLog.innerHTML = allLogs.join("<hr />");
                if (autoScroll && eleContainerLog) {
                    eleContainerLog.scrollTop = eleContainerLog.scrollHeight;
                }
                raw[name](...objs);
            };
        }
        // Inline constants which are switched out at the end of processing
        const replacers = {
            "<span class='literal'>null</span>": "1231232131231231423434534534",
            "<span class='literal'>undefined</span>": "4534534534563567567567",
            "<span class='comma'>, </span>": "785y8345873485763874568734y535438",
        };
        const objectToText = (arg) => {
            const isObj = typeof arg === "object";
            let textRep = "";
            if (arg && arg.stack && arg.message) {
                // special case for err
                textRep = htmlEscape(arg.message);
            }
            else if (arg === null) {
                textRep = replacers["<span class='literal'>null</span>"];
            }
            else if (arg === undefined) {
                textRep = replacers["<span class='literal'>undefined</span>"];
            }
            else if (typeof arg === "symbol") {
                textRep = `<span class='literal'>${htmlEscape(String(arg))}</span>`;
            }
            else if (Array.isArray(arg)) {
                textRep = "[" + arg.map(objectToText).join(replacers["<span class='comma'>, </span>"]) + "]";
            }
            else if (arg instanceof Set) {
                const setIter = [...arg];
                textRep = `Set (${arg.size}) {` + setIter.map(objectToText).join(replacers["<span class='comma'>, </span>"]) + "}";
            }
            else if (arg instanceof Map) {
                const mapIter = [...arg.entries()];
                textRep =
                    `Map (${arg.size}) {` +
                        mapIter
                            .map(([k, v]) => `${objectToText(k)} => ${objectToText(v)}`)
                            .join(replacers["<span class='comma'>, </span>"]) +
                        "}";
            }
            else if (typeof arg === "string") {
                textRep = '"' + htmlEscape(arg) + '"';
            }
            else if (isObj) {
                const name = arg.constructor && arg.constructor.name || "";
                // No one needs to know an obj is an obj
                const nameWithoutObject = name && name === "Object" ? "" : htmlEscape(name);
                const prefix = nameWithoutObject ? `${nameWithoutObject}: ` : "";
                // JSON.stringify omits any keys with a value of undefined. To get around this, we replace undefined with the text __undefined__ and then do a global replace using regex back to keyword undefined
                textRep =
                    prefix +
                        JSON.stringify(arg, (_, value) => (value === undefined ? "__undefined__" : value), 2).replace(/"__undefined__"/g, "undefined");
                textRep = htmlEscape(textRep);
            }
            else {
                textRep = htmlEscape(String(arg));
            }
            return textRep;
        };
        function produceOutput(args) {
            let result = args.reduce((output, arg, index) => {
                const textRep = objectToText(arg);
                const showComma = index !== args.length - 1;
                const comma = showComma ? "<span class='comma'>, </span>" : "";
                return output + textRep + comma + " ";
            }, "");
            Object.keys(replacers).forEach(k => {
                result = result.replace(new RegExp(replacers[k], "g"), k);
            });
            return result;
        }
    }
    // The reflect-metadata runtime is available, so allow that to go through
    function sanitizeJS(code) {
        return code.replace(`import "reflect-metadata"`, "").replace(`require("reflect-metadata")`, "");
    }
    function htmlEscape(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBSUEsSUFBSSxPQUFPLEdBQWEsRUFBRSxDQUFBO0lBQzFCLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFBO0lBQzVCLE1BQU0sZUFBZSxHQUFHOzs7OztDQUt2QixDQUFBO0lBRU0sTUFBTSxTQUFTLEdBQWtCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ25ELE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsTUFBTTtZQUNWLFdBQVcsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUM7WUFDbkMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNoQyxNQUFNLEVBQUUsR0FBRyxJQUFBLG1CQUFRLEdBQUUsQ0FBQTtnQkFFckIsTUFBTSxlQUFlLEdBQUc7b0JBQ3RCLEVBQUUsRUFBRSxpQkFBaUI7b0JBQ3JCLEtBQUssRUFBRSx1QkFBdUI7b0JBQzlCLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBRTFFLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLGdCQUFnQixFQUFFLEdBQUc7b0JBRXJCLEdBQUcsRUFBRTt3QkFDSCxJQUFBLGlCQUFTLEdBQUUsQ0FBQTt3QkFDWCxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUE7b0JBQ3BDLENBQUM7aUJBQ0YsQ0FBQTtnQkFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFBO29CQUN6QyxnQkFBZ0IsR0FB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QUFNLENBQUUsU0FBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUNwRSxDQUFDLENBQUMsQ0FBQTtZQUVGLE9BQU8sTUFBTSxDQUFBO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRCx5RUFBeUU7SUFDekUsU0FBUyxVQUFVLENBQUMsSUFBWTtRQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ2pHLENBQUM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxHQUFXO1FBQzdCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDdkcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tIFwiLi5cIlxuaW1wb3J0IHsgY3JlYXRlVUkgfSBmcm9tIFwiLi4vY3JlYXRlVUlcIlxuaW1wb3J0IHsgbG9jYWxpemUgfSBmcm9tIFwiLi4vbG9jYWxpemVXaXRoRmFsbGJhY2tcIlxuXG5sZXQgYWxsTG9nczogc3RyaW5nW10gPSBbXVxubGV0IGFkZGVkQ2xlYXJBY3Rpb24gPSBmYWxzZVxuY29uc3QgY2FuY2VsQnV0dG9uU1ZHID0gYFxuPHN2ZyB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiB2aWV3Qm94PVwiMCAwIDEzIDEzXCIgZmlsbD1cIm5vbmVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG48Y2lyY2xlIGN4PVwiNlwiIGN5PVwiN1wiIHI9XCI1XCIgc3Ryb2tlLXdpZHRoPVwiMlwiLz5cbjxsaW5lIHgxPVwiMC43MDcxMDdcIiB5MT1cIjEuMjkyODlcIiB4Mj1cIjExLjcwNzFcIiB5Mj1cIjEyLjI5MjlcIiBzdHJva2Utd2lkdGg9XCIyXCIvPlxuPC9zdmc+XG5gXG5cbmV4cG9ydCBjb25zdCBydW5QbHVnaW46IFBsdWdpbkZhY3RvcnkgPSAoaSwgdXRpbHMpID0+IHtcbiAgY29uc3QgcGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luID0ge1xuICAgIGlkOiBcImxvZ3NcIixcbiAgICBkaXNwbGF5TmFtZTogaShcInBsYXlfc2lkZWJhcl9sb2dzXCIpLFxuICAgIHdpbGxNb3VudDogKHNhbmRib3gsIGNvbnRhaW5lcikgPT4ge1xuICAgICAgY29uc3QgdWkgPSBjcmVhdGVVSSgpXG5cbiAgICAgIGNvbnN0IGNsZWFyTG9nc0FjdGlvbiA9IHtcbiAgICAgICAgaWQ6IFwiY2xlYXItbG9ncy1wbGF5XCIsXG4gICAgICAgIGxhYmVsOiBcIkNsZWFyIFBsYXlncm91bmQgTG9nc1wiLFxuICAgICAgICBrZXliaW5kaW5nczogW3NhbmRib3gubW9uYWNvLktleU1vZC5DdHJsQ21kIHwgc2FuZGJveC5tb25hY28uS2V5Q29kZS5LZXlLXSxcblxuICAgICAgICBjb250ZXh0TWVudUdyb3VwSWQ6IFwicnVuXCIsXG4gICAgICAgIGNvbnRleHRNZW51T3JkZXI6IDEuNSxcblxuICAgICAgICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjbGVhckxvZ3MoKVxuICAgICAgICAgIHVpLmZsYXNoSW5mbyhpKFwicGxheV9jbGVhcl9sb2dzXCIpKVxuICAgICAgICB9LFxuICAgICAgfVxuXG4gICAgICBpZiAoIWFkZGVkQ2xlYXJBY3Rpb24pIHtcbiAgICAgICAgc2FuZGJveC5lZGl0b3IuYWRkQWN0aW9uKGNsZWFyTG9nc0FjdGlvbilcbiAgICAgICAgYWRkZWRDbGVhckFjdGlvbiA9IHRydWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3JVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGVycm9yVUwuaWQgPSBcImxvZy1jb250YWluZXJcIlxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVycm9yVUwpXG5cbiAgICAgIGNvbnN0IGxvZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBsb2dzLmlkID0gXCJsb2dcIlxuICAgICAgbG9ncy5pbm5lckhUTUwgPSBhbGxMb2dzLmpvaW4oXCI8aHIgLz5cIilcbiAgICAgIGVycm9yVUwuYXBwZW5kQ2hpbGQobG9ncylcblxuICAgICAgY29uc3QgbG9nVG9vbHNDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBsb2dUb29sc0NvbnRhaW5lci5pZCA9IFwibG9nLXRvb2xzXCJcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChsb2dUb29sc0NvbnRhaW5lcilcblxuICAgICAgY29uc3QgY2xlYXJMb2dzQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgY2xlYXJMb2dzQnV0dG9uLmlkID0gXCJjbGVhci1sb2dzLWJ1dHRvblwiXG4gICAgICBjbGVhckxvZ3NCdXR0b24uaW5uZXJIVE1MID0gY2FuY2VsQnV0dG9uU1ZHXG4gICAgICBjbGVhckxvZ3NCdXR0b24ub25jbGljayA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgY2xlYXJMb2dzQWN0aW9uLnJ1bigpXG5cbiAgICAgICAgY29uc3QgZmlsdGVyVGV4dEJveDogYW55ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaWx0ZXItbG9nc1wiKVxuICAgICAgICBmaWx0ZXJUZXh0Qm94IS52YWx1ZSA9IFwiXCJcbiAgICAgIH1cbiAgICAgIGxvZ1Rvb2xzQ29udGFpbmVyLmFwcGVuZENoaWxkKGNsZWFyTG9nc0J1dHRvbilcblxuICAgICAgY29uc3QgZmlsdGVyVGV4dEJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICAgICAgZmlsdGVyVGV4dEJveC5pZCA9IFwiZmlsdGVyLWxvZ3NcIlxuICAgICAgZmlsdGVyVGV4dEJveC5wbGFjZWhvbGRlciA9IGkoXCJwbGF5X3NpZGViYXJfdG9vbHNfZmlsdGVyX3BsYWNlaG9sZGVyXCIpXG4gICAgICBmaWx0ZXJUZXh0Qm94LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0VGV4dCA9IGUudGFyZ2V0LnZhbHVlXG5cbiAgICAgICAgY29uc3QgZWxlTG9nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIikhXG4gICAgICAgIGVsZUxvZy5pbm5lckhUTUwgPSBhbGxMb2dzXG4gICAgICAgICAgLmZpbHRlcihsb2cgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXNlckxvZ2dlZFRleHQgPSBsb2cuc3Vic3RyaW5nKGxvZy5pbmRleE9mKFwiOlwiKSArIDEsIGxvZy5pbmRleE9mKFwiJm5ic3A7PGJyPlwiKSlcbiAgICAgICAgICAgIHJldHVybiB1c2VyTG9nZ2VkVGV4dC5pbmNsdWRlcyhpbnB1dFRleHQpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuam9pbihcIjxociAvPlwiKVxuXG4gICAgICAgIGlmIChpbnB1dFRleHQgPT09IFwiXCIpIHtcbiAgICAgICAgICBjb25zdCBsb2dDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZy1jb250YWluZXJcIikhXG4gICAgICAgICAgbG9nQ29udGFpbmVyLnNjcm9sbFRvcCA9IGxvZ0NvbnRhaW5lci5zY3JvbGxIZWlnaHRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGxvZ1Rvb2xzQ29udGFpbmVyLmFwcGVuZENoaWxkKGZpbHRlclRleHRCb3gpXG5cbiAgICAgIGlmIChhbGxMb2dzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb25zdCBub0Vycm9yc01lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgIG5vRXJyb3JzTWVzc2FnZS5pZCA9IFwiZW1wdHktbWVzc2FnZS1jb250YWluZXJcIlxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9FcnJvcnNNZXNzYWdlKVxuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBsb2NhbGl6ZShcInBsYXlfc2lkZWJhcl9sb2dzX25vX2xvZ3NcIiwgXCJObyBsb2dzXCIpXG4gICAgICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZChcImVtcHR5LXBsdWdpbi1tZXNzYWdlXCIpXG4gICAgICAgIG5vRXJyb3JzTWVzc2FnZS5hcHBlbmRDaGlsZChtZXNzYWdlKVxuXG4gICAgICAgIGVycm9yVUwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICAgIGxvZ1Rvb2xzQ29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgICAgfVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG5cbmV4cG9ydCBjb25zdCBjbGVhckxvZ3MgPSAoKSA9PiB7XG4gIGFsbExvZ3MgPSBbXVxuICBjb25zdCBsb2dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2dcIilcbiAgaWYgKGxvZ3MpIHtcbiAgICBsb2dzLnRleHRDb250ZW50ID0gXCJcIlxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBydW5XaXRoQ3VzdG9tTG9ncyA9IChjbG9zdXJlOiBQcm9taXNlPHN0cmluZz4sIGk6IEZ1bmN0aW9uKSA9PiB7XG4gIGNvbnN0IG5vTG9ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1wdHktbWVzc2FnZS1jb250YWluZXJcIilcbiAgY29uc3QgbG9nQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2ctY29udGFpbmVyXCIpIVxuICBjb25zdCBsb2dUb29sc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nLXRvb2xzXCIpIVxuICBpZiAobm9Mb2dzKSB7XG4gICAgbm9Mb2dzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgIGxvZ0NvbnRhaW5lci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gICAgbG9nVG9vbHNDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiXG4gIH1cblxuICByZXdpcmVMb2dnaW5nVG9FbGVtZW50KFxuICAgICgpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9nXCIpISxcbiAgICAoKSA9PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZy1jb250YWluZXJcIikhLFxuICAgIGNsb3N1cmUsXG4gICAgdHJ1ZSxcbiAgICBpXG4gIClcbn1cblxuLy8gVGhhbmtzIFNPOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMDI1Njc2MC9qYXZhc2NyaXB0LWNvbnNvbGUtbG9nLXRvLWh0bWwvMzU0NDkyNTYjMzU0NDkyNTZcblxuZnVuY3Rpb24gcmV3aXJlTG9nZ2luZ1RvRWxlbWVudChcbiAgZWxlTG9jYXRvcjogKCkgPT4gRWxlbWVudCxcbiAgZWxlT3ZlcmZsb3dMb2NhdG9yOiAoKSA9PiBFbGVtZW50LFxuICBjbG9zdXJlOiBQcm9taXNlPHN0cmluZz4sXG4gIGF1dG9TY3JvbGw6IGJvb2xlYW4sXG4gIGk6IEZ1bmN0aW9uXG4pIHtcbiAgY29uc3QgcmF3Q29uc29sZSA9IGNvbnNvbGVcblxuICBjbG9zdXJlLnRoZW4oanMgPT4ge1xuICAgIGNvbnN0IHJlcGxhY2UgPSB7fSBhcyBhbnlcbiAgICBiaW5kTG9nZ2luZ0Z1bmMocmVwbGFjZSwgcmF3Q29uc29sZSwgXCJsb2dcIiwgXCJMT0dcIilcbiAgICBiaW5kTG9nZ2luZ0Z1bmMocmVwbGFjZSwgcmF3Q29uc29sZSwgXCJkZWJ1Z1wiLCBcIkRCR1wiKVxuICAgIGJpbmRMb2dnaW5nRnVuYyhyZXBsYWNlLCByYXdDb25zb2xlLCBcIndhcm5cIiwgXCJXUk5cIilcbiAgICBiaW5kTG9nZ2luZ0Z1bmMocmVwbGFjZSwgcmF3Q29uc29sZSwgXCJlcnJvclwiLCBcIkVSUlwiKVxuICAgIHJlcGxhY2VbXCJjbGVhclwiXSA9IGNsZWFyTG9nc1xuICAgIGNvbnN0IGNvbnNvbGUgPSBPYmplY3QuYXNzaWduKHt9LCByYXdDb25zb2xlLCByZXBsYWNlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYWZlSlMgPSBzYW5pdGl6ZUpTKGpzKVxuICAgICAgZXZhbChzYWZlSlMpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoaShcInBsYXlfcnVuX2pzX2ZhaWxcIikpXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuXG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBTeW50YXhFcnJvciAmJiAvXFxiZXhwb3J0XFxiL3UudGVzdChlcnJvci5tZXNzYWdlKSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgJ1RpcDogQ2hhbmdlIHRoZSBNb2R1bGUgc2V0dGluZyB0byBcIkNvbW1vbkpTXCIgaW4gVFMgQ29uZmlnIHNldHRpbmdzIHRvIGFsbG93IHRvcC1sZXZlbCBleHBvcnRzIHRvIHdvcmsgaW4gdGhlIFBsYXlncm91bmQnXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgZnVuY3Rpb24gYmluZExvZ2dpbmdGdW5jKG9iajogYW55LCByYXc6IGFueSwgbmFtZTogc3RyaW5nLCBpZDogc3RyaW5nKSB7XG4gICAgb2JqW25hbWVdID0gZnVuY3Rpb24gKC4uLm9ianM6IGFueVtdKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBwcm9kdWNlT3V0cHV0KG9ianMpXG4gICAgICBjb25zdCBlbGVMb2cgPSBlbGVMb2NhdG9yKClcbiAgICAgIGNvbnN0IHByZWZpeCA9IGBbPHNwYW4gY2xhc3M9XCJsb2ctJHtuYW1lfVwiPiR7aWR9PC9zcGFuPl06IGBcbiAgICAgIGNvbnN0IGVsZUNvbnRhaW5lckxvZyA9IGVsZU92ZXJmbG93TG9jYXRvcigpXG4gICAgICBhbGxMb2dzLnB1c2goYCR7cHJlZml4fSR7b3V0cHV0fTxicj5gKVxuICAgICAgZWxlTG9nLmlubmVySFRNTCA9IGFsbExvZ3Muam9pbihcIjxociAvPlwiKVxuICAgICAgaWYgKGF1dG9TY3JvbGwgJiYgZWxlQ29udGFpbmVyTG9nKSB7XG4gICAgICAgIGVsZUNvbnRhaW5lckxvZy5zY3JvbGxUb3AgPSBlbGVDb250YWluZXJMb2cuc2Nyb2xsSGVpZ2h0XG4gICAgICB9XG4gICAgICByYXdbbmFtZV0oLi4ub2JqcylcbiAgICB9XG4gIH1cblxuICAvLyBJbmxpbmUgY29uc3RhbnRzIHdoaWNoIGFyZSBzd2l0Y2hlZCBvdXQgYXQgdGhlIGVuZCBvZiBwcm9jZXNzaW5nXG4gIGNvbnN0IHJlcGxhY2VycyA9IHtcbiAgICBcIjxzcGFuIGNsYXNzPSdsaXRlcmFsJz5udWxsPC9zcGFuPlwiOiBcIjEyMzEyMzIxMzEyMzEyMzE0MjM0MzQ1MzQ1MzRcIixcbiAgICBcIjxzcGFuIGNsYXNzPSdsaXRlcmFsJz51bmRlZmluZWQ8L3NwYW4+XCI6IFwiNDUzNDUzNDUzNDU2MzU2NzU2NzU2N1wiLFxuICAgIFwiPHNwYW4gY2xhc3M9J2NvbW1hJz4sIDwvc3Bhbj5cIjogXCI3ODV5ODM0NTg3MzQ4NTc2Mzg3NDU2ODczNHk1MzU0MzhcIixcbiAgfVxuXG4gIGNvbnN0IG9iamVjdFRvVGV4dCA9IChhcmc6IGFueSk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgaXNPYmogPSB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiXG4gICAgbGV0IHRleHRSZXAgPSBcIlwiXG4gICAgaWYgKGFyZyAmJiBhcmcuc3RhY2sgJiYgYXJnLm1lc3NhZ2UpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgZXJyXG4gICAgICB0ZXh0UmVwID0gaHRtbEVzY2FwZShhcmcubWVzc2FnZSlcbiAgICB9IGVsc2UgaWYgKGFyZyA9PT0gbnVsbCkge1xuICAgICAgdGV4dFJlcCA9IHJlcGxhY2Vyc1tcIjxzcGFuIGNsYXNzPSdsaXRlcmFsJz5udWxsPC9zcGFuPlwiXVxuICAgIH0gZWxzZSBpZiAoYXJnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRleHRSZXAgPSByZXBsYWNlcnNbXCI8c3BhbiBjbGFzcz0nbGl0ZXJhbCc+dW5kZWZpbmVkPC9zcGFuPlwiXVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gXCJzeW1ib2xcIikge1xuICAgICAgdGV4dFJlcCA9IGA8c3BhbiBjbGFzcz0nbGl0ZXJhbCc+JHtodG1sRXNjYXBlKFN0cmluZyhhcmcpKX08L3NwYW4+YFxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG4gICAgICB0ZXh0UmVwID0gXCJbXCIgKyBhcmcubWFwKG9iamVjdFRvVGV4dCkuam9pbihyZXBsYWNlcnNbXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiXSkgKyBcIl1cIlxuICAgIH0gZWxzZSBpZiAoYXJnIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICBjb25zdCBzZXRJdGVyID0gWy4uLmFyZ11cbiAgICAgIHRleHRSZXAgPSBgU2V0ICgke2FyZy5zaXplfSkge2AgKyBzZXRJdGVyLm1hcChvYmplY3RUb1RleHQpLmpvaW4ocmVwbGFjZXJzW1wiPHNwYW4gY2xhc3M9J2NvbW1hJz4sIDwvc3Bhbj5cIl0pICsgXCJ9XCJcbiAgICB9IGVsc2UgaWYgKGFyZyBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgY29uc3QgbWFwSXRlciA9IFsuLi5hcmcuZW50cmllcygpXVxuICAgICAgdGV4dFJlcCA9XG4gICAgICAgIGBNYXAgKCR7YXJnLnNpemV9KSB7YCArXG4gICAgICAgIG1hcEl0ZXJcbiAgICAgICAgICAubWFwKChbaywgdl0pID0+IGAke29iamVjdFRvVGV4dChrKX0gPT4gJHtvYmplY3RUb1RleHQodil9YClcbiAgICAgICAgICAuam9pbihyZXBsYWNlcnNbXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiXSkgK1xuICAgICAgICBcIn1cIlxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGV4dFJlcCA9ICdcIicgKyBodG1sRXNjYXBlKGFyZykgKyAnXCInXG4gICAgfSBlbHNlIGlmIChpc09iaikge1xuICAgICAgY29uc3QgbmFtZSA9IGFyZy5jb25zdHJ1Y3RvciAmJiBhcmcuY29uc3RydWN0b3IubmFtZSB8fCBcIlwiXG4gICAgICAvLyBObyBvbmUgbmVlZHMgdG8ga25vdyBhbiBvYmogaXMgYW4gb2JqXG4gICAgICBjb25zdCBuYW1lV2l0aG91dE9iamVjdCA9IG5hbWUgJiYgbmFtZSA9PT0gXCJPYmplY3RcIiA/IFwiXCIgOiBodG1sRXNjYXBlKG5hbWUpXG4gICAgICBjb25zdCBwcmVmaXggPSBuYW1lV2l0aG91dE9iamVjdCA/IGAke25hbWVXaXRob3V0T2JqZWN0fTogYCA6IFwiXCJcblxuICAgICAgLy8gSlNPTi5zdHJpbmdpZnkgb21pdHMgYW55IGtleXMgd2l0aCBhIHZhbHVlIG9mIHVuZGVmaW5lZC4gVG8gZ2V0IGFyb3VuZCB0aGlzLCB3ZSByZXBsYWNlIHVuZGVmaW5lZCB3aXRoIHRoZSB0ZXh0IF9fdW5kZWZpbmVkX18gYW5kIHRoZW4gZG8gYSBnbG9iYWwgcmVwbGFjZSB1c2luZyByZWdleCBiYWNrIHRvIGtleXdvcmQgdW5kZWZpbmVkXG4gICAgICB0ZXh0UmVwID1cbiAgICAgICAgcHJlZml4ICtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoYXJnLCAoXywgdmFsdWUpID0+ICh2YWx1ZSA9PT0gdW5kZWZpbmVkID8gXCJfX3VuZGVmaW5lZF9fXCIgOiB2YWx1ZSksIDIpLnJlcGxhY2UoXG4gICAgICAgICAgL1wiX191bmRlZmluZWRfX1wiL2csXG4gICAgICAgICAgXCJ1bmRlZmluZWRcIlxuICAgICAgICApXG5cbiAgICAgIHRleHRSZXAgPSBodG1sRXNjYXBlKHRleHRSZXApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRSZXAgPSBodG1sRXNjYXBlKFN0cmluZyhhcmcpKVxuICAgIH1cbiAgICByZXR1cm4gdGV4dFJlcFxuICB9XG5cbiAgZnVuY3Rpb24gcHJvZHVjZU91dHB1dChhcmdzOiBhbnlbXSkge1xuICAgIGxldCByZXN1bHQ6IHN0cmluZyA9IGFyZ3MucmVkdWNlKChvdXRwdXQ6IGFueSwgYXJnOiBhbnksIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCB0ZXh0UmVwID0gb2JqZWN0VG9UZXh0KGFyZylcbiAgICAgIGNvbnN0IHNob3dDb21tYSA9IGluZGV4ICE9PSBhcmdzLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGNvbW1hID0gc2hvd0NvbW1hID8gXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiIDogXCJcIlxuICAgICAgcmV0dXJuIG91dHB1dCArIHRleHRSZXAgKyBjb21tYSArIFwiIFwiXG4gICAgfSwgXCJcIilcblxuICAgIE9iamVjdC5rZXlzKHJlcGxhY2VycykuZm9yRWFjaChrID0+IHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKG5ldyBSZWdFeHAoKHJlcGxhY2VycyBhcyBhbnkpW2tdLCBcImdcIiksIGspXG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG4vLyBUaGUgcmVmbGVjdC1tZXRhZGF0YSBydW50aW1lIGlzIGF2YWlsYWJsZSwgc28gYWxsb3cgdGhhdCB0byBnbyB0aHJvdWdoXG5mdW5jdGlvbiBzYW5pdGl6ZUpTKGNvZGU6IHN0cmluZykge1xuICByZXR1cm4gY29kZS5yZXBsYWNlKGBpbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCJgLCBcIlwiKS5yZXBsYWNlKGByZXF1aXJlKFwicmVmbGVjdC1tZXRhZGF0YVwiKWAsIFwiXCIpXG59XG5cbmZ1bmN0aW9uIGh0bWxFc2NhcGUoc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcbn1cbiJdfQ==