import { FC } from "react";
import { cn } from "@/lib/utils";
import { Team } from "@/types/kings-league";
import { Heart } from "lucide-react";

interface TeamDisplayProps {
  team: Team;
  isWinner: boolean;
  position: "left" | "right";
  showShootout: boolean;
  isFavorite?: boolean;
}

export const TeamDisplay: FC<TeamDisplayProps> = ({
  team,
  isWinner,
  position,
  showShootout,
  isFavorite
}) => {
  const isLeftSide = position === "left";

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 min-w-0",
      showShootout ? "mt-0" : "mt-4",
      isLeftSide ? "justify-end" : "justify-start"
    )}>
      {isLeftSide ? (
        <>
          <div className="flex-1 text-right overflow-hidden">
            <div className="flex items-center justify-end gap-1.5">
              {isFavorite && (
                <Heart className="w-3.5 h-3.5 text-red-500" fill="currentColor" aria-label="Time favorito" />
              )}
              <p className={cn(
                "font-semibold text-xs sm:text-sm md:text-base truncate max-w-full",
                isFavorite ? "text-[var(--team-primary)]" : isWinner ? "text-green-500" : "text-foreground"
              )}
                title={team.name}
              >
                {team.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground hidden md:block truncate mt-0.5">
              {team.shortName}
            </p>
          </div>
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0 rounded-lg bg-muted/30 p-1.5 border border-border/50"
          )}>
            <img
              src={team.logo?.url || "/placeholder.svg"}
              alt={`Logo do ${team.name}`}
              width={48}
              height={48}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          </div>
        </>
      ) : (
        <>
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0 rounded-lg bg-muted/30 p-1.5 border border-border/50"
          )}>
            <img
              src={team.logo?.url || "/placeholder.svg"}
              alt={`Logo do ${team.name}`}
              width={48}
              height={48}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="flex items-center gap-1.5">
              <p className={cn(
                "font-semibold text-xs sm:text-sm md:text-base truncate max-w-full",
                isFavorite ? "text-[var(--team-primary)]" : isWinner ? "text-green-500" : "text-foreground"
              )}
                title={team.name}
              >
                {team.name}
              </p>
              {isFavorite && (
                <Heart className="w-3.5 h-3.5 text-red-500" fill="currentColor" aria-label="Time favorito" />
              )}
            </div>
            <p className="text-xs text-muted-foreground hidden md:block truncate mt-0.5">
              {team.shortName}
            </p>
          </div>
        </>
      )}
    </div>
  );
};