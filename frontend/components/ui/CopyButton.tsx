import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { IconButton } from "./IconButton";

export function CopyButton({ value, label = "Copy" }: { value?: string | null; label?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);
  if (!value) return null;
  return (
    <IconButton
      icon={copied ? "checkmark" : "copy-outline"}
      label={copied ? "Copied" : label}
      size={32}
      onPress={async () => {
        await Clipboard.setStringAsync(value);
        setCopied(true);
      }}
    />
  );
}
