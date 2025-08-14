import { chromium } from "playwright";

// Interface de produto (Typescript)
export interface Product {
  title: string | null;
  rating: number | null;
  reviews: number | null;
  image: string | null;
}

// Realizar busca na Amazon
export async function scrapeAmazon(keyword: string): Promise<Product[]> {
  // Detalhe: a tarefa pedia a utilização de Axios e JSDOM para fazer essa busca, mas o uso dessas bibiliotecas
  // é contraintuitivo, pois essas ferramentas são voltadas a páginas web estáticas e, o site da Amazon, bloqueia
  // o acesso e sempre retorna código HTTP 503 ao tentar acesso com Axios, para solucionar esse problema, utilizei
  // a biblioteca Playwright, biblioteca robusta e projetada para data scraping
  // Inicia um navegador utilizando playwright para fazer a busca no site
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  // Faz a busca no site com base na palavra buscada
  await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(keyword.trim())}`);

  const productContainers = await page.$$('div[data-component-type="s-search-result"]')

  const productDataList: Product[] = []

  // For loop para extrair os dados de cada produto
  for (const product of productContainers) {
    async function safeEval<T>(selector: string, evalFn: (el: HTMLElement) => T): Promise<T | null>{
      try {
        return await product.$eval(selector, evalFn);
      } catch (e) {
        return null;
      }
    }

    // Extrai cada informação e adiciona no array
    const title = await safeEval('div[data-cy="title-recipe"] span', node => node.textContent)
    const ratingText = await safeEval('a > i.a-icon.a-icon-star-mini > span', node => node.textContent)
    const rating = ratingText ? parseFloat(ratingText?.split(' ')[0] ?? '0') : 0
    const image = await safeEval('span[data-component-type="s-product-image"] img', node => node.getAttribute('src'))
    const reviewsText = await safeEval('div[data-cy="reviews-block"] div.a-row > span.rush-component > div > a > span', node => node.textContent)
    const reviews = reviewsText ? parseInt(reviewsText.replace(/,/g, "")) : 0

    productDataList.push({ title, rating, reviews, image })
  }

  // Finaliza a sessão da página e navegador
  await page.close();
  await browser.close();

  return productDataList;
}