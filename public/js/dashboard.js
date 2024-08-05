function fetchZadnjeEvidencije() {
    fetch('/zadnje-evidencije')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('zadnje-evidencije-table').getElementsByTagName('tbody')[0];
            table.innerHTML = ''; // Clear the table first
            data.forEach(evidencija => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${evidencija.djelatnik_id.ime} ${evidencija.djelatnik_id.prezime}</td>
                    <td>${evidencija.vrsta_rada_id.vrsta_rada}</td>
                    <td>${new Date(evidencija.datum).toLocaleDateString()}</td>
                    <td>${evidencija.kolicina}</td>
                    <td>${evidencija.vrsta_rada_id.cijena * evidencija.kolicina} KM</td> <!-- Prikaz cijene -->
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

document.addEventListener('DOMContentLoaded', fetchZadnjeEvidencije);
