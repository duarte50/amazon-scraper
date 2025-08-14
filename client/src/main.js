import './style.css'

const app = document.querySelector("#app");

app.innerHTML = `
  <main>
    <h1>Amazon Scraper</h1>
    <p>Digite uma palavra para buscar por produtos</p>
    <div>
      <input type="text" id="keyword">
      <button id="search">Pesquisar</button>
    </div>
    <div id="status" class="status"></div>
    <section id="results" class="grid"></section>
  </main>
`

// Elementos utilizados na página
const keyword = document.querySelector("#keyword");
const search = document.querySelector("#search");
const status = document.querySelector("#status");
const results = document.querySelector("#results");

// Renderiza os produtos retornados pela API
function renderProducts(data) {
  const items = data.results;
  
  results.innerHTML = items.length
    ? items.map(p => `
      <article class="card">
        ${p.image ? `<img loading="lazy" src="${p.image}" alt="${p.title.replace(/"/g,'&quot;')}">` : ''}
        <h3 title="${p.title.replace(/"/g,'&quot;')}">${p.title}</h3>
        <div class="meta">
          <span class="badge">Nota: ${p.rating !== null ? p.rating.toFixed(1) + '★' : '—'}</span>
          <span class="badge">Reviews: ${Number.isFinite(p.reviews) ? p.reviews.toLocaleString() : '—'}</span>
        </div>
      </article>`).join('')
    : `<p class="muted">Nenhum resultado encontrado</p>`;
}

// Função que busca os produtos na API
async function fetchData(searchKeyword) {
  status.textContent = 'Carregando...';
  results.innerHTML = '';
  try {
    const res = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(searchKeyword)}`);
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    const data = await res.json();
    status.textContent = `Encontrou ${data.count} itens em "${data.keyword}"`;
    renderProducts(data);
  } catch (err) {
    status.innerHTML = `<span class="error">${err.message || 'Erro na busca'}</span>`;
  }
}

search.addEventListener('click', () => {
  const finalKeyword = keyword.value.trim();
  if (!finalKeyword) {
    status.innerHTML = '<span class="error">Por favor, digite uma palavra chave</span>';
    return;
  }
  fetchData(finalKeyword);
});

keyword.addEventListener('keydown', e => {
  if (e.key === 'Enter') search.click();
});
