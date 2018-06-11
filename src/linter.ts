/**
 * @file Enables support for the Hack linter (hhast-lint)
 */

import * as ps from 'child_process';
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as config from './Config';
// import * as utils from './Utils';

export class HackLinter {

    private hhvmLintDiag: vscode.DiagnosticCollection;

    constructor() {
        this.hhvmLintDiag = vscode.languages.createDiagnosticCollection('hack_lint');
    }

    public async start(context: vscode.ExtensionContext) {
        const defaultLinterPath = `${config.workspace}/vendor/bin/hhast-lint`;
        const linterPath = config.linterPath || defaultLinterPath;

        // If a valid linter executable doesn't exist in the configured or default path, don't register any functionality
        try {
            fs.accessSync(linterPath, fs.constants.X_OK);
        } catch (e) {
            if (config.linterPath) {
                vscode.window.showErrorMessage(`Invalid hhast-lint path configured: ${config.linterPath}`);
            }
            return;
        }

        // Lint the active file(s)
        for (const editor of vscode.window.visibleTextEditors) {
            this.lint(editor.document, linterPath);
        }

        // Lint on file open
        context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
            this.lint(document, linterPath);
        }));

        // Lint on file save
        context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
            this.lint(document, linterPath);
        }));

        // Remove errors on file close
        context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(document => {
            this.hhvmLintDiag.delete(document.uri);
        }));

        context.subscriptions.push(this.hhvmLintDiag);
    }

    /**
     * Lint a single file
     * @param document Document to run the linter on
     */
    private async lint(document: vscode.TextDocument, linterPath: string) {

        if (document.languageId !== 'hack' || document.uri.scheme !== 'file') {
            return;
        }

        // Remove any existing errors for this file
        this.hhvmLintDiag.delete(document.uri);

        // Run the hack linter on this file and display errors
        const filePath = document.uri.fsPath;
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, p => {
            return new Promise((resolve, _reject) => {
                p.report({ message: 'Running Hack Linter' });
                ps.execFile(linterPath, ['--json', filePath], (error: any, stdout: string, stderr: string) => {
                    if (error && error.code !== 2) {
                        if (error.message.includes('Unrecognized option: --json')) {
                            // disable
                        } else {
                            console.error(`Hack Lint: ${error}`);
                        }
                    } else if (stderr) {
                        console.error(`Hack Lint: ${stderr}`);
                    } else if (!stdout) {
                        console.error('Hack Lint: no output');
                    } else {
                        if (vscode.window.visibleTextEditors.findIndex(editor => editor.document === document) !== -1) {
                            try {
                                const result = JSON.parse(stdout);
                                if (!result.passed) {
                                    const errors: vscode.Diagnostic[] = [];
                                    result.errors.forEach(lintError => {
                                        const diagnostic = new vscode.Diagnostic(
                                            new vscode.Range(
                                                new vscode.Position(lintError.range.start.line - 1, lintError.range.start.character),
                                                new vscode.Position(lintError.range.start.line - 1, 100000)
                                            ),
                                            `${lintError.message} (${lintError.linter})`,
                                            vscode.DiagnosticSeverity.Warning);
                                        diagnostic.source = 'Hack Lint';
                                        errors.push(diagnostic);
                                    });
                                    this.hhvmLintDiag.set(document.uri, errors);
                                }
                            } catch (e) {
                                // suppress
                            }
                        }
                    }
                    resolve();
                });
            });
        });
    }
}
