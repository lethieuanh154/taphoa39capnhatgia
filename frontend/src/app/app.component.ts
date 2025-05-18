import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { assignColorsToProductList } from './DisplayChange/app.color';
import { validateNumber } from './DisplayChange/app.validate-number';
import { onSearch } from './DataFunction/app.search';
import { onSave, clearCache } from './DataFunction/app.save';
// import { updateCost, updateCostChildItems } from './DataFunction/app.update-cost';
import { showEditedProducts } from './DisplayChange/app.show';
import { loadCategories } from './Category/app.load-categories';
import { loadData } from './DataFunction/app.load-data';
import { showNotification } from './DisplayChange/app.notification';
import { groupProducts } from "./DisplayChange/app.group-item";
import { KiotVietService } from "./DataFunction/app.send-data-to-kiotviet";
import { CostService } from './services/cost.service';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    './button.component.css',
    './category.component.css'
  ],
})

export class AppComponent implements OnInit {

  searchControl = new FormControl('');
  filteredOptions!: Observable<{ value: string; FullName: string; Image: string; }[]>;
  options: { FullName: string; Image: string }[] = []; // Replace with your data source


  productColors: { [key: string]: string } = {}; // Lưu màu sắc cho từng nhóm ProductList
  displayedRows: any[] = [];
  isLoading: boolean = false;
  data$!: Observable<any[]>;
  error: string | null = null;
  filteredProducts: any[] = [];
  categories: { id?: number; name: string; path: string; }[] = [];
  activeCategory: string | null = null;
  displayedColumns: string[] = [
    'Image',
    'Code',
    'FullName',
    'AverageCheckPoint',
    'FinalBasePrice',
    'BasePrice',
    'Cost',
    'OnHand',
    'Unit',
    // 'PackCost',
    // 'OriginalBoxPrice',
    // 'Description',
    // 'PackingSpec',
    'UnitSpec',
    'Box',
    'Retail',
    'Discount',
    'Discount2',
    'TotalPrice'

  ];
  dataSource: any;
  recognition: any;
  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private costService: CostService,
    private ngZone: NgZone
  ) {
    const { webkitSpeechRecognition }: IWindow = <IWindow><unknown>window;
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'vi-VN'; // hoặc 'en-US' nếu muốn tiếng Anh
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.ngZone.run(() => {
        this.searchControl.setValue(transcript);
      });
    };
   
    this.recognition.onerror = (event: any) => {
      console.error('Lỗi khi nhận giọng nói:', event.error);
    };

  }
  startVoiceInput() {
    this.recognition.start();
  }
  activeButton: string = '';
  userChangedFinalBasePrice = false;
  changedFinalBasePrice: string = '';
  ngOnInit() {
    this.loadCategories();
    // const groupedProducts = groupProducts(this.filteredProducts);
    assignColorsToProductList(this.filteredProducts, this.productColors);
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    this.searchControl.valueChanges.subscribe(value => {
      const selectedOption = this.options.find(option => option.FullName === value);
      if (selectedOption) {
        this.searchTerm = selectedOption.FullName; // Update searchTerm with the selected option
      }
    });



  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    const searchKeys = Object.keys(localStorage).filter((key) => key.startsWith("search_"));

    const allGroupedProducts = searchKeys.map((key) => JSON.parse(localStorage.getItem(key) || "[]"));

    this.options = allGroupedProducts.flatMap(product =>
      product.map((item: { FullName: any; Image: string; }) => ({
        FullName: item.FullName,
        Image: item.Image
      }))
    );
    return this.options.filter(option => option.FullName.toLowerCase().includes(filterValue));
  }

  loadCategories() {
    loadCategories(
      this.categories,
      (categories) => this.categories = categories, // Hàm cập nhật danh sách categories
      (isLoading) => this.isLoading = isLoading,   // Hàm cập nhật trạng thái loading
      this.http,
      (category) => this.loadData(category)        // Hàm tải dữ liệu theo danh mục
    );
  }


  loadData(category: string) {
    loadData(
      category,
      this.http,
      (products) => (this.filteredProducts = products), // Cập nhật filteredProducts
      (isLoading) => (this.isLoading = isLoading), // Cập nhật trạng thái loading
      (showWarning) => (this.showLowStockWarning = showWarning) // Cập nhật cảnh báo tồn kho thấp
    );
  }
  // Hàm xử lý sự kiện khi người dùng nhấp vào danh mục

  onCategoryClick(category: string) {
    this.activeCategory = category; // Cập nhật danh mục đang hoạt động
    loadData(
      category,
      this.http,
      (products) => (this.filteredProducts = products), // Cập nhật filteredProducts
      (isLoading) => (this.isLoading = isLoading), // Cập nhật trạng thái loading
      (showWarning) => (this.showLowStockWarning = showWarning) // Cập nhật cảnh báo tồn kho thấp
    );
  }



  getProductColor(productCode: string): string {
    return this.productColors[productCode] || '#ffffff'; // Mặc định là màu trắng
  }

  searchTerm: string = '';
  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    onSearch(this.http, this.productColors, this.filteredProducts, this.isLoading, this.searchTerm, (data) => this.filteredProducts = data);
  }


  lowStockProducts: any[] = []; // Biến để lưu danh sách sản phẩm tồn kho thấp
  showLowStockWarning: boolean = false; // Biến để kiểm soát hiển thị dấu chấm than

  checkRemains() {
    // Lọc các sản phẩm có OnHand < 3
    this.lowStockProducts = this.filteredProducts.filter(product => product.OnHand < 3 && !/thùng/i.test(product.Unit) && !/lốc/i.test(product.Unit));
    this.showLowStockWarning = this.lowStockProducts.length > 0;

    // Mở popup hiển thị danh sách sản phẩm tồn kho thấp
    this.dialog.open(LowStockDialog, {
      width: '600px',
      data: { products: this.lowStockProducts }
    });
  }

  clearCache() {
    clearCache()
  }

  onSave() {
    onSave(this.searchTerm);
  }

  showEditedProducts() {
    showEditedProducts(this.searchTerm, this.filteredProducts);
  }

  updateCost(element: any) {
    if (element.Master) {
      this.costService.updateCostMaster(element);
      this.costService.updateCostChildItems(this.filteredProducts);
    } else {
      this.costService.updateFinalBasePrice(this.changedFinalBasePrice, this.filteredProducts);
    }
  }

  validateNumber(event: KeyboardEvent) {
    validateNumber(event);
  }

  formatNumber(value: any): string {
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  }
  onInputDiscount(event: any, element: any) {
    const input = event.target.value.replace(/,/g, ''); // Bỏ dấu phẩy
    if (!isNaN(Number(input))) {
      element.Discount = Number(input);
    }
  }
  onInputDiscount2(event: any, element: any) {
    const input = event.target.value.replace(/,/g, ''); // Bỏ dấu phẩy
    if (!isNaN(Number(input))) {
      element.Discount2 = Number(input);
    }
  }
  onInputTotalPrice(event: any, element: any) {
    const input = event.target.value.replace(/,/g, ''); // Bỏ dấu phẩy
    if (!isNaN(Number(input))) {
      element.TotalPrice = Number(input);
    }
  }

  onInputFinalBasePrice(event: any, element: any) {
    const input = event.target.value.replace(/,/g, ''); // Bỏ dấu phẩy
    if (!isNaN(Number(input))) {
      element.FinalBasePrice = Number(input);
    }
  }
  onInputBasePrice(event: any, element: any) {
    const input = event.target.value.replace(/,/g, ''); // Bỏ dấu phẩy
    if (!isNaN(Number(input))) {
      element.BasePrice = Number(input);
    }
  }

  onInputFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;

    input.classList.add('tabbed');
    setTimeout(() => input.classList.remove('tabbed'), 300); // gỡ class sau hiệu ứng
  }

  onUpdate() {
    const editedProducts = Object.keys(localStorage)
      .filter((key) => key.startsWith("edited_products_"))
      .map((key) => JSON.parse(localStorage.getItem(key) || "[]"));
    const oldProducts = Object.keys(localStorage)
      .filter((key) => key.startsWith("grouped_"))
      .map((key) => JSON.parse(localStorage.getItem(key) || "[]"));

    let editedProductKeys: any[] = [];
    editedProducts.forEach((editedProduct: any) => {
      editedProduct.forEach((i: any) => {
        editedProductKeys.push(Object.keys(i))
      })
    })

    editedProducts.forEach((editedProduct: any) => {

      editedProductKeys.forEach((keys) => {
        oldProducts.forEach((oldProduct) => {
          keys.forEach((key: any) => {
            if (oldProduct[key]) {


              editedProduct.forEach((editedItem: any) => {
                Object.values(editedItem).forEach((e: any) => {
                  e.forEach((p: any) => {
                    if (p.FinalBasePrice > 0) {
                      p.BasePrice = p.FinalBasePrice
                    }

                    const matchingOldItem = oldProduct[key].find((oldItem: any) => oldItem.Code === p.Code);

                    if (matchingOldItem) {
                      p['OldCost'] = matchingOldItem.Cost;
                      p['OldBasePrice'] = matchingOldItem.BasePrice;
                    }
                  })

                })

              });
            }
          })

        });
      });
    });

    this.dialog.open(EditedItemDialog, {
      width: '70vw',   // hoặc '1000px'
      height: 'auto',  // hoặc 'auto'
      maxWidth: '100vw',
      data: { products: editedProducts }
    });
  }
  openInputDialog(element: any) {
    const dialogRef = this.dialog.open(InputDialog, {
      width: '80vw',   // hoặc '1000px'
      height: 'auto',  // hoặc 'auto'
      maxWidth: '100vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        element.Box = result.box
        element.Retail = result.retail
        element.Discount = result.discount
        element.Discount2 = result.discount2
        element.TotalPrice = result.totalPrice
        const currentCost = element.Cost;
        element.Cost = (parseInt(element.TotalPrice) / (parseInt(element.Box) * parseInt(element.ConversionValue) + parseInt(element.Retail))) * parseInt(element.ConversionValue) || 0;

        if (element.Discount2 > 0) {
          element.Cost = (parseInt(element.TotalPrice) - parseInt(element.Discount2)) / (parseInt(element.Box) * parseInt(element.ConversionValue) + parseInt(element.Retail)) * parseInt(element.ConversionValue) || 0;
        }
        element.OnHand = ((parseFloat(element.OnHand) * parseInt(element.ConversionValue) + parseInt(element.Retail) + parseInt(element.Box) * parseInt(element.ConversionValue)) / parseInt(element.ConversionValue)) || 0
        element.BasePrice = Math.round((parseInt(element.BasePrice) + (parseInt(element.Cost) - parseInt(currentCost))) / 100) * 100;

        localStorage.setItem(`editing_${element.Code}`, JSON.stringify(element));
        const oldProducts = Object.entries(localStorage)
          .filter(([key]) => key.startsWith("grouped_"))
          .map(([_, value]) => JSON.parse(value || "[]"));
        this.filteredProducts.forEach((currentItem) => {
          oldProducts.forEach((oP) => {
            const productGroup = oP[this.costService.masterCode];
            if (productGroup) {
              const matchingProduct = productGroup.find((o: any) => o.Code === currentItem.Code);
              if (matchingProduct) {
                if (currentItem.Master) {
                  currentItem.Cost = Math.round(currentItem.Cost) || 0;
                  currentItem.BasePrice = Math.round(currentItem.BasePrice * 100) / 100 || 0;
                } else {

                  currentItem.OnHand = (parseFloat(this.costService.masterOnHand) * parseFloat(this.costService.masterConversionValue)) / parseFloat(currentItem.ConversionValue) || 0;
                  currentItem.Cost = Math.round((parseInt(this.costService.masterCost) / parseInt(this.costService.masterConversionValue) * parseInt(currentItem.ConversionValue)) || 0);
                  if (parseInt(this.costService.masterDiscount) > 0) {
                    currentItem.Cost = (currentItem.Cost - (parseInt(this.costService.masterDiscount) * parseInt(currentItem.ConversionValue))) || 0;
                  }
                  currentItem.BasePrice = Math.round((matchingProduct.BasePrice + (currentItem.Cost - matchingProduct.Cost)) / 100) * 100 || 0;
                  if (parseInt(this.costService.masterFinalBasePrice) > 0) {
                    currentItem.FinalBasePrice = Math.round((parseInt(this.costService.masterFinalBasePrice) / parseInt(this.costService.masterConversionValue) * parseInt(currentItem.ConversionValue)) || 0);

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
    });
  }
}


@Component({
  selector: 'input-dialog', standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    FormsModule // 
  ],
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./dialog.component.css']
})

export class InputDialog {
  displayedColumns: string[] = ['Box', 'Retail', 'Discount', 'Discount2', 'TotalPrice'];
  box: any = '';
  retail: any = '';
  discount: any = '';
  discount2: any = '';
  totalPrice: any = '';
  inputRows = [{}];
  constructor(
    public dialogRef: MatDialogRef<InputDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  private evaluateExpression(expr: any): string {
    if (!expr) return '';
    try {
      const result = Function(`"use strict"; return (${expr})`)();
      return result.toString();
    } catch {
      return 'Lỗi';
    }
  }
  onOkClick(): void {
    this.box = this.evaluateExpression(this.box) || 0;
    this.retail = this.evaluateExpression(this.retail) || 0;
    this.discount = this.evaluateExpression(this.discount) || 0;
    this.discount2 = this.evaluateExpression(this.discount2) || 0;
    this.totalPrice = this.evaluateExpression(this.totalPrice) || 0;
    this.inputRows.push(this.box, this.retail, this.discount, this.discount2, this.totalPrice)

    this.dialogRef.close({
      box: this.box,
      retail: this.retail,
      discount: this.discount,
      discount2: this.discount2,
      totalPrice: this.totalPrice
    });
  }
}

@Component({
  selector: 'low-stock-dialog', standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, // Đảm bảo MatDialogModule được import
    MatTableModule,
    MatButtonModule
  ],
  templateUrl: './low-stock-dialog.component.html',
  styleUrls: ['./dialog.component.css']
})

export class LowStockDialog {
  displayedColumns: string[] = ['Code', 'FullName', 'OnHand'];
  filteredProducts: any[] = []; // Lưu danh sách sản phẩm đã lọc

  constructor(
    public dialogRef: MatDialogRef<LowStockDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Lọc bỏ các sản phẩm có đơn vị là "thùng"
    this.filteredProducts = data.products.filter((product: any) => {
      return !/thùng/i.test(product.Unit) && !/lốc/i.test(product.Unit);
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}


@Component({
  selector: 'edited-products-dialog', standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, // Đảm bảo MatDialogModule được import
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './edited-products-dialog.component.html',
  styleUrls: ['./dialog.component.css', './button.component.css']
})

export class EditedItemDialog {
  displayedColumns: string[] = ['Image', 'Code', 'FullName', 'BasePrice', 'OldBasePrice', 'Cost', 'OldCost', 'OnHand'];
  filteredProducts: any[] = []; // Lưu danh sách sản phẩm đã lọc
  productColors: { [key: string]: string } = {};
  constructor(
    public dialogRef: MatDialogRef<EditedItemDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const seen = new Set();

    data.products.forEach((item: any) => {
      Object.values(item).forEach((group: any) => {
        Object.values(group as any).forEach((arr: any) => {
          (arr as any[]).forEach((y: any) => {
            const key = JSON.stringify(y);
            if (!seen.has(key)) {
              seen.add(key);
              this.filteredProducts.push(y);
            }
          });
        });
      });
    });
    assignColorsToProductList(this.filteredProducts, this.productColors)
  }
  getProductColor(productCode: string): string {
    return this.productColors[productCode] || '#ffffff'; // Mặc định là màu trắng
  }

  getCostClass(cost: number, oldCost: number): string {
    if (cost > oldCost) return 'text-red';
    if (cost < oldCost) return 'text-green';
    return '';
  }
  getCostClassHighlight(cost: number, oldCost: number, isMaster: boolean): any {
    return {
      [this.getCostClass(cost, oldCost)]: true,
      'highlight': isMaster
    };
  }
  getBasePriceClass(basePrice: number, oldbasePrice: number): string {
    if (basePrice < oldbasePrice) return 'text-red';
    if (basePrice > oldbasePrice) return 'text-green';
    return '';
  }
  getBasePriceClassHighlight(cost: number, oldCost: number, isMaster: boolean): any {
    return {
      [this.getBasePriceClass(cost, oldCost)]: true,
      'highlight': isMaster
    };
  }
  sendDataClick(): void {
    const kiotVietService = new KiotVietService();
    const groupedProduct = groupProducts(this.filteredProducts)
    Object.entries(groupedProduct).forEach((p: any) => {

      const lowestConversionItem = p[1].reduce((prev: any, curr: any) => {
        return parseFloat(curr.ConversionValue) < parseFloat(prev.ConversionValue) ? curr : prev;
      }, p[1][0]);
      const rest = p[1].filter((item: any) => item !== lowestConversionItem); // Lấy phần còn lại
      console.log(rest)

      // // const [lowestConversionItem, ...rest] = p[1];
      kiotVietService.sendProductData(lowestConversionItem, rest)


      // p[1].forEach((i: any) => {
      //   kiotVietService.sendProductData(i)
      // })

    });

    showNotification('Đã gửi dữ liệu thành công!')
  }
}