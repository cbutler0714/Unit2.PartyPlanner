async function getData() {
    try {
        const response = await fetch("https://fsa-crud-2aa9294fe819.herokuapp.com/api/2405-ftb-et-web-ft/events", {method: "GET"});
        const json = await response.json();
        if (json && json.data) {
            return json.data;
        }
    } catch (error){
        console.error("Error fetching data:", error);
    }
}

async function initialize() {
    const data = await getData();
    if (data) {
        mapPartiesTable(data);
    } else {
        console.log("No data to display.");
    }
}

function mapPartiesTable(data) {
    for (const event of data) {
        const table = document.querySelector("#table")
        let row = table.insertRow(-1);
        row.id = event.id;
        let cell1 = row.insertCell(0);
        cell1.innerHTML = event.name;
        const dateObj = new Date(event.date);
        const date = dateObj.toISOString().split("T")[0];
        const time = dateObj.toTimeString().split(" ")[0];
        let cell2 = row.insertCell(1);
        cell2.innerHTML = date;
        let cell3 = row.insertCell(2);
        cell3.innerHTML = time;
        let cell4 = row.insertCell(3);
        cell4.innerHTML = event.location;
        let cell5 = row.insertCell(4);
        cell5.innerHTML = event.description;
        let cell6 = row.insertCell(5);
        cell6.appendChild(createButton(event.id));
    }
}

function createButton(id) {
  const button = document.createElement("button");
  button.innerHTML = "Delete";
  button.addEventListener("click", (event) => deleteRow(id, event));
  return button;
}

async function deleteRow(id, event) {
  const button = event.target;
  const rowRemove = button.closest("tr");
  rowRemove.remove();
  try {
    const response = await fetch(
      `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2405-ftb-et-web-ft/events/${id}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      console.log("Entry deleted successfully from the API.");
    } else {
      console.error(
        "Failed to delete entry from the API:",
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error deleting entry from the API:", error);
  }
}

const form = document.getElementById("form");
form.addEventListener("submit", addParty);
async function addParty(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const name = formData.get("name");
  const date = formData.get("date");
  const time12h = formData.get("time");
  const location = formData.get("location");
  const description = formData.get("description");
  const cohortId = 219;

  function convertTo24HourFormat(time12h) {
    const [time, modifier] = time12h.split(" ");

    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
  }
  function convertESTToUTC(time24h) {
    let [hours, minutes] = time24h.split(":");
    hours = parseInt(hours, 10) + 5;

    if (hours >= 24) {
      hours = hours - 24;
    }

    hours = hours.toString().padStart(2, "0");
    minutes = minutes.padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  const time24h = convertTo24HourFormat(time12h);
  const timeUTC = convertESTToUTC(time24h);

  const combinedDateTime = `${date}T${timeUTC}:00.000Z`;

  const sendPost = {
    name: name,
    description: description,
    date: combinedDateTime,
    location: location,
    cohortId: cohortId,
  };

  try {
    const response = await fetch(
      "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2405-ftb-et-web-ft/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendPost),
      }
    );

    if (response.ok) {
      event.target.reset();
      const newData = await getData();
      if (newData) {
        const table = document.querySelector("#table");
        table.innerHTML = "";
        mapPartiesTable(newData);
      }
    } else {
      console.error("Failed to add party:", response.statusText);
    }
  } catch (error) {
    console.error("Error adding party:", error);
  }
}

initialize();