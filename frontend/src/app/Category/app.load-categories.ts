import { catchError, map, of } from "rxjs";
import { environment } from '../../environments/environment';

let activeCategory: string = 'all'; // Giá trị mặc định cho activeCategory

export function loadCategories(
  
  categories: any[],
  setCategories: (categories: any[]) => void,
  setLoading: (isLoading: boolean) => void,
  http: any,
  loadData: (category: string) => void
) {
  // Kiểm tra xem danh mục đã được lưu trong Local Storage chưa
  const cachedCategories = localStorage.getItem('categories');
  if (cachedCategories) {
    // Nếu đã có, sử dụng dữ liệu từ Local Storage
    const parsedCategories = JSON.parse(cachedCategories);
    setCategories(parsedCategories); // Cập nhật danh sách categories
    activeCategory = parsedCategories[0]?.path || 'all'; // Chọn "TẤT CẢ" làm mặc định
    loadData(activeCategory);
    return;
  }

  // Nếu chưa có, gọi API để tải danh mục
  setLoading(true); // Bắt đầu loading

  http.get(`${environment.domainUrl}/api/categories`).pipe(
    map((response: any) => response as { Id: number; Name: string; Path: string }[]),
    catchError((err) => {
      console.error('❌ Lỗi khi tải danh sách categories:', err);
      setLoading(false); // Kết thúc loading khi có lỗi
      return of([]);
    })
  ).subscribe((fetchedCategories: any[]) => {
    if (fetchedCategories.length > 0) {
      // Thêm category "TẤT CẢ" vào đầu danh sách
      const updatedCategories = [
        { id: 0, name: 'TẤT CẢ', path: 'all' },
        ...fetchedCategories.map(category => ({
          id: category.Id,
          name: category.Name,
          path: category.Path || category.Name.toLowerCase().replace(/\s+/g, '-')
        }))
      ];

      // Lưu danh mục vào Local Storage
      localStorage.setItem('categories', JSON.stringify(updatedCategories));

      // Cập nhật danh sách categories và activeCategory
      setCategories(updatedCategories);
      activeCategory = updatedCategories[0].path; // Chọn "TẤT CẢ" làm mặc định
      loadData(activeCategory);
    } else {
      console.warn('⚠️ Không có danh mục nào được trả về từ API.');
      setCategories([]); // Xóa danh sách nếu không có danh mục
    }
    setLoading(false); // Kết thúc loading
  });
}