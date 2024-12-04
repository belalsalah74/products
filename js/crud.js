"use strict";
let productsList = JSON.parse(localStorage.getItem("productsList")) || [];
let sorted = true;
let searchList;

const elements = {
  productModal: document.getElementById("productModal"),
  clearAllModal: document.getElementById("clearAllModal"),
  productName: document.getElementById("name"),
  productPrice: document.getElementById("price"),
  productCategory: document.getElementById("category"),
  productImage: document.getElementById("image"),
  productDescription: document.getElementById("description"),
  productSearch: document.querySelector("input[type=search]"),
  submitBtn: document.getElementById("submit-btn"),
  editBtn: document.getElementById("edit-btn"),
  clearBtn: document.getElementById("clearBtn"),
  alertPlaceholder: document.getElementById("alert"),
  productsElement: document.getElementById("products"),
  form: document.querySelector("form"),
  inputs: document.querySelectorAll("form .form-control"),
  sortable: document.querySelectorAll(".sortable"),
};

displayProducts(productsList);

// Bootstrap
const productModal = bootstrap.Modal.getOrCreateInstance(elements.productModal);
const clearAllModal = bootstrap.Modal.getOrCreateInstance(
  elements.clearAllModal
);
const clearTooltip = new bootstrap.Tooltip(elements.clearBtn);
clearTooltip.disable();
// Events
elements.form.setAttribute("onSubmit", "addProduct(event)");
elements.productSearch.addEventListener("input", (event) =>
  productSearch(event)
);
elements.clearBtn.addEventListener("click", confirmClear);
elements.productModal.addEventListener("hide.bs.modal", () => editInputs());
for (let input of elements.inputs) {
  input.addEventListener("change", (event) => inputIsValid(event.target));
}
elements.sortable.forEach((row) =>
  row.addEventListener("click", (e) => sortProducts(e))
);

// Functions
function sortProducts(e) {
  function sortArray(array, criteria) {
    if (sorted) {
      array.sort((a, b) => b[criteria] - a[criteria]);
      sorted = false;
      e.target.firstElementChild.classList.replace(
        "fa-chevron-down",
        "fa-chevron-up"
      );
    } else {
      array.sort((a, b) => a[criteria] - b[criteria]);
      e.target.firstElementChild.classList.replace(
        "fa-chevron-up",
        "fa-chevron-down"
      );
      sorted = true;
    }
  }
  if (e.target.id === "numberRow") {
    searchList ? sortArray(searchList, "id") : sortArray(productsList, "id");
  } else if (e.target.id === "priceRow") {
    searchList
      ? sortArray(searchList, "price")
      : sortArray(productsList, "price");
  }

  searchList ? displayProducts(searchList) : displayProducts();
}
function editInputs(product = null) {
  elements.productName.value = product ? product.name : "";
  elements.productPrice.value = product ? product.price : "";
  elements.productCategory.value = product ? product.category : "";
  elements.productImage.value = "";
  elements.productDescription.value = product ? product.description : "";

  for (let input of elements.inputs) {
    input.classList.remove("is-valid");
  }

  if (elements.submitBtn.innerHTML.trim() === "Update") {
    resetSubmit();
  }
}

function inputIsValid(input) {
  const regex = {
    name: /^[a-zA-Z][\w-]{2,250}/,
    price: /^([6-9][0-9]{2}|[1-5][0-9]{3}|6000)$/,
    category: /(Mobiles|Laptops|Screens|Accesories|PC)/,
    description: /^\w{0,250}$/,
  };
  if (input.type === "file") {
    if (!input.files.length || !input.files[0].type.startsWith("image/")) {
      addInValid();
      return false;
    } else {
      addValid();
    }
  } else {
    if (!regex[input.id].test(input.value)) {
      addInValid();
      return false;
    } else {
      addValid();
    }
  }

  function addInValid() {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
  }

  function addValid() {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
  }
  return true;
}

function formIsValid() {
  for (let input of elements.inputs) {
    if (!inputIsValid(input)) {
      return false;
    }
  }
  return true;
}

