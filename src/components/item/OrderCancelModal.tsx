import Modal from "@/components/Modal";
import { OrderItemResponse } from "@/types/order";
import Image from "next/image";
import Button from "../button/Button";
import Divder from "../divider/Divder";

interface OrderCancelModalProps {
  open: boolean;
  item: (OrderItemResponse & { orderId: string }) | null;
  relatedItems: (OrderItemResponse & { orderId: string })[];
  totalAmount: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function OrderCancelModal({
  open,
  item,
  relatedItems,
  totalAmount,
  onClose,
  onConfirm,
  isLoading,
}: OrderCancelModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
    >
      <div className="relative w-[700px] text-left">
        <button
          className="absolute top-0 right-0"
          onClick={onClose}
        >
          <Image
            src="/icon/deleteBlack.svg"
            alt="닫기"
            width={24}
            height={24}
          />
        </button>
        <div className="text-3xl font-extrabold text-red-600">전체 주문 취소</div>
        <Divder className="mt-5 mb-6" />

        {/* 경고 문구 */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-base font-bold text-yellow-800">
                선택한 상품이 포함된 주문의 모든 상품이 취소됩니다
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                이 주문에 포함된 총 {relatedItems.length}개의 상품이 함께 취소됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 취소될 상품 목록 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-bold mb-3 text-gray-800">취소될 상품 목록</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {relatedItems.map((relatedItem) => (
              <div
                key={relatedItem.id}
                className={`flex justify-between items-start py-2 px-3 rounded ${
                  relatedItem.id === item?.id ? "bg-blue-100 border-2 border-blue-400" : "bg-white"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {relatedItem.product.name}
                    {relatedItem.id === item?.id && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        선택한 상품
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    사이즈: {relatedItem.size.size.ko} | 수량: {relatedItem.quantity}개
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-semibold text-gray-900">
                    {relatedItem.price.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-600">
                    × {relatedItem.quantity}개
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Divder className="my-3" />
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">총 취소 금액</span>
            <span className="text-2xl font-extrabold text-red-600">
              {totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 최종 확인 문구 */}
        <div className="mb-6">
          <p className="text-base text-gray-700 font-medium">
            주문을 취소하면 재고가 복원되고 사용한 포인트가 환불됩니다.
          </p>
          <p className="text-sm text-red-600 mt-2 font-semibold">
            취소 후에는 되돌릴 수 없습니다. 정말 취소하시겠습니까?
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4">
          <Button
            label="돌아가기"
            size="large"
            variant="secondary"
            color="white"
            className="h-16.25 w-full"
            onClick={onClose}
            disabled={isLoading}
          />
          <Button
            label={isLoading ? "취소 중..." : `${totalAmount.toLocaleString()}원 전체 주문 취소`}
            size="large"
            variant="primary"
            color="black"
            className="h-16.25 w-full"
            onClick={onConfirm}
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
