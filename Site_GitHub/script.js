// Header scroll effect
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Intersection Observer for Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
animatedElements.forEach(el => observer.observe(el));

// ---- Product Carousel Logic ----
function initCarousels() {
    document.querySelectorAll('.product-carousel').forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let current = 0;

        function goTo(index) {
            slides[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = index;
            slides[current].classList.add('active');
            dots[current].classList.add('active');
        }

        // Arrow buttons
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (current - 1 + slides.length) % slides.length;
                goTo(newIndex);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (current + 1) % slides.length;
                goTo(newIndex);
            });
        }

        // Dot navigation
        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goTo(i);
            });
        });

        // Touch/swipe support
        let touchStartX = 0;
        let isMultiTouch = false;

        carousel.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                isMultiTouch = true;
            } else {
                isMultiTouch = false;
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                isMultiTouch = true;
            }
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            if (isMultiTouch) {
                isMultiTouch = false;
                return;
            }
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) {
                    const newIndex = (current + 1) % slides.length;
                    goTo(newIndex);
                } else {
                    const newIndex = (current - 1 + slides.length) % slides.length;
                    goTo(newIndex);
                }
            }
        }, { passive: true });

        // Initialize first slide
        goTo(0);
    });
}

// Image Zoom Lightbox Feature
const modal = document.getElementById("imageModal");
const expandedImg = document.getElementById("expandedImg");
const closeBtn = document.getElementsByClassName("close")[0];
const modalPrevBtn = document.querySelector('.modal-prev');
const modalNextBtn = document.querySelector('.modal-next');

let currentModalImages = [];
let currentModalIndex = 0;

if (modal && expandedImg && closeBtn) {
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.carousel-slide.active img:not(.placeholder-img)');
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        const isSmallScreen = window.innerWidth < 768;

        // O usuário solicitou que, com um toque, a imagem seja ampliada em qualquer dispositivo.
        if (img && !img.classList.contains('placeholder-img')) {
            modal.style.display = "block";
            expandedImg.src = img.src;
            document.body.style.overflow = "hidden";
            
            // Coleta todas as imagens do carrossel atual para navegação
            const carousel = img.closest('.product-carousel');
            if(carousel) {
                const slides = Array.from(carousel.querySelectorAll('.carousel-slide img:not(.placeholder-img)'));
                currentModalImages = slides.map(s => s.src);
                currentModalIndex = currentModalImages.indexOf(img.src);
                if(currentModalIndex === -1) currentModalIndex = 0;
            }
        }
    });

    closeBtn.onclick = function () {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    }
    
    // Navegação pelas setas dentro do zoom
    if (modalPrevBtn && modalNextBtn) {
        const prevImage = (e) => {
            if(e) e.stopPropagation();
            if(currentModalImages.length > 0) {
                currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
                expandedImg.src = currentModalImages[currentModalIndex];
            }
        };

        const nextImage = (e) => {
            if(e) e.stopPropagation();
            if(currentModalImages.length > 0) {
                currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
                expandedImg.src = currentModalImages[currentModalIndex];
            }
        };

        modalPrevBtn.onclick = prevImage;
        modalNextBtn.onclick = nextImage;

        // Navegação pelo teclado (setas direita/esquerda)
        document.addEventListener('keydown', (e) => {
            // Apenas interceptar e trocar foto se o modal de zoom estiver aberto
            if (modal.style.display === "block") {
                if (e.key === 'ArrowLeft') {
                    prevImage();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                } else if (e.key === 'Escape') {
                    modal.style.display = "none";
                    document.body.style.overflow = "auto";
                }
            }
        });
    }
}
// ---- Carrinho de Orçamento ----
let carrinho = [];

function adicionarAoOrcamento(nomeProduto, qtdPadrao) {
    // Verifica se já existe
    const existe = carrinho.find(item => item.nome === nomeProduto);
    if (existe) {
        abrirCarrinho();
        return;
    }

    carrinho.push({ nome: nomeProduto, qtd: qtdPadrao || 500, passo: qtdPadrao || 500 });
    atualizarCarrinhoUI();

    // Feedback visual no botão
    const btns = document.querySelectorAll('.btn-comprar');
    btns.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(nomeProduto.substring(0, 20))) {
            btn.classList.add('added');
            btn.textContent = '✓ Adicionado';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.textContent = 'Fazer Orçamento';
            }, 2000);
        }
    });

    // Abrir o carrinho automaticamente
    abrirCarrinho();
}

function removerDoOrcamento(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
    if (carrinho.length === 0) fecharCarrinho();
}

let repeatTimer;

function iniciarAutoRepeticao(index, delta) {
    pararAutoRepeticao();
    alterarQtd(index, delta);
    
    repeatTimer = setTimeout(() => {
        repeatTimer = setInterval(() => {
            alterarQtd(index, delta);
        }, 200); /* Velocidade diminuída: antes era 80ms */
    }, 450);
}

function pararAutoRepeticao() {
    clearTimeout(repeatTimer);
    clearInterval(repeatTimer);
}

function alterarQtd(index, delta) {
    const item = carrinho[index];
    item.qtd = Math.max(item.passo, item.qtd + delta);
    
    // Atualização rápida apenas do valor e do rodapé para evitar re-renderizar a lista toda e perder o foco/clique
    const inputs = document.querySelectorAll('.cart-qty-input');
    if (inputs[index]) {
        inputs[index].value = item.qtd;
    }
    
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = carrinho.length;
}

