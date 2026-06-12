// Diff Checker - Compare two texts or files side by side

let leftContent = '';
let rightContent = '';
let currentTheme = localStorage.getItem('diff-theme') || 'dark';
let helpModalOpen = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    updateStats();
    applyTheme(currentTheme, false);
});

// Theme toggle function
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme, true);
    localStorage.setItem('diff-theme', currentTheme);
    showToast(`${currentTheme === 'dark' ? '🌙' : '☀️'} ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} mode enabled`);
}

function applyTheme(theme, animate) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('themeBtn');
    const hljsTheme = document.getElementById('hljs-theme');
    
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '🌙 Theme' : '☀️ Theme';
    }
    
    if (hljsTheme) {
        hljsTheme.href = theme === 'dark' 
            ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css';
    }
    
    if (animate) {
        document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
}

// Help modal
function showHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'flex';
        helpModalOpen = true;
    }
}

function closeHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.style.display = 'none';
        helpModalOpen = false;
    }
}

// Calculate character-level diff
function getCharDiff(left, right) {
    if (!left || !right || left === right) return null;
    
    const maxLen = Math.max(left.length, right.length);
    let result = { left: [], right: [] };
    let leftBuf = '';
    let rightBuf = '';
    
    for (let i = 0; i < maxLen; i++) {
        const l = left[i] || '';
        const r = right[i] || '';
        
        if (l === r) {
            if (leftBuf) { result.left.push({ text: leftBuf, changed: true }); leftBuf = ''; }
            if (rightBuf) { result.right.push({ text: rightBuf, changed: true }); rightBuf = ''; }
            result.left.push({ text: l, changed: false });
            result.right.push({ text: r, changed: false });
        } else {
            leftBuf += l;
            rightBuf += r;
        }
    }
    
    if (leftBuf) result.left.push({ text: leftBuf, changed: true });
    if (rightBuf) result.right.push({ text: rightBuf, changed: true });
    
    return result;
}

function renderCharDiff(charDiff) {
    if (!charDiff) return null;
    
    const render = (parts) => parts.map(part => 
        part.changed ? `<span class="char-diff">${escapeHtml(part.text)}</span>` : escapeHtml(part.text)
    ).join('');
    
    return { left: render(charDiff.left), right: render(charDiff.right) };
}

function process() {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    const resultDiv = document.getElementById('result');
    const diffOutput = document.getElementById('diffOutput');
    
    if (!leftInput || !rightInput) {
        console.error('Input elements not found');
        return;
    }
    
    leftContent = leftInput.value;
    rightContent = rightInput.value;
    
    // Save to localStorage
    localStorage.setItem('diff-left', leftContent);
    localStorage.setItem('diff-right', rightContent);
    
    if (!leftContent.trim() && !rightContent.trim()) {
        resultDiv.innerHTML = '❌ Please enter text in at least one side';
        diffOutput.innerHTML = '';
        return;
    }
    
    // Calculate diff
    const diff = calculateDiff(leftContent, rightContent);
    
    // Display results
    displayDiff(diff, diffOutput);
    displayStats(diff, resultDiv);
    
    // Update URL hash for sharing
    updateShareableLink();
}

function calculateDiff(left, right) {
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const maxLines = Math.max(leftLines.length, rightLines.length);
    const diffs = [];
    
    const ignoreWhitespace = document.getElementById('ignoreWhitespace')?.checked || false;
    const caseSensitive = !(document.getElementById('caseInsensitive')?.checked || false);
    
    for (let i = 0; i < maxLines; i++) {
        let leftLine = leftLines[i] || '';
        let rightLine = rightLines[i] || '';
        
        let compareLeft = leftLine;
        let compareRight = rightLine;
        
        if (ignoreWhitespace) {
            compareLeft = leftLine.replace(/\s+/g, ' ').trim();
            compareRight = rightLine.replace(/\s+/g, ' ').trim();
        }
        
        if (!caseSensitive) {
            compareLeft = compareLeft.toLowerCase();
            compareRight = compareRight.toLowerCase();
        }
        
        const status = compareLeft === compareRight ? 'equal' : 
                       leftLine === '' ? 'added' : 
                       rightLine === '' ? 'removed' : 'modified';
        
        diffs.push({
            lineNum: i + 1,
            left: leftLine,
            right: rightLine,
            status: status
        });
    }
    
    return diffs;
}

