
(function(){
  const burger = document.querySelector('[data-burger]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if(burger && mobileMenu){
    burger.addEventListener('click', ()=> mobileMenu.classList.toggle('open'));
  }

  // CART (localStorage)
  const KEY = 'demo_cart_v1';
  function readCart(){
    try{
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    }catch(e){ return []; }
  }
  function saveCart(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    updateCartBadge();
  }
  function updateCartBadge(){
    const items = readCart();
    const count = items.reduce((s, it)=> s + (it.qty||0), 0);
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = String(count);
      el.style.display = count>0 ? 'grid' : 'none';
    });
  }
  updateCartBadge();

  function addToCart(item){
    const cart = readCart();
    const ex = cart.find(x=> x.id===item.id && x.variant===item.variant);
    if(ex){ ex.qty += item.qty; }
    else{ cart.push(item); }
    saveCart(cart);
  }

  // Add-to-cart buttons
  document.querySelectorAll('[data-add-to-cart]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const price = Number(btn.getAttribute('data-price')||0);
      const img = btn.getAttribute('data-img') || '';
      const variant = btn.getAttribute('data-variant') || 'default';
      addToCart({id, title, price, img, variant, qty:1});
      btn.textContent = 'Добавлено ✓';
      setTimeout(()=> btn.textContent = 'В корзину', 1200);
    });
  });

  // Product page variant selection
  const variants = document.querySelectorAll('[data-variant]');
  const variantHidden = document.querySelector('[data-variant-hidden]');
  variants.forEach(v=>{
    v.addEventListener('click', ()=>{
      variants.forEach(x=>x.classList.remove('active'));
      v.classList.add('active');
      if(variantHidden) variantHidden.value = v.getAttribute('data-variant') || 'default';
    });
  });

  // Add-to-cart from product page
  const addBtn = document.querySelector('[data-add-product]');
  if(addBtn){
    addBtn.addEventListener('click', ()=>{
      const id = addBtn.getAttribute('data-id');
      const title = addBtn.getAttribute('data-title');
      const price = Number(addBtn.getAttribute('data-price')||0);
      const img = addBtn.getAttribute('data-img') || '';
      const variant = (variantHidden?.value) || 'default';
      addToCart({id, title, price, img, variant, qty:1});
      addBtn.textContent = 'Добавлено ✓';
      setTimeout(()=> addBtn.textContent = 'Добавить в корзину', 1200);
    });
  }

  // Cart rendering
  const cartList = document.querySelector('[data-cart-list]');
  const cartTotal = document.querySelector('[data-cart-total]');
  const cartSubtotal = document.querySelector('[data-cart-subtotal]');
  const clearBtn = document.querySelector('[data-cart-clear]');
  function money(n){ return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'; }

  function renderCart(){
    if(!cartList) return;
    const cart = readCart();
    cartList.innerHTML = '';
    if(cart.length===0){
      cartList.innerHTML = '<div class="card pad">Корзина пустая. <a href="catalog.html" style="color:var(--accent); font-weight:900">Перейти в каталог</a></div>';
    } else {
      cart.forEach((it, idx)=>{
        const row = document.createElement('div');
        row.className='cart-item';
        row.innerHTML = `
          <img src="${it.img}" alt="${it.title}"/>
          <div>
            <strong>${it.title}</strong>
            <div style="color:var(--muted2); font-size:13px; margin-top:4px">Вариант: ${it.variant}</div>
            <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; align-items:center">
              <div class="qty">
                <button type="button" data-dec>−</button>
                <span>${it.qty}</span>
                <button type="button" data-inc>+</button>
              </div>
              <button type="button" class="btn small secondary" data-remove>Удалить</button>
            </div>
          </div>
          <div style="text-align:right">
            <div class="price">${money(it.price)}</div>
            <div style="color:var(--muted2); font-size:13px; margin-top:6px">${money(it.price*it.qty)}</div>
          </div>
        `;
        row.querySelector('[data-inc]').addEventListener('click', ()=>{
          const cart = readCart(); cart[idx].qty += 1; saveCart(cart); renderCart();
        });
        row.querySelector('[data-dec]').addEventListener('click', ()=>{
          const cart = readCart(); cart[idx].qty = Math.max(1, cart[idx].qty-1); saveCart(cart); renderCart();
        });
        row.querySelector('[data-remove]').addEventListener('click', ()=>{
          const cart = readCart(); cart.splice(idx,1); saveCart(cart); renderCart();
        });
        cartList.appendChild(row);
      });
    }

    const cart2 = readCart();
    const subtotal = cart2.reduce((s,it)=> s + it.price*it.qty, 0);
    const delivery = subtotal>2500 || subtotal===0 ? 0 : 290;
    const total = subtotal + delivery;
    if(cartSubtotal) cartSubtotal.textContent = money(subtotal);
    if(cartTotal) cartTotal.textContent = money(total);
  }
  renderCart();
  clearBtn?.addEventListener('click', ()=>{
    saveCart([]);
    renderCart();
  });

})();
