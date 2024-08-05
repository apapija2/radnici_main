const mongoose = require('mongoose');

const vrstaRadaSchema = new mongoose.Schema({
    vrsta_rada: String,
    cijena: Number
}, { collection: 'vrstarada' });

module.exports = mongoose.models.VrstaRada || mongoose.model('VrstaRada', vrstaRadaSchema);
