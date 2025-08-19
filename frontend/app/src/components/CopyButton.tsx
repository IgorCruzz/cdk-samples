'use client';

import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
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
      {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <p>{method}</p>}
    </Button>
  );
}
