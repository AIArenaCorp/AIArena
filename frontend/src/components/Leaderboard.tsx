import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboard";

const LeaderboardTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const result = await getLeaderboard();
        if (result && Array.isArray(result.leaderboard)) {
          setData(result.leaderboard);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
        setData([]);
      }
    };

    fetchLeaders();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 uppercase text-sm">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Bot Name</th>
            <th className="py-3 px-4">Creator</th>
            <th className="py-3 px-4 text-right">Elo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((bot: any, index: number) => (
            <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/50">
              <td className="py-4 px-4 font-mono">#{index + 1}</td>
              <td className="py-4 px-4 font-bold text-blue-400">{bot.bot_name}</td>
              <td className="py-4 px-4">{bot.username}</td>
              <td className="py-4 px-4 text-right text-green-400 font-bold">
                {Math.round(bot.elo)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;