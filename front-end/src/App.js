import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

// import from container
import Header from './components/container/Header';
import Footer from './components/container/Footer';
import Main from './components/container/Main';

// import from routes
import Home from './routes/Home';
import Login from './routes/Login.jsx';
import Register from './routes/Register.jsx';
import NotFound from './routes/NotFound.jsx';
import i18n from './i18n';
import LanguageSelector from './components/LanguageSelector';

function App() {
	return (
		<>
			<BrowserRouter>
					<Header>
						<LanguageSelector />
					</Header>
					<Main>
						<Routes>
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/" element={<Home />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Main>
					<Footer></Footer>
			</BrowserRouter>
		</>
  	);
}

export default App;
