"use client";

import Button from "@/components/button/Button";
import PageButton from "@/components/button/PageButton";
import { getProductInquiry } from "@/lib/api/products";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import { useUserStore } from "@/stores/userStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import InquiryCreateModal from "./InquiryCreateModal";
import InquiryList from "./InquiryList";

interface InquiryContainerProps {
  productId: string;
}

const ITEMS_PER_PAGE = 5;

const InquiryContainer = ({ productId }: InquiryContainerProps) => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUserStore();
  const toaster = useToaster();

  const { data, refetch: refetchInquiry } = useQuery({
    queryKey: ["inquiries", productId],
    queryFn: () => getProductInquiry(productId),
  });

  const setModalOpen = () => {
    if (user === null) {
      toaster("warn", "로그인이 필요합니다.");
      return;
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    refetchInquiry();
  }, [refetchInquiry, isModalOpen]);

  return (
    <div className="flex flex-col">
      <div className="mb-11.5 flex h-12.5 items-center justify-between">
        <h2 className="text-black01 text-[1.75rem] leading-none font-extrabold">상품 문의</h2>
        <Button
          className="h-12.5 w-35"
          size="medium"
          variant="primary"
          label="문의하기"
          onClick={setModalOpen}
        />
      </div>
      {data?.list && (
        <InquiryList
          data={data.list}
          currentPage={currentPage}
          itemPerPage={ITEMS_PER_PAGE}
        />
      )}
      <PageButton
        currentPage={currentPage}
        total={data?.totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
      {isModalOpen && (
        <InquiryCreateModal
          productId={productId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default InquiryContainer;
