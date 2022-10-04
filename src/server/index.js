const express = require("express");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');
const pool = require("./db");
//const Redis = require("redis");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const pgSession = require('connect-pg-simple')(sessions);
require('dotenv').config();
//const hre = require("hardhat");

const PORT = process.env.PORT || 3001;
const app = express();

const chain = "ropsten";
const DEFAULT_EXP = 3600;
const oneDay = 1000 * 60 * 60 * 24;

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(express.json());
app.use(sessions({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: "SeCrEtKeY",
  saveUninitialized: false,
  cookie: { 
    maxAge: oneDay,
    secure: true,
    sameSite: true },
  resave: false
}));
app.use(cookieParser());

//instantiate redis client
//const redisClient =  Redis.createClient();
var session;

// Add user to psql db
app.post("/add_user", async (req, res) => {
  //await redisClient.connect();
  //console.log("redis connected")
  try{
    const {address, stream_id, bucket_id, encrypted_key, ceramic_info, nft_info} = req.body;
    const address_lc = await address.toLowerCase();
    const newUser = await pool.query("INSERT INTO users (address, stream_id, bucket_id, encrypted_key, ceramic_info, nft_info) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [address_lc, stream_id, bucket_id, encrypted_key, ceramic_info, nft_info]);
    const user = JSON.stringify(newUser.rows[0]);
    console.log("user added to db and retrieved")
    res.send(user)
    // //redis add
    // await redisClient.set('user',  user );
    // console.log("redis set attempted")

    // //check if I can get data back from redis
    // const redisUser = await redisClient.get('user')
    // console.log("got user from redis" )
    // console.log(redisUser)
  
    // //parse user back to json
    // const parsedUser = JSON.parse(redisUser)
    // const userAddress = parsedUser.address
    // console.log(userAddress)
    // console.log(parsedUser.nft_info)

    // return res.json(parsedUser)
  } catch (error) {
    console.error(error)
  }
})

// SIGN IN OR SIGN UP PROCESS
app.post("/connect_wallet", async (req, res) => {
  session = req.session;
  session.authSig = req.body;
  const address = session.authSig.address
  const response = await pool.query('SELECT * FROM users WHERE address = $1', [address])
  
  // new user signup flow - no user in db with matching address
  if (!response.rows[0]) {
    console.log("New user signup flow goes here")
    // add new user address to db, store user object in session
    const address_lc = await address.toLowerCase();
    const newUser = await pool.query("INSERT INTO users (address) VALUES($1) RETURNING *", [address_lc]);
    // TO DO stringify the session user instead. user is what is sent to client.
    //const user = JSON.stringify(newUser.rows[0]);
    console.log("NEW USER:", newUser.rows[0])
    session.user = newUser.rows[0];
    // create new chainsafe bucket, store info in session and push to db
    try {
      const newBucket = async () => {
        const body = {
          name: address_lc,
          type: 'fps'
        }
        const response = await fetch('https://api.chainsafe.io/api/v1/buckets', {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`
          },
          body: JSON.stringify(body)
        })
        const json = await response.json()
        session.user.bucket_id = await json.id
        console.log("SESSION USER IS:", session.user)
        // send session user back to client
        res.send(session.user)
      }
      newBucket();
    } catch (error) {
      console.log(error)
    }
    return;
  }

  // Found existing user flow
  try {
    // **NOTE TO SELF** the use of response here might cause confusion when pulling authenticated user from state on refresh
    const currentUser = response.rows[0]
    session.user = currentUser;
    console.log(currentUser)
    return res.json(currentUser)
  } catch (error) {
    console.log(error)
  }
});

//update db with encrypted key and access control info
app.post('/update', async (req, res) => {
const {key, address, accessControlConditions} = req.body
const address_lc = address.toLowerCase();
await pool.query("UPDATE users SET encrypted_key=$1 WHERE address=$2 RETURNING *", [key, address_lc]);
const updatedUser = await pool.query("UPDATE users SET nft_info=$1 WHERE address=$2 RETURNING *", [accessControlConditions, address_lc]);
//const updatedUser = await pool.query("UPDATE users SET nft_info=$1 WHERE address=$2 VALUES($1, $2) RETURNING *", [accessControlConditions, address_lc])
console.log("UPDATED USER:", updatedUser.rows[0])
})

// app.get("/mint", async (req, res) => {
//   const MintAccessNft = await hre.ethers.getContractFactory("MintAccessNft");
//   const mintAccessNft = await MintAccessNft.deploy();

//   await mintAccessNft.deployed();

//   const tx = await mintAccessNft.emitEvent();
//   const receipt = await tx.wait();
//   const _id = await receipt.events[0].args['NewItemId']
//   console.log("NFT ID", receipt.events[0].args['NewItemId'])
//   res.send(_id)
//   return;
// });

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});