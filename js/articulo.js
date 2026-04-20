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

// ===============================================
// CARGAR Y RENDERIZAR ARTÍCULO
// ===============================================

async function initializeArticle() {
    await loadComponent('navbar-container', 'includes/navbar.html');
    await loadComponent('footer-container', 'includes/footer.html');
    
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id'));
    
    if (!articleId) {
        document.getElementById('article-content').innerHTML = '<p class="text-danger">No se especificó artículo.</p>';
        return;
    }
    
    await loadArticle(articleId);
}

async function loadArticle(articleId) {
    try {
        const response = await fetch('articles/articles.json');
        const articles = await response.json();
        const article = articles.find(a => a.id === articleId);
        
        if (!article) {
            document.getElementById('article-content').innerHTML = '<p class="text-danger">Artículo no encontrado.</p>';
            return;
        }
        
        renderArticle(article);
        
        // Esperar a que el DOM esté actualizado
        setTimeout(() => {
            generateTableOfContents();
            setupProgressBar();
            setupScrollHighlight();
        }, 100);
        
    } catch (error) {
        console.error('Error cargando artículo:', error);
        document.getElementById('article-content').innerHTML = '<p class="text-danger">Error cargando el artículo.</p>';
    }
}

function renderArticle(article) {
    // Título y breadcrumb
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('breadcrumb-title').textContent = article.title;
    document.title = article.title + ' - Ocaso Escarlata';
    
    // Metadata
    document.getElementById('article-author').textContent = article.author;
    document.getElementById('article-date').textContent = formatDate(article.date);
    
    // Tags
    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = article.tags
        .map(tag => `<span class="tag-badge">${tag}</span>`)
        .join('');
    
    // Contenido
    const contentContainer = document.getElementById('article-content');
    let contentHTML = '';
    
    article.sections.forEach(section => {
        const headingTag = `h${section.level}`;
        contentHTML += `<${headingTag} id="${section.id}">${section.title}</${headingTag}>`;
        contentHTML += section.content;
    });
    
    contentContainer.innerHTML = contentHTML;
    
    // Tiempo de lectura
    const wordCount = contentContainer.innerText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    document.getElementById('reading-time').textContent = `${readingTime} minuto${readingTime !== 1 ? 's' : ''} de lectura`;
}

// ===============================================
// TABLA DE CONTENIDOS DINÁMICA
// ===============================================

function generateTableOfContents() {
    const articleContent = document.querySelector('.article-content');
    const tocNav = document.getElementById('toc-nav');
    
    if (!articleContent || !tocNav) return;
    
    const headings = articleContent.querySelectorAll('h2, h3');
    
    if (headings.length === 0) return;
    
    let currentLevel = 0;
    let ul = null;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.classList.add('toc-link');
        li.appendChild(a);
        
        if (level === 2) {
            if (currentLevel === 3) {
                currentLevel = 2;
            } else if (currentLevel === 0) {
                ul = document.createElement('ul');
                tocNav.appendChild(ul);
                currentLevel = 2;
            }
            ul.appendChild(li);
        } else if (level === 3) {
            if (currentLevel === 2) {
                const subUl = document.createElement('ul');
                subUl.appendChild(li);
                ul.lastElementChild?.appendChild(subUl);
                currentLevel = 3;
            }
        }
    });
}

// ===============================================
// RESALTAR SECCIÓN ACTIVA
// ===============================================

function setupScrollHighlight() {
    const sections = document.querySelectorAll('.article-content h2, .article-content h3');
    const navLinks = document.querySelectorAll('.toc-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===============================================
// BARRA DE PROGRESO
// ===============================================

function setupProgressBar() {
    const progressBar = document.getElementById('progressBar');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrollPercent + '%';
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
// INICIALIZAR AL CARGAR
// ===============================================

document.addEventListener('DOMContentLoaded', initializeArticle);

// Suavizar scroll en links internos
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    
    e.preventDefault();
    
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});
