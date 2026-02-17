import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Screener",
  description: "NSE stock screener with custom technical conditions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-blue-600">
              Stock Screener
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Screener
              </a>
              <a
                href="/results"
                className="text-gray-600 hover:text-gray-900"
              >
                Results
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
