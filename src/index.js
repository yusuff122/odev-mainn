
require('dotenv').config();
const express = require("express")
const app = express()
const path = require("path")
const tasarim = path.join(__dirname,'../tasarim')
const fs = require('fs');
const port = process.env.PORT || 3000;


app.listen(port, () => {
  console.log('uygulama başarılı bir şekilde açılıyor ');
});
app.use('/tasarim', express.static('tasarim'));

app.use('/images', express.static('images'));
app.engine('html', require('ejs').renderFile);
app.use(express.json())
app.set("view engine","ejs")
app.set("views",tasarim)

app.use(express.urlencoded({
  extended:false
}))



const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
});

client.connect()
    .then(() => console.log('PostgreSQL veritabanına bağlandı'))
    .catch(err => console.error('Bağlantı hatası', err));

    app.post('/', (req, res) => {
      
  });

  app.get("/sepetim", async (req,res)=> {
    res.render('sepetim')
  } )

  app.get("/hakimizda", async (req,res)=> {
    res.render('hakimizda')
  } )

  app.get("/iletisim", async (req,res)=> {
    res.render('iletisim')
  } )
  
  app.get("/urun_detay/:id", async (req, res)=> {
   
        const urunId = req.params.id;
       
        
        try {
            const result = await client.query('SELECT * FROM urunler WHERE id = $1', [urunId]);
            const urun = result.rows[0];
            const base64Image = urun.fotograf.toString('base64');
            console.log(urun);
            res.render('urun_detay', { urun, base64Image });
        } catch (err) {
            console.error('Ürün detayları alınamadı:', err);
            res.status(500).send('Ürün detayları alınamadı');
        }
  });

  app.get("/", async (req, res) => {
    try {
        let query = 'SELECT * FROM urunler WHERE 1=1'; 

        const kategori = req.query.kategori;
        const fiyat = req.query.fiyat;

        if (kategori) {
            query += ` AND urun_adi = '${kategori}'`;
        }

 

        if (fiyat) {
            if (fiyat === '0-100') {
                query += ' AND fiyat BETWEEN 0 AND 100';
            } else if (fiyat === '100-200') {
                query += ' AND fiyat BETWEEN 100 AND 200';
            } else if (fiyat === '200-500') {
                query += ' AND fiyat BETWEEN 200 AND 500';
            } else if (fiyat === '500-1000') {
                query += ' AND fiyat BETWEEN 500 AND 1000';
            } else if (fiyat === '1000') {
                query += ' AND fiyat > 1000';
            }
        }

        const result = await client.query(query);
        const urunler = result.rows;
        const base64Images = urunler.map(urun => {
            return urun.fotograf.toString('base64');
        });

        res.render(path.join(__dirname, '..', 'tasarim', 'urunler.ejs'), { 
            urunler,
            base64Images,
        });
    } catch (err) {
        console.error('Veri alınamadı:', err);
        res.status(500).send('Veri alınamadı');
    }
});

    












