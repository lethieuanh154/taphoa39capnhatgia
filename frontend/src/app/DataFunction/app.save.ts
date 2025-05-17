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
  allEditedProducts.push(groupedProducts);
  saveToLocalStorage(searchTerm, allEditedProducts);
  cleanLocalStorage();


  showNotification('Đã lưu thành công !')
}
let allEditedProducts: any[] = [];

function cleanLocalStorage(): void {
  Object.keys(localStorage).forEach((k) => {
    if (k && k.startsWith('editing_')) {

      localStorage.removeItem(k);
    }
  })

}

function saveToLocalStorage(searchTerm: string, data: any): void {
  localStorage.setItem(`edited_products_${searchTerm}`, JSON.stringify(data));

}
export function clearCache() {
  Object.keys(localStorage).forEach((key) => {
    localStorage.removeItem(key); // Xóa tất cả sản phẩm
  });
  allEditedProducts=[]
  showNotification('Đã xóa cache thành công !')
}

