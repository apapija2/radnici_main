function fetchZadnjeEvidencije() {
    fetch('/zadnje-evidencije')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('zadnje-evidencije-table').getElementsByTagName('tbody')[0];
            table.innerHTML = ''; // Clear the table first
            data.forEach(evidencija => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${evidencija.djelatnik_id.ime} ${evidencija.djelatnik_id.prezime}</td>
                    <td>${evidencija.vrsta_rada_id.vrsta_rada}</td>
                    <td>${evidencija.datum.split('T')[0]}</td>
                    <td>${evidencija.kolicina}</td>
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            
        });
}

document.addEventListener('DOMContentLoaded', fetchZadnjeEvidencije);
