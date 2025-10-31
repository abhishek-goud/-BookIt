import "./globals.css";
import Header from "@/components/Header";
import { SearchProvider } from "@/context/SearchContext";
import { OrderProvider } from "@/context/OrderContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <SearchProvider>
            <OrderProvider>
              <Header />
              {children}
            </OrderProvider>
          </SearchProvider>
        </div>
      </body>
    </html>
  );
}
