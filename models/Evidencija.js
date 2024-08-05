const mongoose = require('mongoose');

const evidencijaSchema = new mongoose.Schema({
    djelatnik_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Djelatnik', required: true },
    vrsta_rada_id: { type: mongoose.Schema.Types.ObjectId, ref: 'VrstaRada', required: true },
    datum: { type: Date, required: true },
    kolicina: { type: Number, required: true }
});

module.exports = mongoose.model('Evidencija', evidencijaSchema);
