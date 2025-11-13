import { getAxiosInstance } from "./axiosInstance";

// 주문 삭제 (취소)
export const deleteOrder = async (orderId: string) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.delete(`/orders/${orderId}`);
  return response.data;
};
