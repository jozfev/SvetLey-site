document.addEventListener("DOMContentLoaded", () => {

    // Плавная прокрутка по ссылкам меню
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Обработка формы бронирования
    const form = document.getElementById("bookingForm");
    const message = document.getElementById("formMessage");

    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const date = document.getElementById("date").value;

        if (!name || !phone || !date) {
            message.style.color = "#e74c3c";
            message.textContent = "Пожалуйста, заполните все поля.";
            return;
        }

        message.style.color = "#4caf50";
        message.textContent = `Спасибо, ${name}! Мы свяжемся с вами по телефону ${phone} для подтверждения брони на ${date}.`;

        form.reset();
    });

    console.log("Сайт кафе «СветЛей» загружен ☀️");
});
