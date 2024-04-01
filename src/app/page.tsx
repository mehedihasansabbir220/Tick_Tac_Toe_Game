"use client"
import clsx from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { createWinner, getLeaderboard } from "../../services/apiService";

type BoxType = {
  boxNo: number;
  chance: "X" | "O" | "Z" | null;
};

function getRandomSymbol() {
  const symbols: ("X" | "O" | "Z")[] = ["X", "O", "Z"];
  const randomIndex = Math.floor(Math.random() * symbols.length);
  return symbols[randomIndex];
}

export default function Home() {
  const boxesNumber: BoxType[] = Array.from({ length: 25 }, (_, index) => ({
    boxNo: index + 1,
    chance: null
  }));

  const winningStates: number[][] = [
    [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25],
    [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], [5, 10, 15, 20, 25],
    [1, 7, 13, 19, 25], [5, 9, 13, 17, 21]
  ];

  const [boxes, setBoxes] = useState<BoxType[]>(boxesNumber);
  const [currentChance, setCurrentChance] = useState<"X" | "O" | "Z">(getRandomSymbol());
  const [xChances, setXChances] = useState<number[]>([]);
  const [oChances, setOChances] = useState<number[]>([]);
  const [zChances, setZChances] = useState<number[]>([]);
  const [win, setWin] = useState<"X" | "O" | "Z" | "Draw" | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  function checkWinningCondition(array: number[]) {
    for (const winState of winningStates) {
      if (winState.every((num) => array.includes(num))) {
        return true;
      }
    }
    return false;
  }

  function handleReset() {
    setCurrentChance(getRandomSymbol());
    setXChances([]);
    setOChances([]);
    setZChances([]);
    setWin(null);
    setBoxes(boxesNumber);
  }

  useEffect(() => {
    updateLeaderboard();
  }, []);

  function updateLeaderboard() {
    getLeaderboard()
      .then((data) => {
        setLeaderboard(data);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard:', error);
      });
  }

  useEffect(() => {
    const xWin = checkWinningCondition(xChances);
    const oWin = checkWinningCondition(oChances);
    const zWin = checkWinningCondition(zChances);
    const allBoxesFill = boxes.every((box) => box.chance !== null);

    if (xWin) setWin("X");
    else if (oWin) setWin("O");
    else if (zWin) setWin("Z");
    else if (!xWin && !oWin && !zWin && allBoxesFill) setWin("Draw");

    if (xWin || oWin || zWin || allBoxesFill) {
      const winnerSymbol = xWin ? "X" : oWin ? "O" : zWin ? "Z" : "Draw";
      createWinner(winnerSymbol, 100) // Assuming a fixed score for each winner, you can adjust this as needed
        .then(() => {
          console.log('Winner created successfully');
          updateLeaderboard();
        })
        .catch((error) => {
          console.error('Error creating winner:', error);
        });
    }
  }, [xChances, oChances, zChances]);

  function handleOnClickBox(boxNumber: number) {
    const updatedBoxes: BoxType[] = boxes.map((box) =>
      box.boxNo === boxNumber ? { ...box, chance: currentChance } : box
    );
    setBoxes(updatedBoxes);

    if (currentChance === "X") setXChances([...xChances, boxNumber]);
    else if (currentChance === "O") setOChances([...oChances, boxNumber]);
    else if (currentChance === "Z") setZChances([...zChances, boxNumber]);

    setCurrentChance((prev) => {
      if (prev === "X") return "O";
      else if (prev === "O") return "Z";
      else return "X";
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-black text-white flex-col">
      <main className="w-full max-w-[500px] flex flex-col gap-4">
        <section className="flex justify-between">
          <p className="text-2xl">
            <span>Chance: </span>
            <span className="font-bold text-3xl text-blue-400">{currentChance}</span>
          </p>
          <button onClick={handleReset} className="bg-white text-black px-4 rounded font-semibold">
            Rematch
          </button>
        </section>
        <section className="gap-2 grid grid-cols-5 w-full max-w-[500px] h-[500px]">
          {boxes.map((box) => (
            <Box
              key={box.boxNo}
              win={win}
              chances={box.chance === "X" ? xChances : box.chance === "O" ? oChances : zChances}
              boxNumber={box.boxNo}
              handleOnClickBox={handleOnClickBox}
              chance={box.chance}
            />
          ))}
        </section>
        <section className="text-3xl">
          {win === "O" && <p>O Win</p>}
          {win === "X" && <p>X Win</p>}
          {win === "Z" && <p>Z Win</p>}
          {win === "Draw" && <p>Draw</p>}
        </section>
        <section>
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <ul>
            {leaderboard.map((winner, index) => (
              <li key={index}>
                {winner.playerName} - {winner.score}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Box({
  boxNumber,
  chance,
  win,
  chances,
  handleOnClickBox
}: {
  boxNumber: number;
  chance: "X" | "O" | "Z" | null;
  win: "X" | "O" | "Z" | "Draw" | null;
  chances: number[];
  handleOnClickBox: (boxNumber: number) => void;
}) {
  const handleClick = () => {
    if (!chance && !win) handleOnClickBox(boxNumber);
  };

  const btnDisabled = chance || win !== null ? true : undefined;

  return (
    <button
      disabled={btnDisabled}
      onClick={handleClick}
      className={twMerge(
        clsx(
          "min-w-16 min-h-16 rounded-md bg-white text-black flex items-center justify-center text-3xl font-bold border-4 border-transparent",
          btnDisabled && "cursor-not-allowed",
          chance === "X" && "text-blue-400 border-blue-400",
          chance === "O" && "text-red-400 border-red-400",
          chance === "Z" && "text-green-400 border-green-400"
        )
      )}
    >
      {chance}
    </button>
  );
}
