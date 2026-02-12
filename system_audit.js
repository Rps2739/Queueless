const fs = require('fs');
const path = require('path');

// Patterns to Scan For
const patterns = [
    { name: "Console Logging", regex: /console\.(log|warn|error|info)/, category: "Observability" },
    { name: "Sensitive Data (LocalStorage)", regex: /localStorage\.(setItem|getItem)/, category: "Security" },
    { name: "Timezone Issue (new Date)", regex: /new Date\(\)/, category: "Data Integrity" },
    { name: "Hardcoded String 'Canteen'", regex: /['"`]Canteen['"`]/, category: "Hardcoding" },
    { name: "Hardcoded String 'Bakery'", regex: /['"`]Bakery['"`]/, category: "Hardcoding" },
    { name: "DangerouslySetInnerHTML", regex: /dangerouslySetInnerHTML/, category: "Security (XSS)" },
    { name: "SQL Injection Risk (concatenation)", regex: /execute\(['"`].*\$\{.*\}['"`]\)/, category: "Security (SQLi)" },
    { name: "Floating Point Math (reduce sum)", regex: /\.reduce\(\(.*\)\s*=>\s*.*\+.*\)/, category: "Data Integrity" },
    { name: "Missing Trim on Input", regex: /e\.target\.value(?!.*\.trim\(\))/, category: "UX" },
    { name: "Router Push (Open Redirect potential)", regex: /router\.push\(/, category: "Security" },
    { name: "Delete Account Logic (Inline)", regex: /fetch\(['"`]\/api\/user\/profile/, category: "Code Quality" }
];

const rootDir = process.cwd();
const ignoreDirs = ['node_modules', '.next', '.git', '.gemini'];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    patterns.forEach(pattern => {
        if (pattern.regex.test(content)) {
            // Find line number
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (pattern.regex.test(line)) {
                    findings.push({
                        file: path.relative(rootDir, filePath),
                        line: index + 1,
                        issue: pattern.name,
                        category: pattern.category,
                        code: line.trim().substring(0, 100)
                    });
                }
            });
        }
    });

    return findings;
}

function traverseDir(dir) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                results = results.concat(traverseDir(fullPath));
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results = results.concat(scanFile(fullPath));
        }
    }
    return results;
}

console.log("Starting Systemic Audit Scan...");
const allFindings = traverseDir(rootDir);

console.log(`\nAudit Complete. Found ${allFindings.length} potential issues.`);
console.log("-".repeat(50));

const summary = {};
allFindings.forEach(f => {
    if (!summary[f.issue]) summary[f.issue] = 0;
    summary[f.issue]++;
    console.log(`[${f.category}] ${f.issue} at ${f.file}:${f.line}`);
});

console.log("\nSummary of Findings:");
console.table(summary);
