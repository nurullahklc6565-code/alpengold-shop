import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-session";
import { CustomerRegisterForm } from "@/components/store/customer/CustomerRegisterForm";

export const metadata: Metadata = { title: "Hesap Oluştur" };

export default async function CustomerRegisterPage() {
  const session = await getCustomerSession();
  if (session) redirect("/account");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="store-eyebrow mb-3">Hesabım</p>
          <h1 className="store-section-title">Hesap Oluştur</h1>
          <p className="mt-2 text-[13px] text-[#a3a3a3]">
            Zaten hesabınız var mı?{" "}
            <Link href="/account/login" className="text-[#0a0a0a] underline underline-offset-2 hover:text-[#525252]">
              Giriş yapın
            </Link>
          </p>
        </div>
        <CustomerRegisterForm />
      </div>
    </div>
  );
}
