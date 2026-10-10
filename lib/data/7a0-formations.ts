export type PositionId = "GOL" | "FIX" | "ZC" | "LD" | "LE" | "AD" | "AE" | "VOL" | "MC" | "MO" | "PIV" | "SA" | "ATA" | "COR";

export interface FormationSlot {
  id: string;
  position: PositionId;
  role: "goalkeeper" | "defender" | "midfielder" | "forward";
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from bottom (0-100)
}

export interface Formation {
  id: string;
  name: string;
  slots: FormationSlot[];
}

export const formations: Formation[] = [
  {
    id: "2-3-1",
    name: "2-3-1",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "ZC", role: "defender", x: 35, y: 25 },
      { id: "slot-3", position: "ZC", role: "defender", x: 65, y: 25 },
      { id: "slot-4", position: "AE", role: "midfielder", x: 20, y: 50 },
      { id: "slot-5", position: "MC", role: "midfielder", x: 50, y: 50 },
      { id: "slot-6", position: "AD", role: "midfielder", x: 80, y: 50 },
      { id: "slot-7", position: "PIV", role: "forward", x: 50, y: 80 },
    ],
  },
  {
    id: "3-2-1",
    name: "3-2-1",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "LE", role: "defender", x: 20, y: 25 },
      { id: "slot-3", position: "ZC", role: "defender", x: 50, y: 25 },
      { id: "slot-4", position: "LD", role: "defender", x: 80, y: 25 },
      { id: "slot-5", position: "VOL", role: "midfielder", x: 35, y: 50 },
      { id: "slot-6", position: "MC", role: "midfielder", x: 65, y: 50 },
      { id: "slot-7", position: "PIV", role: "forward", x: 50, y: 80 },
    ],
  },
  {
    id: "2-2-2",
    name: "2-2-2",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "ZC", role: "defender", x: 35, y: 25 },
      { id: "slot-3", position: "ZC", role: "defender", x: 65, y: 25 },
      { id: "slot-4", position: "VOL", role: "midfielder", x: 35, y: 50 },
      { id: "slot-5", position: "MC", role: "midfielder", x: 65, y: 50 },
      { id: "slot-6", position: "SA", role: "forward", x: 35, y: 80 },
      { id: "slot-7", position: "ATA", role: "forward", x: 65, y: 80 },
    ],
  },
  {
    id: "1-4-1",
    name: "1-4-1",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "FIX", role: "defender", x: 50, y: 25 },
      { id: "slot-3", position: "AE", role: "midfielder", x: 15, y: 50 },
      { id: "slot-4", position: "VOL", role: "midfielder", x: 35, y: 50 },
      { id: "slot-5", position: "MC", role: "midfielder", x: 65, y: 50 },
      { id: "slot-6", position: "AD", role: "midfielder", x: 85, y: 50 },
      { id: "slot-7", position: "PIV", role: "forward", x: 50, y: 80 },
    ],
  },
  {
    id: "3-1-2",
    name: "3-1-2",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "LE", role: "defender", x: 20, y: 25 },
      { id: "slot-3", position: "ZC", role: "defender", x: 50, y: 25 },
      { id: "slot-4", position: "LD", role: "defender", x: 80, y: 25 },
      { id: "slot-5", position: "VOL", role: "midfielder", x: 50, y: 50 },
      { id: "slot-6", position: "SA", role: "forward", x: 35, y: 80 },
      { id: "slot-7", position: "ATA", role: "forward", x: 65, y: 80 },
    ],
  },
  {
    id: "2-1-3",
    name: "2-1-3",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "ZC", role: "defender", x: 35, y: 25 },
      { id: "slot-3", position: "ZC", role: "defender", x: 65, y: 25 },
      { id: "slot-4", position: "VOL", role: "midfielder", x: 50, y: 50 },
      { id: "slot-5", position: "SA", role: "forward", x: 20, y: 75 },
      { id: "slot-6", position: "PIV", role: "forward", x: 50, y: 85 },
      { id: "slot-7", position: "SA", role: "forward", x: 80, y: 75 },
    ],
  },
  {
    id: "1-3-2",
    name: "1-3-2",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "FIX", role: "defender", x: 50, y: 25 },
      { id: "slot-3", position: "AE", role: "midfielder", x: 20, y: 50 },
      { id: "slot-4", position: "MC", role: "midfielder", x: 50, y: 50 },
      { id: "slot-5", position: "AD", role: "midfielder", x: 80, y: 50 },
      { id: "slot-6", position: "SA", role: "forward", x: 35, y: 80 },
      { id: "slot-7", position: "ATA", role: "forward", x: 65, y: 80 },
    ],
  },
  {
    id: "2-4-0",
    name: "2-4-0 (Falso 9)",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "ZC", role: "defender", x: 35, y: 25 },
      { id: "slot-3", position: "ZC", role: "defender", x: 65, y: 25 },
      { id: "slot-4", position: "AE", role: "midfielder", x: 20, y: 55 },
      { id: "slot-5", position: "VOL", role: "midfielder", x: 40, y: 45 },
      { id: "slot-6", position: "MC", role: "midfielder", x: 60, y: 45 },
      { id: "slot-7", position: "AD", role: "midfielder", x: 80, y: 55 },
    ],
  },
  {
    id: "1-2-3",
    name: "1-2-3",
    slots: [
      { id: "slot-1", position: "GOL", role: "goalkeeper", x: 50, y: 10 },
      { id: "slot-2", position: "FIX", role: "defender", x: 50, y: 25 },
      { id: "slot-3", position: "VOL", role: "midfielder", x: 30, y: 50 },
      { id: "slot-4", position: "MC", role: "midfielder", x: 70, y: 50 },
      { id: "slot-5", position: "SA", role: "forward", x: 20, y: 80 },
      { id: "slot-6", position: "PIV", role: "forward", x: 50, y: 85 },
      { id: "slot-7", position: "SA", role: "forward", x: 80, y: 80 },
    ],
  },
];
