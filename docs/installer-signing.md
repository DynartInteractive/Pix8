# Windows Code Signing (Azure Trusted Signing)

To produce a signed Windows installer, install [AzureSignTool](https://github.com/vcsjones/AzureSignTool) and set the environment variables before building:

```bash
dotnet tool install --global AzureSignTool

AZURE_KEY_VAULT_URI="https://your-vault.vault.azure.net" \
AZURE_CLIENT_ID="..." \
AZURE_TENANT_ID="..." \
AZURE_CLIENT_SECRET="..." \
AZURE_CERT_NAME="..." \
npm run dist:win
```

This requires a custom `sign.js` in the project root (see electron-builder [custom signing](https://www.electron.build/code-signing.html)) and the following in `package.json` under `build.win`:

```json
"sign": "./sign.js",
"signingHashAlgorithms": ["sha256"]
```

Without signing, the installer will show an "Unknown publisher" warning on Windows.