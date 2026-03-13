document.addEventListener('DOMContentLoaded', () => {
    const checklistEl = document.getElementById('checklist');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const resetBtn = document.getElementById('reset-btn');
    
    let checklistData = [];
    const STORAGE_KEY = 'wj_beta_checklist_progress';

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Could not load data.json');
            return response.json();
        })
        .then(data => {
            checklistData = data;
            renderChecklist();
        })
        .catch(error => {
            console.error(error);
            checklistEl.innerHTML = '<li class="checklist-item"><span class="item-text" style="color:var(--danger-color)">Error loading checklist. Note: If opening locally directly from a file:// URL, fetch may be blocked by CORS. Please use a local server or GitHub Pages.</span></li>';
        });

    function getSavedProgress() {
        const saved = localStorage.getItem(STORAGE_KEY);
        try { return saved ? JSON.parse(saved) : {}; }
        catch (e) { return {}; }
    }

    function saveProgress(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function updateProgress() {
        const state = getSavedProgress();
        const total = checklistData.length;
        if (total === 0) return;
        
        let completed = 0;
        checklistData.forEach(item => {
            if (state[item.id]) completed++;
        });

        const percentage = (completed / total) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${completed} / ${total} completed`;
    }

    function renderChecklist() {
        checklistEl.innerHTML = '';
        const state = getSavedProgress();

        if (checklistData.length === 0) {
            checklistEl.innerHTML = '<li class="checklist-item"><span class="item-text">Checklist is empty. Add tasks to data.json.</span></li>';
            return;
        }

        checklistData.forEach((item, index) => {
            const isChecked = !!state[item.id];
            
            const li = document.createElement('li');
            li.className = `checklist-item ${isChecked ? 'completed' : ''}`;
            li.style.animationDelay = `${index * 0.05}s`;

            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="check-${item.id}" class="checkbox" ${isChecked ? 'checked' : ''}>
                    <div class="checkbox-custom"></div>
                </div>
                <label for="check-${item.id}" class="item-text">${item.label}</label>
            `;

            li.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
                    const checkbox = li.querySelector('.checkbox');
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });

            const checkbox = li.querySelector('.checkbox');
            checkbox.addEventListener('change', (e) => {
                const currentState = getSavedProgress();
                currentState[item.id] = e.target.checked;
                saveProgress(currentState);
                
                if (e.target.checked) li.classList.add('completed');
                else li.classList.remove('completed');
                
                updateProgress();
            });

            checklistEl.appendChild(li);
        });

        updateProgress();
    }

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your progress?')) {
            localStorage.removeItem(STORAGE_KEY);
            renderChecklist();
        }
    });
});
