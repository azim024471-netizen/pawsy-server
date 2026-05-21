const express = require('express')
const app = express()
app.use(express.json())

const dotenv = require('dotenv');
dotenv.config();

 
const { MongoClient, ServerApiVersion ,  ObjectId } = require('mongodb');
const uri =process.env.MONGODB_URI;
const port =process.env.PORT || 1234;

//  const cors = require('cors');
//  app.use(cors());
 const cors = require('cors');
 app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {await client.connect();

    
const db = client.db('Pawsy');
const petsCollection =db.collection('allpets');


// post ////////////////////////////////////////////////////////////////////////////////

app.post('/allpets', async(req, res)=>{
    const petsData = req.body;
    console.log(petsData, 'this is from server consol pets post')
    const result = await petsCollection.insertOne(petsData);
     console.log(result, 'inserted result')
    res.json(result)

})


///////get///////////////////


app.get('/allpets', async(req, res)=>{
     const cursor = petsCollection.find();
  const result = await cursor.toArray();
  console.log(result, 'result of  get all pets')
  res.send(result) 
})


app.get('/mypets/:userId', async(req, res) => {
    const userId = req.params.userId
    const cursor = petsCollection.find({ ownerId: userId })
    const result = await cursor.toArray()
    res.send(result)
})


app.get('/allpets/:id', async(req, res)=>{
 
  const id = req.params.id;
  // console.log(id, 'id that have sent from ui to server')
   const query = {
      _id : new ObjectId(id)
    }
    
    const result = await petsCollection.findOne(query);
    console.log(result, 'from server after comple the  data  ger');
    res.send(result)
})
 


// for update one patch /////////////////////////////////////////


app.patch('/allpets/:id', async(req, res)=>{
  const id = req.params.id;
  const updateData = req.body;
   const query = {_id : new ObjectId(id)}

 const result = await petsCollection.updateOne(query, {$set : updateData});
 res.json(result)
})











    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('wellcome to pawsy!')
})

app.listen(port, () => {
  console.log(`pawsy server is running ${port}`)
})