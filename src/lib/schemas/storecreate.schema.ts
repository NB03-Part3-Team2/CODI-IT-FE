import { z } from "zod";

export const storeCreateSchema = z.object({
  storeName: z.string().min(1, "스토어명을 입력하세요").max(50, "스토어명은 최대 50자까지 입력 가능합니다"),
  address: z.object({
    basic: z.string().min(1, "주소를 입력하세요"),
    detail: z.string().optional(),
  }),
  phoneNumber: z
    .string()
    .min(1, "전화번호를 입력하세요")
    .regex(/^01([0|1|6|7|8|9])-([0-9]{3,4})-([0-9]{4})$/, "하이픈(-)을 포함한 전화번호를 입력하세요 (예: 010-1234-5678)"),

  image: z
    .custom<File>((file) => file instanceof File, {
      message: "이미지를 선택하세요.",
    })
    .optional(),
  description: z.string().min(10, "스토어 설명은 최소 10자 이상입니다"),
});

export type StoreCreateForm = z.infer<typeof storeCreateSchema>;
