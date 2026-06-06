import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-session";
import { customerService } from "@/server/services/storefront/customer.service";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Profilim" };

export default async function ProfilePage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/account/login");

  const customer = await customerService.findById(customerId);
  if (!customer) redirect("/account/login");

  return (
    <div className="max-w-[600px] mx-auto px-6 py-12">
      <div className="mb-8 flex items-center gap-4 border-b border-[#e5e5e5] pb-6">
        <Link
          href="/account"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#e5e5e5] hover:border-[#a3a3a3] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#525252]" strokeWidth={1.5} />
        </Link>
        <div>
          <p className="store-eyebrow mb-1">Hesabım</p>
          <h1 className="store-section-title">Profilim</h1>
          <p className="mt-0.5 text-[12px] text-[#a3a3a3]">{customer.email}</p>
        </div>
      </div>

      <ProfileForm
        firstName={customer.firstName}
        lastName={customer.lastName}
        phone={customer.phone}
      />
    </div>
  );
}
