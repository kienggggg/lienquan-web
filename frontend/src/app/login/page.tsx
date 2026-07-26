import { login } from '@/app/actions/auth';
import { signIn } from '@/auth';
import Link from 'next/link';
import './auth.css';

export default function LoginPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-panel glass">
        <h1>Chào mừng trở lại</h1>
        <p className="auth-subtitle">Đăng nhập để tham gia cộng đồng Liên Quân</p>
        
        {/* Nút đăng nhập Google sử dụng NextAuth Server Action */}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
          className="google-btn-wrapper"
        >
          <button type="submit" className="btn-google">
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google Logo" className="google-icon" />
            Đăng nhập với Google
          </button>
        </form>

        <div className="divider">
          <span>HOẶC</span>
        </div>

        <form action={login} className="auth-form">
          <div className="input-group">
            <input type="email" name="email" placeholder="Email" required className="glass-input" />
          </div>
          <div className="input-group">
            <input type="password" name="password" placeholder="Mật khẩu" required className="glass-input" />
          </div>
          
          {/* Lỗi đăng nhập sẽ được redirect và hiển thị qua query param, tạm thời không hiện nếu dùng NextAuth built-in error redirect */}
          
          <button type="submit" className="btn-primary">
            Đăng Nhập
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link href="/register" className="auth-link">Tạo tài khoản mới</Link>
        </div>
      </div>
    </div>
  );
}
