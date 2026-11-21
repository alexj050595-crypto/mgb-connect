"use client";

import Image from "next/image";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Image
      src="/mgb-logo.png"
      alt="MGB"
      width={200}
      height={113}
      className={`block shrink-0 object-contain ${className}`}
      unoptimized
    />
  );
}
