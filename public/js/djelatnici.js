document.addEventListener('DOMContentLoaded', fetchDjelatnici);

document.getElementById('djelatnik-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const ime = document.getElementById('ime').value;
    const prezime = document.getElementById('prezime').value;
    const jmbg = document.getElementById('jmbg').value;
    const kontakt = document.getElementById('kontakt').value;
    const adresa = document.getElementById('adresa').value;
    const aktivan = document.getElementById('aktivan').checked;

    fetch('/dodaj-djelatnika', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ime: ime,
            prezime: prezime,
            jmbg: jmbg,
            kontakt: kontakt,
            adresa: adresa,
            aktivan: aktivan
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Djelatnik dodan!');
            location.reload();
        } else {
            alert('Greška pri dodavanju djelatnika.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login.html'; // Redirekcija na login stranicu
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
            const table = document.getElementById('djelatnici-table').getElementsByTagName('tbody')[0];
            table.innerHTML = ''; // Clear the table first
            data.forEach(djelatnik => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td contenteditable="true" onBlur="updateDjelatnik('${djelatnik._id}', 'ime', this.innerText)">${djelatnik.ime}</td>
                    <td contenteditable="true" onBlur="updateDjelatnik('${djelatnik._id}', 'prezime', this.innerText)">${djelatnik.prezime}</td>
                    <td contenteditable="true" onBlur="updateDjelatnik('${djelatnik._id}', 'jmbg', this.innerText)">${djelatnik.jmbg}</td>
                    <td contenteditable="true" onBlur="updateDjelatnik('${djelatnik._id}', 'kontakt', this.innerText)">${djelatnik.kontakt}</td>
                    <td contenteditable="true" onBlur="updateDjelatnik('${djelatnik._id}', 'adresa', this.innerText)">${djelatnik.adresa}</td>
                    <td><input type="checkbox" ${djelatnik.aktivan ? 'checked' : ''} onChange="updateDjelatnik('${djelatnik._id}', 'aktivan', this.checked)"></td>
                    <td><button onClick="deleteDjelatnik('${djelatnik._id}')">Izbriši</button></td>
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateDjelatnik(id, field, value) {
    const data = {};
    data[field] = field === 'aktivan' ? value : value;
    console.log('Updating field:', field, 'with value:', value, 'for ID:', id); // Dodajte logovanje
    fetch(`/azuriraj-djelatnika/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Greška pri ažuriranju djelatnika.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteDjelatnik(id) {
    fetch(`/izbrisi-djelatnika/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            alert('Greška pri brisanju djelatnika.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

