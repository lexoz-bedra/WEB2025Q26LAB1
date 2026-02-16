(function () {
  'use strict';

  const CART_STORAGE_KEY = 'moonlight-cart';

  let cart = [];

  const cartItemsEl = document.querySelector('.cart__items');
  const cartTotalEl = document.querySelector('.cart__total-sum');
  const cartCountEl = document.querySelector('.header__cart-count');
  const checkoutBtn = document.querySelector('.cart__checkout-btn');
  const orderFormSection = document.getElementById('order-form-section');
  const orderForm = document.getElementById('order-form');

  function loadCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      cart = saved ? JSON.parse(saved) : [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  function addToCart(productId) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!productCard) return;

    const id = productId;
    const name = productCard.dataset.name;
    const price = parseInt(productCard.dataset.price, 10);

    const existing = cart.find((item) => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    renderCart();
  }

  function updateQuantity(productId, delta) {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart();
    renderCart();
  }

  function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountEl.textContent = count;
    cartTotalEl.textContent = total.toLocaleString('ru-RU');

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart__empty">Корзина пуста</p>';
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart__item" data-id="${item.id}">
        <span class="cart__item-name">${item.name}</span>
        <div class="cart__item-controls">
          <button type="button" class="cart__quantity-btn" data-action="decrease" aria-label="Уменьшить">−</button>
          <span class="cart__item-quantity">${item.quantity}</span>
          <button type="button" class="cart__quantity-btn" data-action="increase" aria-label="Увеличить">+</button>
        </div>
        <span class="cart__item-price">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
        <button type="button" class="cart__remove-btn" data-action="remove" aria-label="Удалить">×</button>
      </div>
    `
      )
      .join('');

    cartItemsEl.querySelectorAll('.cart__quantity-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const id = this.closest('.cart__item').dataset.id;
        const action = this.dataset.action;
        updateQuantity(id, action === 'increase' ? 1 : -1);
      });
    });

    cartItemsEl.querySelectorAll('.cart__remove-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const id = this.closest('.cart__item').dataset.id;
        removeFromCart(id);
      });
    });
  }

  function showOrderForm() {
    orderFormSection.hidden = false;
    orderFormSection.setAttribute('aria-hidden', 'false');
  }

  function hideOrderForm() {
    orderFormSection.hidden = true;
    orderFormSection.setAttribute('aria-hidden', 'true');
    orderForm.reset();
  }

  function handleOrderSubmit(e) {
    e.preventDefault();
    hideOrderForm();
    alert('Заказ создан!');
  }

  function init() {
    loadCart();
    renderCart();

    document.querySelectorAll('.product-card__add-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const productId = this.closest('.product-card').dataset.id;
        addToCart(productId);
      });
    });

    checkoutBtn.addEventListener('click', showOrderForm);

    orderForm.addEventListener('submit', handleOrderSubmit);

    orderFormSection.addEventListener('click', function (e) {
      if (e.target === orderFormSection) {
        hideOrderForm();
      }
    });
  }

  init();
})();
