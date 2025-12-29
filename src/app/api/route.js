import { NextResponse } from 'next/server';

export async function GET(request) {
  const { origin } = new URL(request.url);

  const endpoints = {
    auth: [
      { method: 'POST', path: '/api/login' },
      { method: 'POST', path: '/api/register' },
      { method: 'POST', path: '/api/logout' },
      { method: 'POST', path: '/api/auth/refresh' },
      { method: 'POST', path: '/api/auth/forgot-password' },
      { method: 'POST', path: '/api/auth/reset-password' },
    ],
    me: [
      { method: 'GET', path: '/api/me' },
      { method: 'GET', path: '/api/profile' },
      { method: 'POST', path: '/api/profile' },
      { method: 'POST', path: '/api/account/password' },
      { method: 'POST', path: '/api/account/delete' },
    ],
    catalog: [
      { method: 'GET', path: '/api/products' },
      { method: 'GET', path: '/api/products/:slug' },
      { method: 'GET', path: '/api/categories' },
      { method: 'GET', path: '/api/products/:slug/reviews' },
      { method: 'POST', path: '/api/products/:slug/reviews' },
    ],
    orders: [
      { method: 'GET', path: '/api/orders' },
      { method: 'POST', path: '/api/orders' },
      { method: 'GET', path: '/api/orders/:id' },
      { method: 'POST', path: '/api/orders/:id' },
    ],
    cart: [
      { method: 'GET', path: '/api/cart' },
      { method: 'PUT', path: '/api/cart' },
      { method: 'DELETE', path: '/api/cart' },
    ],
    coupons: [
      { method: 'GET', path: '/api/coupons' },
    ],
    payments: [
      { method: 'POST', path: '/api/payment/momo/create' },
      { method: 'POST', path: '/api/payment/momo/ipn' },
    ],
    admin: [
      { method: 'GET', path: '/api/admin/stats' },
      { method: 'GET', path: '/api/admin/users' },
      { method: 'GET', path: '/api/admin/users/:id' },
      { method: 'PUT', path: '/api/admin/users/:id' },
      { method: 'GET', path: '/api/admin/products' },
      { method: 'POST', path: '/api/admin/products' },
      { method: 'GET', path: '/api/admin/products/:id' },
      { method: 'PUT', path: '/api/admin/products/:id' },
      { method: 'DELETE', path: '/api/admin/products/:id' },
      { method: 'GET', path: '/api/admin/orders' },
      { method: 'GET', path: '/api/admin/orders/:id' },
      { method: 'POST', path: '/api/admin/orders/:id' },
      { method: 'GET', path: '/api/admin/reviews' },
      { method: 'DELETE', path: '/api/admin/reviews/:id' },
      { method: 'GET', path: '/api/admin/coupons' },
      { method: 'POST', path: '/api/admin/coupons' },
      { method: 'GET', path: '/api/admin/coupons/:id' },
      { method: 'PUT', path: '/api/admin/coupons/:id' },
      { method: 'DELETE', path: '/api/admin/coupons/:id' },
    ],
  };

  return NextResponse.json({
    ok: true,
    name: 'Bookstore API',
    baseUrl: origin,
    endpoints,
  });
}
