const mongoose = require('mongoose');

const djelatnikSchema = new mongoose.Schema({
    ime: String,
    prezime: String,
    jmbg: String,
    kontakt: String,
    adresa: String,
    aktivan: Boolean
}, { collection: 'djelatnici' });

module.exports = mongoose.models.Djelatnik || mongoose.model('Djelatnik', djelatnikSchema);
