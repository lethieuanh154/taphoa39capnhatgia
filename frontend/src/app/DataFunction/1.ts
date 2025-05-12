


export function getOldProducts(code: any) {
    const oldProduct = Object.entries(localStorage)
        .filter(([key]) => key.startsWith("grouped_"))
        .map(([key, value]) => ({ key: key.replace('grouped_', ''), value: JSON.parse(value) }));
    const oldItem = oldProduct.map((k) => {
        return k.value[code]?.find((c: { Code: any }) => c.Code == code);
    }).find(item => item !== undefined); // Find the first non-undefined result

    return {
        BasePrice: oldItem?.BasePrice || 0,
        OnHand: oldItem?.OnHand || 0,
        Cost: oldItem?.Cost || 0,
    };

}

export function updateCost(element: any) {
    let currentBaseprice: any;
    let currentCost: any;
    let currentOnHand: any;
    const oldProduct = getOldProducts(element.Code) || 0
    currentBaseprice = oldProduct.BasePrice || 0;
    currentOnHand = oldProduct.OnHand || 0
    currentCost = oldProduct.Cost || 0

    masterCode = element.Code
    let newCost: number = 0;
    newCost = (parseInt(element.TotalPrice) / (parseInt(element.Box) * parseInt(element.ConversionValue) + parseInt(element.Retail))) * parseInt(element.ConversionValue) || 0;

    if (element.Discount2 > 0) {
        newCost = (parseInt(element.TotalPrice) - parseInt(element.Discount2)) / (parseInt(element.Box) * parseInt(element.ConversionValue) + parseInt(element.Retail)) * parseInt(element.ConversionValue) || 0;
    }

    element.OnHand = ((parseFloat(currentOnHand) * parseInt(element.ConversionValue) + parseInt(element.Retail) + parseInt(element.Box) * parseInt(element.ConversionValue)) / parseInt(element.ConversionValue)) || 0

    element.Cost = ((newCost * element.OnHand * element.ConversionValue) + (currentCost * currentOnHand * element.ConversionValue)) / ((element.OnHand+currentOnHand) * element.ConversionValue)
    element.BasePrice = Math.round((parseInt(currentBaseprice) + (parseInt(element.Cost) - parseInt(currentCost))) / 100) * 100;
    masterOnHand = element.OnHand
    masterConversionValue = element.ConversionValue
    masterCost = element.Cost
    masterDiscount = element.Discount


    localStorage.setItem(`editing_${element.Code}`, JSON.stringify(element));
}



let masterCode: string = '';
let masterOnHand: string = '';
let masterConversionValue: string = '';
let masterCost: string = '';
let masterDiscount: string = '';
export function updateCostChildItems(filteredProducts: any[]) {
    const oldProducts = Object.entries(localStorage)
        .filter(([key]) => key.startsWith("grouped_"))
        .map(([_, value]) => JSON.parse(value || "[]"));

    filteredProducts.forEach((currentItem) => {
        oldProducts.forEach((oP) => {
            const productGroup = oP[masterCode];
            if (productGroup) {
                const matchingProduct = productGroup.find((o: any) => o.Code === currentItem.Code);
                if (matchingProduct) {
                    if (currentItem.Master) {
                        currentItem.Cost = Math.round(currentItem.Cost) || 0;
                        currentItem.BasePrice = Math.round(currentItem.BasePrice * 100) / 100 || 0;
                    } else {
                        currentItem.OnHand = (parseFloat(masterOnHand) * parseFloat(masterConversionValue)) / parseFloat(currentItem.ConversionValue) || 0;
                        currentItem.Cost = Math.round((parseInt(masterCost) / parseInt(masterConversionValue) * parseInt(currentItem.ConversionValue)) || 0);
                        if (parseInt(masterDiscount) > 0) {
                            currentItem.Cost = (currentItem.Cost - (parseInt(masterDiscount) * parseInt(currentItem.ConversionValue))) || 0;
                        }
                        currentItem.BasePrice = Math.round((matchingProduct.BasePrice + (currentItem.Cost - matchingProduct.Cost)) / 100) * 100 || 0;
                    }

                    currentItem.Edited = true;
                    if (!currentItem.Master) {
                        localStorage.setItem(`editing_childProduct_${currentItem.Code}`, JSON.stringify(currentItem));
                    }
                }
            }
        });
    });
}
