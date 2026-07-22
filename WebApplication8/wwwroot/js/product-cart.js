
let lastDeliveryTier = 0; // 0: normal, 1: half, 2: free

const vegDatabase = {
    1: { name: "Banana Cake", desc: "Moist and flavorful banana cake", price: 45, image: "https://via.placeholder.com/150/FFD700/000000?text=BananaCake" },
    2: { name: "Brownie", desc: "Rich and fudgy chocolate brownie", price: 50, image: "https://via.placeholder.com/150/8B4513/FFFFFF?text=Brownie" },
    3: { name: "Cake Pop", desc: "Mini cake on a stick, coated in chocolate", price: 30, image: "https://via.placeholder.com/150/FF69B4/FFFFFF?text=CakePop" },
    4: { name: "Cheesecake", desc: "Creamy cheesecake with a graham cracker crust", price: 70, image: "https://via.placeholder.com/150/F0F8FF/000000?text=Cheesecake" },
    5: { name: "Chocolate Strawberry", desc: "Fresh strawberries dipped in chocolate", price: 80, image: "https://via.placeholder.com/150/FF0000/FFFFFF?text=ChocoStrawberry" },
    6: { name: "Churros", desc: "Crispy fried dough sticks rolled in cinnamon sugar", price: 40, image: "https://via.placeholder.com/150/A0522D/FFFFFF?text=Churros" },
    7: { name: "Cookies", desc: "Soft and chewy chocolate chip cookies", price: 25, image: "https://via.placeholder.com/150/D2B48C/000000?text=Cookies" },
    8: { name: "Cupcake", desc: "Moist vanilla cupcake topped with buttercream", price: 35, image: "https://via.placeholder.com/150/FFC0CB/000000?text=Cupcake" },
    9: { name: "Donuts", desc: "Fluffy donuts with various glazes and toppings", price: 20, image: "https://via.placeholder.com/150/FFDAB9/000000?text=Donuts" },
    10: { name: "Matilda Cake", desc: "Decadent chocolate cake inspired by Matilda", price: 60, image: "https://via.placeholder.com/150/6A0DAD/FFFFFF?text=MatildaCake" },
    11: { name: "Milk Cake", desc: "Traditional Indian sweet made from condensed milk", price: 50, image: "https://via.placeholder.com/150/F5F5DC/000000?text=MilkCake" },
    12: { name: "Tiramisu", desc: "Classic Italian dessert with layers of coffee-soaked ladyfingers", price: 90, image: "https://via.placeholder.com/150/8B4513/FFFFFF?text=Tiramisu" },
    13: { name: "Pudding", desc: "Creamy vanilla pudding topped with caramel", price: 40, image: "https://via.placeholder.com/150/F0E68C/000000?text=Pudding" },
    14: { name: "Sundae", desc: "Ice cream topped with hot fudge and whipped cream", price: 60, image: "https://via.placeholder.com/150/ADD8E6/000000?text=Sundae" },
    15: { name: "Waffle", desc: "Crispy waffles served with syrup and butter", price: 55, image: "https://via.placeholder.com/150/F4A460/000000?text=Waffle" }
};

let cart = [];

