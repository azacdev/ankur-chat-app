import { Provider } from 'react-redux';
import { store } from './store/store';
import Chat from './components/chat';

function App() {
  return (
    <Provider store={store}>
      <Chat />
    </Provider>
  );
}

export default App;