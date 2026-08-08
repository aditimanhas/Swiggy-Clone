const page = window.location.pathname.split("/").pop();
const header = document.getElementById("header");

if(header){
    window.addEventListener("scroll", () => {
        header.classList.toggle("active", window.scrollY > 100);
    });
}

const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");

if(menuToggle && navbar){
    menuToggle.addEventListener("click", () => {
        navbar.classList.toggle("active");
    });
}

/* SIGNIN / SIGNUP */

const signinForm = document.querySelector(".signin-form");
const signupForm = document.querySelector(".signup-form");

const showSignup = document.getElementById("showSignup");
const showSignin = document.getElementById("showSignin");

if(showSignup){
    showSignup.onclick = () => {
        signinForm.style.display = "none";
        signupForm.style.display = "block";
    };
}

if(showSignin){
    showSignin.onclick = () => {
        signupForm.style.display = "none";
        signinForm.style.display = "block";
    };
}

window.signup = function(){
    let name = document.getElementById("signupName").value.trim();
    let email = document.getElementById("signupEmail").value.trim();
    let pass = document.getElementById("signupPassword").value.trim();

    if(!name || !email || !pass){
        alert("Please fill all fields");
        return;
    }

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", pass);

    document.getElementById("signupPopup").classList.add("active");

    signupForm.style.display = "none";
    signinForm.style.display = "block";
};

function closeSignupPopup(){
    document.getElementById("signupPopup").classList.remove("active");
}

/* LOGIN */

window.login = function(){
    let email = document.getElementById("loginEmail").value.trim();
    let pass = document.getElementById("loginPassword").value.trim();

    if(!email || !pass){
        alert("Enter details");
        return;
    }

    let savedEmail = localStorage.getItem("userEmail");
    let savedPass = localStorage.getItem("userPassword");

    if(email === savedEmail && pass === savedPass){
        localStorage.setItem("isLoggedIn", "true");
        location.href = "index.html";
    }else{
        document.getElementById("loginPopup").classList.add("active");
    }
};

function closeLoginPopup(){
    document.getElementById("loginPopup").classList.remove("active");
}

/* LOGIN CHECK */

if(
    page === "index.html" ||
    page === "restaurant.html" ||
    page === "cart.html" ||
    page === "contact.html"
){
    if(localStorage.getItem("isLoggedIn") !== "true"){
        location.href = "start.html";
    }
}

/* LOGOUT */

window.logout = function(){
    localStorage.removeItem("isLoggedIn");
    location.href = "start.html";
};

/* SLIDER */

const foodContainer = document.getElementById("foodContainer");

function slideRight(){
    if(foodContainer){
        foodContainer.scrollLeft += 300;
    }
}

function slideLeft(){
    if(foodContainer){
        foodContainer.scrollLeft -= 300;
    }
}

/* CATEGORY */

function openCategory(category){
    localStorage.setItem("selectedCategory", category);
    location.href = "restaurant.html";
}

/* RESTAURANTS */

const restaurantContainer = document.getElementById("restaurantContainer");
const homeRestaurantContainer = document.getElementById("homeRestaurantContainer");
const searchInput = document.getElementById("searchInput");

let allRestaurants = [];

/* GET CART */

