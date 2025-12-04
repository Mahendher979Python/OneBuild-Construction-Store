/* ======================================================
     GLOBAL ECOMMERCE SYSTEM (WORKS FOR ALL CATEGORIES)
====================================================== */

const CART_KEY = "global_ecom_cart_v1";

/* ---------------- CART CORE ---------------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product){
  let cart = getCart();
  let item = cart.find(p => p.id === product.id);

  if(item) item.qty += product.qty || 1;
  else cart.push({ ...product, qty: product.qty || 1 });

  saveCart(cart);
  updateCartBadge();
}

/* REMOVE ITEM */
function removeFromCart(id){
  saveCart(getCart().filter(p => p.id !== id));
  updateCartBadge();
}

/* BADGE UPDATE */
function updateCartBadge(){
  let badge = document.getElementById("cart-badge");
  if(!badge) return;

  let total = getCart().reduce((s,p)=>s+p.qty,0);
  badge.innerText = total;
}
document.addEventListener("DOMContentLoaded", updateCartBadge);


/* ---------------- IMAGE PATH ---------------- */
function resolveImgPath(path){
  // allow either "/images/..." or "img:/..." shorthand in data
  return path.replace(/^img:\//, "/images/");
}


/* =====================================================
      PRODUCT RENDERING (MATCHED TO YOUR HTML UI)
=====================================================*/
function renderProducts(array, containerId = "products-grid") {
  const box = document.getElementById(containerId);
  if(!box) return;

  box.innerHTML = array.map(p => `
    <div class="card">

      <div class="thumb" onclick="openModal('${p.id}')">
        <img src="${resolveImgPath(p.img)}" alt="${p.name}">
      </div>

      <h3>${p.name}</h3>
      <div class="price">₹${p.price.toLocaleString()}</div>

      <div class="chips">
        ${p.tags.map(t => `<div class="chip">${t}</div>`).join("")}
      </div>

      <button class="btn add"
        onclick='addToCart(${JSON.stringify({
          id:p.id, name:p.name, price:p.price, img:p.img
        })})'>
        ADD TO CART
      </button>

    </div>
  `).join("");
}


/* =====================================================
      NEW MODAL SYSTEM (MATCHING YOUR HTML EXACTLY - OPTION 1)
=====================================================*/
function openModal(id) {
  const p = (typeof productsArray !== "undefined") ? productsArray.find(x => x.id === id) : null;
  if(!p) return;

  // Populate modal fields
  const imgEl = document.getElementById("modalImg");
  const titleEl = document.getElementById("modalTitle");
  const descEl = document.getElementById("modalDesc");
  const tagsEl = document.getElementById("modalTags");
  const priceEl = document.getElementById("modalPrice");
  const qtyEl = document.getElementById("modalQty");
  const addBtn = document.getElementById("modalAddToCart");
  const modal = document.getElementById("modal");

  if(imgEl) imgEl.src = resolveImgPath(p.img);
  if(titleEl) titleEl.innerText = p.name;
  if(descEl) descEl.innerText = p.desc || "";
  if(tagsEl) tagsEl.innerHTML = p.tags.map(t => `<span class="tag">${t}</span>`).join("");
  if(priceEl) priceEl.innerText = p.price.toLocaleString();
  if(qtyEl) qtyEl.value = 1;

  // bind add to cart in modal
  if(addBtn){
    addBtn.onclick = () => {
      const qty = parseInt(qtyEl.value) || 1;
      addToCart({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
      // keep modal open or close — here we close after adding
      closeModal();
    };
  }

  // show modal
  if(modal){
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }
}

function closeModal(){
  const modal = document.getElementById("modal");
  if(modal){
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
}

// close button binding (safe)
document.addEventListener("click", function(e){
  if(e.target && e.target.id === "closeModal") closeModal();
});

// also close modal on Escape key
document.addEventListener("keydown", function(e){
  if(e.key === "Escape") closeModal();
});

/* =====================================================
      CART PAGE RENDER
=====================================================*/
function renderCartPage(boxId = "cart-container") {
  const box = document.getElementById(boxId);
  if(!box) return;

  let cart = getCart();

  if(cart.length === 0){
    box.innerHTML = `<h2>Your cart is empty.</h2>`;
    return;
  }

  let total = 0;

  box.innerHTML = `
    <table class="cart-table">
      <tr>
        <th>Product</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
        <th></th>
      </tr>

      ${cart.map(p => {
        let rowTotal = p.qty * p.price;
        total += rowTotal;
        return `
          <tr>
            <td>${p.name}</td>
            <td>${p.qty}</td>
            <td>₹${p.price}</td>
            <td>₹${rowTotal}</td>

            <td>
              <button class="btn"
              onclick="removeFromCart('${p.id}'); renderCartPage('${boxId}')">X</button>
            </td>
          </tr>`;
      }).join("")}
    </table>

    <div class="cart-summary">
      <span class="grand">Grand Total: ₹${total.toLocaleString()}</span>

      <button class="btn add" onclick="window.location='checkout.html'">
        Checkout
      </button>
    </div>
  `;
}


/* =====================================================
      CHECKOUT LOGIC
=====================================================*/
function placeOrder(name, address, phone){
  if(!name || !address || !phone) return alert("Fill all details!");

  localStorage.setItem("last_order_id", "ORD" + Math.floor(Math.random()*900000+100000));
  localStorage.setItem("last_order_cart", JSON.stringify(getCart()));

  saveCart([]);
  window.location = "success.html";
}
