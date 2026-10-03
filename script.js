/**
 * Основной скрипт сайта "Свет и Лей"
 * Управляет каталогом, корзиной, модальными окнами и анимациями.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. ДАННЫЕ И СОСТОЯНИЕ
    // ==========================================

    // База данных товаров (имитация)
    const products = [
        { id: 1, name: "Светильник 'Утренний луч'", price: 4500, icon: "💡", desc: "Тёплый янтарный свет для уютных вечеров." },
        { id: 2, name: "Ваза 'Горный поток'", price: 3200, icon: "🏺", desc: "Прозрачное стекло с бирюзовым переливом." },
        { id: 3, name: "Набор свечей 'Сияние'", price: 1800, icon: "🕯️", desc: "Аромат ванили и морской соли." },
        { id: 4, name: "Плед 'Облако'", price: 5900, icon: "☁️", desc: "Невесомый и мягкий, как утренняя дымка." },
        { id: 5, name: "Чаша 'Океан'", price: 2100, icon: "🥣", desc: "Керамика ручной работы с глазурью цвета воды." },
        { id: 6, name: "Диффузор 'Бриз'", price: 2800, icon: "🌬️", desc: "Свежесть морского побережья в вашем доме." }
    ];

    // Состояние корзины (загружаем из localStorage или создаём пустой массив)
    let cart = JSON.parse(localStorage.getItem("svetilei_cart")) || [];

    // ==========================================
    // 2. DOM ЭЛЕМЕНТЫ
    // ==========================================
    const catalogGrid = document.getElementById("catalogGrid");
    const cartBtn = document.getElementById("cartBtn");
    const cartCount = document.getElementById("cartCount");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartClose = document.getElementById("cartClose");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const checkoutModal = document.getElementById("checkoutModal");
    const modalClose = document.getElementById("modalClose");
    const orderForm = document.getElementById("orderForm");
    const checkoutFormContainer = document.getElementById("checkoutFormContainer");
    const orderSuccess = document.getElementById("orderSuccess");
    const orderNumberEl = document.getElementById("orderNumber");
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");

    // ==========================================
    // 3. РЕНДЕРИНГ КАТАЛОГА
    // ==========================================
    function renderCatalog() {
        catalogGrid.innerHTML = products.map(product => `
            <article class="product-card">
                <div class="product-card__img">${product.icon}</div>
                <div class="product-card__body">
                    <h3 class="product-card__title">${product.name}</h3>
                    <p class="product-card__desc">${product.desc}</p>
                    <div class="product-card__footer">
                        <span class="product-card__price">${product.price} ₽</span>
                        <button class="btn btn--add add-to-cart-btn" data-id="${product.id}">
                            В корзину
                        </button>
                    </div>
                </div>
            </article>
        `).join("");
    }

    // ==========================================
    // 4. ЛОГИКА КОРЗИНЫ
    // ==========================================

    // Сохранение в localStorage
    function saveCart() {
        localStorage.setItem("svetilei_cart", JSON.stringify(cart));
        updateCartUI();
    }

    // Обновление интерфейса корзины
    function updateCartUI() {
        // Обновляем бейдж
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle("active", totalItems > 0);

        // Рендерим список товаров
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty">Ваша корзина пуста</p>';
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item__img">${item.icon}</div>
                    <div class="cart-item__details">
                        <div class="cart-item__title">${item.name}</div>
                        <div class="cart-item__price">${item.price} ₽</div>
                        <div class="cart-item__controls">
                            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                            <button class="cart-item__remove" onclick="removeFromCart(${item.id})">Удалить</button>
                        </div>
                    </div>
                </div>
            `).join("");
        }

        // Считаем итог
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        cartTotalEl.textContent = `${total} ₽`;
    }

    // Добавление в корзину с анимацией
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }

        saveCart();
        animateFlyToCart(productId);

        // Открываем корзину автоматически при первом добавлении
        if (cart.length === 1 && cart[0].qty === 1) {
            openCart();
        }
    }

    // Глобальные функции для onclick в HTML-строках
    window.changeQty = function (id, change) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) {
                removeFromCart(id);
            } else {
                saveCart();
            }
        }
    };

    window.removeFromCart = function (id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    };

    // Анимация "полёта" товара в корзину
    function animateFlyToCart(productId) {
        const btn = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
        const cartIcon = cartBtn.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        // Создаём клон для анимации
        const flyer = document.createElement("div");
        flyer.classList.add("flying-item");
        flyer.style.left = `${btnRect.left + btnRect.width / 2}px`;
        flyer.style.top = `${btnRect.top + btnRect.height / 2}px`;
        document.body.appendChild(flyer);

        // Запускаем анимацию
        requestAnimationFrame(() => {
            flyer.style.left = `${cartIcon.left + 10}px`;
            flyer.style.top = `${cartIcon.top + 10}px`;
            flyer.style.transform = "scale(0.2)";
            flyer.style.opacity = "0";
        });

        // Удаляем клон после анимации
        setTimeout(() => {
            flyer.remove();
            // Визуальный фидбек на иконке корзины
            cartBtn.style.transform = "scale(1.2)";
            setTimeout(() => { cartBtn.style.transform = "scale(1)"; }, 200);
        }, 800);
    }

    // ==========================================
    // 5. УПРАВЛЕНИЕ UI (Открытие/Закрытие)
    // ==========================================
    function openCart() {
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Блокируем скролл фона
    }

    function closeCart() {
        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    function openModal() {
        closeCart(); // Закрываем корзину при открытии оформления
        checkoutModal.classList.add("active");
        checkoutFormContainer.classList.remove("hidden");
        orderSuccess.classList.add("hidden");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        checkoutModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    // ==========================================
    // 6. ОБРАБОТЧИКИ СОБЫТИЙ
    // ==========================================

    // Делегирование событий для кнопок "В корзину"
    catalogGrid.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart-btn")) {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        }
    });

    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    checkoutBtn.addEventListener("click", openModal);
    modalClose.addEventListener("click", closeModal);
    closeSuccessBtn.addEventListener("click", () => {
        closeModal();
        // Скролл к началу страницы для лучшего UX
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Закрытие модалки по клику вне её
    checkoutModal.addEventListener("click", (e) => {
        if (e.target === checkoutModal) closeModal();
    });

    // Обработка отправки формы заказа
    orderForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Имитация отправки данных на сервер
        const orderId = Math.floor(100000 + Math.random() * 900000);
        orderNumberEl.textContent = `#${orderId}`;

        // Очищаем корзину
        cart = [];
        saveCart();
        orderForm.reset();

        // Показываем экран успеха
        checkoutFormContainer.classList.add("hidden");
        orderSuccess.classList.remove("hidden");
    });

    // Плавная прокрутка для якорных ссылок (дополнительная страховка)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // ==========================================
    // 7. ИНИЦИАЛИЗАЦИЯ
    // ==========================================
    renderCatalog();
    updateCartUI();

    console.log("✨ Сайт «Свет и Лей» успешно загружен. Гармония установлена.");
});