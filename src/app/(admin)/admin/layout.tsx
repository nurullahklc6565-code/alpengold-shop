// Admin namespace root layout — auth kontrolü yok.
// Login sayfası bu layout'u kullanır.
// Korumalı sayfalar (protected)/layout.tsx tarafından sarılır.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ colorScheme: "light" }}>{children}</div>;
}
