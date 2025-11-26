import ContactPrefixDropdown from "@/components/order/ContactPrefixDropdown";
import { useOrderStore } from "@/store/orderStore";
import { useState } from "react";

export default function OrderInfoSection() {
  const [selectedPrefix, setSelectedPrefix] = useState("010");
  const [postalCode, setPostalCode] = useState("");
  const { orderInfo, setOrderInfo } = useOrderStore();

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, "");

    // 최대 8자리까지만 허용
    const limitedNumbers = numbers.slice(0, 8);

    // 길이에 따라 자동 포맷팅
    if (limitedNumbers.length <= 3) {
      // 처음 3자리까지: "123"
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      // 4-7자리: "123-4567" 형식 (중간 3자리, 마지막 4자리)
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      // 8자리: "1234-5678" 형식 (중간 4자리, 마지막 4자리)
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setOrderInfo({ phone: formatted ? `${selectedPrefix}-${formatted}` : "" });
  };

  // prefix 변경 시 phone 값 업데이트
  const handlePrefixChange = (newPrefix: string) => {
    setSelectedPrefix(newPrefix);
    // 기존 전화번호가 있으면 새 prefix로 업데이트
    if (orderInfo.phone) {
      const currentNumber = orderInfo.phone.split("-").slice(1).join("-");
      setOrderInfo({ phone: currentNumber ? `${newPrefix}-${currentNumber}` : "" });
    }
  };

  // input value 계산 (안전하게)
  const getInputValue = () => {
    if (!orderInfo.phone) return "";
    const parts = orderInfo.phone.split("-");
    if (parts.length <= 1) return "";
    return parts.slice(1).join("-");
  };

  return (
    <section className="mb-8">
      <h2 className="border-b border-black px-2 py-2.5 text-xl font-extrabold">주문정보</h2>
      <div className="mt-7 flex flex-col gap-4">
        <div className="flex items-center gap-18">
          <label className="text-base font-bold">주문자</label>
          <input
            type="text"
            placeholder="이름"
            value={orderInfo.name}
            onChange={(e) => setOrderInfo({ name: e.target.value })}
            className="border-gray03 w-[24.375rem] rounded-md border px-5 py-3 text-base font-normal"
          />
        </div>
        <div className="flex items-center gap-18">
          <label className="text-base font-bold">연락처</label>
          <div className="flex items-center gap-5">
            <ContactPrefixDropdown
              value={selectedPrefix}
              onChange={handlePrefixChange}
            />
            <input
              type="text"
              placeholder="숫자만 입력 (예: 12345678)"
              value={getInputValue()}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="border-gray03 w-[15.625rem] rounded-md border px-5 py-3 text-base font-normal"
            />
          </div>
        </div>
        <div className="flex items-start gap-9">
          <label className="mt-2 text-base font-bold">배송지 주소</label>
          <div className="flex flex-1 flex-col gap-2">
            <input
              type="text"
              placeholder="우편 번호"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="border-gray03 w-[15.625rem] rounded-md border px-5 py-3 text-base font-normal"
            />
            <input
              type="text"
              placeholder="기본 주소"
              value={orderInfo.address}
              onChange={(e) => setOrderInfo({ address: e.target.value })}
              className="border-gray03 flex-1 rounded-md border px-5 py-3 text-base font-normal"
            />
            <input
              type="text"
              placeholder="상세 주소"
              value={orderInfo.addressDetail}
              onChange={(e) => setOrderInfo({ addressDetail: e.target.value })}
              className="border-gray03 flex-1 rounded-md border px-5 py-3 text-base font-normal"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
