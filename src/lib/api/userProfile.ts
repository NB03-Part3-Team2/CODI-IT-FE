import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { FavoriteStores } from "@/types/store";
import { AxiosError } from "axios";

interface EditProfileParams {
  currentPassword: string;
  nickname?: string;
  newPassword?: string;
  imageFile?: File | null; // 이미지 파일 추가
}

export const editUserProfile = async ({ currentPassword, nickname, newPassword, imageFile }: EditProfileParams) => {
  const axiosInstance = getAxiosInstance();
  
  // FormData 생성
  const formData = new FormData();
  
  // 기본 필드 추가
  formData.append("currentPassword", currentPassword);
  
  // 닉네임이 있으면 추가
  if (nickname?.trim()) {
    formData.append("name", nickname.trim());
  }
  
  // 새 비밀번호가 있으면 추가
  if (newPassword?.trim()) {
    formData.append("newPassword", newPassword.trim());
  }
  
  // 이미지 파일이 있으면 추가
  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  try {
    const { data } = await axiosInstance.patch("/users/me", formData);
    return data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("프로필 수정 실패", error.response?.data || error.message);
    throw err;
  }
};

export const getFavoriteStore = async (): Promise<FavoriteStores[]> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/users/me/likes`);
  return response.data;
};

export const withdrawUser = async () => {
  try {
    const axiosInstance = getAxiosInstance();
    await axiosInstance.delete("/users/delete");
  } catch (err) {
    const error = err as AxiosError;
    console.error("회원탈퇴 API 실패", error.response?.data || error.message);
    throw err;
  }
};
