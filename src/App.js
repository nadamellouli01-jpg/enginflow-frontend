import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Inscription from './components/Auth/Inscription';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Common/Navbar';

// ✅ IMPORTER LES COMPOSANTS
import CreerDemande from './components/Demandeur/CreerDemande';
import SuiviDemandes from './components/Demandeur/SuiviDemandes';
import Notifications from './components/Demandeur/Notifications';
import Dashboard from './components/Admin/Dashboard';
import ListeDemandes from './components/Admin/ListeDemandes';
import DetailDemande from './components/Admin/DetailDemande';
import MonCompte from './components/Common/MonCompte';  // ← AJOUTE CETTE LIGNE

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  const hideNavbarPaths = ['/login', '/inscription'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />

        <Route path="/" element={
          <ProtectedRoute>
            {user?.role === 'ADMINISTRATEUR' ? <Dashboard /> : <SuiviDemandes />}
          </ProtectedRoute>
        } />

        <Route path="/creer-demande" element={
          <ProtectedRoute allowedRoles={['DEMANDEUR']}>
            <CreerDemande />
          </ProtectedRoute>
        } />

        <Route path="/suivi-demandes" element={
          <ProtectedRoute>
            <SuiviDemandes />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={['DEMANDEUR']}>
            <Notifications />
          </ProtectedRoute>
        } />

        {/* ✅ ROUTE MON COMPTE */}
        <Route path="/mon-compte" element={
          <ProtectedRoute>
            <MonCompte />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMINISTRATEUR']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/demandes" element={
          <ProtectedRoute allowedRoles={['ADMINISTRATEUR']}>
            <ListeDemandes />
          </ProtectedRoute>
        } />

        <Route path="/admin/demandes/:id" element={
          <ProtectedRoute allowedRoles={['ADMINISTRATEUR']}>
            <DetailDemande />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;