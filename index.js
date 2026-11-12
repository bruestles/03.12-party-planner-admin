// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2609-StaceyB"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Create a new party via the API
 * @param {Party} party
 */
async function addParty(party) {
  try {
    // `fetch` requires some extra information to make non-GET requests
    // TODO
    console.log("party", party);
    console.log("API", API + "/events/" + party.id);
    await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(party),
    });
    // data on server chaged so we need to query the API again
    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Deletes the party with the given id
 * @param {string | number} id
 */
async function deleteParty(id) {
  try {
    // The ID of the party to delete is sent via the URL, not the body!
    // DELETE requests don't have a body.
    // TODO
    await fetch(API + "/events/" + id, {
      method: "DELETE",
    });

    // since this is also a mutation, we need to query the API again
    await getParties();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    console.log(API + "/events/" + id);
    const response = await fetch(API + "/events/" + id);
    console.log("response", response);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    console.log(API + "/rsvps");
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    console.log(API + "/guests");
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <h4>Guests</h4>
    <GuestList></GuestList>
    <br />
    <button>Delete party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  // Add a delete button to each party list item
  const $delete = $party.querySelector("button");
  $delete.addEventListener("click", () => deleteParty(selectedParty.id));
  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id,
    ),
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function NewPartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name
      <input name="name" required />
    </label>
    <label>
      Description
      <input name="description" required />
    </label>
    <label>
      Date
      <input name="date" required />
    </label>
    <label>
      Location
      <input name="location" required />
    </label>
    <button>
      Add new party
    </button>
  `;
  $form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData($form);
    const isoDate = new Date(data.get("date")).toISOString();
    // TODO - call `addParty` on form submit
    addParty({
      name: data.get("name"),
      date: isoDate,
      location: data.get("location"),
      description: data.get("description"),
    });
  });
  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section>
        <h2>Plan a new party</h2>
        <NewPartyForm></NewPartyForm>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("NewPartyForm").replaceWith(NewPartyForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
