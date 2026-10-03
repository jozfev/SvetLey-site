document.addEventListener("DOMContentLoaded", () => {
    // ⚠️ URL твоего веб-приложения Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1Dg_PUUK_asjOmiCD413LMOF1s2WR0qnIAyX-Q_Ja_awusaifSqW5dScSdiZ4YUPo/exec';

    // 1. ДАННЫЕ МЕНЮ (3 категории)
    const menuData = {
        breakfast: [
            { id: 1, name: "Авокадо-тост с яйцом пашот", price: 420, desc: "Хрустящий тост, спелый авокадо, яйцо пашот, микрозелень" },
            { id: 2, name: "Сырники со сметаной и ягодами", price: 360, desc: "Нежные сырники из фермерского творога, свежая мята" },
            { id: 3, name: "Овсяная каша на миндальном молоке", price: 320, desc: "Долгой варки, с бананом, орехами и кленовым сиропом" }
        ],
        lunch: [
            { id: 4, name: "Боул с лососем и киноа", price: 540, desc: "Киноа, лосось су-вид, авокадо, черри, соус тахини" },
            { id: 5, name: "Крем-суп из тыквы с гренками", price: 340, desc: "Тыква, имбирь, кокосовое молоко, тыквенные семечки" },
            { id: 6, name: "Паста с песто и курицей", price: 460, desc: "Домашняя паста, базиликовое песто, вяленые томаты" }
        ],
        coffee: [
            { id: 7, name: "Капучино", price: 240, desc: "Двойная порция эспрессо, шелковистое молоко" },
            { id: 8, name: "Раф лавандовый", price: 320, desc: "Сливки, эспрессо, натуральный лавандовый сироп" },
            { id: 9, name: "Миндальный круассан", price: 260, desc: "Слоёное тесто, миндальный крем, лепестки миндаля" }
        ]
    };

    let cart = JSON.parse(localStorage.getItem("svetilei_cart")) || [];

    // 2. DOM ЭЛЕМЕНТЫ
    const menuGrid = document.getElementById("menuGrid");
    const menuTabs = document.querySelectorAll(".menu-tab");
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
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
    const submitOrderBtn = document.getElementById("submitOrderBtn");

    // 3. РЕНДЕР МЕНЮ
    function renderMenu(category) {
        menuGrid.style.opacity = "0";
        setTimeout(() => {
            menuGrid.innerHTML = menuData[category].map(item => `
                <article class="menu-item">
                    <div class="menu-item__head">
                        <h3 class="menu-item__name">${item.name}</h3>
                        <span class="menu-item__price">${item.price} ₽</span>
                    </div>
                    <p class="menu-item__desc">${item.desc}</p>
                    <button class="btn btn--add add-to-cart-btn" data-id="${item.id}">В корзину</button>
                </article>
            `).join("");
            menuGrid.style.opacity = "1";
            menuGrid.style.transition = "opacity 0.3s ease";
        }, 150);
    }

    menuTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            menuTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderMenu(tab.dataset.category);
        });
    });

    // 4. ЛОГИКА КОРЗИНЫ
    function saveCart() {
        localStorage.setItem("svetilei_cart", JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle("active", totalItems > 0);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
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

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        cartTotalEl.textContent = `${total} ₽`;
    }

    window.changeQty = function (id, change) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) removeFromCart(id);
            else saveCart();
        }
    };

    window.removeFromCart = function (id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    };

    function addToCart(productId) {
        const product = Object.values(menuData).flat().find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) existingItem.qty++;
        else cart.push({ ...product, qty: 1 });
        saveCart();

        cartBtn.style.transform = "scale(1.2)";
        setTimeout(() => { cartBtn.style.transform = "scale(1)"; }, 200);
    }

    // 5. УПРАВЛЕНИЕ UI
    function openCart() {
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeCart() {
        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    function openModal() {
        closeCart();
        checkoutModal.classList.add("active");
        checkoutFormContainer.classList.remove("hidden");
        orderSuccess.classList.add("hidden");
    }

    function closeModal() {
        checkoutModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    // 6. ОБРАБОТЧИКИ СОБЫТИЙ
    menuGrid.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart-btn")) {
            addToCart(parseInt(e.target.dataset.id));
        }
    });

    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);
    checkoutBtn.addEventListener("click", openModal);
    modalClose.addEventListener("click", closeModal);
    closeSuccessBtn.addEventListener("click", () => { closeModal(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    checkoutModal.addEventListener("click", (e) => { if (e.target === checkoutModal) closeModal(); });

    // 7. ОТПРАВКА ЗАКАЗА В GOOGLE SHEETS (ИСПРАВЛЕННАЯ ВЕРСИЯ)
    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(orderForm);
        const totalSum = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        const orderData = {
            name: formData.get("name").trim(),
            phone: formData.get("phone").trim(),
            orderType: formData.get("orderType"),
            comment: formData.get("comment").trim(),
            items: cart.map(item => ({ name: item.name, qty: item.qty })),
            total: totalSum
        };

        console.log("📦 Отправляем заказ:", orderData);

        submitOrderBtn.disabled = true;
        submitOrderBtn.textContent = "Отправляем...";

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(orderData)
            });

            // Очищаем корзину при успехе
            cart = [];
            localStorage.removeItem("svetilei_cart");
            updateCartUI();
            orderForm.reset();

            // Показываем экран успеха
            checkoutFormContainer.classList.add("hidden");
            orderSuccess.classList.remove("hidden");

        } catch (error) {
            console.error('❌ Ошибка:', error);
            alert("Не удалось отправить заказ. Позвоните нам: +7 (999) 123-45-67");
        } finally {
            submitOrderBtn.disabled = false;
            submitOrderBtn.textContent = "Подтвердить заказ";
        }
    });

    // Инициализация при загрузке
    renderMenu("breakfast");
    updateCartUI();
});