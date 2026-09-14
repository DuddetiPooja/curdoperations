const $ = (id) => document.getElementById(id);

let editingProductId = null;

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}


function showToast(message) {
  const toast = $('toast');

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}


function showApp(user) {
  $('auth-screen').classList.add('hidden');
  $('app-screen').classList.remove('hidden');

  $('welcome-user').textContent = `Hi, ${user.username}`;

  loadDashboard();
  loadProducts();
}


function showAuth() {
  $('auth-screen').classList.remove('hidden');
  $('app-screen').classList.add('hidden');
}


async function checkSession() {
  try {
    const data = await api('/api/me');

    showApp(data.user);
  } catch (_) {
    showAuth();
  }
}


/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {
  try {
    const data = await api('/api/dashboard');

    $('total-count').textContent = data.total;
    $('available-count').textContent = data.available;
    $('out-of-stock-count').textContent = data.out_of_stock;
  } catch (error) {
    showToast(error.message);
  }
}


/* =========================
   PRODUCT BADGE
========================= */

function badgeClass(value) {
  return value.toLowerCase().replace(' ', '-');
}


/* =========================
   DISPLAY PRODUCTS
========================= */

function renderProducts(products) {

  const list = $('product-list');

  if (!products.length) {

    list.innerHTML = `
      <div class="empty">
        <h3>No products found</h3>
        <p>Add a product or change your filters.</p>
      </div>
    `;

    return;
  }


  list.innerHTML = products.map(product => `

    <article class="product-card">

      <div>

        <h3>${escapeHtml(product.name)}</h3>

        <p>
          ${escapeHtml(
            product.description || 'No description'
          )}
        </p>

        <div class="product-meta">

          <span class="badge ${badgeClass(product.category)}">
            ${product.category}
          </span>

          <span class="badge ${badgeClass(product.stock_status)}">
            ${product.stock_status}
          </span>

          <span class="badge">
            ₹${product.price}
          </span>

        </div>

      </div>


      <div class="product-actions">

        <button onclick="editProduct(${product.id})">
          Edit
        </button>

        <button onclick="removeProduct(${product.id})">
          Delete
        </button>

      </div>

    </article>

  `).join('');
}


/* =========================
   SECURITY
========================= */

function escapeHtml(text) {

  const div = document.createElement('div');

  div.textContent = text;

  return div.innerHTML;
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  try {

    const params = new URLSearchParams();


    if ($('search-input').value.trim()) {

      params.set(
        'search',
        $('search-input').value.trim()
      );

    }


    params.set(
      'category',
      $('category-filter').value
    );


    params.set(
      'stock_status',
      $('stock-filter').value
    );


    const products =
      await api(`/api/products?${params}`);


    renderProducts(products);

  } catch (error) {

    showToast(error.message);

  }
}


/* =========================
   PRODUCT MODAL
========================= */

function openModal(product = null) {

  editingProductId =
    product ? product.id : null;


  $('modal-title').textContent =
    product ? 'Edit Product' : 'Add Product';


  $('product-name').value =
    product?.name || '';


  $('product-description').value =
    product?.description || '';


  $('product-category').value =
    product?.category || 'Electronics';


  $('product-stock-status').value =
    product?.stock_status || 'Available';


  $('product-price').value =
    product?.price || '';


  $('product-modal').classList.remove('hidden');
}


function closeModal() {

  $('product-modal').classList.add('hidden');

}


/* =========================
   EDIT PRODUCT
========================= */

window.editProduct = async function(id) {

  try {

    const products =
      await api('/api/products');


    const product =
      products.find(item => item.id === id);


    if (product) {

      openModal(product);

    }

  } catch (error) {

    showToast(error.message);

  }
};


/* =========================
   DELETE PRODUCT
========================= */

window.removeProduct = async function(id) {

  if (!confirm('Delete this product?')) {
    return;
  }


  try {

    await api(`/api/products/${id}`, {
      method: 'DELETE'
    });


    showToast('Product deleted');


    loadDashboard();
    loadProducts();

  } catch (error) {

    showToast(error.message);

  }
};


/* =========================
   LOGIN
========================= */

$('login-form').addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();


    try {

      const data =
        await api('/api/login', {

          method: 'POST',

          body: JSON.stringify({

            identifier:
              $('login-identifier').value,

            password:
              $('login-password').value

          })

        });


      showApp(data.user);

      showToast('Welcome back!');

    } catch (error) {

      showToast(error.message);

    }

  }
);


/* =========================
   REGISTER
========================= */

$('register-form').addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();


    try {

      const data =
        await api('/api/register', {

          method: 'POST',

          body: JSON.stringify({

            username:
              $('register-username').value,

            email:
              $('register-email').value,

            password:
              $('register-password').value

          })

        });


      showApp(data.user);

      showToast('Account created!');

    } catch (error) {

      showToast(error.message);

    }

  }
);


/* =========================
   LOGIN / REGISTER TABS
========================= */

document
  .querySelectorAll('.tab')
  .forEach(tab => {

    tab.addEventListener(
      'click',
      () => {

        document
          .querySelectorAll('.tab')
          .forEach(item =>
            item.classList.remove('active')
          );


        tab.classList.add('active');


        const login =
          tab.dataset.auth === 'login';


        $('login-form')
          .classList.toggle(
            'hidden',
            !login
          );


        $('register-form')
          .classList.toggle(
            'hidden',
            login
          );

      }
    );

  });


/* =========================
   LOGOUT
========================= */

$('logout-btn').addEventListener(
  'click',
  async () => {

    await api('/api/logout', {
      method: 'POST'
    });


    showAuth();

    showToast('Logged out');

  }
);


/* =========================
   ADD PRODUCT
========================= */

$('add-product-btn').addEventListener(
  'click',
  () => openModal()
);


/* =========================
   CLOSE MODAL
========================= */

$('close-modal').addEventListener(
  'click',
  closeModal
);


$('cancel-btn').addEventListener(
  'click',
  closeModal
);


$('product-modal').addEventListener(
  'click',
  (event) => {

    if (
      event.target === $('product-modal')
    ) {

      closeModal();

    }

  }
);


/* =========================
   CREATE / UPDATE PRODUCT
========================= */

$('product-form').addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();


    const payload = {

      name:
        $('product-name').value,

      description:
        $('product-description').value,

      category:
        $('product-category').value,

      stock_status:
        $('product-stock-status').value,

      price:
        $('product-price').value

    };


    try {

      if (editingProductId) {

        await api(
          `/api/products/${editingProductId}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload)
          }
        );


        showToast('Product updated');

      } else {

        await api(
          '/api/products',
          {
            method: 'POST',
            body: JSON.stringify(payload)
          }
        );


        showToast('Product created');

      }


      closeModal();

      loadDashboard();
      loadProducts();

    } catch (error) {

      showToast(error.message);

    }

  }
);


/* =========================
   SEARCH
========================= */

$('search-input').addEventListener(
  'input',
  loadProducts
);


/* =========================
   CATEGORY FILTER
========================= */

$('category-filter').addEventListener(
  'change',
  loadProducts
);


/* =========================
   STOCK FILTER
========================= */

$('stock-filter').addEventListener(
  'change',
  loadProducts
);


/* =========================
   START APPLICATION
========================= */

checkSession();