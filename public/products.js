window.addEventListener('DOMContentLoaded', () => {
  const categoryFilters = document.getElementById('categoryFilters');
  const productGrid = document.getElementById('productGrid');
  const catalogNotice = document.getElementById('catalogNotice');

  let allProducts = [];
  let activeCategory = 'All';

  const renderFilterButtons = (categories) => {
    categoryFilters.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'category-button active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => { setCategory('All'); });
    categoryFilters.appendChild(allBtn);

    categories.sort((a, b) => a.localeCompare(b)).forEach(category => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-button';
      btn.textContent = category;
      btn.addEventListener('click', () => { setCategory(category); });
      categoryFilters.appendChild(btn);
    });
  };

  const setCategory = (category) => {
    activeCategory = category;
    document.querySelectorAll('.category-button').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === category);
    });
    renderProducts(allProducts.filter(product => category === 'All' || (product.category || 'Uncategorized') === category));
  };

  const renderProducts = (products) => {
    productGrid.innerHTML = '';
    if (!products || products.length === 0) {
      catalogNotice.textContent = 'No products found for this category.';
      return;
    }
    catalogNotice.textContent = '';

    products.forEach(product => {
      const item = document.createElement('article');
      item.className = 'collection-card catalog-item-card';
      item.innerHTML = `
        <div class="card-image" style="background-image: url('${product.imageUrl || 'assets/cakefront.png'}');"></div>
        <h3>${product.name}</h3>
        <p>${product.description || 'No description provided.'}</p>
      `;
      productGrid.appendChild(item);
    });
  };

  const loadProducts = async () => {
    categoryFilters.innerHTML = '';
    productGrid.innerHTML = '';
    catalogNotice.textContent = 'Loading live catalog…';
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) {
        catalogNotice.textContent = `Catalog load failed: ${json.error}`;
        return;
      }
      allProducts = json.products || [];
      const categories = Array.from(new Set(allProducts.map(p => (p.category || 'Uncategorized').trim()))).filter(Boolean);
      renderFilterButtons(categories);
      setCategory('All');
    } catch (err) {
      catalogNotice.textContent = `Catalog load error: ${err.message}`;
    }
  };

  loadProducts();
});
