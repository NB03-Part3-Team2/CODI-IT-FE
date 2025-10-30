"use client";

import MyPageMenu from "@/components/MyPageMenu";
import ProfileButton from "@/components/button/ProfileButton";
import ProfileInput from "@/components/input/ProfileInput";
import { menuItems } from "@/data/buyerMenuItems";
import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { editUserProfile, withdrawUser } from "@/lib/api/userProfile";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { User } from "@/types/User";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditProfilePage() {
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedMenu, setSelectedMenu] = useState("editProfile");
  const [passwordError, setPasswordError] = useState("");
  const toaster = useToaster();
  const router = useRouter();
  const axiosInstance = getAxiosInstance();
  const { setUser, logout } = useUserStore();

  const { data: user, refetch } = useQuery({
    queryKey: ["User"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<User>("/users/me");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: editUserProfile,
    onSuccess: async () => {
      const { data: latestUser } = await refetch(); // 최신 유저 데이터 받아오고
      if (latestUser) {
        setUser(latestUser); // zustand 상태 업데이트
      }
      toaster("info", "프로필 수정 성공");

      // 인풋창 상태 전부 초기화
      setNickname("");
      setSelectedImage(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    },
    onError: (error: AxiosError<{ success?: boolean; error?: { code: number; message: string }; message?: string }>) => {
      // 백엔드 에러 메시지 추출
      let errorMessage = "수정에 실패했습니다.";
      
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
      // 1단계: "context 유효성 검사 실패: summary" -> "summary"만 추출
      if (errorMessage.includes("유효성 검사 실패:")) {
        errorMessage = errorMessage.split("유효성 검사 실패:")[1]?.trim() || errorMessage;
      }
      
      // 2단계: 콤마로 구분된 여러 에러 메시지 처리
      const messages = errorMessage.split(",").map((msg) => msg.trim());
      
      // 3단계: 각 메시지에서 필드명 제거
      const fieldPrefixes = ["name:", "currentPassword:", "newPassword:", "image:"];
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

  const handleEditImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) setSelectedImage(file);
    };
    input.click();
  };

  // 현재 비밀번호와 새 비밀번호 모두 필수, 새 비밀번호는 확인과 일치해야 함
  const isValid = currentPassword.trim() !== "" && 
                 newPassword.trim() !== "" && 
                 newPassword === confirmPassword;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[1520px] gap-10 pt-[3.75rem]">
        {/* 사이드 메뉴 */}
        <MyPageMenu
          items={menuItems}
          selectedId={selectedMenu}
          onSelect={(id, path) => {
            setSelectedMenu(id);
            router.push(path);
          }}
          className="h-[280px] w-[218px] flex-shrink-0"
        />

        {/* 본문 */}
        <div className="flex flex-col">
          <span className="text-black01 mb-6 text-[1.75rem] font-extrabold">내 정보 수정</span>

          {/* 프로필 이미지 */}
          <div className="relative mb-6 h-24 w-24">
            <Image
              src={selectedImage ? URL.createObjectURL(selectedImage) : user.image}
              alt={user.name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover"
            />
            <div className="absolute right-0 bottom-0">
              <button
                onClick={handleEditImage}
                className="border-gray03 absolute right-0 bottom-0 flex h-[35px] w-[35px] items-center justify-center rounded-full border bg-white"
              >
                <Image
                  src="/icon/edit.svg"
                  alt="Edit"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>

          {/* 인풋 영역 */}
          <div className="flex flex-col gap-4">
            <ProfileInput
              label="이메일"
              value={user.email}
              onChange={() => {}}
              readOnly
            />
            <ProfileInput
              label="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={user.name}
            />
            <ProfileInput
              label="현재 비밀번호"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
            />
            <ProfileInput
              label="새 비밀번호 입력"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (confirmPassword && e.target.value !== confirmPassword) {
                  setPasswordError("비밀번호가 일치하지 않습니다.");
                } else {
                  setPasswordError("");
                }
              }}
              placeholder="새 비밀번호 입력 (필수)"
            />
            <ProfileInput
              label="새 비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (newPassword && e.target.value !== newPassword) {
                  setPasswordError("비밀번호가 일치하지 않습니다.");
                } else {
                  setPasswordError("");
                }
              }}
              placeholder="새 비밀번호 확인 (필수)"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="mt-6 flex flex-col gap-4">
            <ProfileButton
              label="수정하기"
              onClick={() => {
                if (newPassword && newPassword !== confirmPassword) {
                  alert("새 비밀번호가 일치하지 않습니다.");
                  return;
                }

                // 새 비밀번호는 필수, 닉네임은 입력 없으면 현재 값 사용
                const submitData = {
                  currentPassword,
                  nickname: nickname.trim() || user.name,
                  newPassword: newPassword.trim(),
                  imageFile: selectedImage || null,
                };
                
                updateMutation.mutate(submitData);
              }}
              disabled={!isValid || !!passwordError}
            />
            
            {/* 회원탈퇴 버튼 */}
            <button
              className="border-gray03 hover:bg-red-50 text-red-600 h-[50px] w-full rounded-[10px] border text-base font-bold"
              onClick={async () => {
                if (window.confirm("정말로 탈퇴하시겠습니까? 모든 정보가 삭제되며 복구할 수 없습니다.")) {
                  try {
                    await withdrawUser();
                    
                    // 로그아웃 로직: userStore와 localStorage 완전 초기화
                    logout();
                    
                    // localStorage에서 유저 정보 직접 삭제
                    localStorage.removeItem("codiit-user-storage");
                    
                    toaster("info", "회원탈퇴가 완료되었습니다.");
                    
                    // 홈페이지로 이동 및 페이지 새로고침
                    window.location.href = "/";
                  } catch (err) {
                    console.error("회원탈퇴 실패:", err);
                    toaster("warn", "회원탈퇴에 실패했습니다.");
                  }
                }
              }}
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
