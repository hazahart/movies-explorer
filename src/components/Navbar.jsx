import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getAvatarLetter = () => {
    const name = user?.user_metadata?.full_name || user?.email || '?';
    return name.charAt(0).toUpperCase();
  };

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-netflix-black' : 'bg-gradient-to-b from-black to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-netflix-red text-3xl font-bold tracking-tight">
            MOVIES
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-white hover:text-gray-300 transition text-sm">
              Inicio
            </Link>
            <Link to="/browse" className="text-white hover:text-gray-300 transition text-sm">
              Explorar
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            {showSearch ? (
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setShowSearch(false);
                }}
                placeholder="Títulos, géneros..."
                className="bg-black/80 border border-gray-600 text-white px-3 py-1 rounded text-sm focus:outline-none focus:border-white w-64"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="text-white hover:text-gray-300"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </form>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.user_metadata?.full_name || 'Avatar'}
                  className="w-8 h-8 rounded object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center text-white font-semibold text-sm">
                  {getAvatarLetter()}
                </div>
              )}
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 bg-netflix-black border border-netflix-gray rounded shadow-lg py-2 min-w-[200px] z-50">
                  <div className="px-4 py-2 border-b border-netflix-gray">
                    <p className="text-white text-sm font-semibold truncate">
                      {user?.user_metadata?.full_name || 'Usuario'}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-white hover:bg-netflix-dark transition text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}