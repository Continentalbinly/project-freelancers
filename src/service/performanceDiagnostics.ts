/**
 * 🔍 Performance Diagnostics Utility
 * Run this in browser console to identify bottlenecks
 */

interface PerformanceDiagnostics {
  timestamp: string;
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  navigationTiming: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    loadTime: number;
  };
  networkRequests: {
    total: number;
    cached: number;
    byType: Record<string, number>;
    averageSize: number;
  };
  cacheStatus: {
    cacheSize: number;
    cacheEntries: number;
    oldestEntry: string;
  };
}

/**
 * 🟢 Create a performance diagnostics report
 */
export function generatePerformanceReport(): PerformanceDiagnostics {
  // Memory usage
  const memory = (performance as any).memory || {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  };

  // Navigation timing
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const firstContentfulPaint = performance
    .getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
  const largestContentfulPaint = performance
    .getEntriesByType('largest-contentful-paint')
    .pop()?.startTime || 0;
  const timeToInteractive = performance
    .getEntriesByName('first-input')[0]?.startTime || 0;

  // Network requests from Resource Timing API
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const networkByType: Record<string, number> = {};
  let totalSize = 0;

  resources.forEach((resource) => {
    const type = new URL(resource.name).pathname.split('.').pop() || 'other';
    networkByType[type] = (networkByType[type] || 0) + 1;
    totalSize += resource.transferSize || 0;
  });

  // Cache status - detect cached resources by transferSize === 0 (more compatible)
  const cachedResources = resources.filter((r) => {
    // transferSize === 0 typically means cache hit (except for 304 Not Modified)
    // Also check if duration is very small (< 5ms) as additional indicator
    return r.transferSize === 0 && r.duration < 5;
  }).length;

  const cacheKeys = Object.keys(localStorage).filter((k) => k.startsWith('cache_'));
  const oldestKey = cacheKeys.length > 0 ? cacheKeys[0] : 'none';

  return {
    timestamp: new Date().toISOString(),
    memoryUsage: {
      usedJSHeapSize: memory.usedJSHeapSize / 1048576, // Convert to MB
      totalJSHeapSize: memory.totalJSHeapSize / 1048576,
      jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576,
    },
    navigationTiming: {
      firstContentfulPaint,
      largestContentfulPaint,
      timeToInteractive,
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
    },
    networkRequests: {
      total: resources.length,
      cached: cachedResources,
      byType: networkByType,
      averageSize: resources.length > 0 ? totalSize / resources.length / 1024 : 0, // KB
    },
    cacheStatus: {
      cacheSize: cacheKeys.reduce(
        (sum, key) => sum + (localStorage.getItem(key)?.length || 0),
        0
      ) / 1024, // KB
      cacheEntries: cacheKeys.length,
      oldestEntry: oldestKey,
    },
  };
}

/**
 * 🟡 Identify performance issues
 */
export function identifyPerformanceIssues(): string[] {
  const issues: string[] = [];
  const report = generatePerformanceReport();

  // Check memory usage
  const memoryPercent =
    (report.memoryUsage.usedJSHeapSize / report.memoryUsage.jsHeapSizeLimit) * 100;
  if (memoryPercent > 90) {
    issues.push(`⚠️ High memory usage: ${memoryPercent.toFixed(1)}%`);
  }

  // Check paint times
  if (report.navigationTiming.firstContentfulPaint > 3000) {
    issues.push(`⚠️ Slow FCP: ${report.navigationTiming.firstContentfulPaint.toFixed(0)}ms`);
  }

  if (report.navigationTiming.largestContentfulPaint > 4000) {
    issues.push(
      `⚠️ Slow LCP: ${report.navigationTiming.largestContentfulPaint.toFixed(0)}ms`
    );
  }

  // Check cache hit rate
  const cacheHitRate =
    (report.networkRequests.cached / report.networkRequests.total) * 100;
  if (cacheHitRate < 30) {
    issues.push(
      `⚠️ Low cache hit rate: ${cacheHitRate.toFixed(0)}% (should be > 50%)`
    );
  }

  // Check average asset size
  if (report.networkRequests.averageSize > 100) {
    issues.push(
      `⚠️ Large average asset size: ${report.networkRequests.averageSize.toFixed(0)}KB`
    );
  }

  // Check cache size
  if (report.cacheStatus.cacheSize > 5000) {
    issues.push(`⚠️ Large cache size: ${report.cacheStatus.cacheSize.toFixed(0)}KB`);
  }

  return issues.length > 0 ? issues : ['✅ No major performance issues detected'];
}

/**
 * 🟢 Print a detailed performance report
 */
