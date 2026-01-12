// Sample menu data with realistic food items
const menuItems = [
    { id: 1, name: 'Margherita Pizza', category: 'pizza', price: 299, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', desc: 'Classic pizza with fresh mozzarella, basil, and tomato sauce' },
    { id: 2, name: 'Pepperoni Pizza', category: 'pizza', price: 349, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', desc: 'Loaded with pepperoni slices and extra cheese' },
    { id: 3, name: 'Chicken Burger', category: 'burger', price: 179, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', desc: 'Juicy grilled chicken patty with lettuce and mayo' },
    { id: 4, name: 'Veggie Burger', category: 'burger', price: 149, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', desc: 'Plant-based patty with fresh vegetables' },
    { id: 5, name: 'Butter Chicken', category: 'indian', price: 279, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', desc: 'Creamy tomato curry with tender chicken pieces' },
    { id: 6, name: 'Paneer Tikka', category: 'indian', price: 249, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', desc: 'Grilled cottage cheese with aromatic spices' },
    { id: 7, name: 'Chicken Fried Rice', category: 'chinese', price: 199, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', desc: 'Wok-tossed rice with chicken and vegetables' },
    { id: 8, name: 'Veg Manchurian', category: 'chinese', price: 179, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', desc: 'Deep-fried veggie balls in tangy sauce' },
    { id: 9, name: 'Chocolate Brownie', category: 'dessert', price: 129, image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400', desc: 'Rich, fudgy brownie with chocolate chips' },
    { id: 10, name: 'Tiramisu', category: 'dessert', price: 159, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', desc: 'Classic Italian coffee-flavored dessert' }
];

// Cart state stored in memory and synced with localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the application
function init() {
    renderMenu();
    updateCartCount();
    setupEventListeners();
}

// Render menu items to the grid
function renderMenu(filter = 'all', searchTerm = '') {
    const menuGrid = document.getElementById('menuGrid');
    const filtered = menuItems.filter(item => {
        const matchesCategory = filter === 'all' || item.category === filter;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    menuGrid.innerHTML = filtered.map(item => `
        <div class="menu-item">
            <img src="${item.image}" alt="${item.name}" class="menu-item-img">
            <div class="menu-item-content">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-desc">${item.desc}</div>
                <div class="menu-item-footer">
                    <div class="menu-item-price">₹${item.price}</div>
                    <button class="add-to-cart-btn" data-id="${item.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add item to cart or increment quantity if already exists
function addToCart(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showNotification(`${item.name} added to cart!`);
}

// Update item quantity in cart
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCart();
    renderCart();
    updateCartCount();
    showNotification('Item removed from cart');
}

// Calculate cart totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% tax
    const delivery = 40;
    const total = subtotal + tax + delivery;
    return { subtotal, tax, delivery, total };
}

// Render cart page
function renderCart() {
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-text">Your cart is empty</div>
                <button class="browse-menu-btn" onclick="showPage('home')">Browse Menu</button>
            </div>
        `;
        return;
    }

    const { subtotal, tax, delivery, total } = calculateTotals();

    cartContent.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price} each</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="qty-btn" data-id="${item.id}" data-action="decrease">−</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (18%)</span>
                <span>₹${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Delivery Charges</span>
                <span>₹${delivery.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        </div>
    `;
}

// Update cart count badge
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Show notification message
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Switch between pages
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    if (pageName === 'home') {
        document.getElementById('homePage').classList.add('active');
    } else if (pageName === 'cart') {
        document.getElementById('cartPage').classList.add('active');
        renderCart();
    }
}

// Checkout function
function checkout() {
    const { total } = calculateTotals();
    showNotification(`Order placed! Total: ₹${total.toFixed(2)}`);
    // Clear cart after checkout
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartCount();
        showPage('home');
    }, 2000);
}

// Setup event listeners using event delegation
function setupEventListeners() {
    // Add to cart buttons
    document.getElementById('menuGrid').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            addToCart(itemId);
        }
    });

    // Cart quantity and remove buttons
    document.getElementById('cartContent').addEventListener('click', (e) => {
        if (e.target.classList.contains('qty-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            updateQuantity(itemId, action === 'increase' ? 1 : -1);
        } else if (e.target.classList.contains('remove-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            removeFromCart(itemId);
        }
    });

    // Category filter buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const category = e.target.dataset.category;
            const searchTerm = document.getElementById('searchBox').value;
            renderMenu(category, searchTerm);
        });
    });

    // Search box
    document.getElementById('searchBox').addEventListener('input', (e) => {
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        renderMenu(activeCategory, e.target.value);
    });
}

// Initialize app on page load
init();