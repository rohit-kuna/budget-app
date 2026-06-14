"use client";

import { useMemo } from "react";
import { ResponsiveContainer, Treemap } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryRecordDto, SubcategoryRecordDto } from "@/app/lib/finance.types";

type TreemapNode = {
  name: string;
  size: number;
  hue: number;
  subcategoryNames: string[];
};

type TreemapContentProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  hue?: number;
  subcategoryNames?: string[];
};

// Spread hues widely around the color wheel so adjacent categories never look alike.
const HUE_STEP = 137;

const HEADER_HEIGHT = 22;
const LINE_HEIGHT = 16;

function TreemapContent({ x = 0, y = 0, width = 0, height = 0, name = "", hue = 0, subcategoryNames = [] }: TreemapContentProps) {
  const clipId = `category-clip-${x}-${y}`;
  const availableLines = Math.max(0, Math.floor((height - HEADER_HEIGHT - 4) / LINE_HEIGHT));
  const visibleNames = subcategoryNames.slice(0, availableLines);
  const hiddenCount = subcategoryNames.length - visibleNames.length;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} rx={8} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`hsl(${hue}, 45%, 22%)`} stroke="var(--background)" strokeWidth={3} rx={8} />
      <g clipPath={`url(#${clipId})`}>
        {width > 50 ? (
          <rect x={x} y={y} width={width} height={HEADER_HEIGHT} fill={`hsl(${hue}, 55%, 32%)`} />
        ) : null}
        {width > 50 && height > HEADER_HEIGHT ? (
          <text x={x + 8} y={y + 15} fontSize={12} fontWeight={700} fill="#fff">
            {name}
          </text>
        ) : null}
        {width > 50
          ? visibleNames.map((subName, index) => (
              <text key={subName} x={x + 8} y={y + HEADER_HEIGHT + 14 + index * LINE_HEIGHT} fontSize={11} fill="rgba(255,255,255,0.85)">
                {subName.length > Math.floor(width / 6) ? `${subName.slice(0, Math.max(3, Math.floor(width / 6) - 1))}…` : subName}
              </text>
            ))
          : null}
        {width > 50 && hiddenCount > 0 ? (
          <text
            x={x + 8}
            y={y + HEADER_HEIGHT + 14 + visibleNames.length * LINE_HEIGHT}
            fontSize={11}
            fill="rgba(255,255,255,0.6)"
          >
            +{hiddenCount} more
          </text>
        ) : null}
      </g>
    </g>
  );
}

export function CategoryHierarchyChart({
  categories,
  subcategories,
}: {
  categories: CategoryRecordDto[];
  subcategories: SubcategoryRecordDto[];
}) {
  const treemapData = useMemo<TreemapNode[]>(() => {
    return categories.map((category, index) => {
      const subcategoryNames = subcategories
        .filter((subcategory) => subcategory.categoryId === category.id)
        .map((subcategory) => subcategory.name);

      return {
        name: category.name,
        size: Math.max(subcategoryNames.length, 1),
        hue: (index * HUE_STEP) % 360,
        subcategoryNames,
      };
    });
  }, [categories, subcategories]);

  return (
    <Card className="py-2 lg:col-span-2">
      <CardHeader className="px-4 pt-6 sm:px-8 sm:pt-8">
        <CardTitle className="text-2xl tracking-tight">Category overview</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-6 sm:px-8 sm:pb-8">
        {treemapData.length ? (
          <>
            <div className="h-90 w-full min-w-0 min-h-0 rounded-2xl border bg-muted/10 p-2 sm:h-105">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  isAnimationActive={false}
                  content={<TreemapContent />}
                />
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Each block is a category; its subcategories are listed inside.
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No categories yet. Create the first category to start budgeting.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
