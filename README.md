# Hack for Visual Studio Code

[![Build Status](https://travis-ci.org/PranayAgarwal/vscode-hack.svg?branch=master)](https://travis-ci.org/PranayAgarwal/vscode-hack)

This extension adds rich Hack language & HHVM support to Visual Studio Code. Visit [http://hacklang.org](http://hacklang.org) to get started with Hack.

It is published in the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=pranayagarwal.vscode-hack). To install, search for "Hack" in the VS Code extensions tab or run the following command (⌘+P): ```ext install vscode-hack```.

## Latest releases

## v0.8
- **HHVM Debugger (Alpha version)** — Launch scripts or attach to an HHVM server straight from VS Code. See the [debugger doc](https://github.com/PranayAgarwal/vscode-hack/blob/master/docs/debugging.md) for details on setup and usage. _This is a very early release. Please file any bugs at the Issues page._
- Hack coverage check works again. A new icon in the editor status bar shows % coverage for the file and can be clicked to highlight uncovered areas. (Can be disabled by setting `"hack.enableCoverageCheck": false`)
- Updated Hack language syntax to the latest version
- Removed some unnecessary PHP snippets
- Fixed file path mapping in typechecker requests & responses to use the correct scheme (thanks [@fredemmott](https://github.com/fredemmott) for the thorough investigation)
- Documents are now recognized as Hack if they start with a shebang pointing to an HHVM executable (e.g. `#!/usr/bin/hhvm`), regardless of extension
- Syntax highlighting for `.hhconfig` file
- Added support for showing related messages for an error when running in non-LSP mode

See the full list of releases and features added on the [Github releases page](https://github.com/PranayAgarwal/vscode-hack/releases) as well as the project [changelog](https://github.com/PranayAgarwal/vscode-hack/blob/master/CHANGELOG.md).

## Features

* Type Checking
* Autocomplete
* Hover Hints
* Document Symbol Outline
* Workspace Symbol Search
* Document Formatting
* Go To/Peek Definition
* Find All References
* Hack Coverage Check
* [Debugger Support](https://github.com/PranayAgarwal/vscode-hack/blob/master/docs/debugging.md)

![Hack for Visual Studio Code](https://cloud.githubusercontent.com/assets/341507/19377806/d7838da0-919d-11e6-9873-f5a6aa48aea4.gif)

## Requirements

This extension is supported on Linux and Mac OS X 10.10 onwards ([see HHVM compatibility](https://docs.hhvm.com/hhvm/installation/introduction)). The latest versions of Hack typechecking tools (`hh_client` and `hh_server`) are required on the local machine. The workspace should have a `.hhconfig` file at its root.    

## Configuration

This extension adds the following Visual Studio Code settings. These can be set in user preferences (⌘+,) or workspace settings (`.vscode/settings.json`).

* `hack.clientPath`: Absolute path to the hh_client executable. This can be left empty if hh_client is already in your environment $PATH. A `docker exec` command is supported as well.
* `hack.workspaceRootPath`: Absolute path to the workspace root directory. This will be the VS Code workspace root by default, but can be changed if the project is in a subdirectory or mounted in a Docker container.
* `hack.enableCoverageCheck`: Enable calculation of Hack type coverage percentage for every file and display in status bar (default: `true`).
* `hack.useLanguageServer`: Start hh_client in Language Server mode. Only works for HHVM version 3.23 and above (default: `true`).

### Docker

The extension can be used in a contanerized development environment. Simply configure `clientPath` to be a `docker exec` command and specify a `workspaceRootPath` mapping.

E.g. if your container was started using
```bash
$ docker run -d -t --name my-hhvm -v /home/user/repos/project:/mnt/project hhvm/hhvm:latest
```

Configure
```json
"hack.clientPath": "docker exec -i my-hhvm hh_client",
"hack.workspaceRootPath": "/mnt/project"
```

## Issues

Please file all bugs, issues, feature requests etc. at the [GitHub issues page](https://github.com/PranayAgarwal/vscode-hack/issues).

## Contributing

There are lots of ways to help! You can file new bugs and feature requests, or fix a pending one. To contribute to the source code, fork the repository on GitHub and create a pull request. Check out the [VS Code extension development guide](https://code.visualstudio.com/docs/extensions/overview) to get started.

## License

The source code for this extension is hosted at [https://github.com/PranayAgarwal/vscode-hack](https://github.com/PranayAgarwal/vscode-hack) and is available under the [MIT license](LICENSE.md).
