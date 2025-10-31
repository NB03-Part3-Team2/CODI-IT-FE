"use client";

import { postSignup } from "@/lib/api/auth";
import { SignupFormData } from "@/lib/schemas/signup.schemas";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  const router = useRouter();
  const toaster = useToaster();
  const { accessToken } = useUserStore();

  const signupMutation = useMutation({
    mutationFn: postSignup,
    onSuccess: () => {
      toaster("info", "회원가입에 성공했습니다. 로그인 페이지로 이동합니다");
      router.push("/login");
    },
    onError: (error: unknown) => {
      // 백엔드 에러 메시지 추출
      let errorMessage = "회원가입 중 오류가 발생했습니다.";
      
      if (axios.isAxiosError(error) && error.response?.data) {
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
      const fieldPrefixes = ["name:", "email:", "password:", "type:"];
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

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      type: data.userType.toUpperCase() as "BUYER" | "SELLER",
    });
  };

  useEffect(() => {
    if (accessToken) {
      router.back();
    }
  }, [accessToken, router]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
      <Image
        src="/icon/logo.svg"
        alt="CODI-IT"
        width={242}
        height={43}
        className="mb-20"
      />
      <SignupForm onSubmit={onSubmit} />
    </div>
  );
}
