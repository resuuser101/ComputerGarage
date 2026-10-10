import Link from "next/link";
import { Cpu, Monitor, Server, MemoryStick, HardDrive, Zap, Tv, Mouse } from "lucide-react";
import { Category } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-8 w-8" />,
  Monitor: <Monitor className="h-8 w-8" />,
  Server: <Server className="h-8 w-8" />,
  MemoryStick: <MemoryStick className="h-8 w-8" />,
  HardDrive: <HardDrive className="h-8 w-8" />,
  Zap: <Zap className="h-8 w-8" />,
  Tv: <Tv className="h-8 w-8" />,
  Mouse: <Mouse className="h-8 w-8" />,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
      <div className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100 hover:-translate-y-1">
        <div className="h-16 w-16 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          {iconMap[category.icon] || <Cpu className="h-8 w-8" />}
        </div>
        <h3 className="font-medium text-slate-900 text-center">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
