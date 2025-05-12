export function groupProducts(products: any[],): { [key: string]: any[] } {

    let groupedProducts: { [key: string]: any[] } = {};

    if (products.length > 1 && products.some(p => p.Master !== true)) {
        products.forEach((product) => {

            if (product.ListProduct && product.ListProduct.length > 0) {

                product.ListProduct.forEach((childProduct: any) => {
                    if (!groupedProducts[product.Code]) {
                        groupedProducts[product.Code] = [];
                    }
                    groupedProducts[product.Code].push(
                        products.find((p) => p.Code === childProduct.Code) || childProduct
                    );
                });
                let maxCostProduct = groupedProducts[product.Code].reduce((min: any, current: any) =>
                    current.Cost > min.Cost ? current : min, groupedProducts[product.Code][0]);
                maxCostProduct.Master = true;
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
    }  else {
        products.forEach((product) => {
            groupedProducts[product.Code] = [product];
            product.Master = true;
        })

    }


    return groupedProducts;
}