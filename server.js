const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');

// Import modela
const Djelatnik = require('./models/Djelatnik');
const Evidencija = require('./models/Evidencija');
const VrstaRada = require('./models/VrstaRada');

// MongoDB Atlas URI
const uri = "mongodb+srv://apapija2:hLnXkSF31234.@radnici.0gchgzr.mongodb.net/?retryWrites=true&w=majority&appName=radnici";

// Konekcija sa Mongoose
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // Add this line
    useCreateIndex: true // Add this line
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
    mongoose.set('useFindAndModify', false);
})
.catch((err) => console.error('Could not connect to MongoDB Atlas', err));

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'QzvGq1EEsYPo4Ha5xyI26W61e7BFAdptWpJsCddgtV7euu5bOpW3zTauVpIKnZoU',
    resave: false,
    saveUninitialized: true
}));

// Postavljanje EJS kao view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for checking if user is logged in
function checkAuth(req, res, next) {
    

    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Preusmjeravanje početne rute na login stranicu
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Rute za login i logout
app.get('/login.html', (req, res) => {
    res.render('login', { error: req.session.error });
    req.session.error = null;
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        req.session.loggedIn = true;
        res.redirect('/dashboard.html');
    } else {
        req.session.error = 'Korisničko ime ili password nisu točni';
        res.redirect('/login.html');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// Zaštićene rute
app.get('/dashboard.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/sifrant.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sifrant.html'));
});

app.get('/unos_radnika.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'unos_radnika.html'));
});

app.get('/evidencija_rada.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'evidencija_rada.html'));
});

app.get('/izvjestaj.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'izvjestaj.html'));
});

// Ruta za dodavanje nove vrste rada
app.post('/dodaj-vrstu-rada', checkAuth, async (req, res) => {
    try {
        const { vrsta_rada, cijena } = req.body;
        const novaVrstaRada = new VrstaRada({ vrsta_rada, cijena });
        await novaVrstaRada.save();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Greška pri dodavanju vrste rada.' });
    }
});

// Ruta za dodavanje novog djelatnika
app.post('/dodaj-djelatnika', checkAuth, async (req, res) => {
    try {
        const { ime, prezime, jmbg, kontakt, adresa, aktivan } = req.body;
        const noviDjelatnik = new Djelatnik({ ime, prezime, jmbg, kontakt, adresa, aktivan });
        await noviDjelatnik.save();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Greška pri dodavanju djelatnika.' });
    }
});

// Ruta za dodavanje nove evidencije
app.post('/dodaj-evidenciju', checkAuth, async (req, res) => {
    try {
        const evidencije = req.body;
        if (!Array.isArray(evidencije)) {
            return res.json({ success: false, error: 'Podaci moraju biti u formatu niza.' });
        }
        const novaEvidencija = await Evidencija.insertMany(evidencije);
        res.json({ success: true, data: novaEvidencija });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Greška pri dodavanju evidencije.' });
    }
});

// Ruta za ažuriranje vrste rada

app.put('/azuriraj-vrstu-rada/:id', checkAuth, async (req, res) => {
    try {
        const updateData = req.body;
        console.log('Updating VrstaRada with ID:', req.params.id);
        console.log('Request body:', updateData);
        
        // Ažurirajte samo specificirana polja koristeći $set
        const updatedVrstaRada = await VrstaRada.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData },
            { new: true, runValidators: true }  // Vraća ažurirani dokument i validira
        );

        console.log('Updated VrstaRada:', updatedVrstaRada);
        res.json({ success: true, data: updatedVrstaRada });
    } catch (error) {
        console.error('Update error:', error);
        res.json({ success: false, error: 'Greška pri ažuriranju vrste rada.' });
    }
});


