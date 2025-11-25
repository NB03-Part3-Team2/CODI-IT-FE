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
      return limitedNumbers;
    } else if (limitedNumbers.length <= 4) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setOrderInfo({ phone: `${selectedPrefix}-${formatted}` });
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
              onChange={setSelectedPrefix}
            />
            <input
              type="text"
              placeholder="숫자만 입력 (예: 12345678)"
              value={orderInfo.phone.replace(`${selectedPrefix}-`, "")}
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
