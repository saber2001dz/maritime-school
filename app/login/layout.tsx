export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div dir="ltr" className="min-h-screen">
      {children}
    </div>
  );
}
