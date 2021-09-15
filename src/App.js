import { Route, Switch } from 'react-router-dom';
import Profile from './components/profile';
import Home from './components/home';
import Navbar from './components/bars/navbar';
import Goal from './components/goal';
import NewGoal from './components/new-goal';
import Welcome from './components/welcome';
import { Provider } from 'react-redux';
import { store } from './components/utils/store';
import Font from 'react-font';
import './App.css';


function App() {
  return (
    <>
    <Provider store={store}>
      <Font family="Fira Sans">
      <Navbar />
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route exact path="/profile" component={Profile} />
            <Route path="/goal/:goal_id" component={Goal} />
            <Route path="/new_goal" component={NewGoal} />
            <Route path="/home" component={Home} />
            <Route path="/" component={Welcome} />
          </Switch>
        </header>
      </div>
      </Font>
    </Provider>
    </>
  );
}

export default App;
