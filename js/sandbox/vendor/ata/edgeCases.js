define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapModuleNameToModule = void 0;
    /** Converts some of the known global imports to node so that we grab the right info */
    const mapModuleNameToModule = (moduleSpecifier) => {
        // in node repl:
        // > require("module").builtinModules
        const builtInNodeMods = [
            "assert",
            "assert/strict",
            "async_hooks",
            "buffer",
            "child_process",
            "cluster",
            "console",
            "constants",
            "crypto",
            "dgram",
            "diagnostics_channel",
            "dns",
            "dns/promises",
            "domain",
            "events",
            "fs",
            "fs/promises",
            "http",
            "http2",
            "https",
            "inspector",
            "module",
            "net",
            "os",
            "path",
            "path/posix",
            "path/win32",
            "perf_hooks",
            "process",
            "punycode",
            "querystring",
            "readline",
            "repl",
            "stream",
            "stream/promises",
            "stream/consumers",
            "stream/web",
            "string_decoder",
            "sys",
            "timers",
            "timers/promises",
            "tls",
            "trace_events",
            "tty",
            "url",
            "util",
            "util/types",
            "v8",
            "vm",
            "wasi",
            "worker_threads",
            "zlib",
        ];
        if (builtInNodeMods.includes(moduleSpecifier.replace("node:", ""))) {
            return "node";
        }
        // strip module filepath e.g. lodash/identity => lodash
        const [a = "", b = ""] = moduleSpecifier.split("/");
        const moduleName = a.startsWith("@") ? `${a}/${b}` : a;
        return moduleName;
    };
    exports.mapModuleNameToModule = mapModuleNameToModule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRnZUNhc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvdmVuZG9yL2F0YS9lZGdlQ2FzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUFBLHVGQUF1RjtJQUNoRixNQUFNLHFCQUFxQixHQUFHLENBQUMsZUFBdUIsRUFBRSxFQUFFO1FBQy9ELGdCQUFnQjtRQUNoQixxQ0FBcUM7UUFDckMsTUFBTSxlQUFlLEdBQUc7WUFDdEIsUUFBUTtZQUNSLGVBQWU7WUFDZixhQUFhO1lBQ2IsUUFBUTtZQUNSLGVBQWU7WUFDZixTQUFTO1lBQ1QsU0FBUztZQUNULFdBQVc7WUFDWCxRQUFRO1lBQ1IsT0FBTztZQUNQLHFCQUFxQjtZQUNyQixLQUFLO1lBQ0wsY0FBYztZQUNkLFFBQVE7WUFDUixRQUFRO1lBQ1IsSUFBSTtZQUNKLGFBQWE7WUFDYixNQUFNO1lBQ04sT0FBTztZQUNQLE9BQU87WUFDUCxXQUFXO1lBQ1gsUUFBUTtZQUNSLEtBQUs7WUFDTCxJQUFJO1lBQ0osTUFBTTtZQUNOLFlBQVk7WUFDWixZQUFZO1lBQ1osWUFBWTtZQUNaLFNBQVM7WUFDVCxVQUFVO1lBQ1YsYUFBYTtZQUNiLFVBQVU7WUFDVixNQUFNO1lBQ04sUUFBUTtZQUNSLGlCQUFpQjtZQUNqQixrQkFBa0I7WUFDbEIsWUFBWTtZQUNaLGdCQUFnQjtZQUNoQixLQUFLO1lBQ0wsUUFBUTtZQUNSLGlCQUFpQjtZQUNqQixLQUFLO1lBQ0wsY0FBYztZQUNkLEtBQUs7WUFDTCxLQUFLO1lBQ0wsTUFBTTtZQUNOLFlBQVk7WUFDWixJQUFJO1lBQ0osSUFBSTtZQUNKLE1BQU07WUFDTixnQkFBZ0I7WUFDaEIsTUFBTTtTQUNQLENBQUE7UUFFRCxJQUFJLGVBQWUsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNsRSxPQUFPLE1BQU0sQ0FBQTtTQUNkO1FBRUQsdURBQXVEO1FBQ3ZELE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25ELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFdEQsT0FBTyxVQUFVLENBQUE7SUFDbkIsQ0FBQyxDQUFBO0lBbkVZLFFBQUEscUJBQXFCLHlCQW1FakMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQ29udmVydHMgc29tZSBvZiB0aGUga25vd24gZ2xvYmFsIGltcG9ydHMgdG8gbm9kZSBzbyB0aGF0IHdlIGdyYWIgdGhlIHJpZ2h0IGluZm8gKi9cbmV4cG9ydCBjb25zdCBtYXBNb2R1bGVOYW1lVG9Nb2R1bGUgPSAobW9kdWxlU3BlY2lmaWVyOiBzdHJpbmcpID0+IHtcbiAgLy8gaW4gbm9kZSByZXBsOlxuICAvLyA+IHJlcXVpcmUoXCJtb2R1bGVcIikuYnVpbHRpbk1vZHVsZXNcbiAgY29uc3QgYnVpbHRJbk5vZGVNb2RzID0gW1xuICAgIFwiYXNzZXJ0XCIsXG4gICAgXCJhc3NlcnQvc3RyaWN0XCIsXG4gICAgXCJhc3luY19ob29rc1wiLFxuICAgIFwiYnVmZmVyXCIsXG4gICAgXCJjaGlsZF9wcm9jZXNzXCIsXG4gICAgXCJjbHVzdGVyXCIsXG4gICAgXCJjb25zb2xlXCIsXG4gICAgXCJjb25zdGFudHNcIixcbiAgICBcImNyeXB0b1wiLFxuICAgIFwiZGdyYW1cIixcbiAgICBcImRpYWdub3N0aWNzX2NoYW5uZWxcIixcbiAgICBcImRuc1wiLFxuICAgIFwiZG5zL3Byb21pc2VzXCIsXG4gICAgXCJkb21haW5cIixcbiAgICBcImV2ZW50c1wiLFxuICAgIFwiZnNcIixcbiAgICBcImZzL3Byb21pc2VzXCIsXG4gICAgXCJodHRwXCIsXG4gICAgXCJodHRwMlwiLFxuICAgIFwiaHR0cHNcIixcbiAgICBcImluc3BlY3RvclwiLFxuICAgIFwibW9kdWxlXCIsXG4gICAgXCJuZXRcIixcbiAgICBcIm9zXCIsXG4gICAgXCJwYXRoXCIsXG4gICAgXCJwYXRoL3Bvc2l4XCIsXG4gICAgXCJwYXRoL3dpbjMyXCIsXG4gICAgXCJwZXJmX2hvb2tzXCIsXG4gICAgXCJwcm9jZXNzXCIsXG4gICAgXCJwdW55Y29kZVwiLFxuICAgIFwicXVlcnlzdHJpbmdcIixcbiAgICBcInJlYWRsaW5lXCIsXG4gICAgXCJyZXBsXCIsXG4gICAgXCJzdHJlYW1cIixcbiAgICBcInN0cmVhbS9wcm9taXNlc1wiLFxuICAgIFwic3RyZWFtL2NvbnN1bWVyc1wiLFxuICAgIFwic3RyZWFtL3dlYlwiLFxuICAgIFwic3RyaW5nX2RlY29kZXJcIixcbiAgICBcInN5c1wiLFxuICAgIFwidGltZXJzXCIsXG4gICAgXCJ0aW1lcnMvcHJvbWlzZXNcIixcbiAgICBcInRsc1wiLFxuICAgIFwidHJhY2VfZXZlbnRzXCIsXG4gICAgXCJ0dHlcIixcbiAgICBcInVybFwiLFxuICAgIFwidXRpbFwiLFxuICAgIFwidXRpbC90eXBlc1wiLFxuICAgIFwidjhcIixcbiAgICBcInZtXCIsXG4gICAgXCJ3YXNpXCIsXG4gICAgXCJ3b3JrZXJfdGhyZWFkc1wiLFxuICAgIFwiemxpYlwiLFxuICBdXG5cbiAgaWYgKGJ1aWx0SW5Ob2RlTW9kcy5pbmNsdWRlcyhtb2R1bGVTcGVjaWZpZXIucmVwbGFjZShcIm5vZGU6XCIsIFwiXCIpKSkge1xuICAgIHJldHVybiBcIm5vZGVcIlxuICB9XG5cbiAgLy8gc3RyaXAgbW9kdWxlIGZpbGVwYXRoIGUuZy4gbG9kYXNoL2lkZW50aXR5ID0+IGxvZGFzaFxuICBjb25zdCBbYSA9IFwiXCIsIGIgPSBcIlwiXSA9IG1vZHVsZVNwZWNpZmllci5zcGxpdChcIi9cIilcbiAgY29uc3QgbW9kdWxlTmFtZSA9IGEuc3RhcnRzV2l0aChcIkBcIikgPyBgJHthfS8ke2J9YCA6IGFcblxuICByZXR1cm4gbW9kdWxlTmFtZVxufVxuIl19