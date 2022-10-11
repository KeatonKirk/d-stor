
import React, { useState } from "react";
import { Provider } from '@self.id/framework';
import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'

const LazyLogin = React.lazy(() => import ("./components/Login"))
const LazyStorage = React.lazy(() => import ("./components/Storage"))


function App() {
  const [authSig, setAuthSig] = useState(null)
  const storedSig = JSON.parse(window.localStorage.getItem("lit-auth-signature"));
  const ceramic_cookie_exists = document.cookie.includes('self.id')

  // If no authSig in state, attempt to get it from local storage

	// useEffect(() => {
  //   if (!authSig && ceramic_cookie_exists) {
  //     try {
  //       setAuthSig(storedSig)
  //     } catch (error) {
  //       console.error(error)
  //     } 
  //   }
  //   return
  // }, [storedSig, authSig, ceramic_cookie_exists])

  console.log("App's STATE sig :", authSig)
  console.log("App's SESSION sig :", storedSig)
  console.log("APP COOKIES:",ceramic_cookie_exists)



  return (
    <Provider client={{ ceramic: 'testnet-clay' }}>
      <Router>
        <React.Suspense fallback='Loading...'>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/login' element={authSig && window.sessionStorage.getItem('db_user') ? <Navigate to='/storage' /> : <LazyLogin setAuthSig={setAuthSig}/> }/>
          <Route path='/storage' element={<LazyStorage authSig={storedSig}/>}/>
        </Routes>
        </React.Suspense>
      </Router>
    </Provider>
  )
}

export default App;
