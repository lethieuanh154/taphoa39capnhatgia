import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CostService {

  constructor() { }

  masterCode: string = '';
  masterOnHand: string = '';
  masterConversionValue: string = '';
  masterCost: string = '';
  masterDiscount: string = '';
  masterFinalBasePrice: string = '';

  private getOldProductsMaster(code: any) {
    const oldProduct = Object.entries(localStorage)
      .filter(([key]) => key.startsWith("grouped_"))
      .map(([key, value]) => ({ key: key.replace('grouped_', ''), value: JSON.parse(value) }));


    const oldItem = oldProduct.map((k) => {
      return k.value[code]?.find((c: { Code: any }) => c.Code == code);
    }).find(item => item !== undefined); // Find the first non-undefined result

    return oldItem
  }

  updateCostMaster(element: any) {
    let currentBaseprice: any;
    let currentCost: any;
    let currentOnHand: any;
    const oldProduct = this.getOldProductsMaster(element.Code) || 0
    currentBaseprice = oldProduct.BasePrice || 0;
    currentOnHand = oldProduct.OnHand || 0
    currentCost = oldProduct.Cost || 0

    this.masterCode = element.Code

    let newCost: number = 0;
    let retail = element.Retail
    let box = element.Box
    if (element.Retail > element.ConversionValue) {
      retail = element.Retail % element.ConversionValue;
      box = (element.Retail - (element.Retail % element.ConversionValue)) / element.ConversionValue;
    }

    if (element.Box === 0 && element.Retail === 0 && element.TotalPrice === 0) {

    } else {
      if (element.AverageCheckPoint === true) {
        newCost = element.Cost;
        element.Cost = ((newCost * element.OnHand * element.ConversionValue) + (currentCost * currentOnHand * element.ConversionValue)) / ((element.OnHand + currentOnHand) * element.ConversionValue)
      } else {
        element.Cost = (parseInt(element.TotalPrice) / (parseInt(element.Box) * parseInt(element.ConversionValue) + parseInt(element.Retail))) * parseInt(element.ConversionValue) || 0;
        if (element.Discount2 > 0) {
          element.Cost = (parseInt(element.TotalPrice) - parseInt(element.Discount2)) / (parseInt(element.Box) * parseInt(element.ConversionValue) + parseInt(element.Retail)) * parseInt(element.ConversionValue) || 0;
        }

      }
    }
    element.OnHand = ((parseFloat(currentOnHand) * parseInt(element.ConversionValue) + parseInt(element.Retail) + parseInt(element.Box) * parseInt(element.ConversionValue)) / parseInt(element.ConversionValue)) || 0

    element.BasePrice = Math.round((parseInt(currentBaseprice) + (parseInt(element.Cost) - parseInt(currentCost))) / 100) * 100;
    this.masterOnHand = element.OnHand
    this.masterConversionValue = element.ConversionValue
    this.masterCost = element.Cost
    this.masterDiscount = element.Discount
    this.masterFinalBasePrice = element.FinalBasePrice
    localStorage.setItem(`editing_childProduct_${element.Code}`, JSON.stringify(element));
  }



  updateCostChildItems(filteredProducts: any[]) {

    const oldProducts = Object.entries(localStorage)
      .filter(([key]) => key.startsWith("grouped_"))
      .map(([_, value]) => JSON.parse(value || "[]"));

    filteredProducts.forEach((currentItem) => {
      oldProducts.forEach((oP) => {
        const productGroup = oP[this.masterCode];
        if (productGroup) {
          const matchingProduct = productGroup.find((o: any) => o.Code === currentItem.Code);
          if (matchingProduct) {
            if (currentItem.Master) {
              currentItem.Cost = Math.round(currentItem.Cost) || 0;
              currentItem.BasePrice = Math.round(currentItem.BasePrice * 100) / 100 || 0;
            } else {

              currentItem.OnHand = (parseFloat(this.masterOnHand) * parseFloat(this.masterConversionValue)) / parseFloat(currentItem.ConversionValue) || 0;
              currentItem.Cost = Math.round((parseInt(this.masterCost) / parseInt(this.masterConversionValue) * parseInt(currentItem.ConversionValue)) || 0);
              if (parseInt(this.masterDiscount) > 0) {
                currentItem.Cost = (currentItem.Cost - (parseInt(this.masterDiscount) * parseInt(currentItem.ConversionValue))) || 0;
              }
              currentItem.BasePrice = Math.round((matchingProduct.BasePrice + (currentItem.Cost - matchingProduct.Cost)) / 100) * 100 || 0;

              if (parseInt(this.masterFinalBasePrice) > 0) {
                currentItem.FinalBasePrice = Math.round((parseInt(this.masterFinalBasePrice) / parseInt(this.masterConversionValue) * parseInt(currentItem.ConversionValue)) || 0);
              }
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
  updateFinalBasePrice(changedFinalBasePrice: any, filteredProducts: any[]) {

    filteredProducts.forEach((currentItem) => {
      localStorage.setItem(`editing_childProduct_${currentItem.Code}`, JSON.stringify(currentItem));
    });
  }
}
