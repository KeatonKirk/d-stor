//import mintAccessNFT from './mintAccessNFT.json'
//import { ethers, BigNumber } from "ethers";
import { useState, useEffect } from "react";
import { Provider } from '@self.id/framework';
import {BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./components/Login";
import Storage from "./components/Storage";
import Login2 from "./components/Login2";
import Register from './components/Register'
import Home from './components/Home'
//const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

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
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/login' element={authSig && window.sessionStorage.getItem('db_user') ? <Navigate to='/storage' /> : <Login2 setAuthSig={setAuthSig}/> }/>
          <Route path='/storage' element={<Storage authSig={storedSig}/>}/>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App;
