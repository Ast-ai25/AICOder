
import * as vscode from 'vscode';
import { Home } from './app/page';  // Import the Home component
import { getNonce } from './utils';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "firebase-studio" is now active!');

	let disposable = vscode.commands.registerCommand('firebase-studio.start', () => {
		const panel = vscode.window.createWebviewPanel(
			'firebaseStudio',
			'Firebase Studio',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'out')],
			}
		);

		panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'firebase.svg');

		// Get the content to inject from the Next.js app
		const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'out', 'app', 'page.js'));
		const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'out', 'app', 'globals.css'));
		const toolkitUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'toolkit.min.js'));

		const nonce = getNonce();

		panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src webview-ui: 'nonce-${nonce}'; style-src webview-ui: 'unsafe-inline'; connect-src 'self';">
				<title>Firebase Studio</title>
				<link rel="stylesheet" href="${styleUri}">
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${toolkitUri}"></script>
			</body>
			</html>
		`;
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
