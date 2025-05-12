import { environment } from "src/environments/environment";

interface KiotVietAuthResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface KiotVietProductRequest {
    Product: {};
    BranchForProductCostss: any[];
    ListUnitPriceBookDetail: any[];
}

export class KiotVietService {
    private readonly updateItemUrl = 'https://api-man1.kiotviet.vn/api';
    private readonly getUpdateItemUrl = 'https://api-man1.kiotviet.vn/api/products';
    private readonly retailer = environment.retailer; // Replace with your retailer
    private readonly branchId = environment.LatestBranchId; // Replace with your branch ID
    private accessToken: string | null = null;
    private async getAccessToken(): Promise<string> {
        if (this.accessToken) {
            return this.accessToken;
        }

        try {
            const response = await fetch(`${environment.domainUrl}/api/authentication`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data: KiotVietAuthResponse = await response.json();
            this.accessToken = data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    }
    private async getRequestBody(Id: number) {
        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.getUpdateItemUrl}/${Id}/initialdata?Includes=ProductAttributes&ProductType=2`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                    'Retailer': this.retailer,
                    'BranchId': this.branchId,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get product');
            }
            const formData = await response.json();
            return formData
        } catch (error) {
            console.error('Error getting product', error);
            throw error;
        }
    }
    async sendProductData(editedProduct: any, remainEditedProducts: any[]): Promise<any> {

        const formDataGetFromKiotViet = await this.getRequestBody(editedProduct.Id)


        formDataGetFromKiotViet.Product.Code = editedProduct.Code;
        formDataGetFromKiotViet.Product.FullName = editedProduct.FullName;
        formDataGetFromKiotViet.Product.BasePrice = editedProduct.BasePrice;
        formDataGetFromKiotViet.Product.Cost = editedProduct.Cost;
        formDataGetFromKiotViet.Product.Description = editedProduct.Description;
        formDataGetFromKiotViet.Product.OnHand = editedProduct.OnHand
        remainEditedProducts.forEach((ep) => {

            formDataGetFromKiotViet.Product.ProductUnits.forEach((p: any) => {
                if (ep.Code === p.Code) {
                    p.BasePrice = ep.BasePrice
                }
            })

        })
        const fD = new FormData();
        fD.append("product", JSON.stringify(formDataGetFromKiotViet.Product))
        fD.append("BranchForProductCostss", `[{ "Id": ${environment.LatestBranchId}, "Name": "Chi nhánh trung tâm" }]`)
        fD.append("ListUnitPriceBookDetail", "[]")

        try {
            const token = await this.accessToken || '';
            const response = await fetch(`${this.updateItemUrl}/products/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Retailer': this.retailer,
                    'BranchId': this.branchId
                },
                body: fD
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending product data:', error);
            throw error;
        }
    }

}
