require('dotenv').config();
const express = require("express");
const path = require("path");
const { MongoClient } = require('mongodb');
const app = express();
const tasarim = path.join(__dirname,'../tasarim');
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Uygulama başarılı bir şekilde açılıyor');
});

app.use('/tasarim', express.static('tasarim'));
app.use('/images', express.static('images'));
app.engine('html', require('ejs').renderFile);
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", tasarim);
app.use(express.urlencoded({ extended: false }));

// MongoDB bağlantısı
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUri);

async function connectToMongo() {
  try {
    await mongoClient.connect();
    console.log('MongoDB\'ye başarıyla bağlandı');
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err);
  }
}

connectToMongo();

app.get("/sepetim", async (req, res) => {
  res.render('sepetim');
});

app.get("/hakimizda", async (req, res) => {
  res.render('hakimizda');
});

app.get("/iletisim", async (req, res) => {
  res.render('iletisim');
});

app.get("/urun_detay/:id", async (req, res) => {
  const urunId = req.params.id;

  try {
    const db = mongoClient.db('myDatabase');
    const collection = db.collection('products');
    const urun = await collection.findOne({ id: parseInt(urunId) });

    if (!urun) {
      res.status(404).send('Ürün bulunamadı');
      return;
    }

    const base64Image = urun.base64Image;
    res.render('urun_detay', { urun, base64Image });
  } catch (err) {
    console.error('Ürün detayları alınamadı:', err);
    res.status(500).send('Ürün detayları alınamadı');
  }
});

app.get("/", async (req, res) => {
  try {
    const db = mongoClient.db('myDatabase');
    const collection = db.collection('products');

    const query = {};
    const kategori = req.query.kategori;
    const fiyat = req.query.fiyat;

    if (kategori) {
      query.urun_adi = kategori;
    }

    if (fiyat) {
      if (fiyat === '0-100') {
        query.fiyat = { $gte: 0, $lte: 100 };
      } else if (fiyat === '100-200') {
        query.fiyat = { $gte: 100, $lte: 200 };
      } else if (fiyat === '200-500') {
        query.fiyat = { $gte: 200, $lte: 500 };
      } else if (fiyat === '500-1000') {
        query.fiyat = { $gte: 500, $lte: 1000 };
      } else if (fiyat === '1000') {
        query.fiyat = { $gte: 1000 };
      }
    }

    const urunler = await collection.find(query).toArray();
    const base64Images = urunler.map(urun => urun.base64Image);

    res.render(path.join(__dirname, '..', 'tasarim', 'urunler.ejs'), { 
      urunler,
      base64Images,
    });
  } catch (err) {
    console.error('Veri alınamadı:', err);
    res.status(500).send('Veri alınamadı');
  }
});
