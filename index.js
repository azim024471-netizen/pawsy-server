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
const adoptionCollection =db.collection('adoption_requests');



// post ////////////////////////////////////////////////////////////////////////////////

app.post('/allpets', async(req, res)=>{
    const petsData = req.body;
    // console.log(petsData, 'this is from server consol pets post')
    const result = await petsCollection.insertOne(petsData);
    //  console.log(result, 'inserted result')
    res.json(result)
    
})



 app.post('/adoption-requests', async(req, res)=>{
  const reqData = req.body;
  // console.log(reqData, 'this is from server consol adption post')
  const result = await adoptionCollection.insertOne(reqData);
  // console.log(result, 'result form server  adoption postt')
  res.json(result)
 })





// get////////////////////////////////////////////




app.get('/allpets', async(req, res)=>{
    const { search, species } = req.query;
    
    const query = {};
    
    if (search) {
        query.petName = { $regex: search, $options: 'i' }
    }
    if (species) {
        query.species = { $in: [species] }
    }
    
    const result = await petsCollection.find(query).toArray();
    res.send(result) 
})



app.get('/featured', async(req, res)=>{
  const result = await petsCollection.find().limit(6).toArray()
  res.json(result)
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
  // console.log(result, 'from server after comple the  data  ger');
  res.send(result)
})




app.get('/adoption-requests/:userId', async(req, res) => {
    const userId = req.params.userId
    const cursor = adoptionCollection.find({ applicantId: userId })
    const result = await cursor.toArray()
    res.send(result)
})



app.get('/adoption-requests/pet/:petId', async (req, res) => {
    const id = req.params.petId;
    const query = { petId: id }; 
    
    const cursor = adoptionCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
});



//  kew request korse kina jante ///////////////////////////////////////////// getttttttttttt

app.get('/adoption-requests/check/:petId/:userId', async (req, res) => {
    const { petId, userId } = req.params;
    const result = await adoptionCollection.findOne({ 
        petId: petId, 
        applicantId: userId 
    });
    res.json(result); 
});




// for update one patch /////////////////////////////////////////


app.patch('/allpets/:id', async(req, res)=>{
  const id = req.params.id;
  const updateData = req.body;
   const query = {_id : new ObjectId(id)}

 const result = await petsCollection.updateOne(query, {$set : updateData});
 res.json(result)
})



app.patch('/adoption-requests/:id', async (req, res) => {
    const id = req.params.id;
    const { setStatus, petId } = req.body;

    const result = await adoptionCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: setStatus } }
    );

    if (status === 'Approved') {
        await petsCollection.updateOne(
            { _id: new ObjectId(petId) },   
            { $set: { isAdopted: true } }
        );
        await adoptionCollection.deleteMany({
            petId: petId,
            _id: { $ne: new ObjectId(id) }  
        });
    }

    res.json(result);
});



//  delete///////////////////////////////////////////////

app.delete('/allpets/:id', async(req, res)=>{
  const id = req.params.id;
const filter = { _id: new ObjectId(id) };

  const result = await petsCollection.deleteOne(filter);
  res.json(result)
})

app.delete('/adoption-requests/:id', async(req, res)=>{
  const id = req.params.id;
const filter = { _id: new ObjectId(id) };

  const result = await adoptionCollection.deleteOne(filter);
  console.log(result)
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