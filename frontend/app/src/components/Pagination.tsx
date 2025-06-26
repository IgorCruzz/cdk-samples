import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

    // Guarda o lastKey atual antes de ir para a próxima página
    setStartKeys((prev) => [...prev, { startKey: lastKey }]);

    setPagination((prev) => ({
      ...prev,
      pageIndex: prev.pageIndex + 1,
      lastKey: lastKey,
    }));
  };

  return (
    <Card className="w-full flex justify-center items-center shadow-lg py-4">
      <CardContent className="flex items-center gap-4 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canPrevious}
          className="border-none"
        >
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground">
          Página {pageIndex + 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canNext}
          className="border-none"
        >
          Próxima
        </Button>
      </CardContent>
    </Card>
  );
};
