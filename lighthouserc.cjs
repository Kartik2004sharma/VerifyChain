module.exports = {
  ci: {
    collect: {
      url: ["http://127.0.0.1:3100/"],
      numberOfRuns: 3,
      startServerCommand: "npm run start -- --hostname 127.0.0.1 --port 3100",
      settings: { chromeFlags: "--headless --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": [
          "error",
          { minScore: 0.9, aggregationMethod: "median" },
        ],
        "categories:accessibility": [
          "error",
          { minScore: 0.95, aggregationMethod: "median" },
        ],
        "categories:best-practices": [
          "error",
          { minScore: 0.95, aggregationMethod: "median" },
        ],
        "categories:seo": [
          "error",
          { minScore: 0.95, aggregationMethod: "median" },
        ],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "docs/audit-evidence/lighthouse",
    },
  },
};
