"use client";

import { postRefresh } from "@/lib/api/auth";
import { connectNotificationSSE, getNotifications, updateNotificationCheck } from "@/lib/api/notification";
import { useToaster } from "@/proviers/toaster/toaster.hook";
import styles from "@/styles/scrollbar.module.css";
import { NotificationItem } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export default function StockAlertPopover() {
  const queryClient = useQueryClient();
  const toaster = useToaster();
  const hasWarnedRef = useRef(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 알림 목록 가져오기
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 0,
  });

  // 알림 읽음 처리
  const mutation = useMutation({
    mutationFn: updateNotificationCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (data) {
      setNotifications(data);
      setHasUnread(data.some((n) => !n.isChecked));
    }
  }, [data]);

  // SSE 연결
  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = connectNotificationSSE();

      eventSource.onmessage = (event) => {
        if (!event.data || event.data === "[]" || event.data === "{}") return;

        try {
          const newAlarm: NotificationItem = JSON.parse(event.data);

          // id 없는 경우
          if (!newAlarm?.id) return;

          setNotifications((prev) => [newAlarm, ...prev]);
          setHasUnread(true); // 배지
        } catch {
          console.warn("잘못된 데이터:", event.data);
        }
      };

      eventSource.onerror = async () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSource.close(); // 에러 시 연결 닫힘

          try {
            // access token 갱신
            await postRefresh();
            // 성공 시 SSE 재연결
            connect();
          } catch {
            if (!hasWarnedRef.current) {
              toaster("warn", "토큰 갱신 실패");
              hasWarnedRef.current = true;
            }
          }
        }
      };
    };
    connect();

    return () => eventSource?.close();
  }, [toaster]);

  // 팝오버 열릴 때
  useEffect(() => {
    if (isOpen) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // setHasUnread(false);
    }
  }, [isOpen, queryClient]);

  const handleClick = (alarmId: string) => {
    mutation.mutate(alarmId);
    setNotifications((prev) => prev.map((n) => (n.id === alarmId ? { ...n, isChecked: true } : n)));
  };

  return (
    <div
      ref={popoverRef}
      className="relative"
    >
      <button
        className="flex cursor-pointer items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src="/icon/bell.svg"
          alt=""
          width={20}
          height={20}
        />
        {hasUnread && <span className="absolute top-0 right-0 h-1 w-1 rounded-full bg-red-500" />}
      </button>

      {isOpen && (
        <div
          className={`border-gray04 absolute left-0 z-[60] mt-2 h-[420px] w-[300px] cursor-pointer overflow-y-auto rounded-lg border bg-white p-5 ${styles["scrollbar-hidden"]}`}
        >
          {notifications.length === 0 ? (
            <p className="text-black01 pb-4 text-sm font-normal">알림이 없습니다.</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="border-gray04 relative mb-5 flex flex-col border-b pb-4 last:mb-0 last:border-none"
                onClick={() => handleClick(item.id)}
              >
                {!item.isChecked && <span className="absolute top-0 right-0 h-[6px] w-[6px] rounded-full bg-red-500" />}
                <p className="text-black01 h-11 text-sm font-normal">{item.content}</p>
                <span className="text-gray01 mt-[5px] self-end text-sm">{dayjs(item.createdAt).fromNow()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
