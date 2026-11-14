import { Volume2, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { canSpeak, speak, stopSpeaking } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface Props extends Omit<ButtonProps, "onClick"> {
  text: string;
  label?: string;
  compact?: boolean;
}

/** Botão "Ouvir": lê o texto em voz alta para quem tem dificuldade de leitura. */
export function SpeakButton({ text, label = "Ouvir", compact, className, variant = "soft", size, ...rest }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(canSpeak());
    return () => stopSpeaking();
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(text, () => setSpeaking(false));
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (compact ? "iconLg" : "touch")}
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? "Parar leitura" : `${label} em voz alta`}
      className={cn(className)}
      {...rest}
    >
      {speaking ? <Square aria-hidden /> : <Volume2 aria-hidden />}
      {!compact && <span>{speaking ? "Parar" : label}</span>}
    </Button>
  );
}