function displayDiff(diffs, container) {
    if (!container) return;
    
    const charDiffEnabled = document.getElementById('charDiff')?.checked || false;
    const syntaxHighlightEnabled = document.getElementById('syntaxHighlight')?.checked || false;
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    
    // Detect language
    let language = null;
    if (syntaxHighlightEnabled && leftInput && rightInput) {
        const combined = leftInput.value + rightInput.value;
        if (combined.includes('function') || combined.includes('const ') || combined.includes('let ')) language = 'javascript';
        else if (combined.includes('def ') || combined.includes('import ') && combined.includes('print(')) language = 'python';
        else if (combined.includes('<!DOCTYPE') || combined.includes('<html')) language = 'xml';
        else if (combined.includes('{') && combined.includes('"')) language = 'json';
        else if (combined.includes('{') && combined.includes(';')) language = 'css';
    }
    
    let html = '<div class="diff-view">';
    html += '<div class="diff-header"><span>Original</span><span>Modified</span></div>';
    html += '<div class="diff-content">';
    
    diffs.forEach(diff => {
        const lineClass = diff.status === 'equal' ? 'diff-equal' : 
                         diff.status === 'added' ? 'diff-added' :
                         diff.status === 'removed' ? 'diff-removed' : 'diff-modified';
        
        let leftContent = escapeHtml(diff.left);
        let rightContent = escapeHtml(diff.right);
        
        // Apply character-level diff
        if (charDiffEnabled && diff.status === 'modified') {
            const charDiff = getCharDiff(diff.left, diff.right);
            const rendered = renderCharDiff(charDiff);
            if (rendered) {
                leftContent = rendered.left;
                rightContent = rendered.right;
            }
        }
        
        // Apply syntax highlighting
        if (syntaxHighlightEnabled && language && diff.status === 'equal') {
            leftContent = highlightCode(diff.left, language);
            rightContent = highlightCode(diff.right, language);
        }
        
        html += `<div class="diff-line ${lineClass}">`;
        html += `<div class="line-num" title="Click to copy" onclick="copyLine('${escapeHtml(diff.left).replace(/'/g, "\\'")}')">${diff.lineNum}</div>`;
        html += `<div class="line-content left ${syntaxHighlightEnabled && language ? 'hljs' : ''}">${leftContent || '<span class="empty-line">(empty)</span>'}</div>`;
        html += `<div class="line-num" title="Click to copy" onclick="copyLine('${escapeHtml(diff.right).replace(/'/g, "\\'")}')">${diff.lineNum}</div>`;
        html += `<div class="line-content right ${syntaxHighlightEnabled && language ? 'hljs' : ''}">${rightContent || '<span class="empty-line">(empty)</span>'}</div>`;
        html += '</div>';
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

function highlightCode(code, language) {
    if (!code || !window.hljs) return escapeHtml(code);
    try {
        const result = window.hljs.highlight(code, { language, ignoreIllegals: true });
        return result.value;
    } catch (e) {
        return escapeHtml(code);
    }
}

function copyLine(text) {
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Line copied!');
        });
    }
}

