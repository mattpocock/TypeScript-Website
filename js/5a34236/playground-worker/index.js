// index.ts
var worker = (TypeScriptWorker, ts, libFileMap) => {
  const params = new URLSearchParams(self.search);
  const extension = !!params.get("useJavaScript") ? "js" : params.get("filetype") || "ts";
  return class MonacoTSWorker extends TypeScriptWorker {
    constructor() {
      super(...arguments);
      this.mainFile = `input.${extension}`;
      this.twolashFilesModelString = "";
      this.twoslashFiles = [];
      this.additionalTwoslashFilenames = [];
    }
    getMainText() {
      return this._ctx.getMirrorModels()[0].getValue();
    }
    getLanguageService() {
      return this._languageService;
    }
    updateTwoslashInfoIfNeeded() {
      const modelValue = this.getMainText();
      const files = modelValue.split("// @filename: ");
      if (files.length === 1) {
        if (this.twoslashFiles.length) {
          this.twoslashFiles = [];
          this.additionalTwoslashFilenames = [];
        }
        return;
      }
      if (this.twolashFilesModelString === modelValue)
        return;
      const convertedToMultiFile = this.twoslashFiles.length === 0;
      const splits = splitTwoslashCodeInfoFiles(modelValue, this.mainFile, "file:///");
      const twoslashResults = splits.map((f) => {
        const content = f[1].join("\n");
        const updatedAt = new Date().toUTCString();
        return {
          file: f[0],
          content,
          startIndex: modelValue.indexOf(content),
          endIndex: modelValue.indexOf(content) + content.length,
          updatedAt
        };
      });
      this.twoslashFiles = twoslashResults;
      this.additionalTwoslashFilenames = twoslashResults.map((f) => f.file).filter((f) => f !== this.mainFile);
      this.twolashFilesModelString = modelValue;
      if (convertedToMultiFile) {
        console.log("Switched playground to use multiple files: ", this.additionalTwoslashFilenames);
      }
    }
    getCurrentDirectory() {
      return "/";
    }
    readDirectory(_path, _extensions, _exclude, _include, _depth) {
      const giving = this.twoslashFiles.map((f) => f.file);
      return giving.map((f) => f.replace("file://", ""));
    }
    repositionInTwoslash(fileName, position) {
      this.updateTwoslashInfoIfNeeded();
      if (this.twoslashFiles.length === 0)
        return { tsFileName: fileName, tsPosition: position, twoslash: void 0 };
      const thisFile = this.twoslashFiles.find((r) => r.startIndex < position && position <= r.endIndex);
      if (!thisFile)
        return null;
      return {
        tsPosition: position - thisFile.startIndex,
        tsFileName: thisFile.file
      };
    }
    getScriptFileNames() {
      const main = super.getScriptFileNames();
      const files = [...main, ...this.additionalTwoslashFilenames];
      return files;
    }
    _getScriptText(fileName) {
      const twoslashed = this.twoslashFiles.find((f) => fileName === f.file);
      if (twoslashed) {
        return twoslashed.content;
      }
      return super._getScriptText(fileName);
    }
    getScriptVersion(fileName) {
      this.updateTwoslashInfoIfNeeded();
      const thisFile = this.twoslashFiles.find((f) => f.file);
      if (thisFile)
        return thisFile.updatedAt;
      return super.getScriptVersion(fileName);
    }
    async getSemanticDiagnostics(fileName) {
      return this._getDiagsWrapper(super.getSemanticDiagnostics.bind(this), fileName);
    }
    async getSyntacticDiagnostics(fileName) {
      return this._getDiagsWrapper(super.getSyntacticDiagnostics.bind(this), fileName);
    }
    async getCompilerOptionsDiagnostics(fileName) {
      return this._getDiagsWrapper(super.getCompilerOptionsDiagnostics.bind(this), fileName);
    }
    async getSuggestionDiagnostics(fileName) {
      return this._getDiagsWrapper(super.getSuggestionDiagnostics.bind(this), fileName);
    }
    async getQuickInfoAtPosition(fileName, position) {
      const empty = Promise.resolve({ kind: "", kindModifiers: "", textSpan: { start: 0, length: 0 } });
      const pos = await this._overrideFileNamePos(super.getQuickInfoAtPosition.bind(this), fileName, position, void 0, empty, (result, twoslashFile) => {
        if (twoslashFile && result && result.textSpan)
          result.textSpan.start += twoslashFile.startIndex;
        return result;
      });
      return pos;
    }
    async getCompletionsAtPosition(fileName, position) {
      const empty = Promise.resolve({ isGlobalCompletion: false, isMemberCompletion: false, isNewIdentifierLocation: false, entries: [] });
      const completions = await this._overrideFileNamePos(super.getCompletionsAtPosition.bind(this), fileName, position, void 0, empty, (result) => result);
      return completions;
    }
    async getCompletionEntryDetails(fileName, position, entry) {
      const empty = Promise.resolve({ name: "", kind: "", kindModifiers: "", displayParts: [] });
      return this._overrideFileNamePos(super.getCompletionEntryDetails.bind(this), fileName, position, entry, empty, (result) => result);
    }
    async getOccurrencesAtPosition(fileName, position) {
      const empty = Promise.resolve([]);
      return this._overrideFileNamePos(super.getOccurrencesAtPosition.bind(this), fileName, position, void 0, empty, (result) => {
        if (result) {
          result.forEach((re) => {
            const twoslash = this.twoslashFiles.find((f) => f.file === re.fileName);
            if (twoslash)
              re.textSpan.start += twoslash.startIndex;
          });
        }
        return result;
      });
    }
    async getDefinitionAtPosition(fileName, position) {
      const empty = Promise.resolve([]);
      return this._overrideFileNamePos(super.getDefinitionAtPosition.bind(this), fileName, position, void 0, empty, (result) => {
        if (result) {
          result.forEach((re) => {
            const twoslash = this.twoslashFiles.find((f) => f.file === re.fileName);
            if (twoslash) {
              re.textSpan.start += twoslash.startIndex;
            }
            re.fileName = fileName;
          });
        }
        return result;
      });
    }
    async getReferencesAtPosition(fileName, position) {
      const empty = Promise.resolve([]);
      return this._overrideFileNamePos(super.getReferencesAtPosition.bind(this), fileName, position, void 0, empty, (result) => {
        if (result) {
          result.forEach((re) => {
            const twoslash = this.twoslashFiles.find((f) => f.file === re.fileName);
            if (twoslash) {
              re.textSpan.start += twoslash.startIndex;
            }
            re.fileName = fileName;
          });
        }
        return result;
      });
    }
    async getNavigationBarItems(fileName) {
      const empty = Promise.resolve([]);
      return this._overrideFileNamePos(super.getNavigationBarItems.bind(this), fileName, -1, void 0, empty, (result) => result);
    }
    async _overrideFileNamePos(fnc, fileName, position, other, empty, editFunc) {
      const newLocation = this.repositionInTwoslash(fileName, position);
      if (!newLocation)
        return empty;
      const { tsFileName, tsPosition } = newLocation;
      const result = await fnc.bind(this)(tsFileName, tsPosition, other);
      editFunc(result, this.twoslashFiles.find((f) => f.file === tsFileName));
      return result;
    }
    async _getDiagsWrapper(getDiagnostics, fileName) {
      if (!this.getLanguageService())
        return [];
      this.updateTwoslashInfoIfNeeded();
      if (fileName === this.mainFile && this.twoslashFiles.length === 0)
        return getDiagnostics(fileName);
      let diags = [];
      for (const f of this.twoslashFiles) {
        const d = await getDiagnostics(f.file);
        d.forEach((diag) => {
          if (diag && diag.start)
            diag.start += f.startIndex;
        });
        diags = diags.concat(d);
      }
      return diags;
    }
  };
};
var splitTwoslashCodeInfoFiles = (code, defaultFileName, root) => {
  const lines = code.split(/\r\n?|\n/g);
  let nameForFile = code.includes(`@filename: ${defaultFileName}`) ? "global.ts" : defaultFileName;
  let currentFileContent = [];
  const fileMap = [];
  for (const line of lines) {
    if (line.includes("// @filename: ")) {
      fileMap.push([root + nameForFile, currentFileContent]);
      nameForFile = line.split("// @filename: ")[1].trim();
      currentFileContent = [];
    } else {
      currentFileContent.push(line);
    }
  }
  fileMap.push([root + nameForFile, currentFileContent]);
  const nameContent = fileMap.filter((n) => n[1].length > 0 && (n[1].length > 1 || n[1][0] !== ""));
  return nameContent;
};
self.customTSWorkerFactory = worker;
