# StellarSafe Widget

Zero-config security widget for Stellar wallets. Plug & Play white-label solution.

## 🚀 Quick Start

### For Wallet Developers

Add one script tag to your wallet:

```html
<script src="https://cdn.stellarsafe.io/widget.js"></script>
```

Use it before transactions:

```javascript
// Before sending transaction
StellarSafeWidget.check({
  address: recipientAddress,
  partnerId: 'lobstr', // or 'freighter', 'xbull'
  onResult: (result) => {
    if (result.riskLevel === 'DANGER') {
      // Show warning with your wallet's branding
      showSecurityWarning(result.message);
    } else {
      // Proceed with transaction
      proceedWithTransaction();
    }
  }
});
```

## 🎨 White-label Branding

Each wallet gets custom branding:

- **Lobstr**: "Lobstr Security Shield" with Lobstr colors/logo
- **Freighter**: "Freighter Security Check" with Freighter theme  
- **xBull**: "xBull Security" with xBull branding
- **Custom**: Your own brand configuration

## 📦 Installation & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production  
npm run build
```

## 🧪 Testing

Open `demo.html` in your browser to test different wallet brands and risk scenarios.

## 🔧 API Reference

### `StellarSafeWidget.check(options)`

| Option | Type | Description |
|--------|------|-------------|
| `address` | string | Stellar address to analyze |
| `partnerId` | string | Partner ID ('lobstr', 'freighter', 'xbull') |
| `customConfig` | PartnerConfig | Override default branding |
| `onResult` | function | Callback with analysis result |
| `onError` | function | Error callback |

### Risk Levels

- **SAFE**: Verified, trusted address
- **WARNING**: Unknown address, proceed with caution  
- **DANGER**: High risk, known scam/suspicious address

## 🤝 Partnership

Integration is free for wallet partners. Contact us for:

- Custom branding configuration
- Analytics dashboard access
- Revenue sharing opportunities
- Enterprise support

## 📄 License

MIT License - see LICENSE file for details.