function definirQtd(index, valor) {
    const item = carrinho[index];
    let n = parseInt(valor);
    if (isNaN(n) || n < item.passo) n = item.passo; // Previne quantidade menor do que a mínima
    item.qtd = n;
    
    const inputs = document.querySelectorAll('.cart-qty-input');
    if (inputs[index]) {
        inputs[index].value = item.qtd;
    }
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = carrinho.length;
}

function atualizarCarrinhoUI() {
    const container = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty');
    const footer = document.getElementById('cart-footer');
    const fab = document.getElementById('cart-fab');
    const countEl = document.getElementById('cart-count');
    const totalCount = document.getElementById('cart-total-count');

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="cart-empty" id="cart-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                <p>Nenhum produto selecionado</p>
                <small>Clique em "Fazer Orçamento" em qualquer produto</small>
            </div>`;
        footer.style.display = 'none';
        if (fab) fab.style.display = 'none';
        if (countEl) countEl.style.display = 'none';
        return;
    }


    let html = '';
    carrinho.forEach((item, i) => {
        html += `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.nome}</div>
                <div class="cart-item-controls">
                    <button class="cart-qty-btn" 
                        onmousedown="iniciarAutoRepeticao(${i}, -${item.passo})" 
                        onmouseup="pararAutoRepeticao()" 
                        onmouseleave="pararAutoRepeticao()"
                        ontouchstart="iniciarAutoRepeticao(${i}, -${item.passo})"
                        ontouchend="pararAutoRepeticao()">−</button>
                    <input type="number" inputmode="numeric" class="cart-qty-input" value="${item.qtd}" min="${item.passo}" step="${item.passo}" onchange="definirQtd(${i}, this.value)" title="Digite a quantidade">
                    <button class="cart-qty-btn" 
                        onmousedown="iniciarAutoRepeticao(${i}, ${item.passo})" 
                        onmouseup="pararAutoRepeticao()" 
                        onmouseleave="pararAutoRepeticao()"
                        ontouchstart="iniciarAutoRepeticao(${i}, ${item.passo})"
                        ontouchend="pararAutoRepeticao()">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removerDoOrcamento(${i})" title="Remover">✕</button>
        </div>`;
    });

    container.innerHTML = html;
    footer.style.display = 'block';
    fab.style.display = 'flex';
    countEl.style.display = 'flex';
    countEl.textContent = carrinho.length;
    totalCount.textContent = carrinho.length + ' produto(s)';
    
    renderizarPacotesCarrinho();
}

function renderizarPacotesCarrinho() {
    const pkgContainer = document.getElementById('cart-packages');
    if (!pkgContainer) return;
    
    pkgContainer.innerHTML = '';
    
    // Coordenadas fixas detalhadas para formar uma verdadeira "pilha" que:
    // 1. Centraliza perfeitamente dentro do cesto 
    // 2. Fica distante das rodinhas (que estão no Y 36~40)
    // 3. Transborda ligeiramente pela boca superior do carrinho
    const posicoes = [
        // Base - Subindo mais 2px conforme solicitado (Top ~25.5)
        { t: 25.5, l: 24,   r: -5, z: 2 },
        { t: 25.5, l: 27.5, r:  2, z: 1 },
        { t: 25,   l: 31,   r:  8, z: 3 },
        // Meio (Top ~21.5)
        { t: 21.5, l: 22.5, r: -8, z: 4 },
        { t: 22,   l: 26,   r: -2, z: 2 },
        { t: 21.5, l: 29.5, r:  5, z: 4 },
        { t: 21,   l: 33,   r: 12, z: 1 },
        // Topo da cesta (Top ~17.5)
        { t: 17.5, l: 25,   r: -4, z: 5 },
        { t: 18,   l: 29,   r:  6, z: 3 },
        // Uma caixa extra transbordando acima visualmente
        { t: 14,   l: 27,   r: 15, z: 6 }
    ];
    
    posicoes.forEach((pos) => {
        const pkg = document.createElement('div');
        pkg.className = 'cart-pkg cart-pkg-box';
        
        pkg.style.left = `${pos.l}px`;
        pkg.style.top = `${pos.t}px`;
        pkg.style.setProperty('--rot', `${pos.r}deg`);
        pkg.style.zIndex = pos.z;
        
        pkgContainer.appendChild(pkg);
    });
}

function abrirCarrinho() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-panel').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function fecharCarrinho() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-panel').classList.remove('open');
    document.body.style.overflow = 'auto';
}

function enviarOrcamentoWhats() {
    if (carrinho.length === 0) return;

    let msg = 'Olá! Gostaria de solicitar o orçamento dos seguintes produtos:\n\n';
    carrinho.forEach((item, i) => {
        msg += `${i + 1}. ${item.nome} — ${item.qtd.toLocaleString('pt-BR')} unidades\n`;
    });
    msg += '\nAguardo retorno com valores. Obrigado!';

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5583988317362?text=${encoded}`, '_blank');
}

// Init everything after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initCarousels();
    lucide.createIcons();
    renderizarPacotesCarrinho(); // Garante o visual cheio desde o início
});
