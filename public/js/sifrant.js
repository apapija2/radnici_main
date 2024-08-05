document.getElementById('sifrant-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const vrstaRada = document.getElementById('vrsta_rada').value;
    const cijena = document.getElementById('cijena').value;

    fetch('/dodaj-vrstu-rada', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vrsta_rada: vrstaRada,
            cijena: cijena
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Vrsta rada dodana!');
            location.reload();
        } else {
            alert('Greška pri dodavanju vrste rada.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login.html'; // Redirekcija na login stranicu
    });
});

function fetchVrsteRada() {
    fetch('/vrste-rada')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('vrsta-rada-table').getElementsByTagName('tbody')[0];
            data.forEach(vrsta => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td contenteditable="true" onBlur="updateVrstaRada('${vrsta._id}', 'vrsta_rada', this.innerText)">${vrsta.vrsta_rada}</td>
                    <td contenteditable="true" onBlur="updateVrstaRada('${vrsta._id}', 'cijena', this.innerText)">${vrsta.cijena} KM</td>
                `;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            
        });
}

function updateVrstaRada(id, field, value) {
    const data = {};
    data[field] = field === 'cijena' ? parseFloat(value.replace(' KM', '')) : value;
    fetch(`/azuriraj-vrstu-rada/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Greška pri ažuriranju vrste rada.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



document.addEventListener('DOMContentLoaded', fetchVrsteRada);
