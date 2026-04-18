import { Product, Transaction, Category, Supplier, Customer, StockMovement } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronics', description: 'Gadgets and electronic components' },
  { id: 'cat-2', name: 'Office Supplies', description: 'Stationery and office equipment' },
  { id: 'cat-3', name: 'Raw Materials', description: 'Base materials for production' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Industrial Sensor X-100',
    sku: 'SN-X100-BL',
    categoryId: 'cat-1',
    unit: 'Units',
    purchasePrice: 45.00,
    sellingPrice: 89.99,
    minStockLevel: 20,
    currentStock: 15, // Low stock
    description: 'High-precision industrial monitoring sensor',
    status: 'Active',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Precision Gear Assembly',
    sku: 'GA-P500-ST',
    categoryId: 'cat-3',
    unit: 'Units',
    purchasePrice: 120.00,
    sellingPrice: 245.00,
    minStockLevel: 10,
    currentStock: 45,
    description: 'Stainless steel gear assembly for robotics',
    status: 'Active',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Premium Bond Paper',
    sku: 'PA-BOND-A4',
    categoryId: 'cat-2',
    unit: 'Reams',
    purchasePrice: 4.50,
    sellingPrice: 8.00,
    minStockLevel: 50,
    currentStock: 120,
    description: 'Professional grade A4 bond paper',
    status: 'Active',
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Alpha Tech Corp', contactPerson: 'Jane Doe', email: 'jane@alpha.com' },
  { id: 'sup-2', name: 'Stationery Hub', contactPerson: 'Bob Smith', email: 'bob@hub.com' }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Global Logistics Inc', contactPerson: 'Alice Green', email: 'alice@global.com' },
  { id: 'cust-2', name: 'Innovative Designs', contactPerson: 'Charlie Brown', email: 'charlie@inn.com' }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'trans-1',
    type: 'Purchase',
    date: new Date(Date.now() - 86400000).toISOString(),
    entityId: 'sup-1',
    entityName: 'Alpha Tech Corp',
    totalAmount: 450.00,
    status: 'Completed',
    notes: 'Restock of sensors',
    transactionItems: [
      { id: 'ti-1', transactionId: 'trans-1', productId: 'prod-1', productName: 'Industrial Sensor X-100', quantity: 10, unitPrice: 45.00, amount: 450.00 }
    ]
  },
  {
    id: 'trans-2',
    type: 'Sale',
    date: new Date().toISOString(),
    entityId: 'cust-1',
    entityName: 'Global Logistics Inc',
    totalAmount: 179.98,
    status: 'Completed',
    notes: 'Regular client order',
    transactionItems: [
      { id: 'ti-2', transactionId: 'trans-2', productId: 'prod-1', productName: 'Industrial Sensor X-100', quantity: 2, unitPrice: 89.99, amount: 179.98 }
    ]
  }
];

export const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    productName: 'Industrial Sensor X-100',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'Purchase',
    qtyIn: 10,
    qtyOut: 0,
    balanceQty: 17,
    referenceId: 'trans-1'
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    productName: 'Industrial Sensor X-100',
    date: new Date().toISOString(),
    type: 'Sale',
    qtyIn: 0,
    qtyOut: 2,
    balanceQty: 15,
    referenceId: 'trans-2'
  }
];
