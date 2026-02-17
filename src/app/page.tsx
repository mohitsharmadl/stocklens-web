import ScreenerBuilder from "@/components/ScreenerBuilder";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Stock Screener</h1>
        <p className="text-gray-500 text-sm mt-1">
          Build custom screening conditions to find NSE stocks matching your
          criteria
        </p>
      </div>
      <ScreenerBuilder />
    </div>
  );
}
