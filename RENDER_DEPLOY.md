# Deploy server game H5 lên Render game

## 1. File này đã được chỉnh gì

- `PORT`: server tiếp tục dùng `process.env.PORT` mà Render cấp.
- MongoDB chính: dùng `MONGODB_URI` và `MONGODB_DB`.
- Callback nạp thẻ cũ: dùng cùng `MONGODB_URI`, database tên `MONGODB_CALLBACK_DB`.
- Telegram Bot Token: bỏ khỏi source, chuyển sang `TELEGRAM_BOT_TOKEN`.
- JWT secret: bỏ hard-code, chuyển sang `JWT_SECRET`.
- Có `.env.example`, `.gitignore`, `render.yaml`.

## 2. Lưu ý trước khi deploy

Gói `game.zip` người dùng gửi để chỉnh KHÔNG chứa các thư mục lớn `public/`, `views/`, `daily/` của bộ game đầy đủ.
Backend có thể được cấu hình, nhưng để giao diện/CMS/game chạy đầy đủ bạn cần chép lại các thư mục cần thiết từ bộ source gốc vào repo trước khi deploy.
Không đưa `node_modules/` lên GitHub; Render sẽ tự `npm install`.

## 3. MongoDB

Render Web Service không chạy MongoDB localhost của source cũ. Hãy dùng MongoDB Atlas hoặc MongoDB/VPS ngoài và tạo biến môi trường:

- `MONGODB_URI`
- `MONGODB_DB` (mặc định `trumclub0bot`)
- `MONGODB_CALLBACK_DB` (mặc định `X29` để giữ hành vi callback cũ)

Bạn vẫn cần import dữ liệu database cũ vào MongoDB mới nếu muốn giữ tài khoản, số dư, lịch sử, cấu hình game...

## 4. Environment trên Render

Tối thiểu:

```
MONGODB_URI=<chuỗi kết nối MongoDB>
MONGODB_DB=trumclub0bot
MONGODB_CALLBACK_DB=X29
JWT_SECRET=<chuỗi bí mật dài, ngẫu nhiên>
NTBA_FIX_319=1
```

Telegram nếu dùng:

```
TELEGRAM_BOT_TOKEN=<token bot mới>
```

Các Telegram token cũ trong source đã bị loại khỏi gói này. Nên thu hồi token cũ ở BotFather vì chúng đã từng nằm trong source.

## 5. Render

Nếu dùng `render.yaml`, tạo Blueprint từ repo.

Nếu tạo Web Service thủ công:

```
Build Command: npm install
Start Command: npm start
```

## 6. Điều cần kiểm tra sau deploy

- Log phải có `MongoDB connected`.
- Không có lỗi thiếu `views`, `public` hoặc file dữ liệu.
- WebSocket client phải trỏ tới domain HTTPS/WSS của Render, không còn trỏ tới IP/domain cũ.
- Các URL callback thanh toán/nạp thẻ phải đổi sang domain mới nếu bạn thực sự sử dụng chúng.

## 7. Dữ liệu và lưu trữ

Đừng coi filesystem của Web Service là database. Dữ liệu quan trọng nên nằm trong MongoDB hoặc dịch vụ lưu trữ bền vững bên ngoài.
