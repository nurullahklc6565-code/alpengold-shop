import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/customer-session";
import { CustomerLoginForm } from "@/components/store/customer/CustomerLoginForm";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function CustomerLoginPage() {
  const session = await getCustomerSession();
  if (session) redirect("/account");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="store-eyebrow mb-3">Hesabım</p>
          <h1 className="store-section-title">Giriş Yap</h1>
          <p className="mt-2 text-[13px] text-[#a3a3a3]">
            Hesabınız yok mu?{" "}
            <Link href="/account/register" className="text-[#0a0a0a] underline underline-offset-2 hover:text-[#525252]">
              Kayıt olun
            </Link>
          </p>
        </div>
        <CustomerLoginForm />
      </div>
    </div>
  );
}
