"use client";

import OrderInfoSection from "@/components/order/OrderInfoSection";
import OrderPointSection from "@/components/order/OrderPointSection";
import OrderProductList from "@/components/order/OrderProductList";
import OrderSummary from "@/components/order/OrderSummary";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { useOrderStore } from "@/store/orderStore";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AxiosError } from "axios";
import { useToaster } from "@/proviers/toaster/toaster.hook";

export default function OrderPage() {
  const axiosInstance = getAxiosInstance();
  const router = useRouter();
  const { selectedItems, getOrderRequest, reset } = useOrderStore();
  const isOrderCompleted = useRef(false);
  const toaster = useToaster();

  // 선택된 아이템이 없으면 장바구니 페이지로 리다이렉트
  useEffect(() => {
    if (selectedItems.length === 0 && !isOrderCompleted.current) {
      router.replace("/buyer/shopping");
    }
  }, [selectedItems, router]);

  // 장바구니 아이템 삭제 mutation
  const deleteCartItemsMutation = useMutation({
    mutationFn: async () => {
      const deletePromises = selectedItems.map((item) => axiosInstance.delete(`/cart/${item.id}`));
      await Promise.all(deletePromises);
    },
  });

  // 주문 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = getOrderRequest();
      await axiosInstance.post("/orders", orderData);
    },
    onSuccess: async () => {
      try {
        // 주문 성공 후 장바구니에서 주문한 아이템들 삭제
        await deleteCartItemsMutation.mutateAsync();
        isOrderCompleted.current = true; // 주문 완료 플래그 설정
        reset();
        router.replace("/buyer/mypage");
      } catch (error) {
        console.error("장바구니 아이템 삭제 중 오류 발생:", error);
        // 장바구니 삭제 실패해도 주문은 성공했으므로 마이페이지로 이동
        isOrderCompleted.current = true; // 주문 완료 플래그 설정
        reset();
        router.replace("/buyer/mypage");
      }
    },
    onError: (error: AxiosError<{ success?: boolean; error?: { code: number; message: string }; message?: string }>) => {
      // 백엔드 에러 메시지 추출
      let errorMessage = "주문 생성에 실패했습니다.";

      if (error.response?.data) {
        const data = error.response.data;

        // 백엔드 응답 구조: { success: false, error: { code: 400, message: "..." } }
        if (data.error?.message) {
          errorMessage = data.error.message;
        }
        // 또는 직접 message 필드가 있는 경우
        else if (data.message) {
          errorMessage = data.message;
        }
        // 문자열인 경우
        else if (typeof data === "string") {
          errorMessage = data;
        }
      }

      // Zod 에러 메시지 정리
      if (errorMessage.includes("유효성 검사 실패:")) {
        errorMessage = errorMessage.split("유효성 검사 실패:")[1]?.trim() || errorMessage;
      }

      // 여러 에러가 콤마로 구분된 경우 처리
      const messages = errorMessage.split(",").map((msg) => msg.trim());

      // 각 메시지에서 필드명 제거 (예: "phone: 올바른..." -> "올바른...")
      const fieldPrefixes = ["name:", "phone:", "address:", "orderItems:", "usePoint:"];
      const cleanedMessages = messages.map((msg) => {
        for (const prefix of fieldPrefixes) {
          if (msg.startsWith(prefix)) {
            return msg.substring(prefix.length).trim();
          }
        }
        return msg;
      });

      // 최종 메시지: 여러 에러를 줄바꿈으로 연결
      const finalMessage = cleanedMessages.join("\n");

      toaster("warn", finalMessage);
    },
  });

  return (
    <div>
      <div className="mx-auto h-full max-w-[1520px] bg-white pt-8">
        <div className="flex items-center gap-5">
          <h1 className="text-black01 flex items-center text-[1.75rem] font-extrabold">주문 및 결제</h1>
        </div>
        <div className="mt-8 flex gap-15">
          {/* 왼쪽: 주문 정보, 상품, 포인트 */}
          <div className="flex-1">
            <OrderInfoSection />
            <OrderProductList />
            <OrderPointSection />
          </div>

          {/* 오른쪽: 결제 요약 및 버튼 */}
          <OrderSummary onClick={() => createOrderMutation.mutate()} />
        </div>
      </div>
    </div>
  );
}
