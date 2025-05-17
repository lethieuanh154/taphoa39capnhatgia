import { catchError, map, of } from "rxjs";
import { assignColorsToProductList } from "../DisplayChange/app.color";
import { sortByGroup } from "../DisplayChange/app.sort";
import { groupProducts } from "../DisplayChange/app.group-item";
import { environment } from '../../environments/environment';

interface Product {
    Image: string;
    Code: string;
    FullName: string;
    AverageCheckPoint: false,
    BasePrice: number;
    FinalBasePrice: number,
    OnHand: number;
    Cost: number;
    PackCost: number;
    OriginalBoxPrice: number;
    Description: string;
    Unit: string;
    PackingSpec: number;
    UnitSpec: number;
    Retail: number;
    Box: number;
    Discount: number;
    Discount2: number;
    TotalPrice: number;
    ListProduct: number;
    ConversionValue: number;
    GroupName: string;
    Edited: boolean;
    Master: boolean;
    Id: number
}

export function onSearch(
    http: any,
    productColors: { [key: string]: string },
    filteredProducts: Product[],
    isLoading: boolean,
    searchTerm: string,
    loadData: (data: Product[]) => void
) {
    if (!searchTerm) {
        filteredProducts = [];
        loadData(filteredProducts);
        return;
    }

    // Try to get data from localStorage first
    const cachedData = getCachedData(searchTerm);
    if (cachedData) {
        handleCachedData(cachedData, filteredProducts, productColors, loadData);
        return;
    }

    // If no cached data, fetch from API
    fetchFromAPI(http, searchTerm, productColors, filteredProducts, isLoading, loadData);
}

function getCachedData(searchTerm: string): Product[] | null {
    const st = searchTerm.replace(/ /g, '_');
    const groupedKey = `grouped_${st}`;
    const groupedData = localStorage.getItem(groupedKey);

    if (groupedData) {
        return JSON.parse(groupedData);
    }
    return null;
}

function handleCachedData(
    cachedData: Product[],
    filteredProducts: Product[],
    productColors: { [key: string]: string },
    loadData: (data: Product[]) => void
) {
    filteredProducts = Object.keys(cachedData).reduce((acc, k: any) => {
        return acc.concat(cachedData[k]);
    }, [] as Product[]);

    assignColorsToProductList(filteredProducts, productColors);
    filteredProducts = sortByGroup(filteredProducts);
    loadData(filteredProducts);
}

function fetchFromAPI(
    http: any,
    searchTerm: string,
    productColors: { [key: string]: string },
    filteredProducts: Product[],
    isLoading: boolean,
    loadData: (data: Product[]) => void
) {
    isLoading = true;
    const st = searchTerm.replace(/ /g, '_');

    http.get(`${environment.domainUrl}/api/item/${searchTerm}`).pipe(
        map((data: any[]) => {
            const products = transformApiData(data);
            const groupedProducts = groupProducts(products);

            // Cache the grouped products
            localStorage.setItem(`grouped_${st}`, JSON.stringify(groupedProducts));

            const cacheKey = `search_${st}`;
            localStorage.setItem(cacheKey, JSON.stringify(products));

            return products;
        }),
        catchError((err) => {
            console.error('❌ Lỗi khi tìm kiếm:', err);
            isLoading = false;
            return of([]);
        })
    ).subscribe((products: Product[]) => {
        const newProducts = processProducts(products, searchTerm);
        filteredProducts = newProducts;

        // Apply colors and sorting
        assignColorsToProductList(filteredProducts, productColors);
        filteredProducts = sortByGroup(filteredProducts);

        // Cache the search results
        localStorage.setItem(`search_${searchTerm}`, JSON.stringify(filteredProducts));

        isLoading = false;
        loadData(filteredProducts);
    });
}

function transformApiData(data: any[]): Product[] {
    return data.map(item => ({
        Image: item.Image,
        Code: item.Code,
        FullName: item.Name,
        AverageCheckPoint: item.AverageCheckPoint || false,
        BasePrice: item.BasePrice || 0,
        FinalBasePrice: item.FinalBasePrice || 0,
        OnHand: item.OnHand || 0,
        Cost: item.Cost || 0,
        PackCost: item.PackCost || 0,
        OriginalBoxPrice: item.OriginalBoxPrice || 0,
        Description: item.Description ? item.Description.replace(/<\/?[^>]+(>|$)/g, '') : '',
        Unit: item.Unit || '',
        PackingSpec: item.PackingSpec || 0,
        UnitSpec: item.UnitSpec || 0,
        Retail: item.Retail || 0,
        Box: item.Box || 0,
        Discount: item.Discount || 0,
        Discount2: item.Discoun2 || 0,
        TotalPrice: item.TotalPrice || 0,
        ListProduct: item.ListProductUnit || 0,
        ConversionValue: item.ConversionValue || 0,
        GroupName: item.Name,
        Edited: false,
        Master: false,
        Id: item.Id
    }));
}

function processProducts(products: Product[], searchTerm: string): Product[] {
    const newProducts: Product[] = [];
    const groupedProductsResult = JSON.parse(localStorage.getItem(`grouped_${searchTerm.replace(/ /g, '_')}`) || '{}');

    products.forEach((product) => {
        if (groupedProductsResult[product.Code]) {
            groupedProductsResult[product.Code].forEach((p: Product) => {
                newProducts.push(p);
            });
        }
    });

    // Apply edited data if exists
    const cachedEditedProducts = localStorage.getItem(`edited_${searchTerm}`);
    if (cachedEditedProducts) {
        const editedProducts = JSON.parse(cachedEditedProducts);
        newProducts.forEach((product) => {
            const editedProduct = editedProducts.find((p: Product) => p.Code === product.Code);
            if (editedProduct) {
                Object.assign(product, editedProduct);
            }
        });
    }

    return newProducts;
}


