const cardContainer = document.querySelector("#card-grid");
const inputBusca = document.querySelector("#input-busca");
const backToTopButton = document.querySelector("#back-to-top");
const botaoBusca = document.querySelector("#botao-busca");
const filterButtonsContainer = document.querySelector("#filter-buttons");

let dados = [];
let filtroAtivo = 'todos';
let debounceTimeout;

document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    carregarDados();
}

function setupEventListeners() {
    setupSearch();
    setupFilters();
    setupBackToTopButton();
}

function setupSearch() {
    if (inputBusca) {
        inputBusca.addEventListener('input', handleSearchInput);
    }
    if (botaoBusca) {
        botaoBusca.addEventListener('click', renderizarResultados);
    }
}

function setupFilters() {
    if (!filterButtonsContainer) return;

    filterButtonsContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            filtroAtivo = event.target.dataset.filter;
            renderizarResultados();
        }
    });
}

function setupBackToTopButton() {
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function handleSearchInput() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        renderizarResultados();
    }, 300);
}

async function carregarDados() {
    try {
        const resposta = await fetch('data.json');
        if (!resposta.ok) {
            throw new Error(`Erro HTTP! status: ${resposta.status}`);
        }
        dados = await resposta.json();
        renderizarCards(dados);
        criarBotoesDeFiltro();
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
        if (cardContainer) {
            cardContainer.innerHTML = '<p class="status-message">Erro ao carregar os filmes. Tente novamente mais tarde.</p>';
        }
    }
}

function criarBotoesDeFiltro() {
    if (!filterButtonsContainer) return;

    const tipos = ['todos', ...new Set(dados.map(item => item.tipo))];
    filterButtonsContainer.innerHTML = '';

    tipos.forEach(tipo => {
        const button = document.createElement('button');
        button.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        button.dataset.filter = tipo;
        if (tipo === 'todos') {
            button.classList.add('active');
        }
        filterButtonsContainer.appendChild(button);
    });
}
function renderizarResultados() {
    const termoBusca = inputBusca.value.toLowerCase();
    
    let dadosFiltrados = dados;

    // 1. Aplica o filtro de tipo
    if (filtroAtivo !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(item => item.tipo === filtroAtivo);
    }

    if (termoBusca) {
        dadosFiltrados = dadosFiltrados.filter(item =>
            item.nome.toLowerCase().includes(termoBusca) ||
            item.descricao.toLowerCase().includes(termoBusca)
        );
    }

    renderizarCards(dadosFiltrados);
}

function renderizarCards(dadosParaRenderizar) {
    if (!cardContainer) {
        console.error("Erro: O container de cards não foi encontrado no HTML.");
        return;
    }
    cardContainer.innerHTML = "";

    if (dadosParaRenderizar.length === 0) {
        if (inputBusca.value) {
            cardContainer.innerHTML = '<p class="status-message">Nenhum resultado encontrado para sua busca.</p>';
        } else {
            cardContainer.innerHTML = `<p class="status-message">Nenhum item do tipo "${filtroAtivo}" encontrado.</p>`;
        }
        return;
    }

    const cardsHTML = dadosParaRenderizar.map(dado => `
        <a href="${dado.link}" target="_blank" class="card-link">
            <article class="card">
                <img src="${dado.imagem}" alt="Pôster de ${dado.nome}" loading="lazy">
                <div class="card-details">
                    <h2>${dado.nome}</h2>
                    <p>${dado.ano}</p>
                    <p>${dado.descricao}</p>
                </div>
            </article>
        </a>
    `).join('');

    cardContainer.innerHTML = cardsHTML;
}
