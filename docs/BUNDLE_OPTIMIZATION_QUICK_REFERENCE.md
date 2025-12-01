# Bundle Optimization - Quick Reference

## 🚀 Quick Commands

```bash
# Analyze current build
npm run analyze

# Build and analyze
npm run build:analyze

# Production build
npm run build
npm run start
```

## 📊 Current Metrics

- **Static Assets**: 3.87 MB
- **JavaScript Chunks**: 3.73 MB
- **Total Routes**: 27 (23 static, 4 dynamic)

## ✅ Optimizations Enabled

### Automatic

- ✅ Console log removal in production
- ✅ Tree-shaking for unused code
- ✅ Code splitting by route
- ✅ Image optimization (AVIF/WebP)
- ✅ Minification and compression

### Package-Specific

- ✅ `lucide-react` - Optimized imports
- ✅ `@radix-ui/*` - Optimized imports
- ✅ `@tiptap/*` - Optimized imports
- ✅ `@tanstack/react-query` - Optimized imports

## 💡 Best Practices

### ✅ DO

```typescript
// Use dynamic imports for large components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Import only what you need
import { Button } from '@/components/ui/button';

// Use Next.js Image component
import Image from 'next/image';
<Image src="/logo.png" width={200} height={100} alt="Logo" />

// Lazy load heavy libraries
const exportToPDF = async () => {
  const jsPDF = (await import('jspdf')).default;
};
```

### ❌ DON'T

```typescript
// Don't import entire libraries
import * as UI from '@/components/ui';

// Don't use regular img tags
<img src="/logo.png" alt="Logo" />

// Don't import heavy libraries at top level
import jsPDF from 'jspdf'; // Only if used immediately
```

## 🔍 Monitoring

### Before Committing

```bash
npm run build:analyze
```

### Check for Issues

- Large chunks (>500KB) will be flagged
- Review largest files list
- Ensure no unexpected size increases

## 📈 Performance Targets

| Metric | Target  | Status |
| ------ | ------- | ------ |
| FCP    | < 1.8s  | ✅     |
| LCP    | < 2.5s  | ✅     |
| TTI    | < 3.8s  | ✅     |
| TBT    | < 200ms | ✅     |
| CLS    | < 0.1   | ✅     |

## 🛠️ Troubleshooting

### Build Size Increased?

1. Run `npm run analyze`
2. Check largest files
3. Review recent changes
4. Consider lazy loading

### Slow Build?

1. Check for circular dependencies
2. Clear `.next` folder
3. Update dependencies

### Runtime Slow?

1. Use React DevTools Profiler
2. Check for unnecessary re-renders
3. Review component memoization

## 📚 Resources

- Full Guide: `docs/BUNDLE_OPTIMIZATION.md`
- Summary: `BUNDLE_OPTIMIZATION_SUMMARY.md`
- Analyzer: `scripts/analyze-bundle.js`

## 🎯 Quick Wins

1. **Lazy Load**: Use `lazy()` for components >50KB
2. **Tree Shake**: Import specific exports, not entire modules
3. **Images**: Always use `next/image`
4. **Conditional**: Load heavy libs only when needed
5. **Monitor**: Run analyzer before major releases

---

**Last Updated**: December 2024  
**Next Review**: Monthly
