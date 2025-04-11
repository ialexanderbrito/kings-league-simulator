import { FC } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
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

  return (
    <div className={cn(
      "flex items-center gap-1 sm:gap-2 min-w-0",
      showShootout ? "mt-0" : "mt-4",
      isLeftSide ? "justify-end" : "justify-start"
    )}>
      {isLeftSide ? (
        <>
          <div className="flex-1 text-right overflow-hidden">
            <p className={cn(
              "font-medium text-xs sm:text-sm md:text-base truncate max-w-full",
              isWinner ? "text-green-400" : "text-white"
            )}
              title={team.name}
            >
              {team.name}
            </p>
            <p className="text-xs text-gray-400 hidden md:block truncate">
              {team.shortName}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
            <Image
              src={team.logo?.url || "/placeholder.svg"}
              alt={team.name}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        </>
      ) : (
        <>
          <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
            <Image
              src={team.logo?.url || "/placeholder.svg"}
              alt={team.name}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className={cn(
              "font-medium text-xs sm:text-sm md:text-base truncate max-w-full",
              isWinner ? "text-green-400" : "text-white"
            )}
              title={team.name}
            >
              {team.name}
            </p>
            <p className="text-xs text-gray-400 hidden md:block truncate">
              {team.shortName}
            </p>
          </div>
        </>
      )}
    </div>
  );
};