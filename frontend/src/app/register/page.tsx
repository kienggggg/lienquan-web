import { register } from '@/app/actions/auth';
import Link from 'next/link';
import '../login/auth.css';

export default function RegisterPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-panel glass">
        <h1>Tạo tài khoản</h1>
        <p className="auth-subtitle">Tham gia cộng đồng Liên Quân ngay hôm nay</p>

        <form action={async (fd) => {
          'use server';
          await register(fd);
        }} className="auth-form">
          <div className="input-group">
            <input type="text" name="name" placeholder="Tên hiển thị" required className="glass-input" />
          </div>
          <div className="input-group">
            <input type="email" name="email" placeholder="Email" required className="glass-input" />
          </div>
          <div className="input-group">
            <input type="password" name="password" placeholder="Mật khẩu" required className="glass-input" />
          </div>
          
          <button type="submit" className="btn-primary">
            Đăng Ký
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link href="/login" className="auth-link">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
