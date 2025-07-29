import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  Settings,
  ChevronRight,
  MapPin,
} from 'lucide-react';

const MyOrders = () => {
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-07-15',
      status: 'delivered',
      items: [
        { name: 'Wireless Headphones', quantity: 1, price: 129.99 },
        { name: 'Phone Case', quantity: 2, price: 24.99 },
      ],
      total: 179.97,
    },
    {
      id: 'ORD-002',
      date: '2024-07-20',
      status: 'processing',
      items: [
        { name: 'Laptop Stand', quantity: 1, price: 89.99 },
        { name: 'Wireless Mouse', quantity: 1, price: 39.99 },
      ],
      total: 129.98,
    },
    {
      id: 'ORD-003',
      date: '2024-07-10',
      status: 'cancelled',
      items: [{ name: 'Gaming Keyboard', quantity: 1, price: 159.99 }],
      total: 159.99,
    },
  ];

  return (
    <div className="content-area">
      <div className="content-header">
        <h2 className="content-title">My Orders</h2>
        <p className="content-subtitle">Track and manage your orders</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h4>Order {order.id}</h4>
                <p className="order-date">
                  Placed on {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`order-status ${order.status}`}>
                {order.status}
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>${item.price}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total: ${order.total}</span>
            </div>

            <div
              className="flex"
              style={{ gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}
            >
              <button className="btn btn-primary">
                <Package className="icon" />
                Track Order
              </button>
              {order.status === 'delivered' && (
                <button className="btn btn-secondary">Reorder</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
