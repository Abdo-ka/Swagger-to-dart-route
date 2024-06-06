const vscode = require('vscode');
const axios = require('axios');
const fs = require('fs');
const url = require('url');
const path = require('path');

async function generateDartRoutesFromSwagger(swaggerFileUrl, outputFile) {
    try {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: "Fetching Swagger data...",
            cancellable: false
        }, async (progress) => {
            const response = await axios.get(swaggerFileUrl);
            const swagger = response.data;

            const parsedUrl = url.parse(swaggerFileUrl);
            const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

            const paths = swagger.paths;

            const routesByScope = {};
            const processedEndpoints = new Set();  // Set to track processed endpoints

            for (const path in paths) {
                const methods = paths[path];
                for (const method in methods) {
                    let variableName = path.split('/').pop().replace(/{|}/g, ''); // Remove braces from variable name
                    variableName = variableName.charAt(0).toLowerCase() + variableName.slice(1);

                    let route;
                    if (path.includes('{')) {
                        // Extract the parameter name(s) and construct the Dart route
                        const params = path.match(/{(.*?)}/g).map(param => param.replace('{', '').replace('}', ''));
                        const dartPath = path.replace(/{(.*?)}/g, '$$$1');
                        route = `static ${variableName}(${params.join(', ')}) => '${dartPath}';`;
                    } else {
                        route = `static const ${variableName} = '${path}';`;
                    }

                    // Check if the route has already been processed
                    if (processedEndpoints.has(route)) {
                        continue;
                    }
                    processedEndpoints.add(route);

                    const scope = path.split('/')[2];
                    if (!routesByScope[scope]) {
                        routesByScope[scope] = [];
                    }
                    routesByScope[scope].push(route);
                }
            }

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                throw new Error('No workspace folder opened.');
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;
            const outputFilePath = path.join(workspacePath, outputFile);

            const stream = fs.createWriteStream(outputFilePath);
            stream.write('// This file is generated. Do not edit it manually\n\n');
            stream.write('class ApiRoutes {\n');
            stream.write(`  static const baseUrl = '${baseUrl}';\n\n`);

            for (const scope in routesByScope) {
                stream.write(`  //? ---------------------------------------- ${scope} ----------------------------------------\n`);
                stream.write('  ' + routesByScope[scope].join('\n  ') + '\n\n');
            }
            stream.write('}\n');

            stream.end();
        });

        vscode.window.showInformationMessage(`Dart routes generated in ${outputFile}`);
    } catch (error) {
        throw new Error('Error generating Dart routes: ' + error.message);
    }
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generateDartRoutes', async function () {
        const swaggerFileUrl = await vscode.window.showInputBox({ prompt: 'Enter the Swagger file URL' });

        if (!swaggerFileUrl) {
            vscode.window.showErrorMessage('Swagger file URL is required');
            return;
        }

        if (!swaggerFileUrl.endsWith('.json')) {
            vscode.window.showErrorMessage('URL must end with ".json"');
            return;
        }

        const outputFileName = await vscode.window.showInputBox({ prompt: 'Enter the output file name', value: 'ApiRoutes.dart' });

        if (!outputFileName) {
            vscode.window.showErrorMessage('Output file name is required');
            return;
        }

        try {
            await generateDartRoutesFromSwagger(swaggerFileUrl, outputFileName);
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating Dart routes: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
