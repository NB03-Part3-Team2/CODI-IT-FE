import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { FavoriteStores } from "@/types/store";

interface EditProfileParams {
  currentPassword: string;
  nickname: string;
  newPassword: string;
  imageFile?: File | null; // 이미지 파일 추가
}

export const editUserProfile = async ({ currentPassword, nickname, newPassword, imageFile }: EditProfileParams) => {
  const axiosInstance = getAxiosInstance();
  
  // FormData 생성
  const formData = new FormData();
  
  // 기본 필드 추가
  formData.append("currentPassword", currentPassword);
  formData.append("name", nickname.trim());
  formData.append("newPassword", newPassword.trim());

  // 이미지 파일이 있으면 추가
  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  const { data } = await axiosInstance.patch("/users/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });
  return data;
};

export const getFavoriteStore = async (): Promise<FavoriteStores[]> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/users/me/likes`);
  return response.data;
};

export const withdrawUser = async () => {
  const axiosInstance = getAxiosInstance();
  await axiosInstance.delete("/users/delete");
};
