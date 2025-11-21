import { deleteOrder } from "@/lib/api/order";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { OrderItemResponse } from "@/types/order";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import Button from "../button/Button";
import OrderCancelModal from "./OrderCancelModal";
import ReviewViewModal from "./ReviewViewModal";
import ReviewWriteModal from "./ReviewWriteModal";

interface ItemCardProps {
  purchases: OrderItemResponse[];
}

export default function ItemCard({ purchases }: ItemCardProps) {
  const [reviewViewTarget, setReviewViewTarget] = useState<OrderItemResponse | null>(null);
  const [reviewWriteTarget, setReviewWriteTarget] = useState<OrderItemResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderItemResponse & { orderId: string } | null>(null);
  const queryClient = useQueryClient();
  const toaster = useToaster();

  const handleCloseView = () => setReviewViewTarget(null);
  const handleCloseWrite = () => setReviewWriteTarget(null);
  const handleCloseCancel = () => setCancelTarget(null);

  const handleReviewSubmit = () => {
    handleCloseWrite();
  };

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await deleteOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toaster("info", "주문이 취소되었습니다.");
      handleCloseCancel();
    },
  });

  return (
    <div className="flex w-full flex-col gap-5">
      {purchases.map((item) => (
        <div
          key={item.id}
          className="border-gray03 flex items-end justify-between rounded-2xl border bg-white p-[1.875rem]"
        >
          <div className="flex items-center gap-[1.875rem]">
            <div className="relative h-45 w-45">
              <Image
                src={item.product.image ?? "/images/Mask-group.svg"}
                alt={item.product.name}
                fill
                className="rounded-xl object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[1.875rem]">
              <div className="flex flex-col gap-[0.625rem]">
                <div className="text-gray01 text-base font-normal">구매일 : {new Date().toLocaleDateString()}</div>
                <div className="text-black01 text-lg font-bold">{item.product.name}</div>
              </div>
              <div className="text-black01 text-lg font-normal">사이즈 : {item.size.size.ko}</div>
              <div className="flex items-center gap-[0.625rem]">
                <span className="text-lg font-extrabold">{item.price.toLocaleString()}원</span>
                <span className="text-gray01 text-base font-normal">| {item.quantity}개</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[0.625rem]">
            <Button
              label="주문 취소"
              size="medium"
              variant="secondary"
              color="white"
              className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
              onClick={() => {
                const targetItem = item as OrderItemResponse & { orderId: string };
                setCancelTarget(targetItem);
              }}
            />
            <Button
              label={item.isReviewed ? "리뷰 보기" : "리뷰 쓰기"}
              size="medium"
              variant="secondary"
              color={item.isReviewed ? "white" : "black"}
              className="h-[3.75rem] w-[12.5rem] px-[1.875rem] py-[0.875rem] font-bold"
              onClick={() => {
                if (item.isReviewed) setReviewViewTarget(item);
                else setReviewWriteTarget(item);
              }}
            />
          </div>
        </div>
      ))}

      {/* 리뷰 보기 모달 */}
      <ReviewViewModal
        open={!!reviewViewTarget}
        onClose={handleCloseView}
        purchase={reviewViewTarget}
      />

      {/* 리뷰 작성 모달 */}
      <ReviewWriteModal
        open={!!reviewWriteTarget}
        onClose={handleCloseWrite}
        purchase={reviewWriteTarget}
        onSubmit={handleReviewSubmit}
      />

      {/* 주문 취소 모달 */}
      <OrderCancelModal
        open={!!cancelTarget}
        onClose={handleCloseCancel}
        item={cancelTarget}
        relatedItems={
          cancelTarget
            ? (purchases as (OrderItemResponse & { orderId: string })[]).filter(
                (p) => p.orderId === cancelTarget.orderId,
              )
            : []
        }
        totalAmount={
          cancelTarget
            ? (purchases as (OrderItemResponse & { orderId: string })[])
                .filter((p) => p.orderId === cancelTarget.orderId)
                .reduce((sum, p) => sum + p.price * p.quantity, 0)
            : 0
        }
        onConfirm={() => {
          if (cancelTarget) {
            cancelOrderMutation.mutate(cancelTarget.orderId);
          }
        }}
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
}
