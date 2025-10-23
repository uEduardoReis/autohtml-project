document.addEventListener('DOMContentLoaded', () => {

    const cart = [];
    const cartCount = document.querySelector('.cart-count');
    const cartPopup = document.querySelector('.cart-popup');
    const cartTrigger = document.querySelector('.cart-trigger');

    cartTrigger.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-item')) {
            return;
        }
        cartTrigger.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
        if (!cartTrigger.contains(e.target)) {
            cartTrigger.classList.remove('is-open');
        }
    });

    document.querySelectorAll('.btn--add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.closest('[data-carousel]')) {
                e.stopPropagation();
            }

            const title = btn.closest('.course-card').querySelector('.course-card__title').innerText.trim();
            cart.push(title);
            updateCart();
            cartTrigger.classList.add('is-open');
        });
    });

    cartPopup.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-item')) {
            e.preventDefault();
            const indexToRemove = parseInt(e.target.dataset.index, 10);
            cart.splice(indexToRemove, 1);
            updateCart();
        }
    });

    function updateCart() {
        cartCount.textContent = cart.length;

        if (cart.length > 0) {
            cartPopup.innerHTML = `
                <ul class="cart-item-list">
                    ${cart.map((item, index) => `
                        <li>
                            <span>${item}</span>
                            <button class="btn-remove-item" data-index="${index}" title="Remover item">&times;</button>
                        </li>
                    `).join('')}
                </ul>`;
        } else {
            cartPopup.innerHTML = `<p class="text-small">Nenhum produto no seu carrinho.</p>`;
        }
    }

});