import { FC } from "react";
import { cn, getProxyImageUrl } from "@/lib/utils";
import { Team } from "@/types/kings-league";
import { useLocale } from "@/contexts/locale-context";

interface TeamDisplayProps {
  team: Team;
  isWinner: boolean;
  position: "left" | "right";
  showShootout: boolean;
  compact?: boolean;
}

export const TeamDisplay: FC<TeamDisplayProps> = ({
  team,
  isWinner,
  position,
  showShootout,
  compact = false,
}) => {
  const { t } = useLocale();
  const isLeftSide = position === "left";

  const shieldEl = (
    <div
      className={cn(
        "relative h-8 w-8 flex-shrink-0 rounded-xl p-1.5 transition-transform duration-200 group-hover:scale-105 sm:h-9 sm:w-9",
        isWinner
          ? "ring-1.5 ring-[var(--team-primary,#F4AF23)]/80 bg-[rgba(var(--team-primary-rgb,244,175,35),0.14)] shadow-[0_0_12px_rgba(244,175,35,0.25)] scale-105"
          : "bg-zinc-900/60 border border-zinc-800/80"
      )}
    >
      <img
        src={getProxyImageUrl(team.logo?.url)}
        alt={`${t.common.officialShield} ${team.name}`}
        width={40}
        height={40}
        className="object-contain w-full h-full drop-shadow-sm"
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  );

  return (
    <div className={cn(
      "flex items-center gap-1.5 sm:gap-2 min-w-0",
      isLeftSide ? "justify-end" : "justify-start"
    )}>
      {isLeftSide ? (
        <>
          <div className="flex-1 text-right overflow-hidden min-w-0">
            <p
              className={cn(
                compact
                  ? "max-w-full truncate text-center text-[11px] font-bold leading-tight tracking-wide sm:text-xs"
                  : "font-semibold text-[11px] sm:text-xs leading-tight line-clamp-2 break-words",
                isWinner ? "text-[var(--team-primary,#F4AF23)]" : "text-zinc-100"
              )}
              title={team.name}
            >
              {compact ? (team.shortName || team.name) : team.name}
            </p>
            {!compact && (
              <p className="text-[10px] text-zinc-500 hidden sm:block truncate font-medium">
                {team.shortName || team.name}
              </p>
            )}
          </div>
          {shieldEl}
        </>
      ) : (
        <>
          {shieldEl}
          <div className="flex-1 text-left overflow-hidden min-w-0">
            <p
              className={cn(
                compact
                  ? "max-w-full truncate text-center text-[11px] font-bold leading-tight tracking-wide sm:text-xs"
                  : "font-semibold text-[11px] sm:text-xs leading-tight line-clamp-2 break-words",
                isWinner ? "text-[var(--team-primary,#F4AF23)]" : "text-zinc-100"
              )}
              title={team.name}
            >
              {compact ? (team.shortName || team.name) : team.name}
            </p>
            {!compact && (
              <p className="text-[10px] text-zinc-500 hidden sm:block truncate font-medium">
                {team.shortName || team.name}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};