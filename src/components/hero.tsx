import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="relative z-10 max-w-3xl text-center">
        <Badge variant="default" asChild>
          <Link href="/product" className="no-underline!">
            Welcome to WHA
          </Link>
        </Badge>

        <h1 className="mx-auto mt-6 max-w-2xl font-heading text-display">
          งานฝีมือที่บอกเล่าเรื่องราว
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-body-large text-muted-foreground">
          ค้นพบสินค้าแฮนด์เมดที่ทำด้วยความรักและความตั้งใจ
          จากช่างฝีมือผู้มากประสบการณ์ทั่วทุกมุมของประเทศไทย
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/product">
              เริ่มช้อปปิ้ง <ArrowUpRight className="h-5! w-5!" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/about">เรื่องราวของเรา</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
