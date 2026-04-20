// ===============================================
// VARIABLES GLOBALES
// ===============================================

let allArticles = [];
let selectedTags = [];

// ===============================================
// CARGAR COMPONENTES REUTILIZABLES
// ===============================================

async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error cargando ${filePath}:`, error);
    }
}

// Cargar navbar y footer
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('navbar-container', 'includes/navbar.html');
    await loadComponent('footer-container', 'includes/footer.html');
    await loadArticles();
});

// ===============================================
// CARGAR Y RENDERIZAR ARTÍCULOS
// ===============================================

async function loadArticles() {
    try {
        const response = await fetch('articles/articles.json');
        allArticles = await response.json();
        
        // Ordenar por fecha descendente
        allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderArticles(allArticles);
        renderTags();
    } catch (error) {
        console.error('Error cargando artículos:', error);
    }
}

function renderArticles(articlesToRender) {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';

    if (articlesToRender.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hay artículos con las etiquetas seleccionadas.</p></div>';
        return;
    }

    articlesToRender.forEach(article => {
        const articleElement = createArticleCard(article);
        container.appendChild(articleElement);
    });
}

function createArticleCard(article) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const tagsHtml = article.tags
        .map(tag => `<span class="tag-badge">${tag}</span>`)
        .join('');

    const formattedDate = formatDate(article.date);

    col.innerHTML = `
        <a href="${article.url}" class="article-card-link">
            <div class="article-card">
                <h3>${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="mb-2">
                    ${tagsHtml}
                </div>
                <div class="article-meta">
                    <span class="article-author">${article.author}</span>
                    <span class="article-date">${formattedDate}</span>
                </div>
            </div>
        </a>
    `;

    return col;
}

// ===============================================
// RENDERIZAR Y FILTRAR ETIQUETAS
// ===============================================

function renderTags() {
    const tagsSet = new Set();
    
    allArticles.forEach(article => {
        article.tags.forEach(tag => tagsSet.add(tag));
    });

    const tagsContainer = document.getElementById('tags-container');
    tagsContainer.innerHTML = '<button class="tag-badge active" onclick="clearFilter()">Todas</button>';

    tagsSet.forEach(tag => {
        const tagElement = document.createElement('button');
        tagElement.className = 'tag-badge';
        tagElement.textContent = tag;
        tagElement.onclick = () => filterByTag(tag);
        tagsContainer.appendChild(tagElement);
    });
}

function filterByTag(tag) {
    selectedTags = [tag];
    updateTagsUI();
    
    const filtered = allArticles.filter(article => 
        article.tags.includes(tag)
    );
    
    renderArticles(filtered);
}

function clearFilter() {
    selectedTags = [];
    updateTagsUI();
    renderArticles(allArticles);
}

function updateTagsUI() {
    const tagBadges = document.querySelectorAll('.tag-badge');
    
    tagBadges.forEach(badge => {
        if (badge.textContent === 'Todas') {
            badge.classList.toggle('active', selectedTags.length === 0);
        } else {
            badge.classList.toggle('active', selectedTags.includes(badge.textContent));
        }
    });
}

// ===============================================
// UTILIDADES
// ===============================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}

// ===============================================
// BÚSQUEDA DE ARTÍCULOS
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Agregar event listener al formulario de búsqueda
    setTimeout(() => {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        
        if (searchForm) {
            searchForm.addEventListener('submit', handleSearch);
        }
        
        if (searchInput) {
            // Búsqueda en tiempo real mientras escribes
            searchInput.addEventListener('input', handleLiveSearch);
        }
    }, 500);
});

function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query === '') {
        clearFilter();
        return;
    }
    
    performSearch(query);
}

function handleLiveSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    if (query === '') {
        renderArticles(allArticles);
        return;
    }
    
    performSearch(query);
}

function performSearch(query) {
    const filtered = allArticles.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(query);
        const excerptMatch = article.excerpt.toLowerCase().includes(query);
        const contentMatch = article.content.toLowerCase().includes(query);
        const authorMatch = article.author.toLowerCase().includes(query);
        const tagsMatch = article.tags.some(tag => tag.toLowerCase().includes(query));
        
        return titleMatch || excerptMatch || contentMatch || authorMatch || tagsMatch;
    });
    
    renderArticles(filtered);
}
