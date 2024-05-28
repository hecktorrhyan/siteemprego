document.addEventListener('DOMContentLoaded', function() {
    const folderForm = document.getElementById('folder-form');
    const foldersDiv = document.getElementById('folders');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter');
    const sortSelect = document.getElementById('sort');

    folderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const folderName = document.getElementById('folder-name').value.trim();
        if (folderName) {
            if (!document.getElementById(folderName)) {
                addFolder(folderName);
                saveFolder(folderName);
                folderForm.reset();
                alert('Site adicionado com sucesso!');
            } else {
                alert('Esse site já existe!');
            }
        } else {
            alert('Por favor, insira um nome de site válido.');
        }
    });

    function addFolder(folderName) {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.id = folderName;
        folderDiv.innerHTML = `
            <h2>${folderName}</h2>
            <form class="job-form" data-folder="${folderName}">
                <div class="form-group">
                    <input type="text" placeholder="Posição" required>
                    <input type="date" required>
                    <button type="submit">Adicionar Inscrição</button>
                </div>
            </form>
            <ul id="${folderName}-list"></ul>
        `;
        foldersDiv.appendChild(folderDiv);

        const jobForm = folderDiv.querySelector('.job-form');
        jobForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const position = this.querySelector('input[type="text"]').value.trim();
            const date = this.querySelector('input[type="date"]').value;
            if (position && date) {
                const job = { position, date };
                addJobToList(folderName, job);
                saveJob(folderName, job);
                this.reset();
                alert('Inscrição adicionada com sucesso!');
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }

    function saveFolder(folderName) {
        let folders = localStorage.getItem('folders') ? JSON.parse(localStorage.getItem('folders')) : [];
        if (!folders.includes(folderName)) {
            folders.push(folderName);
            localStorage.setItem('folders', JSON.stringify(folders));
        }
    }

    function loadFolders() {
        const folders = localStorage.getItem('folders') ? JSON.parse(localStorage.getItem('folders')) : [];
        folders.forEach(folder => {
            addFolder(folder);
            loadJobs(folder);
        });
    }

    function addJobToList(folderName, job) {
        const jobList = document.getElementById(`${folderName}-list`);
        const li = document.createElement('li');
        li.innerHTML = `${job.position} - ${job.date} <button onclick="removeJob(this, '${folderName}')">Remover</button>`;
        jobList.appendChild(li);
    }

    function saveJob(folderName, job) {
        let jobs = localStorage.getItem(folderName) ? JSON.parse(localStorage.getItem(folderName)) : [];
        jobs.push(job);
        localStorage.setItem(folderName, JSON.stringify(jobs));
    }

    function loadJobs(folderName) {
        const jobs = localStorage.getItem(folderName) ? JSON.parse(localStorage.getItem(folderName)) : [];
        jobs.forEach(job => addJobToList(folderName, job));
    }

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterAndSortJobs(searchTerm, filterSelect.value, sortSelect.value);
    });

    filterSelect.addEventListener('change', function() {
        filterAndSortJobs(searchInput.value.toLowerCase(), this.value, sortSelect.value);
    });

    sortSelect.addEventListener('change', function() {
        filterAndSortJobs(searchInput.value.toLowerCase(), filterSelect.value, this.value);
    });

    function filterAndSortJobs(searchTerm, filterBy, sortBy) {
        const folders = localStorage.getItem('folders') ? JSON.parse(localStorage.getItem('folders')) : [];
        folders.forEach(folder => {
            const jobList = document.getElementById(`${folder}-list`);
            jobList.innerHTML = '';
            let jobs = localStorage.getItem(folder) ? JSON.parse(localStorage.getItem(folder)) : [];
            
            if (searchTerm) {
                jobs = jobs.filter(job => job.position.toLowerCase().includes(searchTerm) || job.date.includes(searchTerm));
            }

            if (filterBy) {
                if (filterBy === 'date') {
                    jobs = jobs.filter(job => job.date.includes(searchTerm));
                } else if (filterBy === 'position') {
                    jobs = jobs.filter(job => job.position.toLowerCase().includes(searchTerm));
                }
            }

            if (sortBy) {
                jobs = jobs.sort((a, b) => {
                    if (sortBy === 'date-asc') {
                        return new Date(a.date) - new Date(b.date);
                    } else if (sortBy === 'date-desc') {
                        return new Date(b.date) - new Date(a.date);
                    } else if (sortBy === 'position-asc') {
                        return a.position.localeCompare(b.position);
                    } else if (sortBy === 'position-desc') {
                        return b.position.localeCompare(a.position);
                    }
                });
            }

            jobs.forEach(job => addJobToList(folder, job));
        });
    }

    loadFolders();
});

function removeJob(button, folderName) {
    const li = button.parentElement;
    const jobList = document.getElementById(`${folderName}-list`);
    jobList.removeChild(li);

    let jobs = localStorage.getItem(folderName) ? JSON.parse(localStorage.getItem(folderName)) : [];
    const jobIndex = Array.from(jobList.children).indexOf(li);
    jobs.splice(jobIndex, 1);
    localStorage.setItem(folderName, JSON.stringify(jobs));

    alert('Inscrição removida com sucesso!');
}
