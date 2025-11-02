# StellarSafe Browser Extension

Real-time security analysis for Stellar transactions. Detects scams, risky assets, and dangerous operations before you sign.

## Features

- 🛡️ **Real-time Transaction Analysis** - Automatically analyzes transactions before you sign
- ⚠️ **Risk Detection** - Identifies dangerous operations, blacklisted assets, and suspicious patterns
- 🔍 **Asset Verification** - Checks against verified and blacklisted asset database
- 💡 **Smart Warnings** - Shows detailed risk analysis with actionable recommendations
- 🚫 **Transaction Blocking** - Option to block high-risk transactions automatically
- 📊 **Dashboard Integration** - Quick access to full StellarSafe dashboard

## Installation

### Development Mode

1. **Clone the repository**
   ```bash
   cd /Users/ahmetbugrakurnaz/Desktop/stellarostim/extension
   ```

2. **Load extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `/extension` folder
   - The extension icon should appear in your toolbar

3. **Load extension in Firefox**
   - Open Firefox and go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `/extension` folder (e.g., `manifest.json`)
   - The extension will be loaded temporarily

4. **Start the StellarSafe API**
   ```bash
   cd ../frontend
   npm run dev
   ```
   The extension communicates with the API at `http://localhost:3000`

### Adding Icons

The extension needs icon files. You can:

1. **Use existing icons** - Copy PNG files (16x16, 32x32, 48x48, 128x128) to `/extension/icons/`
2. **Generate icons** - Use a tool like [Icon Generator](https://icon.kitchen) to create icons from the shield emoji 🛡️
3. **Download from project** - If icons are provided in the repository

## How It Works

### 1. Freighter Wallet Integration

The extension intercepts Freighter wallet's `signTransaction` calls:

```javascript
// Original Freighter call
await window.freighterApi.signTransaction(xdr);

// With StellarSafe
// 1. Transaction is intercepted
// 2. XDR is analyzed by StellarSafe API
// 3. Risk assessment is shown to user
// 4. User decides: Cancel or Proceed
// 5. If proceed, original signing continues
```

### 2. Architecture

```
┌─────────────┐
│   Web Page  │
│  (Freighter)│
└──────┬──────┘
       │
       ↓ intercept
┌─────────────┐
│ injected.js │ (Page Context)
└──────┬──────┘
       │
       ↓ postMessage
┌─────────────┐
│ content.js  │ (Extension Context)
└──────┬──────┘
       │
       ↓ chrome.runtime
┌─────────────┐
│background.js│ (Service Worker)
└──────┬──────┘
       │
       ↓ fetch
┌─────────────┐
│StellarSafe  │
│   API       │
└─────────────┘
```

### 3. Communication Flow

1. **Injected Script** - Runs in page context, intercepts Freighter
2. **Content Script** - Bridges page and extension contexts
3. **Background Worker** - Makes API calls to analyze transactions
4. **Warning Modal** - Shows risk analysis to user
5. **User Decision** - Cancel or proceed with transaction

## Features Detail

### Risk Analysis

The extension analyzes:
- ✅ Transaction operations (payment, account merge, clawback, etc.)
- ✅ Asset verification status (verified/blacklisted)
- ✅ Issuer reputation and flags
- ✅ Amount thresholds
- ✅ Smart contract invocations
- ✅ Path payments
- ✅ Account security changes (signers, thresholds)

### Warning Modal

Shows:
- Overall risk level (SAFE/LOW/MEDIUM/HIGH/CRITICAL)
- Risk score (0-100)
- List of detected threats with explanations
- Operation breakdown
- Recommendations

### Settings

- **Enable Protection** - Turn extension on/off
- **Show Warnings** - Display risk analysis modals
- **Block High Risk** (future) - Automatically block critical transactions

## Testing

### Test with Example Transactions

1. **Safe Transaction**
   - Use verified assets (USDC, AQUA)
   - Simple payment operations
   - Should show LOW risk

2. **Risky Transaction**
   - Use unverified assets
   - Account merge operations
   - Should show HIGH risk

3. **Blacklisted Asset**
   - Use known scam asset from database
   - Should show CRITICAL risk

### Debug Mode

Enable console logs:
```javascript
// In browser console
localStorage.setItem('stellarsafe-debug', 'true');
```

## API Endpoints Used

- `POST /api/analyze/transaction` - Analyze transaction XDR
- `POST /api/analyze/asset` - Analyze specific asset
- `GET /api/assets/stats` - Get database statistics

## Configuration

Edit `background.js` to change API endpoint:

```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // Development
// const API_BASE_URL = 'https://stellarsafe.app/api'; // Production
```

## Permissions Explained

- **storage** - Save user settings (enable/disable protection)
- **activeTab** - Access current tab to inject scripts
- **scripting** - Inject content scripts dynamically
- **host_permissions** - Connect to StellarSafe API

## Troubleshooting

### Extension Not Working

1. Check console for errors (`chrome://extensions/` → Details → Inspect views)
2. Verify API is running (`curl http://localhost:3000/api/health`)
3. Reload extension after code changes
4. Check Freighter is installed and active

### Modal Not Showing

1. Check "Show Warnings" is enabled in popup
2. Look for CSP (Content Security Policy) errors in console
3. Verify injected.js loaded successfully

### API Connection Failed

1. Ensure frontend is running (`npm run dev` in `/frontend`)
2. Check CORS settings
3. Verify API_BASE_URL in background.js

## Building for Production

### Chrome Web Store

1. Update `manifest.json` version
2. Change API_BASE_URL to production URL
3. Create ZIP file:
   ```bash
   cd extension
   zip -r stellarsafe-extension.zip . -x "*.DS_Store" -x "README.md"
   ```
4. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

### Firefox Add-ons

1. Same steps as Chrome
2. Upload to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)

## Security Notes

- Extension only analyzes transactions, never stores private keys
- All analysis happens via public API
- User always has final control (can proceed despite warnings)
- No tracking or analytics
- Open source for transparency

## Development

### File Structure

```
extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (API calls)
├── content.js         # Content script (message bridge)
├── injected.js        # Page script (Freighter interceptor)
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Adding Features

1. **New Analysis Types**
   - Add to `background.js` message handlers
   - Update `injected.js` to send new data
   - Modify warning modal to display results

2. **New Settings**
   - Add toggle to `popup.html`
   - Update `popup.js` to save/load setting
   - Check setting in `injected.js` before showing modal

## Future Enhancements

- [ ] Support for other Stellar wallets (Albedo, LOBSTR)
- [ ] Transaction simulation before signing
- [ ] Portfolio tracking integration
- [ ] Community threat reporting
- [ ] Browser notifications for high-risk transactions
- [ ] Transaction history and analytics

## License

MIT License - See LICENSE file in repository root

## Support

- 🐛 Report bugs: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📧 Email: support@stellarsafe.app
- 🌐 Website: https://stellarsafe.app

---

Made with ❤️ for the Stellar Community
