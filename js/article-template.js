// ===============================================
// CARGAR NAVBAR Y FOOTER
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

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('navbar-container', 'includes/navbar.html');
    await loadComponent('footer-container', 'includes/footer.html');
    
    // Inicializar funcionalidades del artículo
    generateTableOfContents();
    setupProgressBar();
    setupScrollHighlight();
});

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
// TABLA DE CONTENIDOS DINÁMICA
// ===============================================

function generateTableOfContents() {
    const articleContent = document.querySelector('.article-content');
    const tocNav = document.getElementById('toc-nav');
    
    if (!articleContent || !tocNav) return;
    
    // Obtener todos los h2 y h3
    const headings = articleContent.querySelectorAll('h2, h3');
    
    if (headings.length === 0) return;
    
    let currentLevel = 0;
    let ul = null;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        
        // Asegurar que cada encabezado tiene un ID
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // Crear elemento de lista
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.classList.add('toc-link');
        li.appendChild(a);
        
        // Manejar niveles (h2 vs h3)
        if (level === 2) {
            if (currentLevel === 3) {
                // Volver a nivel 2
                currentLevel = 2;
            } else if (currentLevel === 0) {
                // Primer h2
                ul = document.createElement('ul');
                tocNav.appendChild(ul);
                currentLevel = 2;
            }
            ul.appendChild(li);
        } else if (level === 3) {
            if (currentLevel === 2) {
                // Crear ul anidado para h3
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
            const sectionHeight = section.clientHeight;
            
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
// CALCULAR Y MOSTRAR TIEMPO DE LECTURA
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const readingTimeElement = document.getElementById('readingTime');
    
    if (readingTimeElement) {
        const articleText = document.querySelector('.article-content')?.innerText || '';
        const wordCount = articleText.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Promedio 200 palabras por minuto
        
        readingTimeElement.textContent = `${readingTime} minuto${readingTime !== 1 ? 's' : ''} de lectura`;
    }
});

// ===============================================
// SUAVIZAR SCROLL
// ===============================================

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
