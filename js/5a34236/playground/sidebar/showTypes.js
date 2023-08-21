var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compiledJSPlugin = void 0;
    const compiledJSPlugin = () => {
        let codeElement;
        const plugin = {
            id: 'types',
            displayName: 'Types',
            willMount: (sandbox, container) => __awaiter(void 0, void 0, void 0, function* () {
                const createCodePre = document.createElement('pre');
                codeElement = document.createElement('code');
                createCodePre.appendChild(codeElement);
                container.appendChild(createCodePre);
            }),
            modelChangedDebounce: (sandbox, model) => __awaiter(void 0, void 0, void 0, function* () {
                const program = yield sandbox.createTSProgram();
                const checker = program.getTypeChecker();
                const sourceFile = program.getSourceFile(model.uri.path);
                const ts = sandbox.ts;
                sandbox.ts.forEachChild(sourceFile, node => {
                    if (ts.isInterfaceDeclaration(node)) {
                        const symbol = checker.getSymbolAtLocation(node);
                        if (symbol) {
                            console.log(symbol, symbol.members);
                        }
                        else {
                            console.log('could not get symbol for interface');
                        }
                    }
                });
            }),
        };
        return plugin;
    };
    exports.compiledJSPlugin = compiledJSPlugin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd1R5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcGxheWdyb3VuZC9zcmMvc2lkZWJhci9zaG93VHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUVPLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFO1FBQ25DLElBQUksV0FBd0IsQ0FBQTtRQUU1QixNQUFNLE1BQU0sR0FBcUI7WUFDL0IsRUFBRSxFQUFFLE9BQU87WUFDWCxXQUFXLEVBQUUsT0FBTztZQUNwQixTQUFTLEVBQUUsQ0FBTyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBQ3RDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ25ELFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUU1QyxhQUFhLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUN0QyxTQUFTLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBQ3RDLENBQUMsQ0FBQTtZQUVELG9CQUFvQixFQUFFLENBQU8sT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUM3QyxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQTtnQkFDL0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFBO2dCQUV4QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUE7Z0JBQ3pELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUE7Z0JBQ3JCLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDekMsSUFBSSxFQUFFLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ25DLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDaEQsSUFBSSxNQUFNLEVBQUU7NEJBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO3lCQUNwQzs2QkFBTTs0QkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7eUJBQ2xEO3FCQUNGO2dCQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFBO1NBQ0YsQ0FBQTtRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQyxDQUFBO0lBbENZLFFBQUEsZ0JBQWdCLG9CQWtDNUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luIH0gZnJvbSAnLi4nXG5cbmV4cG9ydCBjb25zdCBjb21waWxlZEpTUGx1Z2luID0gKCkgPT4ge1xuICBsZXQgY29kZUVsZW1lbnQ6IEhUTUxFbGVtZW50XG5cbiAgY29uc3QgcGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luID0ge1xuICAgIGlkOiAndHlwZXMnLFxuICAgIGRpc3BsYXlOYW1lOiAnVHlwZXMnLFxuICAgIHdpbGxNb3VudDogYXN5bmMgKHNhbmRib3gsIGNvbnRhaW5lcikgPT4ge1xuICAgICAgY29uc3QgY3JlYXRlQ29kZVByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpXG4gICAgICBjb2RlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NvZGUnKVxuXG4gICAgICBjcmVhdGVDb2RlUHJlLmFwcGVuZENoaWxkKGNvZGVFbGVtZW50KVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNyZWF0ZUNvZGVQcmUpXG4gICAgfSxcblxuICAgIG1vZGVsQ2hhbmdlZERlYm91bmNlOiBhc3luYyAoc2FuZGJveCwgbW9kZWwpID0+IHtcbiAgICAgIGNvbnN0IHByb2dyYW0gPSBhd2FpdCBzYW5kYm94LmNyZWF0ZVRTUHJvZ3JhbSgpXG4gICAgICBjb25zdCBjaGVja2VyID0gcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpXG5cbiAgICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUobW9kZWwudXJpLnBhdGgpIVxuICAgICAgY29uc3QgdHMgPSBzYW5kYm94LnRzXG4gICAgICBzYW5kYm94LnRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCBub2RlID0+IHtcbiAgICAgICAgaWYgKHRzLmlzSW50ZXJmYWNlRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgICAgICBjb25zdCBzeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obm9kZSlcbiAgICAgICAgICBpZiAoc3ltYm9sKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzeW1ib2wsIHN5bWJvbC5tZW1iZXJzKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY291bGQgbm90IGdldCBzeW1ib2wgZm9yIGludGVyZmFjZScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG4iXX0=