# Images Storage Frontend (React)

## Tính năng

### 🔐 **Authentication**

- Đăng ký/Đăng nhập với JWT
- Auto-login với cookies
- Protected routes

### 📁 **Folder Management**

- Tạo, xóa, đổi tên folders
- Cấu trúc thư mục phân cấp
- Navigate giữa các folders

### 🖼️ **File Management**

- Upload multiple files (drag & drop)
- Preview images trực tiếp
- Download files từ Discord
- Delete files
- File type validation

### 🎨 **UI/UX**

- Material-UI components
- Responsive design
- Dark/Light theme support
- Smooth animations

## Cách chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Khởi động development server

```bash
npm start
```

### 3. Mở browser

```
http://localhost:3000
```

## Cấu trúc dự án

```
src/
  components/
    Dashboard.js          # Main dashboard
    LoginPage.js          # Authentication
    FileUpload.js         # File upload với drag & drop
    FileGrid.js           # Display files in grid
    FolderList.js         # Folder navigation
    ProtectedRoute.js     # Route protection

  contexts/
    AuthContext.js        # Authentication state management

  services/
    api.js               # API calls to backend

  App.js                # Main app với routing
  index.js              # Entry point
```

## API Integration

Backend URL: `https://images-storage-nestjs-production.up.railway.app`

### Endpoints được sử dụng:

- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /auth/profile` - Profile user
- `POST /files/upload` - Upload files
- `GET /files/:id/download` - Download files
- `DELETE /files/:id` - Xóa files
- `POST /folders` - Tạo folder
- `GET /folders/user/:userId` - Lấy folders của user

## Features đã hoàn thiện

✅ **Authentication System**

- JWT token management
- Auto-refresh tokens
- Secure cookie storage

✅ **File Upload**

- Drag & drop interface
- Multiple file selection
- Real-time upload progress
- File type validation
- Size limit checks

✅ **File Management**

- Grid view với thumbnails
- Preview dialog cho images
- Download functionality
- Delete với confirmation

✅ **Folder Management**

- Create/delete folders
- Hierarchical navigation
- Breadcrumb navigation

✅ **Responsive Design**

- Mobile-friendly
- Tablet support
- Desktop optimized

## Discord Storage Integration

- Files được upload lên Discord servers
- Tự động generate unique filenames
- Metadata lưu trong MongoDB
- Direct download links từ Discord CDN

## Các package được sử dụng

- **React** - UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Dropzone** - File upload
- **JS Cookie** - Cookie management

## Chạy cùng Backend

1. Khởi động backend NestJS trước:

   ```bash
   cd ../images-storage-nestjs
   npm run start:dev
   ```

2. Khởi động frontend React:

   ```bash
   npm start
   ```

3. Test workflow:
   - Đăng ký account mới
   - Upload files
   - Tạo folders
   - Organize files
   - Download/delete files

## Production Build

```bash
npm run build
```

Build files sẽ có trong thư mục `build/` và có thể deploy lên Netlify, Vercel, hoặc any static hosting.