function productSearch(e) {
  searchList = [];
  const query = e.target.value;
  for (let product of productsList) {
    if (query.length) {
      if (product.name.toLowerCase().includes(query.toLowerCase())) {
        searchList.push(product);
        product.title = product.name
          .toLowerCase()
          .replaceAll(query.toLowerCase(), `<mark>${query}</mark>`);
      }
      displayProducts(searchList);
    } else {
      product.title = null;
      searchList = null;
      displayProducts();
    }
  }
}
function addProduct(e) {
  e.preventDefault();
  if (formIsValid()) {
    let id = productsList.length + 1 || 1;
    var product = {
      name: elements.productName.value,
      price: elements.productPrice.value,
      category: elements.productCategory.value,
      imageSrc: elements.productImage.files[0].name,
      description: elements.productDescription.value,
      id,
    };
    productsList.push(product);
    postAction();
    productModal.hide();
    successAlert("Succesfully added");
    getCategories();
    clearTooltip.disable();
  } else {
    console.log("error");
  }
}

function displayProducts(list = productsList) {
  if (list.length) {
    elements.productsElement.innerHTML = "";
    list.forEach((product, index) => {
      elements.productsElement.innerHTML += `
              <tr>
                <td>${product.id}</td>
                  <td class="text-capitalize">
                  <span class="fw-medium">${
                    product.title || product.name
                  }</span>
                  </td>
                   <td>
                      <img src="./imgs/${product.imageSrc}" class="rounded-3" />
                    </td>
                  <td class="fw-semibold">$${product.price}</td>
                  <td>
                    <span class="badge bg-info-subtle fw-normal text-dark"
                      >${product.category}</span
                    >
                  </td>
                  <td class="text-wrap w-50 text-secondary-emphasis">
                   ${product.description}
                  </td>
                  <td>
                    <button
                      class="btn btn-success btn-sm py-2 edit-btn "
                      data-bs-toggle="modal"
                      data-bs-target="#productModal"
                      onClick="editProduct(${index})"
                    >
                        <i class="fa-solid fa-pen fa-fw"></i>
                   </button>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-danger py-2"  onclick="deleteProduct(${index})">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
           
          `;
    });
  } else {
    elements.productsElement.innerHTML = `
      <tr>
        <td colspan=4 class="text-secondary text-center">No products found</td>
      </tr>
      `;
  }
}

function deleteProduct(index) {
  if (searchList) {
    let product = searchList[index];
    searchList.splice(index, 1);
    productsList.splice(productsList.indexOf(product), 1);
  } else {
    productsList.splice(index, 1);
  }
  postAction();
}
function getProduct(index) {
  let product;
  if (searchList) {
    product = productsList[productsList.indexOf(product)] = searchList[index];
  } else {
    product = productsList[index];
  }
  return product;
}
function editProduct(index) {
  const product = getProduct(index);
  editInputs(product);
  editSubmit(index);
}

function editSubmit(index) {
  elements.submitBtn.textContent = "Update";
  elements.form.setAttribute("onSubmit", `updateProduct(event,${index})`);
}

function resetSubmit() {
  elements.submitBtn.textContent = "Submit";
  elements.form.setAttribute("onSubmit", "addProduct(event)");
}

function updateProduct(event, index) {
  event.preventDefault();
  const product = getProduct(index);
  if (formIsValid()) {
    product.name = elements.productName.value;
    product.price = elements.productPrice.value;
    product.category = elements.productCategory.value;
    product.description = elements.productDescription.value;
    product.imageSrc = elements.productImage.files[0].name;
    productModal.hide();
    successAlert("Product updated successfully.");
    if (searchList) {
      elements.productSearch.value = product.name;
      product.title = product.name;
    }
    postAction();
  } else console.log("error");
}

function postAction(clear = false) {
  editInputs();
  searchList ? displayProducts(searchList) : displayProducts();
  if (clear) {
    localStorage.removeItem("productsList");
    return;
  }
  localStorage.setItem("productsList", JSON.stringify(productsList));
}

function confirmClear() {
  if (productsList.length) {
    clearAllModal.show();
  } else {
    clearTooltip.enable();
  }
}

function clearAll() {
  productsList = [];
  postAction(true);
}

function successAlert(message) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<div class="alert alert-success fade show" role="alert">
        <div>${message}</div>
    </div>`;
  elements.alertPlaceholder.append(wrapper);
  wrapper.animate(
    [
      {
        opacity: 0,
      },
      {
        opacity: 1,
      },
    ],
    500
  );

  const bsAlert = bootstrap.Alert.getOrCreateInstance(
    document.querySelector(".alert")
  );
  setTimeout(() => {
    wrapper.animate(
      [
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
      ],
      400
    );
    bsAlert.close();
  }, 2500);
}
