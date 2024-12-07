"use strict";
let productsList = JSON.parse(localStorage.getItem("productsList")) || [];
let sorted = true;
let isSearching = false;
let isFiltering = false;
let searchList;
let filteredList;
let showing;

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
};
displayProducts(productsList);

// init

elements.main.style.minHeight = `calc(100vh - ${
  getComputedStyle(elements.navBar).height
})`;

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
// function getCategories() {
//   const categories = new Set(productsList.map((p) => p.category));
//   categorySelect.innerHTML = `
//          <option value="">All</option>
//         `;
//   Array.from(categories).forEach((c) => {
//     categorySelect.innerHTML += `
//          <option value="${c}">${c}</option>
//         `;
//   });
// }

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

  for (let input of elements.inputs) {
    input.classList.remove("is-valid");
  }
}

function inputIsValid(input) {
  const regex = {
    name: /^[a-zA-Z][\w-]{2,250}/,
    price: /^([6-9][0-9]{3}|[1-5][0-9]{4}|60000)$/,
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

elements.categorySelect.addEventListener("input", (e) => categoryFilter(e));
function categoryFilter(e) {
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
    // if (filteredList) {
    //   filteredList = productsList.filter(
    //     (p) => p.category == elements.categorySelect.value
    //   );
    //   currentList = [...filteredList];
    // }
    displayProducts(currentList);
  }
}
function addProduct(e) {
  e.preventDefault();
  if (formIsValid()) {
    let id = productsList.length + 1 || 1;
    let product = {
      name: elements.productName.value,
      price: elements.productPrice.value,
      category: elements.productCategory.value,
      description: elements.productDescription.value,
      imageSrc: elements.productImage.files[0].name,
      id,
    };
    product.image = structuredClone(elements.productImage.files[0]);
    console.log(product);
    productsList.push(product);
    postAction();
    productModal.hide();
    successAlert("Succesfully added");
    clearTooltip.disable();
  }
}

function displayProducts(list = productsList) {
  if (list.length) {
    elements.productsElement.innerHTML = "";
    list.forEach((product, index) => {
      elements.productsElement.innerHTML += `
              <tr class="align-middle text-center">
                <td>${index + 1}</td>
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
        <td colspan=7 class="text-secondary text-center">No products found</td>
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
  if (index >= 0) {
    elements.submitBtn.textContent = "Update";
    elements.form.setAttribute("onSubmit", `updateProduct(event,${index})`);
  } else {
    elements.submitBtn.textContent = "Submit";
    elements.form.setAttribute("onSubmit", "addProduct(event)");
  }
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
  }
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
    clearTooltip.show();
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
