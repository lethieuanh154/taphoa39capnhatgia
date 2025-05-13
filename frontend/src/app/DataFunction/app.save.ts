import { showNotification } from "../DisplayChange/app.notification";

export function onSave(searchTerm: string) {

  const editedProducts = Object.entries(localStorage)
    .filter(([key]) => key.startsWith("editing_childProduct_"))
    .map(([_, value]) => JSON.parse(value));

  const groupedProducts: { [key: string]: any[] } = {};

  editedProducts.forEach((product) => {

    if (product.ListProduct && product.ListProduct.length > 0) {

      product.ListProduct.forEach((childProduct: any) => {
        if (!groupedProducts[product.Code]) {
          groupedProducts[product.Code] = [];
        }
        groupedProducts[product.Code].push(
          editedProducts.find((p) => p.Code === childProduct.Code) || childProduct
        );
      });
    }
  });
  const masterItems: any[] = [];

  Object.entries(groupedProducts).forEach((key) => {
    const masterItem = key[1].find((a) => a.Master === true);
    if (masterItem && !masterItems.some((item) => item.Code === masterItem.Code)) {
      masterItems.push(masterItem);
    }
    if (!masterItems.some((item) => item.Code === key[0])) {
      delete groupedProducts[key[0]];
    }

  })
  cleanLocalStorage();

  saveToLocalStorage(`edited_products_${searchTerm}`, groupedProducts);
  showNotification('Đã lưu thành công !')
}


function cleanLocalStorage(): void {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('editing_')) {
      localStorage.removeItem(key);
    }
  }
}

function saveToLocalStorage(key: string, data: any): void {
  localStorage.setItem(key, JSON.stringify(data));
}
