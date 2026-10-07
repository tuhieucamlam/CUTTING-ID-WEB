# CUTTING-ID-WEB

Ứng dụng web hiển thị kế hoạch cắt theo **Size × Material × Color Code**, hỗ trợ xem tổng kế hoạch và nhập số lượng sản xuất trực tiếp trên bảng pivot.

Source ứng dụng nằm trong thư mục [cutting-plan](./cutting-plan). Phiên bản hiện tại là frontend sử dụng dữ liệu mẫu và dữ liệu JSON nhập từ người dùng; chưa có backend hoặc kết nối database.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Giao diện | React 19, JavaScript / JSX, CSS |
| Công cụ phát triển và build | Vite 8, `@vitejs/plugin-react` |
| Kiểm tra code | Oxlint |
| Dữ liệu ban đầu | `cutting-plan/src/data/sampleData.js` |

## Cài đặt và chạy

Cần Git, Node.js và npm. Theo yêu cầu trong lockfile, Node.js phải thuộc nhánh **20 từ 20.19.0** hoặc **22.12.0 trở lên**.

```bash
git clone https://github.com/tuhieucamlam/CUTTING-ID-WEB.git
cd CUTTING-ID-WEB/cutting-plan
npm ci
npm run dev
```

Mở địa chỉ mà Vite in trong terminal.

**Chạy lệnh npm trong thư mục `cutting-plan`**, vì `package.json` của ứng dụng nằm ở đây. File `package-lock.json` tại thư mục gốc repo không phải lockfile của ứng dụng.

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy máy chủ phát triển |
| `npm run build` | Build ứng dụng vào `cutting-plan/dist/` |
| `npm run preview` | Xem thử bản build sau khi chạy build |
| `npm run lint` | Kiểm tra source bằng Oxlint |

Để cho thiết bị khác trong mạng nội bộ truy cập máy chủ phát triển:

```bash
npm run dev -- --host 0.0.0.0
```

Dùng địa chỉ IP của máy chạy Vite và cổng hiển thị trong terminal. Khi triển khai, phục vụ nội dung `dist/` bằng web server hoặc dịch vụ hosting; repo hiện chưa có cấu hình triển khai riêng.

## Chức năng và cách sử dụng

1. **Lọc kế hoạch:** chọn ngày, máy, mã hàng và chi tiết. Ngày mặc định là **05/10/2026**, tương ứng với dữ liệu mẫu. Nếu nhập dữ liệu ngày khác, đổi bộ lọc ngày để xem.
2. **Xem bảng pivot:** header hai tầng gồm nhóm vật liệu và mã màu. Có cột `G-Total`, cột `Total` cho từng vật liệu và dòng tổng cuối bảng.
3. **Nhập số lượng sản xuất:** bấm vào ô có kế hoạch để mở popup. Nhập số nguyên từ 0 đến số lượng kế hoạch; dùng nút cộng/trừ hoặc nhấn Enter để xác nhận, Escape để đóng.
4. **Nhập JSON:** chọn file `.json` chứa một mảng các dòng dữ liệu. Các dòng nhập được **nối thêm** vào dữ liệu hiện có.
5. **Xem dữ liệu gốc:** bật nút “Dữ liệu gốc” để xem các dòng đã lọc.
6. **Xuất CSV:** xuất các dòng kế hoạch đã lọc, với UTF-8 BOM để hỗ trợ tiếng Việt. File có tên dạng `cutting-plan-2026-10-05.csv`.
7. **Chế độ TV:** nút TV bật/tắt class giao diện `tv-mode`; không gọi chế độ toàn màn hình của trình duyệt.

Giao diện cũng có form “Thêm Kế Hoạch”. Xem mục giới hạn bên dưới về lỗi hiện tại của form này.

## Dữ liệu JSON

Ví dụ file nhập:

```json
[
  {
    "planDate": "20261005",
    "machine": "14",
    "modelCode": "HO23FREERNFK",
    "modelName": "HO23 FREE RN FLYKNIT",
    "component": "FOXING BOTT REINFOR",
    "partNameVN": "ĐỆM HẬU DƯỚI",
    "grade": "A",
    "material": "NASA-V",
    "colorCode": "00A",
    "size": "6T",
    "qty": 10,
    "color": "WHITE"
  }
]
```

