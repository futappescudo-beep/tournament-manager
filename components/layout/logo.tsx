import { Shield } from "lucide-react";

export function Logo() {
  return <div className="flex items-center gap-3">
    <div className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-[35%_35%_45%_45%] border-2 border-[var(--ea-gold)] bg-gradient-to-br from-[#b71920] to-[#430407] shadow-[0_0_18px_rgba(217,170,50,.22)]">
      <Shield className="h-7 w-7 text-[var(--ea-gold-soft)]" />
      <span className="absolute bottom-1 text-[8px] font-black text-white">EA</span>
    </div>
    <div><h1 className="ea-heading text-base text-white">Escudo Amistad</h1><p className="text-[10px] font-bold tracking-[.16em] text-[var(--ea-gold)]">SIEMPRE FUTBOL</p></div>
  </div>;
}
