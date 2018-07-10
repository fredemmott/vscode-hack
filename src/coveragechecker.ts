/**
 * @file Logic to calculate Hack coverage percentage of a source file.
 */

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient';

type CoverageResponse = {
    coveredPercent: number;
    uncoveredRanges: any[];
    defaultMessage: string;
};

export class HackCoverageChecker {

    // whether coverage errors are visible in the "Problems" tab or not
    private visible: boolean = false;

    // the percentage coverage indicator in the status bar
    private coverageStatus: vscode.StatusBarItem;

    // the global coverage error collection
    private hhvmCoverDiag: vscode.DiagnosticCollection;

    // the global hack language client instance
    private languageClient: LanguageClient;

    constructor(languageClient: LanguageClient) {
        this.coverageStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.hhvmCoverDiag = vscode.languages.createDiagnosticCollection('hack_coverage');
        this.languageClient = languageClient;
    }

    public async start(context: vscode.ExtensionContext) {

        context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => this.check(doc)));
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            this.hhvmCoverDiag.clear();
            if (editor) {
                this.check(editor.document);
            } else {
                this.coverageStatus.hide();
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand('hack.toggleCoverageHighlight', () => { this.toggle(); }));
        context.subscriptions.push(this.hhvmCoverDiag, this.coverageStatus);

        // Check the active file, if any
        if (vscode.window.activeTextEditor) {
            this.check(vscode.window.activeTextEditor.document);
        }
    }

    public async toggle() {
        if (this.visible) {
            this.hhvmCoverDiag.clear();
            this.visible = false;
        } else {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                this.check(editor.document);
            }
            this.visible = true;
        }
    }

    private async check(document: vscode.TextDocument) {
        if (document.languageId !== 'hack' && document.uri.scheme !== 'file') {
            this.coverageStatus.hide();
            return;
        }

        let coverageResponse: CoverageResponse;
        try {
            coverageResponse = <CoverageResponse>await this.languageClient.sendRequest(
                'textDocument/typeCoverage',
                { textDocument: this.languageClient.code2ProtocolConverter.asTextDocumentIdentifier(document) }
            );
        } catch (e) {
            this.coverageStatus.hide();
            return;
        }

        this.coverageStatus.text = `$(paintcan)  ${coverageResponse.coveredPercent}%`;
        this.coverageStatus.tooltip = `This file is ${coverageResponse.coveredPercent}% covered by Hack.\nClick to toggle highlighting of uncovered areas.`;
        this.coverageStatus.command = 'hack.toggleCoverageHighlight';
        this.coverageStatus.show();

        if (this.visible && coverageResponse.uncoveredRanges) {
            const diagnostics: vscode.Diagnostic[] = [];
            coverageResponse.uncoveredRanges.forEach(range => {
                const text = coverageResponse.defaultMessage;
                const diagnostic = new vscode.Diagnostic(range, text, vscode.DiagnosticSeverity.Information);
                diagnostic.source = 'Type Coverage';
                diagnostics.push(diagnostic);
            });
            this.hhvmCoverDiag.set(document.uri, diagnostics);
        }
    }
}