export function printPerformanceReport() {
  const report = generatePerformanceReport();

  console.clear();
  console.log('%c🚀 PERFORMANCE DIAGNOSTIC REPORT', 'font-size: 18px; font-weight: bold; color: #0066cc;');
  console.log(`📅 Generated: ${report.timestamp}\n`);

  // Memory Section
  console.log(
    '%c📊 MEMORY USAGE',
    'font-weight: bold; color: #0066cc; font-size: 14px;'
  );
  console.table({
    'Used Heap': `${report.memoryUsage.usedJSHeapSize.toFixed(1)} MB`,
    'Total Heap': `${report.memoryUsage.totalJSHeapSize.toFixed(1)} MB`,
    'Limit': `${report.memoryUsage.jsHeapSizeLimit.toFixed(1)} MB`,
    'Usage %': `${((report.memoryUsage.usedJSHeapSize / report.memoryUsage.jsHeapSizeLimit) * 100).toFixed(1)}%`,
  });

  // Performance Timing Section
  console.log(
    '%c⏱️ PERFORMANCE TIMING',
    'font-weight: bold; color: #0066cc; font-size: 14px;'
  );
  console.table({
    'FCP (First Contentful Paint)': `${report.navigationTiming.firstContentfulPaint.toFixed(0)}ms`,
    'LCP (Largest Contentful Paint)': `${report.navigationTiming.largestContentfulPaint.toFixed(0)}ms`,
    'TTI (Time to Interactive)': `${report.navigationTiming.timeToInteractive.toFixed(0)}ms`,
    'Load Time': `${report.navigationTiming.loadTime.toFixed(0)}ms`,
  });

  // Network Section
  console.log(
    '%c🌐 NETWORK REQUESTS',
    'font-weight: bold; color: #0066cc; font-size: 14px;'
  );
  console.table({
    'Total Requests': report.networkRequests.total,
    'Cached Requests': report.networkRequests.cached,
    'Cache Hit Rate': `${((report.networkRequests.cached / report.networkRequests.total) * 100).toFixed(1)}%`,
    'Average Size': `${report.networkRequests.averageSize.toFixed(1)} KB`,
    'By Type': JSON.stringify(report.networkRequests.byType),
  });

  // Cache Section
  console.log(
    '%c💾 CACHE STATUS',
    'font-weight: bold; color: #0066cc; font-size: 14px;'
  );
  console.table({
    'Cache Size': `${report.cacheStatus.cacheSize.toFixed(1)} KB`,
    'Cache Entries': report.cacheStatus.cacheEntries,
    'Oldest Entry': report.cacheStatus.oldestEntry,
  });

  // Issues Section
  console.log(
    '%c🔍 ISSUES DETECTED',
    'font-weight: bold; color: #0066cc; font-size: 14px;'
  );
  const issues = identifyPerformanceIssues();
  issues.forEach((issue) => {
    console.log(issue);
  });

  // Recommendations
  console.log(
    '%c💡 RECOMMENDATIONS',
    'font-weight: bold; color: #0066cc; font-size: 14px;'
  );
  const recommendations = [
    '• Use useMemo() for expensive computations',
    '• Lazy load components with React.lazy()',
    '• Enable image optimization with Next.js <Image>',
    '• Enable Cloudflare caching for API routes',
    '• Monitor cache hit rate (target: > 70%)',
    '• Keep assets under 100KB on average',
    '• Use request deduplication for API calls',
  ];
  recommendations.forEach((rec) => console.log(rec));
}

/**
 * 🔄 Monitor performance continuously
 */
export function startPerformanceMonitoring(intervalMs = 60000) {
  console.log('🔍 Started performance monitoring...');

  const interval = setInterval(() => {
    const report = generatePerformanceReport();
    const issues = identifyPerformanceIssues();

    console.log('%c[Performance Check]', 'color: #0066cc;', {
      timestamp: report.timestamp,
      memoryMB: report.memoryUsage.usedJSHeapSize.toFixed(1),
      cacheHitRate: `${((report.networkRequests.cached / report.networkRequests.total) * 100).toFixed(0)}%`,
      issues: issues.length > 1 ? issues : 'None',
    });
  }, intervalMs);

  return () => {
    clearInterval(interval);
    console.log('Stopped performance monitoring');
  };
}

/**
 * 🧹 Cleanup and recommendations
 */
export function optimizePerformance() {
  const suggestions: string[] = [];

  // Check for console errors
  const errors = performance.getEntriesByType('measure')
    .filter(m => m.name.includes('error')).length;
  if (errors > 0) {
    suggestions.push(`Found ${errors} performance marks related to errors`);
  }

  // Check localStorage usage
  let storageSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      storageSize += localStorage[key].length + key.length;
    }
  }

  if (storageSize > 5 * 1024 * 1024) {
    suggestions.push('localStorage is using > 5MB. Consider clearing old data.');
    suggestions.push('Clear with: localStorage.clear()');
  }

  // Recommendations
  if (suggestions.length === 0) {
    console.log('✅ No immediate optimizations needed!');
  } else {
    console.log('🔧 Optimization Suggestions:');
    suggestions.forEach((s) => console.log(`  • ${s}`));
  }

  return suggestions;
}

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as any).perfDiagnostics = {
    report: generatePerformanceReport,
    issues: identifyPerformanceIssues,
    print: printPerformanceReport,
    monitor: startPerformanceMonitoring,
    optimize: optimizePerformance,
  };

  console.log(
    '%c💡 Performance tools available: window.perfDiagnostics',
    'color: #00aa00; font-size: 12px;'
  );
}
