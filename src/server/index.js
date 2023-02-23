const express = require("express");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');
const multer = require('multer');

const upload = multer({dest: "uploads/"})

const FormData = require('form-data')
const fs = require('fs');

//prod db
//const client = require("./prod_db")

//dev db
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

// Connect Wallet, return user if exists or null if no user found
app.post("/connect_wallet", async (req, res) => {
  //session = req.session;
  const authSig = req.body;
  const address = authSig.address
  console.log("ADDRESS:", address)
  const response = await client.query('SELECT * FROM users WHERE address = $1', [address])
  
  try {
    const currentUser = response.rows[0]
    console.log('user from db:', currentUser)
    if (!currentUser) {
      console.log("No user found in db")
      return res.send({error: "No user found in db"})
    }
    return res.send(currentUser)
  } catch (error) {
    console.log(error)
    return res.send(error)
  }
});

app.post('/new_user', async (req, res) => {
  const {address} = req.body;
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
    res.send(error)
  }
})

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
    console.log('GOT TO FILE UPLOAD', req.body)
    const file = req.file
    console.log('request:', file)
    const uploadFile = fs.createReadStream(file.path)
    const {bucket_id, folder}  = req.body

    const form = new FormData()
    try {

    form.append('file', uploadFile, file.name)

    // TO DO input folder path here instead of root route
    form.append('path', folder)
    const formHeaders = form.getHeaders()

    await axios.post(`https://api.chainsafe.io/api/v1/bucket/${bucket_id}/upload`, form, {
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`,
        formHeaders
      },
    });
    
    // file.path is the name that the file is stored as in the bucket
    const json = JSON.stringify(file.path);

    await res.send(json)
    fs.unlink('uploads/' + file.filename, (err) => {
      if (err) {
          throw err;
      }
      console.log("Delete Upload successfully.");
    });

    } catch (error) {
      console.log(error)
      fs.unlink('uploads/' + file.filename, (err) => {
        if (err) {
            throw err;
        }
        console.log("Delete Upload successfully.");
      });
      res.status(500).send(error)
    }
    res.end()
  }

  app.post('/upload', upload.single('file'), uploadFile);

  app.post('/delete_file', async (req, res) => {
    const {bucket_id, path} = req.body
    console.log('bucket Id and file path:', req.body)
    const body = {
      path: path
    }
    const body_string = JSON.stringify(body)
    try {
      const response = await fetch(`https://api.chainsafe.io/api/v1/bucket/${bucket_id}/rm`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`
        },
        body: body_string
      })
      console.log("DELETE RESPONSE:", response)
    } catch (error) {
      res.status(500).send(error)
    }
  })

  //TO DO check copilot's code here
  app.post('/new_folder', async (req, res) => {
    console.log("GOT TO NEW FOLDER ROUTE")
    const {bucket_id, path} = req.body
    console.log('bucket Id and folder name:', req.body)

    const body = {
      path: '/' + path
      }
      const response = await fetch(`https://api.chainsafe.io/api/v1/bucket/${bucket_id}/mkdir`, {
        method: 'post',
        headers: {
          "Authorization": `Bearer ${process.env.REACT_APP_CHAINSAFE_KEY}`,
          "Content-Type": 'application/json'
          },
          body: JSON.stringify(body)
        })
        const json = await response.json()
        console.log("NEW FOLDER RESPONSE:", json)
        res.send(json)
  })

  app.post('/download', async (req, res) => {
    console.log("GOT TO DOWNLOAD ROUTE", req.body)
    try{
      const {bucket_id, file_path, file_name, folder} = req.body
      const file_path_string = folder + '/' + file_path;
      console.log("FILE PATH STRING:", file_path_string)
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
      res.status(500).send(err)
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