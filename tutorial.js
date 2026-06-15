// Interactive Tutorial for Diff Checker
// Guided walkthrough for new users

const Tutorial = {
    steps: [
        {
            id: 'welcome',
            title: '👋 Welcome to Diff Checker!',
            content: 'Let me show you around. This tool helps you compare two texts or files side by side.',
            target: 'h1',
            position: 'bottom',
            action: null
        },
        {
            id: 'left-input',
            title: '📄 Original Text',
            content: 'Paste your original text here. You can also upload a file using the 📁 button.',
            target: '#leftInput',
            position: 'right',
            action: () => {
                document.getElementById('leftInput').value = `function greet(name) {
    console.log("Hello, " + name);
}`;
                document.getElementById('leftInput').dispatchEvent(new Event('input'));
            }
        },
        {
            id: 'right-input',
            title: '📝 Modified Text',
            content: 'Paste your modified version here. We\'ll compare it with the original.',
            target: '#rightInput',
            position: 'left',
            action: () => {
                document.getElementById('rightInput').value = `function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return true;
}`;
                document.getElementById('rightInput').dispatchEvent(new Event('input'));
            }
        },
        {
            id: 'options',
            title: '⚙️ Compare Options',
            content: 'Customize how comparisons work. Try "Char-level diff" to see exact character changes!',
            target: '.options',
            position: 'bottom',
            action: null
        },
        {
            id: 'compare-btn',
            title: '🔍 Ready to Compare?',
            content: 'Click this button or press Ctrl+Enter to see the differences!',
            target: '.compare-btn',
            position: 'top',
            action: null
        },
        {
            id: 'results',
            title: '📊 Understanding Results',
            content: 'Green = added, Red = removed, Yellow = modified. Click any line number to copy it!',
            target: '#diffOutput',
            position: 'top',
            action: () => {
                // Trigger comparison if not already done
                if (typeof process === 'function') process();
            }
        },
        {
            id: 'export',
            title: '📤 Export & Share',
            content: 'Export your diff as text, JSON, or HTML. You can also save sessions for later!',
            target: '#exportSection',
            position: 'top',
            action: () => {
                document.getElementById('exportSection').style.display = 'block';
            }
        },
        {
            id: 'shortcuts',
            title: '⌨️ Keyboard Shortcuts',
            content: 'Press "?" anytime to see all shortcuts. Try Ctrl+T to toggle themes!',
            target: 'footer',
            position: 'top',
            action: null
        },
        {
            id: 'complete',
            title: '🎉 You\'re All Set!',
            content: 'That\'s the basics! The URL also auto-updates so you can share your diff. Happy comparing!',
            target: 'h1',
            position: 'bottom',
            action: null
        }
    ],
    
    currentStep: 0,
    isActive: false,
    overlay: null,
    tooltip: null,
    
    init() {
        // Check if user has seen tutorial
        if (localStorage.getItem('tutorial-completed')) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            setTimeout(() => this.start(), 500);
        }
    },
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.currentStep = 0;
        
        this.createOverlay();
        this.createTooltip();
        this.showStep(0);
    },
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.innerHTML = `
            <div class="tutorial-backdrop"></div>
            <div class="tutorial-spotlight"></div>
        `;
        document.body.appendChild(this.overlay);
    },
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tutorial-tooltip';
        this.tooltip.className = 'tutorial-tooltip';
        this.tooltip.innerHTML = `
            <div class="tutorial-header">
                <span class="tutorial-progress">Step <span class="current">1</span> of <span class="total">${this.steps.length}</span></span>
                <button class="tutorial-close" onclick="Tutorial.end()" title="Skip tutorial">&times;</button>
            </div>
            <div class="tutorial-content">
                <h3 class="tutorial-title"></h3>
                <p class="tutorial-text"></p>
            </div>
            <div class="tutorial-actions">
                <button class="tutorial-btn tutorial-skip" onclick="Tutorial.end()">Skip</button>
                <button class="tutorial-btn tutorial-prev" onclick="Tutorial.prev()" style="display:none">Previous</button>
                <button class="tutorial-btn tutorial-next primary" onclick="Tutorial.next()">Next</button>
            </div>
        `;
        document.body.appendChild(this.tooltip);
    },
    
    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }
        
        this.currentStep = index;
        const step = this.steps[index];
        
        // Run action if defined
        if (step.action) step.action();
        
        // Find target element
        const target = document.querySelector(step.target);
        if (!target) {
            // Skip to next if element not found
            this.next();
            return;
        }
        
        // Highlight target
        this.highlightElement(target);
        
        // Update tooltip content
        this.tooltip.querySelector('.current').textContent = index + 1;
        this.tooltip.querySelector('.tutorial-title').textContent = step.title;
        this.tooltip.querySelector('.tutorial-text').textContent = step.content;
        
        // Update buttons
        const prevBtn = this.tooltip.querySelector('.tutorial-prev');
        const nextBtn = this.tooltip.querySelector('.tutorial-next');
        
        prevBtn.style.display = index > 0 ? 'inline-block' : 'none';
        nextBtn.textContent = index === this.steps.length - 1 ? 'Finish! 🎉' : 'Next →';
        
        // Position tooltip
        this.positionTooltip(target, step.position);
        
        // Scroll into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    
    highlightElement(element) {
        const rect = element.getBoundingClientRect();
        const spotlight = this.overlay.querySelector('.tutorial-spotlight');
        const padding = 8;
        
        spotlight.style.cssText = `
            position: fixed;
            top: ${rect.top - padding}px;
            left: ${rect.left - padding}px;
            width: ${rect.width + padding * 2}px;
            height: ${rect.height + padding * 2}px;
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
            pointer-events: none;
            z-index: 9998;
            transition: all 0.3s ease;
        `;
    },
    
    positionTooltip(target, position) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const margin = 16;
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - margin;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + margin;
                break;
        }
        
        // Keep within viewport
        const maxLeft = window.innerWidth - tooltipRect.width - margin;
        const maxTop = window.innerHeight - tooltipRect.height - margin;
        
        left = Math.max(margin, Math.min(left, maxLeft));
        top = Math.max(margin, Math.min(top, maxTop));
        
        this.tooltip.style.cssText = `
            position: fixed;
            top: ${top}px;
            left: ${left}px;
            z-index: 9999;
        `;
    },
    
    next() {
        this.showStep(this.currentStep + 1);
    },
    
    prev() {
        this.showStep(this.currentStep - 1);
    },
    
    end() {
        this.isActive = false;
        if (this.overlay) this.overlay.remove();
        if (this.tooltip) this.tooltip.remove();
        localStorage.setItem('tutorial-completed', 'true');
        
        // Show toast
        if (typeof showToast === 'function') {
            showToast('💡 Tip: Press "?" anytime for help');
        }
    },
    
    complete() {
        this.end();
        localStorage.setItem('tutorial-completed', 'true');
        
        // Confetti effect
        this.celebrate();
    },
    
    celebrate() {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    pointer-events: none;
                    z-index: 10000;
                    animation: confetti-fall ${1 + Math.random()}s ease-out forwards;
                `;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 2000);
            }, i * 30);
        }
    },
    
    // Allow restarting tutorial
    restart() {
        localStorage.removeItem('tutorial-completed');
        this.start();
    }
};

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Auto-init on load
Tutorial.init();

// Expose to global scope
window.Tutorial = Tutorial;
