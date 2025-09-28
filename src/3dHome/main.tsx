import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home3D from './Home3D'
import LibreDWGTestPage from './components/LibreDWGTestPage'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home3D />,
  },
  {
    path: "/libredwg-test",
    element: <LibreDWGTestPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)