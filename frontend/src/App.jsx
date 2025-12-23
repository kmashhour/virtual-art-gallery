import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionPage from './pages/CollectionPage';
import AddArt from './pages/AddArt';
import EditArt from './pages/EditArt';
import FavoritesPage from "./pages/FavoritesPage";
import ArtPage from './pages/ArtPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from "./context/AuthContext";
import RequireAdmin from "./components/RequireAdmin";
import LoginPage from "./pages/LoginPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />

      <Route path="/collections" element={<CollectionsPage />} />
      <Route path="/collections/:id" element={<CollectionPage />} />
      <Route path="/art/:id" element={<ArtPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Admin beveiligd */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);


const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