function displayStats(diff, container) {
    if (!container) return;
    
    const equalCount = diff.filter(d => d.status === 'equal').length;
    const addedCount = diff.filter(d => d.status === 'added').length;
    const removedCount = diff.filter(d => d.status === 'removed').length;
    const modifiedCount = diff.filter(d => d.status === 'modified').length;
    const changedCount = addedCount + removedCount + modifiedCount;
    
    const similarity = diff.length > 0 ? Math.round((equalCount / diff.length) * 100) : 100;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item equal"><span class="stat-value">${equalCount}</span><span class="stat-label">✓ Identical</span></div>
            <div class="stat-item added"><span class="stat-value">${addedCount}</span><span class="stat-label">➕ Added</span></div>
            <div class="stat-item removed"><span class="stat-value">${removedCount}</span><span class="stat-label">➖ Removed</span></div>
            <div class="stat-item modified"><span class="stat-value">${modifiedCount}</span><span class="stat-label">✏️ Modified</span></div>
        </div>
        <div class="similarity-bar">
            <div class="similarity-fill" style="width: ${similarity}%"></div>
            <span class="similarity-text">${similarity}% Similar</span>
        </div>
        ${changedCount === 0 ? '<div class="no-changes">🎉 No differences found!</div>' : ''}
    `;
}

function escapeHtml(text) {
    if (!text) return '<span class="empty-line">(empty)</span>';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/ /g, '&nbsp;')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}

function clearAll() {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    
    if (leftInput) leftInput.value = '';
    if (rightInput) rightInput.value = '';
    
    localStorage.removeItem('diff-left');
    localStorage.removeItem('diff-right');
    
    document.getElementById('result').innerHTML = '';
    document.getElementById('diffOutput').innerHTML = '';
    
    updateStats();
}

function swapSides() {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    
    if (!leftInput || !rightInput) return;
    
    const temp = leftInput.value;
    leftInput.value = rightInput.value;
    rightInput.value = temp;
    
    localStorage.setItem('diff-left', leftInput.value);
    localStorage.setItem('diff-right', rightInput.value);
}

function loadFromStorage() {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    
    if (leftInput) leftInput.value = localStorage.getItem('diff-left') || '';
    if (rightInput) rightInput.value = localStorage.getItem('diff-right') || '';
}

function updateStats() {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    const statsDiv = document.getElementById('inputStats');
    
    if (!leftInput || !rightInput || !statsDiv) return;
    
    const leftLines = leftInput.value.split('\n').filter(l => l.trim()).length;
    const leftChars = leftInput.value.length;
    const rightLines = rightInput.value.split('\n').filter(l => l.trim()).length;
    const rightChars = rightInput.value.length;
    
    statsDiv.innerHTML = `
        <div class="input-stat">Left: ${leftLines} lines, ${leftChars} chars</div>
        <div class="input-stat">Right: ${rightLines} lines, ${rightChars} chars</div>
    `;
}

function copy(side) {
    const input = document.getElementById(side === 'left' ? 'leftInput' : 'rightInput');
    if (input && input.value) {
        navigator.clipboard.writeText(input.value).then(() => {
            showToast(`${side.charAt(0).toUpperCase() + side.slice(1)} side copied!`);
        });
    }
}

function copyDiff() {
    const diffOutput = document.getElementById('diffOutput');
    if (diffOutput) {
        const text = diffOutput.innerText;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Diff copied to clipboard!');
        });
    }
}

function exportDiff(format) {
    const diffOutput = document.getElementById('diffOutput');
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    
    if (!leftInput || !rightInput) return;
    
    let content = '';
    const timestamp = new Date().toISOString();
    
    if (format === 'txt') {
        content = `Diff Report - ${timestamp}\n`;
        content += `${'='.repeat(50)}\n\n`;
        content += `LEFT:\n${leftInput.value}\n\n`;
        content += `RIGHT:\n${rightInput.value}\n\n`;
        content += `DIFF:\n${diffOutput ? diffOutput.innerText : 'No diff generated'}`;
    } else if (format === 'json') {
        content = JSON.stringify({
            timestamp,
            left: leftInput.value,
            right: rightInput.value,
            diff: diffOutput ? diffOutput.innerText : ''
        }, null, 2);
    } else if (format === 'html') {
        content = `<!DOCTYPE html>
<html>
<head><title>Diff Report</title></head>
<body>
<h1>Diff Report - ${timestamp}</h1>
<pre>${escapeHtml(leftInput.value)}</pre>
<hr>
<pre>${escapeHtml(rightInput.value)}</pre>
</body></html>`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-report-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Exported as ${format.toUpperCase()}`);
}

