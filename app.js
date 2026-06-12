// Diff Checker - Compare two texts or files side by side

let leftContent = '';
let rightContent = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    updateStats();
});

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
    
    let html = '<div class="diff-view">';
    html += '<div class="diff-header"><span>Original</span><span>Modified</span></div>';
    html += '<div class="diff-content">';
    
    diffs.forEach(diff => {
        const lineClass = diff.status === 'equal' ? 'diff-equal' : 
                         diff.status === 'added' ? 'diff-added' :
                         diff.status === 'removed' ? 'diff-removed' : 'diff-modified';
        
        html += `<div class="diff-line ${lineClass}">`;
        html += `<div class="line-num">${diff.lineNum}</div>`;
        html += `<div class="line-content left">${escapeHtml(diff.left)}</div>`;
        html += `<div class="line-num">${diff.lineNum}</div>`;
        html += `<div class="line-content right">${escapeHtml(diff.right)}</div>`;
        html += '</div>';
    });
    
    html += '</div></div>';
    container.innerHTML = html;
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        process();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
        e.preventDefault();
        clearAll();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportDiff('txt');
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
    
    // Load from hash if present
    loadFromHash();
});