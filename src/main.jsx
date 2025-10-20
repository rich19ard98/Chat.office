import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from "./store"
// import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
          <React.StrictMode>
                    <Provider store={store}>
                              <BrowserRouter>
                                        <App />
                              </BrowserRouter>
                    </Provider>
          </React.StrictMode>,
)


// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import { BrowserRouter } from 'react-router-dom'
// import { Provider } from 'react-redux'
// import store from "./store"
// // import './index.css'
// // navigator.serviceWorker.register("/sw.js", { type: "module" });

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </Provider>
//   </React.StrictMode>,
// );

// // ✅ Enregistrement du Service Worker
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register("/sw.js", { type: "module" })
//       .then(reg => {
//         console.log('[Service Worker] Registered:', reg);
//       })
//       .catch(err => {
//         console.error('[Service Worker] Registration failed:', err);
//       });
//   });
// }

