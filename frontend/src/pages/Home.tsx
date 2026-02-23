import { Link } from 'react-router-dom';
import LeaderboardTable from '../components/Leaderboard';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto text-center py-16">
        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Arena
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Design your minimax weights, and submit to the leaderboard.
        </p>
        <Link
          to="/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 inline-block shadow-lg"
        >
          Build Your Bot →
        </Link>
      </header>

      {/* Leaderboard Section */}
      <section className="max-w-4xl mx-auto mt-12">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            Current Leaderboard
          </h2>
          <LeaderboardTable />
        </div>
      </section>
    </div>
  );
};
export default Home;