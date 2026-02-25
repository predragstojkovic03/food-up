import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import MainLayout from './layouts/main.layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<div>Home Page</div>} />
          <Route path='/employee/*'>
            <Route path='/' element={<div>Employee Home Page</div>} />
            <Route path='manager' element={<div>Manager Page</div>} />
          </Route>
          <Route path='/supplier/*'>
            <Route path='/' element={<div>Supplier Home Page</div>} />
            <Route path='/:id' element={<div>Supplier Details Page</div>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