document.addEventListener("DOMContentLoaded", function () {
    ["productId", "quantity"].forEach(function (id) {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", function () {
                this.value = this.value.replace(/[^0-9]/g, "");
            });
        }
    });

    const okBtn = document.getElementById("customAlertOk");
    if (okBtn) {
        okBtn.onclick = function () {
            document.getElementById("customAlert").style.display = "none";
        };
    }

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.content');

    if (menuToggle && sidebar && content) { // Ensure elements exist
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            content.classList.toggle('shifted');
        });
    }

    // Drag functionality for custom alert
    const alertBox = document.getElementById("customAlert");
    const header = document.getElementById("customAlertHeader");
    let offsetX = 0, offsetY = 0, isDown = false;

    if (header && alertBox) {
        header.onmousedown = function (e) {
            isDown = true;
            offsetX = e.clientX - alertBox.offsetLeft;
            offsetY = e.clientY - alertBox.offsetTop;
            document.onmousemove = function (e) {
                if (!isDown) return;
                alertBox.style.left = (e.clientX - offsetX) + "px";
                alertBox.style.top = (e.clientY - offsetY) + "px";
            };
            document.onmouseup = function () {
                isDown = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    renderCart();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    fillEmptyRows(); // Call fillEmptyRows on DOMContentLoaded
});

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

window.addProduct = function () {
    const idInput = document.getElementById("productId");
    const qtyInput = document.getElementById("quantity");

    // Add checks for null before accessing .value
    if (!idInput || !qtyInput) {
        console.error("Product ID or Quantity input element not found.");
        return;
    }

    const id = idInput.value.trim();
    const qty = qtyInput.value.trim();

    if (!id && !qty) {
        showCustomAlert("Please enter Product ID and Quantity");
        idInput.focus();
        return;
    }
    if (!id) {
        showCustomAlert("Please enter Product ID.");
        idInput.focus();
        return;
    }
    if (!qty) {
        showCustomAlert("Please enter Quantity.");
        qtyInput.focus();
        return;
    }

    const product = vegDatabase[id];
    if (!product) {
        showCustomAlert("Invalid Product ID.");
        idInput.focus();
        return;
    }

    // Check if product already exists in the cart
    let found = false;
    for (let item of cart) {
        if (item.id === id) {
            item.qty = parseInt(item.qty, 10) + parseInt(qty, 10);
            found = true;
            break;
        }
    }

    if (!found) {
        cart.push({
            id: id,
            name: product.name,
            price: product.price,
            qty: parseInt(qty, 10)
        });
    }

    renderCart();

    idInput.value = '';
    qtyInput.value = '';
    idInput.focus();
}

window.addToCartFromPanel = function (btn) {
    const itemDiv = btn.closest('.item');
    if (!itemDiv) {
        console.error("Could not find parent .item for the clicked button.");
        return;
    }
    const id = itemDiv.getAttribute('data-id');
    const name = itemDiv.getAttribute('data-name');
    const price = parseFloat(itemDiv.getAttribute('data-price'));

    // Check if product already in cart
    let existing = cart.find(x => x.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    renderCart();
};

function renderCart() {
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let netTotal = 0;

    cart.forEach((item, idx) => {
        const total = item.price * item.qty;
        netTotal += total;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="sno-col">${idx + 1}</td>
            <td class="product-col">${item.name}</td>
            <td class="unitrate-col">${item.price.toFixed(2)}</td>
            <td class="qty-col">
                <div class="qty-circle-selector">
                    <button type="button" class="qty-circle-btn" onclick="changeCartQty(${idx}, -1)">&#8722;</button>
                    <span class="qty-circle-value">${item.qty}</span>
                    <button type="button" class="qty-circle-btn" onclick="changeCartQty(${idx}, 1)">&#43;</button>
                </div>
            </td>
            <td class="total-col">${total.toFixed(2)}</td>
            <td style="text-align:center;">
                <button class="delete-row-btn" onclick="removeCartItem(${idx})" title="Delete">&#128465;</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Calculate grand total for all items in the cart
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.qty;
    });

    let gst = subtotal * 0.02;
    let deliveryCharges = 0;
    let currentTier = 0;
    let preDeliveryTotal = subtotal + gst;
    if (cart.length > 0) {
        if (preDeliveryTotal > 1000) {
            deliveryCharges = 0;
            currentTier = 2;
        } else if (preDeliveryTotal > 500) {
            deliveryCharges = 25;
            currentTier = 1;
        } else {
            deliveryCharges = 50;
            currentTier = 0;
        }
    }
    // Show alert only when the tier changes upward
    // Also, show alert if it's the first render and a tier is met
    if (currentTier > lastDeliveryTier || (lastDeliveryTier === 0 && currentTier > 0)) {
        if (currentTier === 1) {
            showCustomAlert("Congratulations! 50% off on delivery for purchase above 500rs.", "alert-success");
        } else if (currentTier === 2) {
            showCustomAlert("Congratulations! Free delivery for purchase above 1000rs.", "alert-success");
        }
    }
    lastDeliveryTier = currentTier;

    let grandTotal = subtotal + gst + deliveryCharges;

    // Update totals outside the table
    const netTotalEl = document.getElementById("netTotalPage");
    const gstEl = document.getElementById("gst");
    const deliveryChargesEl = document.getElementById("deliveryCharges");
    const grandTotalEl = document.getElementById("grandTotal");

    if (netTotalEl) netTotalEl.textContent = netTotal.toFixed(2);
    if (gstEl) gstEl.textContent = gst.toFixed(2);
    if (deliveryChargesEl) deliveryChargesEl.textContent = deliveryCharges.toFixed(2);
    if (grandTotalEl) grandTotalEl.textContent = grandTotal.toFixed(2);

    fillEmptyRows(); // Ensure empty rows are filled after rendering cart
}

window.changeCartQty = function (index, delta) {
    if (cart[index]) { // Ensure item exists at index
        cart[index].qty += delta;
        if (cart[index].qty < 1) cart[index].qty = 1;
        renderCart();
    }
};

window.updateCartQty = function (input, realIndex) {
    let val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (cart[realIndex]) { // Ensure item exists at realIndex
        cart[realIndex].qty = val;
        renderCart();
    }
};

window.removeCartItem = function (index) {
    if (index > -1 && index < cart.length) { // Validate index
        cart.splice(index, 1);
        renderCart();
    }
};

// Removed the Razor syntax block @if (Context.Session.GetString("UserName") != null) { ... }
// This JavaScript file should not contain server-side Razor syntax.
// The `clearGrid` function should be directly defined or managed by the client-side.

window.clearGrid = function () {
    const modal = document.getElementById("confirmModal");
    if (!modal) {
        console.error("Confirmation modal not found.");
        return;
    }
    modal.style.display = "flex";

    const modalCancelBtn = document.getElementById("modalCancelBtn");
    const modalOkBtn = document.getElementById("modalOkBtn");

    if (modalCancelBtn) {
        modalCancelBtn.onclick = function () {
            modal.style.display = "none";
        };
    }

    if (modalOkBtn) {
        modalOkBtn.onclick = function () {
            modal.style.display = "none";
            cart = []; // Clear the cart
            renderCart(); // Re-render the cart to show it's empty
            showToast("Cart cleared successfully!");
        };
    }
};


// Optional: Close modal if user clicks outside modal content
window.onclick = function (event) {
    const modal = document.getElementById("confirmModal");
    if (modal && event.target === modal) {
        modal.style.display = "none";
    }
};

function showCustomAlert(message, cssClass) {
    const alertBox = document.getElementById("customAlert");
    if (!alertBox) return;
    const customAlertMsg = document.getElementById("customAlertMsg");
    if (customAlertMsg) {
        customAlertMsg.textContent = message;
    }

    // Remove any previous alert-success class
    alertBox.classList.remove("alert-success");

    // Add the new class if provided
    if (cssClass) {
        alertBox.classList.add(cssClass);
    }

    alertBox.style.display = "block";
    alertBox.style.top = "30%";
    alertBox.style.left = "40%";
    const customAlertOk = document.getElementById("customAlertOk");
    if (customAlertOk) {
        customAlertOk.focus();
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

function updateDateTime() {
    const now = new Date();
    const formatted = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
    const el = document.getElementById('currentDateTime');
    if (el) el.textContent = formatted;
}

// Your existing PDF function (with fixes from earlier)
window.downloadTableAsPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const startY = 60;

    doc.setFontSize(18);
    doc.text("Product Cart Report", margin, 40);

    const table = document.getElementById('productTable');
    if (!table) {
        alert('Table not found');
        return;
    }

    // Headers except delete column
    const headers = [];
    const ths = table.querySelectorAll('thead tr th');
    for (let i = 0; i < ths.length - 1; i++) {
        headers.push(ths[i].innerText.trim());
    }

    // Rows
    const data = [];
    const trs = table.querySelectorAll('tbody tr');
    trs.forEach(tr => {
        const row = [];
        const tds = tr.querySelectorAll('td');
        // Loop up to tds.length - 1 to exclude the last column (delete button)
        for (let i = 0; i < tds.length - 1; i++) {
            let cellText = tds[i].textContent || "";
            if (i === 3) { // Assuming quantity column is at index 3
                cellText = cellText.replace(/[^0-9]/g, '').trim();
            } else {
                cellText = cellText.trim();
            }
            row.push(cellText);
        }
        data.push(row);
    });

    doc.autoTable({
        head: [headers],
        body: data,
        startY: startY,
        margin: { left: margin, right: margin },
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        theme: 'striped',
        columnStyles: {
            0: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'right' }
        }
    });

    let posY = doc.lastAutoTable.finalY + 20;
    const rightMargin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();

    const netTotal = document.getElementById('netTotalPage')?.innerText || '0.00';
    const gst = document.getElementById('gst')?.innerText || '0.00';
    const deliveryCharges = document.getElementById('deliveryCharges')?.innerText || '0.00';
    const grandTotal = document.getElementById('grandTotal')?.innerText || '0.00';

    function drawLine(label, value, y) {
        doc.setFontSize(12);
        doc.text(label, pageWidth - rightMargin - 150, y);
        doc.text(value, pageWidth - rightMargin, y, { align: 'right' });
    }

    drawLine('Net Total:', netTotal, posY);
    drawLine('GST (2%):', gst, posY + 18);
    drawLine('Delivery Charges:', deliveryCharges, posY + 36);
    doc.setFont(undefined, 'bold');
    drawLine('Grand Total:', grandTotal, posY + 54);
    doc.setFont(undefined, 'normal');

    doc.save('product-cart-report.pdf');
};


// The CSV export logic was incomplete and had a syntax error.
// Assuming 'csv' array was intended to be generated here.
// I've commented out the problematic lines. If you need CSV export,
// you'll need to implement the CSV generation logic properly.
/*
    const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product-cart-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
*/

document.querySelector('.menu-toggle').addEventListener('click', function () {
    document.querySelector('.menu-bar').classList.toggle('open');
    document.querySelector('.menu-container').classList.toggle('menu-open');
});

let startX = 0;
let isDragging = false;

// Ensure these selectors exist in your HTML
const contentElement = document.querySelector('.content');
const menuBarElement = document.querySelector('.menu-bar');
const menuContainerElement = document.querySelector('.menu-container');

if (contentElement) {
    contentElement.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    contentElement.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        let moveX = e.touches[0].clientX;
        if (moveX - startX > 50) {
            if (menuBarElement) menuBarElement.classList.add('open');
            if (menuContainerElement) menuContainerElement.classList.add('menu-open');
            isDragging = false;
        }
    });

    contentElement.addEventListener('touchend', function () {
        isDragging = false;
    });
}


