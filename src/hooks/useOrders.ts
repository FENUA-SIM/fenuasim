import { useState, useCallback } from 'react';
import { useAiraloAPI } from './useAiraloAPI';

interface Order {
  id: string;
  status: string;
  created_at: string;
  package_name: string;
  data_amount: number;
  data_unit: string;
  price: number;
  currency: string;
  sim_iccid?: string;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  per_page: number;
}

export const useOrders = () => {
  const { fetchAPI, loading, error } = useAiraloAPI();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async (page = 1, perPage = 10) => {
    const response = await fetchAPI<OrdersResponse>(`/orders?page=${page}&per_page=${perPage}`);
    if (response.data) {
      /* @ts-ignore */
      setOrders(response.data);
    }
    return response;
  }, [fetchAPI]);

  const fetchOrderDetails = useCallback(async (orderId: string) => {
    const response = await fetchAPI<Order>(`/orders/${orderId}`);
    if (response.data) {
      setCurrentOrder(response.data);
    }
    return response;
  }, [fetchAPI]);

  const createTopUp = useCallback(async (simIccid: string, packageId: string) => {
    const response = await fetchAPI<Order>('/orders/top-up', {
      method: 'POST',
      body: JSON.stringify({
        sim_iccid: simIccid,
        package_id: packageId,
      }),
    });
    if (response.data) {
      setCurrentOrder(response.data);
    }
    return response;
  }, [fetchAPI]);

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderDetails,
    createTopUp,
  };
}; 