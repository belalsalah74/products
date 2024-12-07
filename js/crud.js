"use strict";
let productsList = JSON.parse(localStorage.getItem("productsList")) || [];
let categories = JSON.parse(localStorage.getItem("categoryList")) || [];
let sorted = true;
let searchList;
let filteredList;
let showing = "product";
const elements = {
  productModal: document.getElementById("productModal"),
  clearAllModal: document.getElementById("clearAllModal"),
  productName: document.getElementById("name"),
  productPrice: document.getElementById("price"),
  productCategory: document.getElementById("category"),
  productImage: document.getElementById("image"),
  productDescription: document.getElementById("description"),
  productSearch: document.querySelector("input[type=search]"),
  categorySelect: document.getElementById("categorySelect"),
  submitBtn: document.getElementById("submit-btn"),
  editBtn: document.getElementById("edit-btn"),
  clearBtn: document.getElementById("clearBtn"),
  alertPlaceholder: document.getElementById("alert"),
  productsElement: document.getElementById("products"),
  form: document.querySelector("form"),
  inputs: document.querySelectorAll("form .form-control"),
  sortable: document.querySelectorAll(".sortable"),
  main: document.querySelector("main"),
  navBar: document.querySelector("nav"),
  categoryInput: document.getElementById("category-input"),
  newCategory: document.getElementById("newCategory"),
  categoryFeedback: document.getElementById("category-feedback"),
};

// init

getCategories();
displayProducts();

// Bootstrap
const productModal = new bootstrap.Modal(elements.productModal);
const clearAllModal = new bootstrap.Modal(elements.clearAllModal);
const clearTooltip = new bootstrap.Tooltip(elements.clearBtn);
clearTooltip.disable();

// Events
elements.form.setAttribute("onSubmit", "addProduct(event)");
elements.productSearch.addEventListener("input", (event) =>
  productSearch(event)
);
elements.clearBtn.addEventListener("click", confirmClear);
elements.categorySelect.addEventListener("input", (e) => categoryFilter(e));
elements.productModal.addEventListener("hide.bs.modal", () => editInputs());


elements.inputs.forEach((input) =>
  input.addEventListener("change", (event) => inputIsValid(event.target))
);
elements.sortable.forEach((item) =>
  item.addEventListener("click", (e) => sortProducts(e))
);

