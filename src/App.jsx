import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/movies/:id"
        element={
          <ProtectedRoute>
            <MovieDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />

      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;