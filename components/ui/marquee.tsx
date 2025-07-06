import { Star } from "lucide-react";

export default function Marquee({ items }: { items: string[] }) {
  const displayItems = [...items, ...items];

  return (
    <div className="relative w-full overflow-x-hidden border-b-4 border-black bg-blue-600 text-white group">
      <div className="animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap py-2 flex items-center">
        {displayItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="mx-4 text-sm font-semibold tracking-wide">
              {item}
            </span>
            <span className="text-blue-200">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
