'use client';

import { Button } from '@/components/ui/button';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text, method }: { text: string; method: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy}>
      {copied ? <CheckIcon className="h-4 text-green-500" /> : <PlusCircleIcon className="h-4 text-green-500" />}
    </Button>
  );
}