function updateShareableLink() {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    
    if (!leftInput || !rightInput) return;
    
    try {
        const data = {
            left: leftInput.value.slice(0, 2000),
            right: rightInput.value.slice(0, 2000)
        };
        const hash = btoa(JSON.stringify(data));
        history.replaceState(null, null, '#' + hash);
    } catch (e) {
        console.log('Content too large for URL');
    }
}

function loadFromHash() {
    if (window.location.hash) {
        try {
            const data = JSON.parse(atob(window.location.hash.slice(1)));
            const leftInput = document.getElementById('leftInput');
            const rightInput = document.getElementById('rightInput');
            
            if (leftInput && data.left) leftInput.value = data.left;
            if (rightInput && data.right) rightInput.value = data.right;
            
            process();
        } catch (e) {
            console.error('Failed to load from hash');
        }
    }
}

function showToast(message) {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
}

function handleFileUpload(event, side) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const input = document.getElementById(side === 'left' ? 'leftInput' : 'rightInput');
        if (input) {
            input.value = e.target.result;
            localStorage.setItem(`diff-${side}`, e.target.result);
            updateStats();
        }
    };
    reader.readAsText(file);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in textareas
    if (e.target.tagName === 'TEXTAREA' && !e.ctrlKey && !e.metaKey) return;
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        process();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Delete' || e.key === 'Backspace' && e.shiftKey)) {
        e.preventDefault();
        clearAll();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportDiff('txt');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection().toString()) {
        e.preventDefault();
        copyDiff();
    }
    if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        showHelp();
    }
    if (e.key === 'Escape') {
        if (helpModalOpen) {
            closeHelp();
        } else {
            clearAll();
        }
    }
});

// Auto-resize textareas
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Initialize file inputs and event listeners
document.addEventListener('DOMContentLoaded', () => {
    const leftInput = document.getElementById('leftInput');
    const rightInput = document.getElementById('rightInput');
    const leftFile = document.getElementById('leftFile');
    const rightFile = document.getElementById('rightFile');
    const charDiffCheckbox = document.getElementById('charDiff');
    const syntaxHighlightCheckbox = document.getElementById('syntaxHighlight');
    
    if (leftInput) {
        leftInput.addEventListener('input', () => {
            updateStats();
            localStorage.setItem('diff-left', leftInput.value);
        });
    }
    
    if (rightInput) {
        rightInput.addEventListener('input', () => {
            updateStats();
            localStorage.setItem('diff-right', rightInput.value);
        });
    }
    
    if (leftFile) {
        leftFile.addEventListener('change', (e) => handleFileUpload(e, 'left'));
    }
    
    if (rightFile) {
        rightFile.addEventListener('change', (e) => handleFileUpload(e, 'right'));
    }
    
    // Re-run diff when toggle options change
    if (charDiffCheckbox) {
        charDiffCheckbox.addEventListener('change', () => {
            localStorage.setItem('diff-chardiff', charDiffCheckbox.checked);
            if (leftInput?.value && rightInput?.value) process();
        });
        charDiffCheckbox.checked = localStorage.getItem('diff-chardiff') === 'true';
    }
    
    if (syntaxHighlightCheckbox) {
        syntaxHighlightCheckbox.addEventListener('change', () => {
            localStorage.setItem('diff-syntax', syntaxHighlightCheckbox.checked);
            if (leftInput?.value && rightInput?.value) process();
        });
        syntaxHighlightCheckbox.checked = localStorage.getItem('diff-syntax') === 'true';
    }
    
    // Load from hash if present
    loadFromHash();
});