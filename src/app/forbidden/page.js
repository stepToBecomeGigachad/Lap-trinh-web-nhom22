import Link from 'next/link';

export const metadata = {
  title: 'Không đủ quyền',
};

export default function ForbiddenPage() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
    }}>
      <h1>Không đủ quyền truy cập</h1>
      <p>Bạn không có quyền truy cập vào trang này.</p>
      <Link href="/" style={{ color: '#6b4bff' }}>Quay về trang chủ</Link>
    </div>
  );
}
