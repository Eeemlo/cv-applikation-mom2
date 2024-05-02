let url = "https://dt207g-moment2-lgk1.onrender.com/api/work_experience";

var modal = document.querySelector("#myModal"); // Container för popup

// Funktion för att hämta data från API
async function getData() {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    iterateData(data);
}

getData();

// Funktion för att skriva ut data till DOM
async function iterateData(data) {
    const joblistContainer = document.querySelector(".joblist");

    let jobExperience = [];
    if (data.rows) {
        jobExperience = data.rows; // Om data.rows är definierad, använd det
    } else if (data.workExperience) {
        jobExperience = [data.workExperience]; // Om data.workExperience är definierat, lägg till det i en array
    }

    jobExperience.forEach((job) => {
        // Kontrollera om startdate är mer än 10 tecknen
        const shortenedStartdate =
            job.startdate.length > 10
                ? job.startdate.substring(0, 10)
                : job.startdate;
        // Kontrollera att enddate är av typen string och innehåller mer än 10 tecknen
        const shortenedEnddate =
            typeof job.enddate === "string" && job.enddate.length > 10
                ? job.enddate.substring(0, 10)
                : job.enddate;

        if (job.enddate != null) {
            joblistContainer.innerHTML += `<div class="job"><div><h3>${job.job_title} @ </h3>
        <h3>${job.company_name}</h3>
        <h4>${shortenedStartdate} - ${shortenedEnddate}</h4>
        <p>${job.description}</p>
        <button class="deleteBtn" data-id="${job.id}">Radera</button>
        </div></div>
        `;
        } else {
            joblistContainer.innerHTML += `<div class="job"><div><h3>${job.job_title} @ </h3>
            <h3>${job.company_name}</h3>
            <h4>${shortenedStartdate} - Pågående</h4>
            <p>${job.description}</p>
            <button class="deleteBtn" data-id="${job.id}">Radera</button></div></div>`;
        }
    });

    // Lägg till händelselyssnare för redigeringsknappar
    const editBtns = document.querySelectorAll(".editBtn");
    editBtns.forEach((editBtn) => {
        editBtn.addEventListener("click", (e) => {
            const jobId = e.target.getAttribute("data-id");
            openEditModal(jobId);
        });
    });

    // Lägg till händelselyssnare för raderaknappar
    const deleteBtns = document.querySelectorAll(".deleteBtn");
    deleteBtns.forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", (e) => {
            const jobId = e.target.getAttribute("data-id");
            const jobElement = e.target.closest(".job");
            deleteJob(jobId, jobElement);
        });
    });
}

// Hämta formulärfältens element
const form = document.querySelector(".form");
const companyNameInput = document.querySelector("#employer");
const jobtitleInput = document.querySelector("#position");
const locationInput = document.querySelector("#location");
const startdateInput = document.querySelector("#startdate");
const enddateInput = document.querySelector("#enddate");
const descriptionInput = document.querySelector("#description");
const ongoingCheckbox = document.querySelector("#ongoing");

// Lägg till eventlyssnare för att visa felmeddelanden när fält får fokus
let inputs = [companyNameInput, jobtitleInput, locationInput, startdateInput];

// Objekt som hämtar errorelementen
const errors = {
    employer: document.querySelector("#companyError"),
    position: document.querySelector("#jobtitleError"),
    location: document.querySelector("#locationError"),
    startdate: document.querySelector("#startdateError"),
};

const submitBtn = document.querySelector(".button");

inputs.forEach((input) => {
    input.addEventListener("focus", () => {
        const error = errors[input.id];
        if (input.value.trim() === "") {
            error.textContent =
                "Fyll i " +
                input.previousElementSibling.textContent.toLowerCase();
        }
    });
    input.addEventListener("input", () => {
        errors[input.id].textContent = "";
        submitBtn.disabled = !validateForm();
    });
});

// Funktion för att validera formuläret
function validateForm() {
    return inputs.every((input) => input.value.trim() !== "");
}

// Eventlyssnare vid submit av formulär som skapar objekt och skickar till API
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    let inputs = [
        companyNameInput,
        jobtitleInput,
        locationInput,
        startdateInput,
        enddateInput,
        descriptionInput,
        ongoingCheckbox,
    ];

    // Hämta värdena från formulärfälten
    const companyName = companyNameInput.value;
    const jobtitle = jobtitleInput.value;
    const location = locationInput.value;
    const startdate = startdateInput.value;
    const enddate = enddateInput.value;
    const description = descriptionInput.value;

    // Skapa en payload baserat på formulärvärdena
    const workExperience = {
        company_name: companyName,
        job_title: jobtitle,
        location: location,
        startdate: startdate,
        enddate: enddate || null,
        description: description,
    };

    console.log(workExperience);

    // Om "Pågående" är markerad, sätt enddate till null
    if (ongoingCheckbox.checked) {
        workExperience.enddate = null;
    }

    try {
        // Skicka POST-förfrågan till API:et med den skapade payloaden
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(workExperience),
        });

        const data = await response.json();
        console.log(data);

        iterateData(data);
    } catch (error) {
        console.error("Error:", error);
    }

    // Återställ formulärfält
    inputs.forEach((input) => (input.value = ""));
    modal.style.display = "none";
});

// Funktion för att radera jobb från API
async function deleteJob(id, jobElement) {
    // Skicka DELETE-förfrågan till API:et med objektets id
    const response = await fetch(url + "/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();
    console.log(data);

    // Ta bort det aktuella jobberfarenhetsobjektet från DOM
    jobElement.parentNode.removeChild(jobElement);
}

// Ladda in DOM innan JS körs
document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("#myBtn"); // Knapp för att öppna popup
    var closeBtn = document.querySelector(".close"); // Kryss för att stänga popup

    // Kontrollera att modal, btn och span har validerats innan de används
    if (modal && btn && closeBtn) {
        // WÖppna popup när användare trycker på knappen för "lägg till jobb"
        btn.onclick = function () {
            modal.style.display = "block";
        };
        // Stäng popup när användaren trycker på kryss
        closeBtn.onclick = function () {
            modal.style.display = "none";
        };
        // Stäng popup när användaren trycker utanför popupfönstret
        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
    }
});
