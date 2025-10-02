import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';

function Placeholder({ title }: { title: string }) {
  return <Container sx={{ py: 4 }}><h2>{title}</h2></Container>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
      <Route path="/campaigns" element={<Placeholder title="Campaigns" />} />
      <Route path="/analytics" element={<Placeholder title="Analytics" />} />
      <Route path="/monitor" element={<Placeholder title="Real-time Monitor" />} />
      <Route path="/admin/users" element={<Placeholder title="User Management" />} />
    </Routes>
  );
}