// Functions
function getCategories() {
  const currenttCategories = new Set(productsList.map((p) => p.category));
  elements.categorySelect.innerHTML = ` <option value="">All</option>`;
  Array.from(currenttCategories).forEach((c) => {
    elements.categorySelect.innerHTML += ` <option value="${c}">${c}</option>`;
  });

  elements.categoryInput.innerHTML = "";
  categories.forEach((c) => {
    elements.categoryInput.innerHTML += ` <option value="${c}">${c}</option>`;
  });
  if (categories.length) {
    elements.newCategory.checked = false;
  }
}
function sortProducts(e) {
  function sortArray(array, criteria) {
    if (sorted) {
      array.sort((a, b) => b[criteria] - a[criteria]);
      sorted = false;
      e.currentTarget.firstElementChild.classList.replace(
        "fa-chevron-down",
        "fa-chevron-up"
      );
    } else {
      array.reverse();
      e.currentTarget.firstElementChild.classList.replace(
        "fa-chevron-up",
        "fa-chevron-down"
      );
      sorted = true;
    }
    displayProducts(array);
  }
  if (showing === "search") {
    sortArray(searchList, e.currentTarget.id.replace("Row", ""));
  } else if (showing === "category") {
    sortArray(filteredList, e.currentTarget.id.replace("Row", ""));
  } else {
    sortArray(productsList, e.currentTarget.id.replace("Row", ""));
  }
}
function editInputs(product = null) {
  if (product) {
    elements.productName.value = product.name;
    elements.productPrice.value = product.price;
    elements.productCategory.value = product.category;
    elements.productDescription.value = product.description;
    const myFile = new File([""], product.imageSrc, {
      type: `image/${product.imageSrc.slice(product.imageSrc.indexOf("."))}`,
    });

    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(myFile);

    const fileList = dataTransfer.files;

    elements.productImage.files = fileList;
  } else {
    elements.form.reset();
    editSubmit();
  }
  if (categories.length) {
    elements.newCategory.checked = false;
  } else {
    elements.newCategory.checked = true;
  }
  for (let input of elements.inputs) {
    input.classList.remove("is-valid", "is-invalid");
  }
}
function inputIsValid(input) {
  const regex = {
    name: /^[a-zA-Z][\w-]{2,250}/,
    price: /^([6-9][0-9]{3}|[1-5][0-9]{4}|60000)$/,
    description: /^\w{0,250}$/,
  };
  // validate category
  if (input.id === "category") {
    if (elements.newCategory.checked && input.value.length < 3) {
      elements.categoryFeedback.innerHTML =
        "Category must be at least 3 characters";
      elements.categoryFeedback.style.display = "block";
      addInValid();
      return false;
    } else if (!elements.newCategory.checked) {
      if (!categories.includes(input.value)) {
        addInValid();
        elements.categoryFeedback.innerHTML = "Please choose valid category";
        elements.categoryFeedback.style.display = "block";
        return false;
      }
    }
    addValid();
    elements.categoryFeedback.style.display = "none";
    return true;
  }
  // validate image
  else if (input.type === "file") {
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

function categoryFilter(e) {
  showing = "category";
  let currentList = searchList ? [...searchList] : [...productsList];
  filteredList = [];
  if (e.target.value) {
    for (let product of productsList) {
      if (product.category === e.target.value) {
        filteredList.push(product);
      }
    }
    if (searchList) {
      searchList = productsList.filter((p) =>
        p.name.includes(elements.productSearch.value)
      );
      filteredList = searchList.filter((p) => p.category == e.target.value);
    }
    displayProducts(filteredList);
  } else {
    showing = searchList ? "search" : "product";
    filteredList = null;
    if (searchList) {
      searchList = productsList.filter((p) =>
        p.name.includes(elements.productSearch.value)
      );
      currentList = [...searchList];
    }
    displayProducts(currentList);
  }
}
function productSearch(e) {
  let currentList = filteredList ? [...filteredList] : [...productsList];
  searchList = [];
  showing = "search";
  const query = e.target.value;
  if (query.length) {
    for (let product of productsList) {
      if (product.name.toLowerCase().includes(query.toLowerCase())) {
        searchList.push(product);
        product.title = product.name
          .toLowerCase()
          .replaceAll(query.toLowerCase(), `<mark>${query}</mark>`);
      }
    }
    if (filteredList) {
      filteredList = productsList.filter(
        (p) => p.category == elements.categorySelect.value
      );
      searchList = filteredList.filter((p) => p.name.includes(query));
    }
    displayProducts(searchList);
  } else {
    productsList.forEach((p) => (p.title = null));
    searchList = null;
    if (filteredList) {
      filteredList = productsList.filter(
        (p) => p.category == elements.categorySelect.value
      );
      currentList = [...filteredList];
    }
    showing = filteredList ? "category" : "product";
    displayProducts(currentList);
  }
}
function addProduct(e) {
  e.preventDefault();
  let id = +localStorage.getItem("id") || 1;
  if (formIsValid()) {
    let product = {
      name: elements.productName.value,
      price: elements.productPrice.value,
      category: elements.productCategory.value,
      description: elements.productDescription.value,
      imageSrc: elements.productImage.files[0].name,
      id,
    };
    productsList.push(product);
    if (elements.newCategory.checked) {
      categories.push(elements.productCategory.value);
      localStorage.setItem("categoryList", JSON.stringify(categories));
      getCategories();
    }

    postAction();
    productModal.hide();
    successAlert("Succesfully added");
    clearTooltip.disable();
    id++;
    localStorage.setItem("id", id);
  }
}

function displayProducts(list = productsList) {
  if (list.length) {
    elements.productsElement.innerHTML = "";
    list.forEach((product, index) => {
      elements.productsElement.innerHTML += `
              <tr class="align-middle text-center">
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
                    <span class="badge bg-secondary fw-normal text-white"
                      >${product.category}</span
                    >
                  </td>
                  <td class="text-wrap  text-secondary-emphasis">
                   ${product.description}
                  </td>
                  <td>
                    <button
                      class="btn btn-success btn-sm py-2 edit-btn "
                      data-bs-toggle="modal"
                      data-bs-target="#productModal"
                      onClick="editProduct(${product.id})"
                    >
                        <i class="fa-solid fa-pen fa-fw"></i>
                   </button>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-danger py-2"  onclick="deleteProduct(${
                      product.id
                    })">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                </tr>
           
          `;
    });
  } else {
    elements.productsElement.innerHTML = `
      <tr>
        <td colspan=7 class="text-secondary text-center">No products found</td>
      </tr>
      `;
  }
}

function deleteProduct(id) {
  const product = getProduct(id);
  productsList.splice(productsList.indexOf(product), 1);
  if (searchList) {
    searchList.splice(searchList.indexOf(product), 1);
  }
  if (filteredList) {
    filteredList.splice(filteredList.indexOf(product), 1);
  }
  postAction();
}
function getProduct(id) {
  return productsList.find((p) => p.id == id);
}
function editProduct(id) {
  const product = getProduct(id);
  editInputs(product);
  editSubmit(id);
}

function editSubmit(id) {
  if (id) {
    elements.submitBtn.textContent = "Update";
    elements.form.setAttribute("onSubmit", `updateProduct(event,${id})`);
  } else {
    elements.submitBtn.textContent = "Submit";
    elements.form.setAttribute("onSubmit", "addProduct(event)");
  }
}

function updateProduct(event, id) {
  event.preventDefault();
  const product = getProduct(id);
  if (formIsValid()) {
    product.name = elements.productName.value;
    product.price = elements.productPrice.value;
    product.category = elements.productCategory.value;
    product.description = elements.productDescription.value;
    product.imageSrc = elements.productImage.files[0].name;
    productModal.hide();
    successAlert("Product updated successfully.");
    if (searchList) {
      product.title = product.name;
    }
    postAction();
  }
}

function postAction(clear = false) {
  editInputs();
  if (showing === "search") {
    displayProducts(searchList);
  } else if (showing == "category") {
    displayProducts(filteredList);
  } else {
    displayProducts();
  }
  if (clear) {
    localStorage.clear();
    return;
  }
  localStorage.setItem("productsList", JSON.stringify(productsList));
}

function confirmClear() {
  if (productsList.length) {
    clearAllModal.show();
  } else {
    clearTooltip.enable();
    clearTooltip.show();
  }
}

function clearAll() {
  productsList = [];
  categories = [];
  postAction(true);
}

function successAlert(message) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<div class="alert alert-success fade show" role="alert">
        <div>${message}</div>
    </div>`;
  elements.alertPlaceholder.append(wrapper);
  const bsAlert = bootstrap.Alert.getOrCreateInstance(
    document.querySelector(".alert")
  );
  setTimeout(() => {
    bsAlert.close();
  }, 2500);
}