// JavaScript functions
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu) {
        // Toggle the 'left' property to show/hide the menu
        if (sideMenu.style.left === '0px') {
            sideMenu.style.left = '-250px'; // Hide menu
        } else {
            sideMenu.style.left = '0px'; // Show menu
        }
    }
}

function showContent(sectionId) {
    // Hide all content sections
    const sections = document.querySelectorAll('.menu-content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Hide the initial content
    const initialContent = document.getElementById('initialContent');
    if (initialContent) { // Check if it exists before trying to hide
        initialContent.style.display = 'none';
    }

    // Show the selected content section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) { // Check if it exists before trying to show
        selectedSection.style.display = 'block';
    }

    // Close the side menu after selecting an item
    toggleMenu();
}

function hideContent() {
    // Hide all content sections
    const sections = document.querySelectorAll('.menu-content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show the initial content
    const initialContent = document.getElementById('initialContent');
    if (initialContent) { // Check if it exists before trying to show
        initialContent.style.display = 'block';
    }
}

function logout() {
    // In a real application, you'd perform logout actions here (e.g., redirect to login page)
    alert("You have been logged out. (This is a placeholder)");
    // Example: window.location.href = 'login.html'; // Uncomment to redirect
}

function updateCartTable() {
    // This function seems to be intended to refresh the cart display.
    // renderCart() already does this, so this might be redundant or
    // needs to be properly implemented if it has a different purpose.
    renderCart();
}

function fillEmptyRows() {
    const cartBody = document.getElementById("productTable").querySelector("tbody"); // Targeting the correct tbody
    if (!cartBody) return; // Exit if tbody not found

    const currentRows = cartBody.getElementsByTagName("tr").length;
    const minRows = 10;

    // Clear existing empty rows to prevent accumulation if re-rendering
    // (This is a common issue; better to re-render completely or manage rows more carefully)
    // For simplicity, let's just append if currentRows < minRows
    if (currentRows < minRows) {
        for (let i = currentRows; i < minRows; i++) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `
                <td style="height: 40px;"></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `;
            cartBody.appendChild(emptyRow);
        }// --- New Functions for "Items" Section and Item Detail Modal ---

        // Function to render the list of all items from vegDatabase
        function renderItemsList() {
            const itemsListContainer = document.getElementById('itemsListContainer');
            if (!itemsListContainer) {
                console.error("Items list container not found!");
                return;
            }

            itemsListContainer.innerHTML = ''; // Clear previous content

            // Loop through vegDatabase to create item cards
            for (const id in vegDatabase) {
                const item = vegDatabase[id];
                const itemCard = document.createElement('div');
                itemCard.classList.add('item-card');
                itemCard.setAttribute('data-id', id); // Store the product ID

                itemCard.innerHTML = `
            <img class="item-card-image" src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>${item.desc}</p>
            <p class="price">${item.price.toFixed(2)} Rs.</p>
        `;

                // Add click listener to each item card to show its details
                itemCard.addEventListener('click', () => showItemDetailModal(id));
                itemsListContainer.appendChild(itemCard);
            }
        }

        // Function to show the item detail modal
        window.showItemDetailModal = function (productId) {
            const item = vegDatabase[productId];
            if (!item) {
                console.error("Item not found for ID:", productId);
                return;
            }

            const modal = document.getElementById('itemDetailModal');
            if (!modal) {
                console.error("Item detail modal not found!");
                return;
            }

            // Populate modal content
            document.getElementById('itemModalImage').src = item.image;
            document.getElementById('itemModalId').textContent = productId;
            document.getElementById('itemModalName').textContent = item.name;
            document.getElementById('itemModalDesc').textContent = item.desc;
            document.getElementById('itemModalRate').textContent = item.rate_per_kg.toFixed(2); // Using rate_per_kg

            // Show the modal
            modal.style.display = 'flex'; // Use flex to center with align-items/justify-content
        };

        // Function to close the item detail modal
        window.closeItemDetailModal = function () {
            const modal = document.getElementById('itemDetailModal');
            if (modal) {
                modal.style.display = 'none';
            }
        };

        // --- Modify the existing showContent function ---
        // You will find this function already in your product-cart.js
        // Update it to call renderItemsList() when 'itemsSection' is shown.
        function showContent(sectionId) {
            // Hide all content sections
            const sections = document.querySelectorAll('.menu-content-section');
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Hide the initial content
            const initialContent = document.getElementById('initialContent');
            if (initialContent) { // Check if it exists before trying to hide
                initialContent.style.display = 'none';
            }

            // Show the selected content section
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) { // Check if it exists before trying to show
                selectedSection.style.display = 'block';

                // NEW: Call renderItemsList if the "Items" section is being shown
                if (sectionId === 'itemsSection') {
                    renderItemsList();
                }
            }

            // Close the side menu after selecting an item
            toggleMenu(); // Assuming toggleMenu closes the menu if open
        }

        // ... rest of your product-cart.js file ...

        // Optional: Add an event listener to close the item detail modal if clicked outside
        document.addEventListener('DOMContentLoaded', function () {
            const itemDetailModal = document.getElementById('itemDetailModal');
            if (itemDetailModal) {
                itemDetailModal.addEventListener('click', function (event) {
                    if (event.target === itemDetailModal) {
                        closeItemDetailModal();
                    }
                });
            }
        });
    }
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }

    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ✅ Closes all modals and hides the overlay
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });

    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}


    // Load saved data if available
    window.onload = function () {
        const name = localStorage.getItem('custName');
    const address = localStorage.getItem('custAddress');
    const phone = localStorage.getItem('custPhone');

    if (name) document.getElementById('custName').value = name;
    if (address) document.getElementById('custAddress').value = address;
    if (phone) document.getElementById('custPhone').value = phone;
    };

    function saveCustomerDetails(event) {
        event.preventDefault(); // prevent page reload

    const name = document.getElementById('custName').value;
    const address = document.getElementById('custAddress').value;
    const phone = document.getElementById('custPhone').value;

    localStorage.setItem('custName', name);
    localStorage.setItem('custAddress', address);
    localStorage.setItem('custPhone', phone);

    document.getElementById('saveMessage').style.display = 'block';
        setTimeout(() => {
        document.getElementById('saveMessage').style.display = 'none';
        }, 2000);
    }
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.dataset.target;
            hideContent();
            const section = document.getElementById(target);
            if (section) section.style.display = 'block';
        });
    });
});
