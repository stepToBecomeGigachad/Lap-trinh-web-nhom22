"use client";

const KEY = 'orders';

export function loadOrders() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveOrders(list) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addOrder(order) {
  const list = loadOrders();
  list.unshift(order);
  saveOrders(list);
}

export function getOrderById(id) {
  return loadOrders().find(o => o.id === id) || null;
}

export function updateOrderStatus(id, status) {
  const list = loadOrders();
  const idx = list.findIndex(o => o.id === id);
  if (idx > -1) { list[idx].status = status; saveOrders(list); }
}

export function listOrdersByEmail(email) {
  const list = loadOrders();
  if (!email) return list;
  return list.filter(o => (o.email || '') === email);
}

