"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = { orderId: string };

/**
 * 3 saniyede bir ödeme durumunu sorgular.
 * PAID → success sayfasına yönlendirir.
 * FAILED → hata mesajı gösterir.
 * 2 dakika sonra timeout → kullanıcıya e-posta kontrolü önerir.
 *
 * Ödeme durumu asla bu poller tarafından değiştirilmez;
 * sadece mevcut durumu okur (GET).
 */
export function PaymentPoller({ orderId }: Props) {
  const router = useRouter();
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 40; // 40 × 3s = 2 dakika

  useEffect(() => {
    const interval = setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/store/order-status?orderId=${orderId}`);
        if (!res.ok) return;
        const data = await res.json() as { paymentStatus: string };

        if (data.paymentStatus === "PAID") {
          clearInterval(interval);
          router.push(`/checkout/success/${orderId}`);
        } else if (data.paymentStatus === "REFUNDED") {
          clearInterval(interval);
          router.push(`/checkout?paymentError=Ödeme+iptal+edildi`);
        }
      } catch {
        // Ağ hatası → sessizce devam et
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return null;
}
