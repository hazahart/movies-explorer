import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRandomPosters, getPosterUrl } from '../services/moviesService';

const LOGIN_STYLE = {
  '--mosaic-opacity': '0.9',
  '--mosaic-scale': '1',
  '--overlay-center': '0.65',
  '--overlay-edges': '0.55',
  '--overlay-corners': '0.7',
};

export default function Login() {
  const { signInWithGoogle, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [posters, setPosters] = useState([]);
  const [postersLoaded, setPostersLoaded] = useState(false);

  useEffect(() => {
    getRandomPosters(30)
      .then((data) => {
        setPosters(data);
        setPostersLoaded(true);
      })
      .catch(() => setPostersLoaded(true));
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={LOGIN_STYLE}>
      <div className="absolute inset-0 z-0">
        {postersLoaded && posters.length > 0 && (
          <div
            className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 p-2 login-mosaic"
            style={{
              gridAutoRows: 'minmax(180px, auto)',
              opacity: 'var(--mosaic-opacity)',
              transform: 'scale(var(--mosaic-scale))',
              transformOrigin: 'center',
            }}
          >
            {posters.map((poster, i) => (
              <div
                key={poster.id}
                className="aspect-[2/3] rounded overflow-hidden bg-netflix-dark"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <img
                  src={getPosterUrl(poster.poster_path, 'w342')}
                  alt=""
                  className="w-full h-full object-cover"
                  loading={i < 10 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="absolute inset-0 z-10"
        style={{
          background: `radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, var(--overlay-center)) 0%,
            rgba(0, 0, 0, var(--overlay-edges)) 60%,
            rgba(0, 0, 0, var(--overlay-corners)) 100%
          )`,
        }}
      />

      <div className="relative z-20 min-h-screen flex flex-col">
        <header className="px-8 md:px-16 py-6">
          <div className="text-netflix-red font-bold leading-none tracking-tight">
            <div className="text-xl md:text-2xl">MOVIES</div>
            <div className="text-2xl md:text-3xl">EXPLORER</div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
              Todo lo que puedas imaginar
              <br />
              <span className="bg-gradient-to-r from-netflix-red via-red-500 to-red-400 bg-clip-text text-transparent">
                En un solo lugar.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl mx-auto leading-relaxed drop-shadow-lg">
              Explora más de 8,000 películas con trailers, reseñas y recomendaciones.
              Entra con tu cuenta y descubre tu próxima favorita.
            </p>

            {error && (
              <div className="bg-red-950/80 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6 text-sm max-w-md mx-auto">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="group relative inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold px-10 py-4 rounded-full transition-all duration-200 shadow-2xl hover:scale-105 hover:shadow-netflix-red/30"
            >
              {signingIn ? (
                <>
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-base">Continuar con Google</span>
                </>
              )}
            </button>

            <p className="text-gray-500 text-xs mt-8 max-w-md mx-auto">
              Aplicación realizada por: <br/>
              - Gustavo Ramírez Mireles <br/>
              - Vanessa Fernanda Arreola García
            </p>
          </div>
        </main>

        <footer className="px-8 md:px-16 py-4 text-center text-gray-600 text-xs">
          Movies Explorer - GVTeam © 2026
        </footer>
      </div>
    </div>
  );
}