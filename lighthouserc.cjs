/**
 * Lighthouse CI configuration
 * Docs: https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 *
 * Runs against the static build (pnpm generate) served by lhci autoroute.
 */
module.exports = {
  ci: {
    collect: {
      // Collect from static build served by LHCI autoroute
      staticDistDir: '.output/public',
      url: [
        'http://localhost/index.html',
        'http://localhost/en/index.html',
        'http://localhost/es/index.html',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // --- Performance (desktop preset, realistic thresholds) ---
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // --- Hard failures on specific a11y audits ---
        'color-contrast': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'html-lang-valid': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'input-image-alt': ['error', { minScore: 1 }],
        label: ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'object-alt': ['error', { minScore: 1 }],
        tabindex: ['error', { minScore: 1 }],
        'td-headers-attr': ['error', { minScore: 1 }],
        'th-has-data-cells': ['error', { minScore: 1 }],
        'valid-lang': ['error', { minScore: 1 }],

        // --- Hard failures on specific SEO audits ---
        'meta-description': ['error', { minScore: 1 }],
        'robots-txt': ['warn', { minScore: 1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
