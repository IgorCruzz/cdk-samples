import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepBack, StepForward } from 'lucide-react';

interface PaginationProps {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{
      pageIndex: number;
      pageSize: number;
    }>
  >;
  total: number;
}

export const Pagination = ({
  pagination,
  setPagination,
  total,
}: PaginationProps) => {
  const totalPages = Math.ceil(total / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    const firstPage = 1;
    const lastPage = totalPages;
    const current = currentPage;

 
    pages.push(firstPage);

     if (current - 2 > firstPage) {
      pages.push('ellipsis-prev');
    }

     const start = Math.max(current - 1, firstPage + 1);
    const end = Math.min(current + 1, lastPage - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

     if (current + 2 < lastPage) {
      pages.push('ellipsis-next');
    }

     if (lastPage > firstPage) {
      pages.push(lastPage);
    }

    return pages;
  };

  const pagesToRender = getPageNumbers();

  return (
    <Card className="w-full flex flex-col md:flex-row justify-center md:justify-between items-center ml-auto shadow-lg pb-10 lg:p-0">
      <CardContent className="w-max flex items-center gap-1 py-2 px-4 !text-sm">
        Viewing
        <span className="font-semibold m-0">
          {pagination.pageIndex * pagination.pageSize + 1}
        </span>
        to
        <span className="font-semibold m-0">
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)}
        </span>
        from <span className="font-semibold m-0">{total}</span>
      </CardContent>

      <CardContent className="flex items-center gap-4 py-2 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              pageIndex: Math.max(prev.pageIndex - 1, 0),
            }))
          }
          disabled={pagination.pageIndex === 0}
          className="border-none"
        >
          <StepBack />
        </Button>

        <div className="flex items-center gap-1">
          {pagesToRender.map((page, idx) =>
            page === 'ellipsis-prev' || page === 'ellipsis-next' ? (
              <span key={idx} className="select-none px-2">
                ...
              </span>
            ) : (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: (page as number) - 1,
                  }))
                }
                className={cn('border-none', {
                  'font-bold': page === currentPage,
                })}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              pageIndex: Math.min(prev.pageIndex + 1, totalPages - 1),
            }))
          }
          disabled={pagination.pageIndex + 1 >= totalPages}
          className="border-none"
        >
        <StepForward />  
        </Button>
      </CardContent>
    </Card>
  );
};
