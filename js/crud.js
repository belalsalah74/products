// "use strict";
let productList = JSON.parse(localStorage.getItem("productsList")) || [];
let searchList = [];
const elements = {
  productName: document.getElementById("name"),
  productPrice: document.getElementById("price"),
  productCategory: document.getElementById("category"),
  productImage: document.getElementById("image"),
  productDescription: document.getElementById("description"),
  productSearch: document.querySelector("input[type=search]"),
  submitBtn: document.getElementById("submit-btn"),
  updateBtn: document.getElementById("update-btn"),
  productsElement: document.getElementById("products"),
  form: document.querySelector("form"),
  inputs: document.querySelectorAll("form .form-control"),
};

displayProducts(productList);

elements.form.setAttribute("onSubmit", "addProduct(event)");
elements.productSearch.addEventListener("input", (event) =>
  productSearch(event)
);

for (let input of elements.inputs) {
  input.addEventListener("blur", (event) => inputIsValid(event.target));
}

function productSearch(e) {
  searchList = [];
  const query = e.target.value;
  for (let product of productList) {
    if (product.name.toLowerCase().includes(query.toLowerCase())) {
      const searchProduct = { ...product };
      searchList.push(searchProduct);
      if (query) {
        searchProduct.title = product.name
          .toLowerCase()
          .replaceAll(query.toLowerCase(), `<span class=mark>${query}</span>`);
      }
    }
    displayProducts(searchList);
  }
}
function editInputs(product) {
  elements.productName.value = product ? product.name : "";
  elements.productPrice.value = product ? product.price : "";
  elements.productCategory.value = product ? product.category : "";
  // elements.productImage.value = "";
  elements.productDescription.value = product ? product.description : "";

  for (let input of elements.inputs) {
    input.classList.remove("is-valid");
  }
}

function inputIsValid(input) {
  const regex = {
    name: /^[a-zA-Z][\w-]{2,250}/,
    price: /(^[6-9][0-9]{2}|[1-5][0-9]{3}|60{3})$/,
    category: /(iPhone|Samsung|Xiaomi|Oppo|iWatch|Dell|HP)/,
    description: /^\w{0,250}$/,
  };
  console.log(input.type);
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

function addProduct(e) {
  e.preventDefault();
  if (formIsValid()) {
    let product = {
      name: elements.productName.value,
      price: elements.productPrice.value,
      category: elements.productCategory.value,
      imageSrc: elements.productImage.files[0].name,
      description: elements.productDescription.value,
    };
    productList.push(product);
    postAction();
  } else {
    console.log("error");
  }
}

function displayProducts(list = productList) {
  if (list.length) {
    elements.productsElement.innerHTML = "";
    list.forEach((product, index) => {
      elements.productsElement.innerHTML += `
              <tr>
                  <td class="text-capitalize">
                  <img src="./imgs/${product.imageSrc}" class="img-fluid "/>
                  <span>${product.title || product.name}</span>
                  </td>
                  <td>$${product.price}</td>
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
                      data-index="${index}"
                      data-bs-toggle="modal"
                      data-bs-target="#addProduct"
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
    elements.productsElement.innerHTML = ` <p class="text-secondary text-center">No products found</p>`;
  }
}

function deleteProduct(index) {
  if (searchList.length) {
    let product = searchList[index];
    searchList.splice(index, 1);
    productList.splice(productList.indexOf(product), 1);
  } else {
    productList.splice(index, 1);
  }
  postAction();
}

function editProduct(index) {
  const product = getProduct(index);
  editSubmitBtn(index);
  elements.productName.focus();
  editInputs(product);
}

function getProduct(index) {
  if (searchList.length) {
    console.log("searchlist");
    return searchList[index];
  }

  console.log("productList");
  return productList[index];
}

function editSubmitBtn(index) {
  elements.submitBtn.textContent = "Update";
  elements.form.setAttribute("onSubmit", `updateProduct(event,${index})`);
}

function resetSubmitBtn() {
  elements.submitBtn.textContent = "Submit";
  elements.form.setAttribute("onSubmit", "addProduct(event)");
}

function updateProduct(event, index) {
  event.preventDefault();
  let product = getProduct(index);
  console.log(product);
  if (formIsValid()) {
    productList[index] = {
      name: elements.productName.value,
      price: elements.productPrice.value,
      category: elements.productCategory.value,
      description: elements.productDescription.value,
      imageSrc: elements.productImage.files[0].name,
    };
    postAction();
  } else console.log("Wtf");
  resetSubmitBtn();
}

function postAction(clear) {
  console.log("post");
  editInputs();
  displayProducts();
  if (clear) {
    localStorage.removeItem("productsList");
    return;
  }
  localStorage.setItem("productsList", JSON.stringify(productList));
}

function confirmClear() {
  productList = [];
  postAction(true);
}
