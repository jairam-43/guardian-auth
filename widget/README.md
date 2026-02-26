# Guardian Auth Widget

A standalone JavaScript widget for passwordless authentication that can be easily integrated into any website.

## Quick Start

### 1. Add the Widget Script

```html
<script src="https://guardian-auth.vercel.app/widget.js"></script>
```

### 2. Add the Login Button

```html
<guardian-login app-id="your-app-id"></guardian-login>
```

### 3. Listen for Authentication Events

```javascript
document.addEventListener('guardian-auth-success', function(e) {
  console.log('User authenticated:', e.detail.token);
  console.log('User data:', e.detail.user);
  
  // Redirect or update your UI
  window.location.href = '/dashboard';
});

document.addEventListener('guardian-auth-error', function(e) {
  console.error('Authentication failed:', e.detail.error);
  // Show error message to user
});
```

## Configuration Options

The `<guardian-login>` element supports the following attributes:

- `app-id` (required): Your application ID from the developer dashboard
- `theme-color` (optional): Primary color for the widget (default: #4f8ef7)
- `redirect-url` (optional): URL to redirect to after successful authentication

### Example with Custom Styling

```html
<guardian-login 
  app-id="guardian_app_12345678"
  theme-color="#ff6b6b"
  redirect-url="https://yoursite.com/dashboard">
</guardian-login>
```

## Advanced Usage

### Programmatic Control

You can also control the widget programmatically:

```javascript
const loginButton = document.querySelector('guardian-login');

// Open the modal
loginButton.openModal();

// Close the modal
loginButton.closeModal();
```

### Custom Event Handling

```javascript
// Listen for all Guardian Auth events
const events = [
  'guardian-auth-success',
  'guardian-auth-error',
  'guardian-auth-close'
];

events.forEach(eventName => {
  document.addEventListener(eventName, function(e) {
    console.log(`${eventName}:`, e.detail);
  });
});
```

## Security Features

- **Origin Validation**: Only accepts messages from verified Guardian Auth domains
- **Token Security**: Authentication tokens are handled securely and never exposed in URLs
- **CORS Protection**: Proper CORS headers prevent unauthorized access
- **Frame Security**: Uses secure iframe communication with postMessage API

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Widget Not Loading

1. Check that the script is loaded from the correct URL
2. Verify your `app-id` is correct
3. Check browser console for error messages

### Authentication Not Working

1. Ensure your app domain is registered in the developer dashboard
2. Check that your API key is valid and active
3. Verify network connectivity to Guardian Auth servers

### Styling Issues

The widget is designed to be unobtrusive and should work with most websites. If you encounter styling conflicts, you can override the CSS:

```css
.guardian-modal-content {
  /* Custom styles */
}

.guardian-login-btn {
  /* Custom button styles */
}
```

## Support

For support and documentation, visit [guardian-auth.vercel.app](https://guardian-auth.vercel.app).