// Ruta za ažuriranje djelatnika
app.put('/azuriraj-djelatnika/:id', checkAuth, async (req, res) => {
    try {
        const updateData = req.body;
        console.log('Updating Djelatnik with ID:', req.params.id);
        console.log('Request body:', updateData);
        
        const updatedDjelatnik = await Djelatnik.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData },
            { new: true, runValidators: true }
        );

        console.log('Updated Djelatnik:', updatedDjelatnik);
        res.json({ success: true, data: updatedDjelatnik });
    } catch (error) {
        console.error('Update error:', error);
        res.json({ success: false, error: 'Greška pri ažuriranju djelatnika.' });
    }
});




// Ruta za ažuriranje evidencije
app.put('/azuriraj-evidenciju/:id', checkAuth, async (req, res) => {
    try {
        const updateData = req.body;
        console.log('Updating Evidencija with ID:', req.params.id);
        console.log('Request body:', updateData);
        
        // Ažurirajte samo specificirana polja koristeći $set
        const updatedEvidencija = await Evidencija.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData },
            { new: true, runValidators: true }  // Vraća ažurirani dokument i validira
        );

        console.log('Updated Evidencija:', updatedEvidencija);
        res.json({ success: true, data: updatedEvidencija });
    } catch (error) {
        console.error('Update error:', error);
        res.json({ success: false, error: 'Greška pri ažuriranju evidencije.' });
    }
});

// Ruta za dohvaćanje vrsta rada
app.get('/vrste-rada', checkAuth, async (req, res) => {
    try {
        const vrsteRada = await VrstaRada.find();
        res.json(vrsteRada);
    } catch (error) {
        console.error(error);
        res.status(500).send('Greška pri dohvaćanju vrsta rada.');
    }
});

// Ruta za dohvaćanje djelatnika
app.get('/djelatnici', checkAuth, async (req, res) => {
    try {
        const djelatnici = await Djelatnik.find();
        res.json(djelatnici);
    } catch (error) {
        console.error(error);
        res.status(500).send('Greška pri dohvaćanju djelatnika.');
    }
});

// Ruta za dohvaćanje evidencije
app.get('/evidencija', checkAuth, async (req, res) => {
    try {
        const evidencije = await Evidencija.find().populate('djelatnik_id').populate('vrsta_rada_id');
        res.json(evidencije);
    } catch (error) {
        console.error(error);
        res.status(500).send('Greška pri dohvaćanju evidencije.');
    }
});

// Ruta za dohvaćanje zadnjih 15 evidencija
app.get('/zadnje-evidencije', checkAuth, async (req, res) => {
    try {
        const evidencije = await Evidencija.find().sort({ datum: -1 }).limit(15).populate('djelatnik_id').populate('vrsta_rada_id');
        res.json(evidencije);
    } catch (error) {
        console.error(error);
        res.status(500).send('Greška pri dohvaćanju zadnjih evidencija.');
    }
});

// Ruta za brisanje djelatnika
app.delete('/izbrisi-djelatnika/:id', checkAuth, async (req, res) => {
    try {
        await Djelatnik.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Greška pri brisanju djelatnika.' });
    }
});

// Ruta za brisanje evidencije
app.delete('/izbrisi-evidenciju/:id', checkAuth, async (req, res) => {
    try {
        await Evidencija.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Greška pri brisanju evidencije.' });
    }
});

// Ruta za izvještaj
app.get('/izvjestaj', checkAuth, async (req, res) => {
    const { datum_od, datum_do } = req.query;
    const djelatnici = req.query.djelatnik_id;
    const query = {
        datum: {
            $gte: new Date(datum_od),
            $lte: new Date(datum_do)
        }
    };
    if (djelatnici) {
        query.djelatnik_id = { $in: Array.isArray(djelatnici) ? djelatnici : [djelatnici] };
    }
    try {
        const evidencije = await Evidencija.find(query).populate('djelatnik_id').populate('vrsta_rada_id');
        res.json(evidencije);
    } catch (error) {
        console.error(error);
        res.status(500).send('Greška pri dohvaćanju izvještaja.');
    }
});

app.delete('/izbrisi-vrstu-rada/:id', checkAuth, async (req, res) => {
    try {
        await VrstaRada.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Greška pri brisanju vrste rada.' });
    }
});

function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('show');
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
