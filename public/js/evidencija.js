document.getElementById('evidencija-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const djelatnikId = document.getElementById('djelatnik_id').value;
    const datum = document.getElementById('datum').value;
    const evidencije = [];
    const vrsteRadaDiv = document.getElementById('vrste-rada');
    for (let i = 0; i < vrsteRadaDiv.children.length; i++) {
        const vrstaRadaSelect = vrsteRadaDiv.children[i].querySelector('select');
        const kolicinaInput = vrsteRadaDiv.children[i].querySelector('input[type="number"]');
        const vrstaRadaId = vrstaRadaSelect.value;
        const kolicina = kolicinaInput.value;
        evidencije.push({ djelatnik_id: djelatnikId, vrsta_rada_id: vrstaRadaId, datum: datum, kolicina: kolicina });
    }

    fetch('/dodaj-evidenciju', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(evidencije),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Evidencija dodana!');
            location.reload();
        } else {
            alert('Greška pri dodavanju evidencije.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login.html'; // Redirect to login page
    });
});

document.getElementById('dodaj-vrstu-rada').addEventListener('click', function() {
    const vrsteRadaDiv = document.getElementById('vrste-rada');
    const index = vrsteRadaDiv.children.length;
    const newVrstaRada = document.createElement('div');
    newVrstaRada.innerHTML = `
        <label for="vrsta_rada_id_${index}">Vrsta Rada ${index + 1}:</label>
        <select id="vrsta_rada_id_${index}" name="vrsta_rada_id_${index}" required></select>
        <label for="kolicina_${index}">Količina:</label>
        <input type="number" id="kolicina_${index}" name="kolicina_${index}" required>
    `;
    vrsteRadaDiv.appendChild(newVrstaRada);

    fetchVrsteRada(index);
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

function fetchVrsteRada(index = null) {
    fetch('/vrste-rada')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const vrsteRadaSelects = index !== null ? [document.getElementById(`vrsta_rada_id_${index}`)] : document.querySelectorAll('select[id^="vrsta_rada_id_"]');
            vrsteRadaSelects.forEach(select => {
                const currentValue = select.value;
                select.innerHTML = ''; // Clear the options first
                data.forEach(vrsta => {
                    const option = document.createElement('option');
                    option.value = vrsta._id;
                    option.text = vrsta.vrsta_rada;
                    select.appendChild(option);
                });
                select.value = currentValue; // Set the select back to its original value
            });
        })
        .catch(error => {
            console.error('Error:', error);
           
        });
}

function fetchEvidencije() {
    fetch('/evidencija')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('evidencija-table').getElementsByTagName('tbody')[0];
            table.innerHTML = ''; // Clear the table first
            data.forEach(evidencija => {
                if (evidencija.djelatnik_id && evidencija.vrsta_rada_id) { // Provjera postojanja podataka
                    const cijena = (evidencija.vrsta_rada_id.cijena * evidencija.kolicina).toFixed(2);
                    const row = table.insertRow();
                    row.innerHTML = `
                        <td>${evidencija.djelatnik_id.ime} ${evidencija.djelatnik_id.prezime}</td>
                        <td>${evidencija.vrsta_rada_id.vrsta_rada}</td>
                        <td contenteditable="true" onBlur="updateEvidencija('${evidencija._id}', 'datum', this.innerText)">${evidencija.datum.split('T')[0]}</td>
                        <td contenteditable="true" onBlur="updateEvidencija('${evidencija._id}', 'kolicina', this.innerText)">${evidencija.kolicina}</td>
                        <td>${cijena} KM</td>
                        <td><button onclick="izbrisiEvidenciju('${evidencija._id}')">Izbriši</button></td>
                    `;
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
          
        });
}

function updateEvidencija(id, field, value) {
    const data = {};
    data[field] = field === 'datum' ? new Date(value).toISOString() : value;
    fetch(`/azuriraj-evidenciju/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Greška pri ažuriranju evidencije.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function izbrisiEvidenciju(id) {
    fetch(`/izbrisi-evidenciju/${id}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Evidencija izbrisana!');
            location.reload();
        } else {
            alert('Greška pri brisanju evidencije.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
       
    });
}

function sortTable(n) {
    const table = document.getElementById('evidencija-table');
    let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchDjelatnici();
    fetchVrsteRada();
    fetchEvidencije();
});
