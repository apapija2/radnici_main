document.getElementById('izvjestaj-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const djelatnici = Array.from(document.getElementById('djelatnik_id').selectedOptions).map(option => option.value);
    const datumOd = document.getElementById('datum_od').value;
    const datumDo = document.getElementById('datum_do').value;

    const queryString = new URLSearchParams({ datum_od: datumOd, datum_do: datumDo }).toString();
    const djelatniciParams = djelatnici.map(id => `djelatnik_id=${id}`).join('&');

    fetch(`/izvjestaj?${queryString}&${djelatniciParams}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('izvjestaj-table').getElementsByTagName('tbody')[0];
            table.innerHTML = ''; // Clear the table first
            let ukupnaKolicina = 0;
            let ukupnaCijena = 0;
            data.forEach(evidencija => {
                const cijena = evidencija.vrsta_rada_id.cijena * evidencija.kolicina;
                ukupnaKolicina += evidencija.kolicina;
                ukupnaCijena += cijena;
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${evidencija.djelatnik_id.ime} ${evidencija.djelatnik_id.prezime}</td>
                    <td>${evidencija.vrsta_rada_id.vrsta_rada}</td>
                    <td>${evidencija.datum.split('T')[0]}</td>
                    <td>${evidencija.kolicina}</td>
                    <td>${cijena}</td>
                `;
            });
            document.getElementById('ukupna-kolicina').innerText = ukupnaKolicina;
            document.getElementById('ukupna-cijena').innerText = ukupnaCijena;
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/login.html'; // Redirect to login page
        });
});

function fetchDjelatnici() {
    fetch('/djelatnici')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('djelatnik_id');
            data.forEach(djelatnik => {
                const option = document.createElement('option');
                option.value = djelatnik._id;
                option.text = `${djelatnik.ime} ${djelatnik.prezime}`;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/login.html'; // Redirect to login page
        });
}

document.addEventListener('DOMContentLoaded', fetchDjelatnici);
