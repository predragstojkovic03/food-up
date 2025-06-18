import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import MainLayout from './layouts/main.layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<div>Home Page</div>} />
          <Route path='about' element={<div>About Page</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