function getCart(){
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* RENDER BUTTON */

function getCartButton(item){
    let cart = getCart();
    let cartItem = cart.find(product => product.id === item.id);

    if(cartItem){
        return `
            <div class="qty-box">
                <button onclick="decreaseQty(${item.id})">-</button>
                <span>${cartItem.quantity}</span>
                <button onclick="increaseQty(${item.id})">+</button>
            </div>
        `;
    }

    return `
        <button class="add-cart-btn" onclick="addToCart(${item.id})">
            ${item.button}
        </button>
    `;
}

/* HOME PAGE ITEMS */

if(homeRestaurantContainer){
    fetch("restaurant.json")
    .then(response => response.json())
    .then(data => {
        allRestaurants = data;

        data.sort(() => Math.random() - 0.5);

        let firstItems = data.slice(0, 4);

        showHomeRestaurants(firstItems);
    });
}

function showHomeRestaurants(items){
    if(!homeRestaurantContainer) return;

    homeRestaurantContainer.innerHTML = "";

    items.forEach(item => {
        homeRestaurantContainer.innerHTML += restaurantCardHTML(item);
    });
}

/* RESTAURANT PAGE ITEMS */

if(restaurantContainer){
    fetch("restaurant.json")
    .then(response => response.json())
    .then(data => {
        allRestaurants = data;

        let selectedCategory = localStorage.getItem("selectedCategory");

        if(selectedCategory){
            let filteredItems = allRestaurants.filter(item => {
                return (
                    item.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                    item.foodType.toLowerCase().includes(selectedCategory.toLowerCase())
                );
            });

            showRestaurants(filteredItems);
            localStorage.removeItem("selectedCategory");
        }else{
            showRestaurants(allRestaurants);
        }
    });
}

function restaurantCardHTML(item){
    return `
        <div class="restaurant-card">
            <div class="restaurant-img">
                <img src="${item.image}">
                <span>${item.offer}</span>
            </div>

            <div class="restaurant-content">
                <h3>${item.name}</h3>

                <div class="restaurant-info">
                    <p><i class="fa-solid fa-star"></i>${item.rating}</p>
                    <p>${item.time}</p>
                </div>

                <p class="food-type">${item.foodType}</p>

                <div class="restaurant-bottom">
                    <span class="price">${item.price}</span>

                    <div id="cartBtn-${item.id}">
                        ${getCartButton(item)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showRestaurants(items){
    if(!restaurantContainer) return;

    restaurantContainer.innerHTML = "";

    items.forEach(item => {
        restaurantContainer.innerHTML += restaurantCardHTML(item);
    });
}

/* SEARCH */

if(searchInput){
    searchInput.addEventListener("keyup", function(){
        let value = searchInput.value.toLowerCase();

        let filteredItems = allRestaurants.filter(item => {
            return (
                item.name.toLowerCase().includes(value) ||
                item.foodType.toLowerCase().includes(value)
            );
        });

        showRestaurants(filteredItems);
    });
}

/* ADD / INCREASE / DECREASE */

function addToCart(id){
    let cart = getCart();

    let product = allRestaurants.find(item => item.id === id);

    if(!product) return;

    cart.push({
        ...product,
        quantity: 1
    });

    saveCart(cart);

    updateCartCount();
    refreshProductButton(id);
}

function increaseQty(id){
    let cart = getCart();

    let product = cart.find(item => item.id === id);

    if(product){
        product.quantity += 1;
    }

    saveCart(cart);

    updateCartCount();
    refreshProductButton(id);
    showCart();
}

function decreaseQty(id){
    let cart = getCart();

    let product = cart.find(item => item.id === id);

    if(product){
        product.quantity -= 1;

        if(product.quantity <= 0){
            cart = cart.filter(item => item.id !== id);
        }
    }

    saveCart(cart);

    updateCartCount();
    refreshProductButton(id);
    showCart();
}

function refreshProductButton(id){
    let product = allRestaurants.find(item => item.id === id);

    let btnBox = document.getElementById(`cartBtn-${id}`);

    if(btnBox && product){
        btnBox.innerHTML = getCartButton(product);
    }
}

/* CART COUNT */

function updateCartCount(){
    let cart = getCart();
    let totalItems = 0;

    cart.forEach(item => {
        totalItems += item.quantity || 1;
    });

    let cartCount = document.getElementById("cartCount");

    if(cartCount){
        cartCount.innerText = totalItems;
    }
}

/* CART PAGE */

const cartContainer = document.getElementById("cartContainer");
const totalPrice = document.getElementById("totalPrice");

function showCart(){
    if(!cartContainer) return;

    let cart = getCart();

    cartContainer.innerHTML = "";

    let total = 0;

    if(cart.length === 0){
        cartContainer.innerHTML = `
    <div class="empty-cart">
        <h2>Your Cart Is Empty</h2>
        <p>
            Looks like you haven't added anything yet.
        </p>
        <a href="restaurant.html">
            <button class="back-menu-btn">
                Back To Menu
            </button>
        </a>
    </div>
`;

        if(totalPrice){
            totalPrice.innerText = "₹0";
        }

        return;
    }

    cart.forEach(item => {
    let priceNumber = Number(item.price.replace("₹",""));
    let qty = item.quantity || 1;
    let itemTotal = priceNumber * qty;

    total += itemTotal;

    cartContainer.innerHTML += `
        <div class="cart-card">
            <img src="${item.image}">

            <div class="cart-content">
                <h3>${item.name}</h3>
                <p>${item.foodType}</p>

                <h4>₹${itemTotal}</h4>

                <div class="qty-box cart-page-qty">
                    <button onclick="decreaseQty(${item.id})">-</button>
                    <span>${qty}</span>
                    <button onclick="increaseQty(${item.id})">+</button>
                </div>

                <button onclick="removeCart(${item.id})">
                    Remove
                </button>
            </div>
        </div>
    `;
});

    if(totalPrice){
        totalPrice.innerText = "₹" + total;
    }
}

function removeCart(id){
    let cart = getCart();

    cart = cart.filter(item => item.id !== id);

    saveCart(cart);

    updateCartCount();
    refreshProductButton(id);
    showCart();
}

/* PLACE ORDER */

function openPaymentPopup(){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if(cart.length === 0){
        Swal.fire({
            icon: "warning",
            title: "Cart Is Empty",
            text: "Please add food items first",
            confirmButtonColor: "#fc8019"
        });
        return;
    }

    window.location.href = "payment.html";
}

function showPaymentCart(){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let box = document.getElementById("paymentCartItems");
    let totalBox = document.getElementById("paymentTotal");

    if(!box || !totalBox) return;

    box.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        let price = Number(item.price.replace("₹",""));
        let qty = item.quantity || 1;
        let itemTotal = price * qty;

        total += itemTotal;

        box.innerHTML += `
            <div class="summary-item">
                <span>${item.name} x ${qty}</span>
                <b>₹${itemTotal}</b>
            </div>
        `;
    });

    totalBox.innerText = "₹" + total;

generateQRCode(total);
}

function showPaymentFields(){
    let method = document.querySelector('input[name="payment"]:checked').value;
    let box = document.getElementById("paymentFields");

    if(!box) return;

    if(method === "UPI"){
        box.innerHTML = `
            <div class="payment-field">
                <input type="text" placeholder="Enter UPI ID">
            </div>
        `;
    }
    else if(method === "Card"){
        box.innerHTML = `
            <div class="payment-field">
                <input type="text" placeholder="Card Number">
                <input type="text" placeholder="Card Holder Name">
                <input type="text" placeholder="Expiry Date MM/YY">
                <input type="password" placeholder="CVV">
            </div>
        `;
    }
    else{
        box.innerHTML = `
            <div class="cod-message">
                Pay cash when your food arrives
            </div>
        `;
    }
}

function makePayment(){
    let method = document.querySelector('input[name="payment"]:checked').value;

    Swal.fire({
        title:"Order Placed Successfully",
        text:`Payment method: ${method}`,
        icon:"success",
        confirmButtonColor:"#fc8019"
    }).then(() => {
        localStorage.removeItem("cart");
        window.location.href = "index.html";
    });
}

showPaymentCart();
showPaymentFields();

/* LOAD */

updateCartCount();
showCart();