| Trường | Kiểu dữ liệu nên dùng | Ý nghĩa |
| --- | --- | --- |
| `planDate` | Chuỗi `YYYYMMDD` | Ngày kế hoạch |
| `machine` | Chuỗi, tùy chọn | Mã máy dùng để lọc |
| `modelCode` | Chuỗi | Mã hàng |
| `modelName` | Chuỗi | Tên mã hàng |
| `component` | Chuỗi | Tên chi tiết |
| `partNameVN` | Chuỗi | Tên chi tiết tiếng Việt |
| `grade` | Chuỗi | Grade, ví dụ `A` |
| `material` | Chuỗi | Nhóm vật liệu hiển thị trên header |
| `colorCode` | Chuỗi | Mã màu, giữ các số 0 ở đầu |
| `size` | Chuỗi | Size, ví dụ `6`, `6T` |
| `qty` | Số | Số lượng kế hoạch |
| `color` | Chuỗi | Tên màu |

Bộ nhập hiện chỉ kiểm tra JSON hợp lệ và giá trị ngoài cùng là mảng, chưa kiểm tra từng trường. Hãy truyền `qty` dạng số, ngày đúng định dạng và đầy đủ các trường dùng cho pivot. Không đưa dòng tổng tính sẵn vào file: ứng dụng tự tính tổng từ các dòng chi tiết.

Dữ liệu mẫu hiện không có `machine`, nên danh sách máy chỉ xuất hiện thêm lựa chọn khi dữ liệu nhập có trường này.

## Quy tắc tính pivot

- Lọc các dòng theo ngày, máy, mã hàng và chi tiết trước khi tính pivot.
- Cộng `qty` của các dòng cùng `size + material + colorCode`.
- `Total` của vật liệu là tổng các mã màu; `G-Total` là tổng các vật liệu.
- Size sắp giảm dần theo phần số; cùng phần số thì size có hậu tố `T` đứng trước, ví dụ `7T, 7, 6T, 6`.
- Mã màu sắp tăng dần; vật liệu giữ thứ tự xuất hiện trong dữ liệu.
- Nếu chọn tất cả mã hàng hoặc chi tiết, các dòng khác mã hàng/chi tiết nhưng cùng size, vật liệu và mã màu sẽ cộng chung.

Màu xanh lá/xanh dương của ô đã nhập sản xuất được chọn xen kẽ theo mã màu trong nhóm vật liệu. Các màu này không biểu thị trạng thái hoàn thành.

## Cấu trúc source

| Đường dẫn trong `cutting-plan/` | Vai trò |
| --- | --- |
| `src/main.jsx` | Khởi tạo React và render ứng dụng |
| `src/App.jsx` | Quản lý dữ liệu, bộ lọc, nhập JSON, xuất CSV và form thêm |
| `src/components/FilterBar.jsx` | Bộ lọc ngày, máy, mã hàng và chi tiết |
| `src/components/ActionBar.jsx` | Các nút thao tác và chọn file JSON |
| `src/components/PivotTable.jsx` | Bảng pivot và popup nhập sản lượng |
| `src/utils/pivotUtils.js` | Tính pivot, tổng và sắp xếp size |
| `src/data/sampleData.js` | Dữ liệu kế hoạch mẫu |
| `src/App.css`, `src/index.css`, `src/components/*.css` | Định dạng giao diện |
| `public/`, `src/assets/` | Tài nguyên tĩnh |
| `vite.config.js` | Cấu hình Vite |
| `package.json`, `package-lock.json` | Scripts và dependencies |
| `.oxlintrc.json` | Quy tắc lint |

Luồng dữ liệu: dữ liệu mẫu / JSON nhập → state trong `App` → lọc → `buildPivot` → `PivotTable`. Nhập sản lượng cập nhật state trong bảng và gọi `onCellEdit` về `App`.

## Giới hạn hiện tại

- Dữ liệu chỉ lưu trong bộ nhớ React. Tải lại trang sẽ quay về dữ liệu mẫu; chưa có localStorage, API hoặc database.
- Số lượng sản xuất nhập trong popup chưa được cộng vào các cột tổng. Tổng pivot và CSV vẫn dùng số lượng **kế hoạch**; CSV không xuất sản lượng vừa nhập.
- Khóa lưu sản lượng chỉ gồm `size|material|colorCode`, chưa bao gồm ngày, máy, mã hàng hoặc chi tiết. Khi đổi bộ lọc có thể thấy lại giá trị của nhóm khác có cùng khóa.
- Nhập cùng file JSON nhiều lần sẽ nối lặp dữ liệu và tăng tổng; chưa có chống trùng.
- Form “Thêm Kế Hoạch” dùng `React.Fragment` trong `App.jsx` nhưng file chưa import `React`. Cần sửa import hoặc dùng `Fragment` trước khi sử dụng form.
- Chưa có scripts test tự động, đăng nhập hoặc phân quyền trong source hiện tại.

## Hướng phát triển

Các bước có thể bổ sung tiếp: API đọc kế hoạch thực tế, lưu sản lượng theo định danh kế hoạch, tách tổng kế hoạch/tổng thực tế, kiểm tra schema JSON và đồng bộ dữ liệu giữa các thiết bị.

