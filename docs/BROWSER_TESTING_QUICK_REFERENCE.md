# Browser Testing Quick Reference

## Quick Start

### 1. Check Browser Compatibility

```bash
npm run test:browser-compat
```

This will analyze the application's browser compatibility and show:

- ✅ Supported features
- ⚠️ Features with limited support
- ❌ Unsupported features

### 2. Open Multiple Browsers for Testing

```bash
npm run test:browsers
```

This will automatically open the application in:

- Google Chrome
- Firefox
- Safari
- Microsoft Edge
- Opera (if installed)
- Brave (if installed)

### 3. Test on Mobile Devices

1. Find your local IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Access from mobile device:
   ```
   http://YOUR_IP:3000
   ```

## Supported Browsers

### Desktop

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile

- ✅ Safari iOS 14+
- ✅ Chrome Android 90+
- ⚠️ Firefox Mobile 88+
- ⚠️ Samsung Internet 14+

## Testing Checklist

### Critical Features to Test

1. **Authentication**
   - [ ] Login works
   - [ ] Registration works
   - [ ] Password reset works

2. **Dashboard**
   - [ ] Layout displays correctly
   - [ ] Data loads properly
   - [ ] Navigation works

3. **Complaints**
   - [ ] List displays
   - [ ] Create new complaint
   - [ ] View complaint details
   - [ ] File upload works

4. **Real-time**
   - [ ] Notifications appear
   - [ ] WebSocket connection stable
   - [ ] Updates happen instantly

5. **Responsive Design**
   - [ ] Mobile layout works
   - [ ] Tablet layout works
   - [ ] Desktop layout works

## Common Issues & Solutions

### Safari-Specific

**Issue**: Date picker looks different  
**Solution**: This is expected - Safari has its own date picker UI

**Issue**: WebSocket disconnects on background  
**Solution**: Reconnection logic is implemented

### Firefox-Specific

**Issue**: Custom scrollbars don't work  
**Solution**: Firefox doesn't support custom scrollbars - uses default

### Mobile Safari (iOS)

**Issue**: 100vh includes address bar  
**Solution**: Use `dvh` units or JavaScript height calculation

**Issue**: Input fields zoom when focused  
**Solution**: Ensure inputs have minimum 16px font size

## Performance Targets

| Metric                 | Desktop | Mobile |
| ---------------------- | ------- | ------ |
| Page Load              | < 2s    | < 3s   |
| Time to Interactive    | < 3s    | < 4s   |
| First Contentful Paint | < 1s    | < 1.5s |

## Documentation

- **Full Guide**: [docs/BROWSER_TESTING_GUIDE.md](./BROWSER_TESTING_GUIDE.md)
- **Results Template**: [docs/BROWSER_TESTING_RESULTS.md](./BROWSER_TESTING_RESULTS.md)
- **Mobile Testing**: [MOBILE_RESPONSIVENESS_IMPLEMENTATION.md](../MOBILE_RESPONSIVENESS_IMPLEMENTATION.md)

## Automated Testing (Future)

Consider adding:

- Playwright for cross-browser E2E testing
- Cypress for integration testing
- Jest for unit testing
- Testing Library for component testing

## Resources

- [Can I Use](https://caniuse.com/) - Feature compatibility
- [MDN Web Docs](https://developer.mozilla.org/) - Web standards
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [LambdaTest](https://www.lambdatest.com/) - Browser testing platform

## Need Help?

1. Check the [Browser Testing Guide](./BROWSER_TESTING_GUIDE.md)
2. Review [Mobile Responsiveness](../MOBILE_RESPONSIVENESS_IMPLEMENTATION.md)
3. See [Performance Testing](./PERFORMANCE_TESTING_GUIDE.md)
4. Check [Security Headers](./SECURITY_HEADERS.md)
