// src/renderer/pages/browse/game/index.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Gamepad2, Video, Tv, Calendar, ExternalLink } from 'lucide-react';
import { gamesAPI, type Game, type Stream } from '../../../api/core/games';
import { clipsAPI, type Clip } from '../../../api/core/clips';
import Button from '../../../components/UI/Button';
import StreamCard from './components/StreamCard';
import ClipCard from './components/ClipCard';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

type TabType = 'streams' | 'clips';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingClips, setLoadingClips] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('streams');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;
    const fetchGame = async () => {
      try {
        const res = await gamesAPI.getGameInfo(gameId);
        if (res.status && res.data) {
          setGame(res.data);
        } else {
          setError('Game not found');
        }
      } catch (err) {
        setError('Failed to load game');
      }
    };
    fetchGame();
  }, [gameId]);

  useEffect(() => {
    if (!gameId || activeTab !== 'streams') return;
    const fetchStreams = async () => {
      setLoadingStreams(true);
      try {
        const res = await gamesAPI.getStreamsByGame(gameId, 50);
        if (res.status && res.data?.data) {
          setStreams(res.data.data);
        } else {
          setStreams([]);
        }
      } catch (err) {
        console.error('Failed to fetch streams', err);
      } finally {
        setLoadingStreams(false);
      }
    };
    fetchStreams();
  }, [gameId, activeTab]);

  useEffect(() => {
    if (!gameId || activeTab !== 'clips') return;
    const fetchClips = async () => {
      setLoadingClips(true);
      try {
        const res = await clipsAPI.getTopClips(gameId, undefined, 'week', 30);
        if (res.status && res.data?.data) {
          setClips(res.data.data);
        } else {
          setClips([]);
        }
      } catch (err) {
        console.error('Failed to fetch clips', err);
      } finally {
        setLoadingClips(false);
      }
    };
    fetchClips();
  }, [gameId, activeTab]);

  useEffect(() => {
    if (gameId && game) setLoading(false);
    else if (error) setLoading(false);
  }, [game, error, gameId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="medium" text="Loading game data..." />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <p className="text-red-500 mb-2">{error || 'Game not found'}</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/browse/top-games')}>
          Back to Top Games
        </Button>
      </div>
    );
  }

  const boxArtUrl = game.box_art_url
    ? game.box_art_url.replace('{width}', '400').replace('{height}', '533')
    : 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.png';

  const totalViewers = streams.reduce((acc, s) => acc + s.viewer_count, 0);

  return (
    <div className="min-h-screen bg-[#0e0e10]">
      {/* Hero section with glassy effect */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/50 to-transparent z-10" />
        <img
          src={boxArtUrl}
          alt={game.name}
          className="w-full h-full object-cover opacity-20 scale-110 blur-md"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
          <img
            src={boxArtUrl}
            alt={game.name}
            className="w-28 h-36 md:w-40 md:h-52 rounded-xl shadow-2xl border-2 border-[#9147ff]/30 mb-4"
          />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{game.name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#adadb8]">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
              <Gamepad2 className="w-4 h-4" />
              <span>Game</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span>{totalViewers.toLocaleString()} viewers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
              <Tv className="w-4 h-4" />
              <span>{streams.length} live channels</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-30 bg-black/50 backdrop-blur-sm hover:bg-black/70 p-2 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="border-b border-[#2a2a2e] mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('streams')}
              className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                activeTab === 'streams'
                  ? 'text-white'
                  : 'text-[#adadb8] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                Live Streams
              </div>
              {activeTab === 'streams' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9147ff] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('clips')}
              className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                activeTab === 'clips'
                  ? 'text-white'
                  : 'text-[#adadb8] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Top Clips
              </div>
              {activeTab === 'clips' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9147ff] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Streams content */}
        {activeTab === 'streams' && (
          <>
            {loadingStreams && streams.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9147ff]" />
              </div>
            )}
            {!loadingStreams && streams.length === 0 && (
              <div className="text-center py-12 bg-[#1f1f23] rounded-xl">
                <Tv className="w-12 h-12 mx-auto text-[#adadb8] mb-3" />
                <p className="text-[#adadb8]">No live streams for this game right now.</p>
              </div>
            )}
            {streams.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {streams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Clips content */}
        {activeTab === 'clips' && (
          <>
            {loadingClips && clips.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9147ff]" />
              </div>
            )}
            {!loadingClips && clips.length === 0 && (
              <div className="text-center py-12 bg-[#1f1f23] rounded-xl">
                <Video className="w-12 h-12 mx-auto text-[#adadb8] mb-3" />
                <p className="text-[#adadb8]">No clips found for this game this week.</p>
              </div>
            )}
            {clips.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {clips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GamePage;