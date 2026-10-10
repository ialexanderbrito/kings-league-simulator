import { FC } from "react";
import { cn, getProxyImageUrl } from "@/lib/utils";
import { Team } from "@/types/kings-league";

interface TeamDisplayProps {
  team: Team;
  isWinner: boolean;
  position: "left" | "right";
  showShootout: boolean;
}

export const TeamDisplay: FC<TeamDisplayProps> = ({
  team,
  isWinner,
  position,
  showShootout,
}) => {
  const isLeftSide = position === "left";

  const shieldEl = (
    <div
      className={cn(
        "w-9 h-9 sm:w-10 sm:h-10 relative flex-shrink-0 rounded-xl p-1.5 transition-transform duration-200 group-hover:scale-105",
        isWinner
          ? "ring-1.5 ring-[var(--team-primary,#F4AF23)]/80 bg-[rgba(var(--team-primary-rgb,244,175,35),0.14)] shadow-[0_0_12px_rgba(244,175,35,0.25)] scale-105"
          : "bg-zinc-900/60 border border-zinc-800/80"
      )}
    >
      <img
        src={getProxyImageUrl(team.logo?.url)}
        alt={`Logo do ${team.name}`}
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
      "flex items-center gap-2 sm:gap-3 min-w-0",
      isLeftSide ? "justify-end" : "justify-start"
    )}>
      {isLeftSide ? (
        <>
          <div className="flex-1 text-right overflow-hidden min-w-0">
            <p
              className={cn(
                "font-bold text-xs sm:text-sm md:text-base truncate max-w-full leading-snug",
                isWinner ? "text-[var(--team-primary,#F4AF23)]" : "text-zinc-100"
              )}
              title={team.name}
            >
              {team.name}
            </p>
            <p className="text-[11px] text-zinc-500 hidden sm:block truncate font-medium">
              {team.shortName || team.name}
            </p>
          </div>
          {shieldEl}
        </>
      ) : (
        <>
          {shieldEl}
          <div className="flex-1 text-left overflow-hidden min-w-0">
            <p
              className={cn(
                "font-bold text-xs sm:text-sm md:text-base truncate max-w-full leading-snug",
                isWinner ? "text-[var(--team-primary,#F4AF23)]" : "text-zinc-100"
              )}
              title={team.name}
            >
              {team.name}
            </p>
            <p className="text-[11px] text-zinc-500 hidden sm:block truncate font-medium">
              {team.shortName || team.name}
            </p>
          </div>
        </>
      )}
    </div>
  );
};