import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/CopyButton';

type CurlSheetProps = {
  curlText: string;
  triggerLabel?: string;
};

export function CurlSheet({ curlText, triggerLabel = 'CURL' }: CurlSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerLabel}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>CURL Command</SheetTitle>
          <SheetDescription>Use this command in your terminal to test the API request.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          <div className="relative rounded-xl bg-zinc-900 text-zinc-100 p-4 font-mono text-sm shadow-md max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap break-words">{curlText}</pre>
            <div className="absolute top-2 right-2">
              <CopyButton text={curlText} method="CURL" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
