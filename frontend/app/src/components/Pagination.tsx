import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepBack, StepForward } from 'lucide-react';

interface PaginationProps {
  pagination: {
    pageIndex: number;
    pageSize: number;
    lastKey?: string | null;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      pageIndex: number;
      pageSize: number;
      lastKey?: string | null;
    }>
  >;
  lastKey?: string | null; 
  setStartKeys: React.Dispatch<
    React.SetStateAction<{ startKey: string | null }[]>
  >;
  startKeys: { startKey: string | null }[];
}

export const Pagination = ({
  pagination,
  setPagination,
  lastKey,
  setStartKeys,
  startKeys,
}: PaginationProps) => {
  const { pageIndex } = pagination;

  const canPrevious = pageIndex > 0;
  const canNext = !!lastKey;

  const handlePrevious = () => {
  if (!canPrevious) return; 

  const previousStartKey = startKeys[pageIndex - 1]?.startKey ?? null; 

  setPagination((prev) => ({
    ...prev,
    pageIndex: prev.pageIndex - 1,
    lastKey: previousStartKey,
  }));
  };


 const handleNext = () => {
  if (!canNext) return;
 
  setStartKeys((prev) => {
    if (prev[pageIndex + 1]?.startKey === lastKey) {
      return prev;
    } 
    const newKeys = prev.slice(0, pageIndex + 1);
    return [...newKeys, { startKey: lastKey }];
  });

  setPagination((prev) => ({
    ...prev,
    pageIndex: prev.pageIndex + 1,
    lastKey: lastKey,
  }));
};
  return (
    <Card className="w-full flex justify-center items-center py-4">
      <CardContent className="flex items-center justify-center gap-4 px-4 flex-col sm:flex-row">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canPrevious}
          className="border-none"
        >
          <StepBack />
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {pageIndex + 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canNext}
          className="border-none"
        >
          <StepForward />
        </Button>
      </CardContent>
    </Card>
  );
};
