// src/routes/publicRoutes.tsx
import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../components/layout';
import { HomePage } from '../pages/public/HomePage';

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <div className="p-8">Search Page (Coming Soon)</div> },
      { path: 'pg/:id', element: <div className="p-8">PG Details Page (Coming Soon)</div> },
      { path: 'list-property', element: <div className="p-8">List Your PG (Coming Soon)</div> },
    ],
  },
  // Auth pages (bina Navbar/Footer ke clean full-screen)
  { path: '/login', element: <div className="p-8">Login Page (Coming Soon)</div> },
  { path: '/register', element: <div className="p-8">Register Page (Coming Soon)</div> },
];