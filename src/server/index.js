const express = require("express");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');
const multer = require('multer');

const upload = multer({dest: "uploads/"})

const FormData = require('form-data')
const fs = require('fs');
const client = require("./db")
const cookieParser = require("cookie-parser");
require('dotenv').config();
const axios = require('axios')

const PORT = process.env.PORT || 3001;
const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../../build')));
app.use(express.json());
app.use(cookieParser());
app.use((error, req, res, next) => {
  if ( error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({
        message: 'File too large: Please limit uploads to 20mb'
      })
    }
  }
})

// Add user to psql db
app.post("/add_user", async (req, res) => {

  try{
    const {address, stream_id, bucket_id, encrypted_key, ceramic_info, nft_info} = req.body;
    const address_lc = await address.toLowerCase();
    const newUser = await client.query("INSERT INTO users (address, stream_id, bucket_id, encrypted_key, ceramic_info, nft_info) VALUES($1, $2, $3, $4, $5, $6) RETURNING *", [address_lc, stream_id, bucket_id, encrypted_key, ceramic_info, nft_info]);
    const user = JSON.stringify(newUser.rows[0]);
    console.log("user added to db and retrieved")
    res.send(user)
  } catch (error) {
    console.error(error)
  }
})

// SIGN IN OR SIGN UP PROCESS
app.post("/connect_wallet", async (req, res) => {
  //session = req.session;
  const authSig = req.body;
  const address = authSig.address
  const response = await client.query('SELECT * FROM users WHERE address = $1', [address])
  
  // new user signup flow - no user in db with matching address
  if (!response.rows[0]) {
    console.log("New user signup flow goes here")
    // add new user address to db, store user object in session
    const address_lc = await address.toLowerCase();
    const newUser = await client.query("INSERT INTO users (address) VALUES($1) RETURNING *", [address_lc]);

    console.log("NEW USER:", newUser.rows[0])
    const user = newUser.rows[0];
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
        user.bucket_id = await json.id
        console.log("SESSION USER IS:", user)
        // send user back to client
        res.send(user)
      }
      newBucket();
    } catch (error) {
      console.log(error)
    }
    return;
  }

  // Found existing user flow
  try {
    const currentUser = response.rows[0]
    const user = currentUser;
    console.log(user)
    return res.json(currentUser)
  } catch (error) {
    console.log(error)
  }
});

//update db with encrypted key and access control info
app.post('/update', async (req, res) => {
const {key, address, accessControlConditions} = req.body
const address_lc = address.toLowerCase();
await client.query("UPDATE users SET encrypted_key=$1 WHERE address=$2 RETURNING *", [key, address_lc]);
const updatedUser = await client.query("UPDATE users SET nft_info=$1 WHERE address=$2 RETURNING *", [accessControlConditions, address_lc]);
res.send(updatedUser)
console.log("UPDATED USER:", updatedUser.rows[0])
})

app.post('/get_files', async (req, res) => {
  // get info from chainsafe
  const body = req.body
  const bucket_id = body.bucket_id
  console.log( "BUCKET ID FROM CLIENT:", bucket_id)

  const getFiles = async () => {
    const body = {
      path: '/'
    }
    const body_string = JSON.stringify(body)
    const response = await fetch(`https://api.chainsafe.io/api/v1/bucket/${bucket_id}/ls`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`
      },
      body: body_string
    })
    const json = await response.json()
    console.log("list response is:", json)
    // send session user back to client
    res.send(json)
  }
  getFiles();
})

  async function uploadFile(req,res) {
    try {
    console.log('GOT TO FILE UPLOAD')
    const file = req.file
    console.log('request:', file)
    const uploadFile = fs.createReadStream(file.path)
    const {bucket_id}  = req.body
    const form = new FormData()
    form.append('file', uploadFile, file.name)
    form.append('path', '/')
    const formHeaders = form.getHeaders()

    // TODO add error handling for the post request
    await axios.post(`https://api.chainsafe.io/api/v1/bucket/${bucket_id}/upload`, form, {
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`,
        formHeaders
      },
    });

    const json = JSON.stringify(file.path);

    await res.send(json)
    fs.unlink('uploads/' + file.filename, (err) => {
      if (err) {
          throw err;
      }
      console.log("Delete Upload successfully.");
    });

    } catch (err) {
      console.log(err)
    }
    res.end()
  }

  app.post('/upload', upload.single('file'), uploadFile);

  app.post('/download', async (req, res) => {

    try{
      const {bucket_id, file_path, file_name} = req.body
      const file_path_string = '/' + file_path;
      const body = {
        path: file_path_string
      }
      const response = await fetch(`https://api.chainsafe.io/api/v1/bucket/${bucket_id}/download`, {
      method: 'post',
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`,
        "Content-Type": 'application/json'
      },
      body: JSON.stringify(body)
    })

    const fileStream = await fs.createWriteStream('downloads/' + file_name);
    await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", () => {
        fileStream.close()
        resolve()
    });
    });

    await res.download('downloads/' + file_name)
    
    } catch (err) {
      console.log(err)
    }
  })


  app.post('/unlink_download', async (req, res) => {
    try {
      const {file_name} = req.body
      console.log(file_name)
      fs.unlink(('downloads/' + file_name), (err) => {
        if (err) {
            throw err;
        }
          console.log("Delete Download successfully.");
      });
    } catch (error) {
      console.log(error)
    }
    res.end()
  })

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});