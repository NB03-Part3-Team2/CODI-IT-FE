import { editStore } from "@/lib/api/store";
import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import StoreForm from "./StoreForm";

interface StoreEditModalProps {
  onClose: () => void;
  store: {
    id: string;
    name: string;
    address: string;
    detailAddress?: string;
    phone: string;
    content: string;
    imageUrl?: string;
  };
}

export default function StoreEditModal({ onClose, store }: StoreEditModalProps) {
  const toaster = useToaster();

  const queryClient = useQueryClient();

  const handleEdit = async (data: StoreCreateForm) => {
    try {
      await editStore(store.id, data);

      await queryClient.invalidateQueries({ queryKey: ["myStore"] });
      toaster("info", "스토어 정보를 수정했습니다");
      onClose();
    } catch (error) {
      // 백엔드 에러 메시지 추출
      let errorMessage = "스토어 수정에 실패했습니다.";
      
      if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data;
        
        // 백엔드 응답 구조: { success: false, error: { code: 400, message: "...", details: [...] } }
        // details 배열이 있으면 각 message만 추출 (path 제외)
        if (data.error?.details && Array.isArray(data.error.details)) {
          const messages = data.error.details.map((detail: { path: string; message: string }) => `${detail.message}`);
          errorMessage = messages.join("\n");
        }
        // details가 없으면 기존 message 사용
        else if (data.error?.message) {
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
      
      toaster("warn", errorMessage);
    }
  };

  return (
    <StoreForm
      mode="edit"
      onClose={onClose}
      onSubmit={handleEdit}
      defaultValues={{
        storeName: store.name,
        address: {
          basic: store.address,
          detail: store.detailAddress ?? "",
        },
        phoneNumber: store.phone,
        description: store.content,
      }}
      imagePreviewUrl={store.imageUrl}
    />
  );
}
