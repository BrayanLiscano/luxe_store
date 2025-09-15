document.addEventListener('DOMContentLoaded', () => {
  // Productos de ejemplo (puedes reemplazarlos con datos desde una BD)
  const productos = [
    { id: 1, nombre: 'Perfume Dior Sauvage', descripcion: 'Fragancia fresca y amaderada', precio: 350000, imagen: 'https://via.placeholder.com/400x400?text=Dior+Sauvage', categoria: 'Perfume' },
    { id: 2, nombre: 'Reloj Rolex Submariner', descripcion: 'Reloj de lujo automático', precio: 25000000, imagen: 'https://via.placeholder.com/400x400?text=Rolex+Submariner', categoria: 'Reloj' },
    { id: 3, nombre: 'Perfume Chanel No.5', descripcion: 'Perfume icónico y elegante', precio: 400000, imagen: 'https://via.placeholder.com/400x400?text=Chanel+No5', categoria: 'Perfume' },
    { id: 4, nombre: 'Reloj Casio Edifice', descripcion: 'Reloj deportivo con cronómetro', precio: 800000, imagen: 'https://via.placeholder.com/400x400?text=Casio+Edifice', categoria: 'Reloj' },
    { id: 5, nombre: 'Perfume Bleu de Chanel', descripcion: 'Aromas cítricos y amaderados', precio: 380000, imagen: 'https://via.placeholder.com/400x400?text=Bleu+de+Chanel', categoria: 'Perfume' }
  ];

  // Estado del carrito
  let carrito = JSON.parse(localStorage.getItem('luxe_cart') || '[]');

  // Elementos del DOM
  const listaProductos = document.getElementById('lista-productos');
  const buscarInput = document.getElementById('buscar');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const abrirCarritoBtn = document.getElementById('abrir-carrito');
  const carritoAside = document.getElementById('carrito');
  const cerrarCarritoBtn = document.getElementById('cerrar-carrito');
  const carritoItemsEl = document.getElementById('carrito-items');
  const carritoTotalEl = document.getElementById('carrito-total');
  const cartCountEl = document.getElementById('cart-count');
  const vaciarBtn = document.getElementById('vaciar-carrito');
  const checkoutBtn = document.getElementById('checkout');
  const contactoForm = document.getElementById('contacto-form');

  // FORMATO DE PRECIOS
  function formatPrice(n){
    return '$' + Number(n).toLocaleString('es-CO', {maximumFractionDigits: 0});
  }

  // Render productos
  function renderProductos(cat = 'Todas', query = ''){
    const q = query.trim().toLowerCase();
    const lista = productos.filter(p => (cat === 'Todas' || p.categoria === cat) && (p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)));
    listaProductos.innerHTML = '';
    if(lista.length === 0){
      listaProductos.innerHTML = '<p style="color:var(--muted)">No se encontraron productos.</p>';
      return;
    }
    lista.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
        <div class="meta">
          <h3>${p.nombre}</h3>
          <div class="price">${formatPrice(p.precio)}</div>
        </div>
        <p>${p.descripcion}</p>
        <div class="actions">
          <button class="btn-small" onclick="window.viewProduct && window.viewProduct(${p.id})">Ver</button>
          <button class="btn-add" onclick="window.addToCart && window.addToCart(${p.id})">Agregar</button>
        </div>`;
      listaProductos.appendChild(card);
    });
  }

  // Render carrito
  function renderCarrito(){
    carritoItemsEl.innerHTML = '';
    if(carrito.length === 0){
      carritoItemsEl.innerHTML = '<p style="color:var(--muted)">Tu carrito está vacío.</p>';
      carritoTotalEl.textContent = 'Total: $0';
      cartCountEl.textContent = '0';
      return;
    }
    let total = 0;
    carrito.forEach(item => {
      const product = productos.find(p => p.id === item.id);
      if(!product) return;
      total += product.precio * item.cantidad;
      const div = document.createElement('div');
      div.className = 'carrito-item';
      div.innerHTML = `
        <img src="${product.imagen}" alt="${product.nombre}">
        <div class="info">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong style="color:var(--gold)">${product.nombre}</strong>
            <div class="price">${formatPrice(product.precio * item.cantidad)}</div>
          </div>
          <div class="qty-controls">
            <button class="qty-decrease" data-id="${item.id}">−</button>
            <span style="padding:0 .5rem">${item.cantidad}</span>
            <button class="qty-increase" data-id="${item.id}">+</button>
            <button class="btn-small" style="margin-left:8px" data-remove="${item.id}">Eliminar</button>
          </div>
        </div>`;
      carritoItemsEl.appendChild(div);
    });
    carritoTotalEl.textContent = 'Total: ' + formatPrice(total);
    cartCountEl.textContent = carrito.reduce((s,i) => s + i.cantidad, 0);
  }

  // Añadir al carrito
  function addToCart(id){
    const index = carrito.findIndex(i => i.id === id);
    if(index > -1){
      carrito[index].cantidad += 1;
    } else {
      carrito.push({id, cantidad:1});
    }
    saveCart();
    renderCarrito();
    // feedback elegante: temporal
    abrirCarritoBrief();
  }

  // Abrir carrito brevemente para feedback
  function abrirCarritoBrief(){
    openCart();
    setTimeout(() => {
      // no cerramos para que el usuario vea el carrito; se puede comentar si no lo quiere
    }, 600);
  }

  // Guardar
  function saveCart(){
    localStorage.setItem('luxe_cart', JSON.stringify(carrito));
  }

  // Abrir/Cerrar carrito
  function openCart(){ carritoAside.classList.add('open'); carritoAside.setAttribute('aria-hidden','false'); }
  function closeCart(){ carritoAside.classList.remove('open'); carritoAside.setAttribute('aria-hidden','true'); }
  function toggleCart(){ carritoAside.classList.toggle('open'); carritoAside.setAttribute('aria-hidden', carritoAside.classList.contains('open') ? 'false' : 'true'); }

  // Cambiar cantidad o eliminar
  carritoItemsEl.addEventListener('click', (e) => {
    const idInc = e.target.closest('button.qty-increase')?.dataset.id;
    const idDec = e.target.closest('button.qty-decrease')?.dataset.id;
    const idRem = e.target.closest('button[data-remove]')?.dataset.remove;
    if(idInc){
      const id = Number(idInc);
      const idx = carrito.findIndex(i => i.id === id);
      if(idx > -1){ carrito[idx].cantidad += 1; saveCart(); renderCarrito(); }
    } else if(idDec){
      const id = Number(idDec);
      const idx = carrito.findIndex(i => i.id === id);
      if(idx > -1){
        carrito[idx].cantidad = Math.max(1, carrito[idx].cantidad - 1);
        saveCart();
        renderCarrito();
      }
    } else if(idRem){
      const id = Number(idRem);
      carrito = carrito.filter(i => i.id !== id);
      saveCart();
      renderCarrito();
    }
  });

  // Vaciar carrito
  vaciarBtn.addEventListener('click', () => {
    if(!confirm('¿Vaciar el carrito?')) return;
    carrito = [];
    saveCart();
    renderCarrito();
  });

  // Checkout (simulado)
  checkoutBtn.addEventListener('click', () => {
    if(carrito.length === 0){ alert('Tu carrito está vacío.'); return; }
    const total = carrito.reduce((s,i) => {
      const p = productos.find(x => x.id === i.id);
      return s + (p ? p.precio * i.cantidad : 0);
    }, 0);
    if(confirm('Total a pagar: ' + formatPrice(total) + '\n\nSimular compra?')){
      // Simulación de compra
      carrito = [];
      saveCart();
      renderCarrito();
      alert('Compra realizada. ¡Gracias! ✅');
      closeCart();
    }
  });

  // Eventos de UI
  abrirCarritoBtn.addEventListener('click', () => toggleCart());
  cerrarCarritoBtn.addEventListener('click', () => closeCart());

  // Buscador y filtros
  buscarInput.addEventListener('input', () => {
    const cat = document.querySelector('.filter-btn.active')?.dataset.cat || 'Todas';
    renderProductos(cat, buscarInput.value);
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProductos(btn.dataset.cat, buscarInput.value);
    });
  });

  // Contact form
  contactoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(contactoForm);
    // Simular envío
    alert('Mensaje enviado. ¡Gracias, ' + (form.get('nombre') || '') + '!');
    contactoForm.reset();
  });

  // Exponer funciones para botones inline (ver, add)
  window.addToCart = addToCart;
  window.viewProduct = function(id){
    const p = productos.find(x => x.id === id);
    if(!p) return alert('Producto no encontrado');
    alert(p.nombre + '\n\n' + p.descripcion + '\n\nPrecio: ' + formatPrice(p.precio));
  }

  // Inicializar
  renderProductos();
  renderCarrito();
});