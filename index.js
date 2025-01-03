let data = null;
let test;

el.dataInput.addEventListener("change", async function () {
  const file = el.dataInput.files[0];
  data = CSVToArray(await file.text());

  const header = data[0];

  // names
  el.namesContainer.innerHTML = "";
  for (const [key, title] of Object.entries(header.filter((title) => !title.match(/^.*\[(.*)\]$/)))) {
    const i = parseInt(key) + 1;

    const name = el.namesItem.cloneNode(true);
    name.id = "names-" + i;

    const nameInput = name.querySelector("#names-input-0");
    nameInput.id = "names-input-" + i;
    nameInput.checked = title.toLowerCase().includes("name");
    const nameLabel = name.querySelector("#names-label-0");
    nameLabel.id = "names-label-" + i;
    nameLabel.setAttribute("for", "names-input-" + i);
    nameLabel.innerText = title;
    name.style.display = "block";

    el.namesContainer.appendChild(name);
  }

  if (header.length === 0) {
    el.namesStatus.innerText = "No columns found.";
  } else {
    el.namesStatus.hidden = true;
  }

  // groups
  const groupNames = header.map((title) => title.match(/^.*\[(.*)\]$/)?.[1]).filter((title) => title !== undefined);
  el.groupsContainer.innerHTML = "";
  for (const [key, title] of Object.entries(groupNames)) {
    const i = parseInt(key) + 1;

    const group = el.groupsItem.cloneNode(true);
    group.id = "groups-" + i;

    const groupInput = group.querySelector("#groups-input-0");
    groupInput.id = "groups-input-" + i;
    groupInput.checked = true;
    const groupLabel = group.querySelector("#groups-label-0");
    groupLabel.id = "groups-label-" + i;
    groupLabel.setAttribute("for", "groups-input-" + i);
    groupLabel.innerText = title;
    group.style.display = "block";

    el.groupsContainer.appendChild(group);
  }

  if (header.length === 0) {
    el.groupsStatus.innerText = "No columns found.";
  } else {
    el.groupsStatus.hidden = true;
  }

  // max members
  el.maxMembersContainer.innerHTML = "";
  for (const [key, title] of Object.entries(groupNames)) {
    const i = parseInt(key) + 1;

    const maxMembers = el.maxMembersItem.cloneNode(true);
    maxMembers.id = "maxMembers-" + i;

    const maxMembersInput = maxMembers.querySelector("#maxMembers-input-0");
    maxMembersInput.id = "maxMembers-input-" + i;
    const maxMembersLabel = maxMembers.querySelector("#maxMembers-label-0");
    maxMembersLabel.id = "maxMembers-label-" + i;
    maxMembersLabel.innerText = title;
    maxMembers.style.display = "block";

    el.maxMembersContainer.appendChild(maxMembers);
  }

  if (header.length === 0) {
    el.maxMembersStatus.innerText = "No columns found.";
  } else {
    el.maxMembersStatus.hidden = true;
  }
});

el.submit.addEventListener("click", async function () {
  try {
    clearLog();

    // validation
    const file = el.dataInput.files[0];
    if (file === undefined) {
      throw "No data file has been uploaded.";
    }
    const data = CSVToArray(await file.text());

    const namesCol = Number.parseInt(el.namesCol.value);
    if (Number.isNaN(namesCol)) {
      throw "Invalid column number for the names column.";
    } else if (namesCol < 1 || namesCol > data[0].length) {
      throw "Column number for names is out of range.";
    }

    const choicesFromCol = Number.parseInt(el.choicesFromCol.value);
    if (Number.isNaN(choicesFromCol)) {
      throw "Invalid 'from' column number for the choices columns.";
    } else if (choicesFromCol < 1 || choicesFromCol > data[0].length) {
      throw "'From' column number for the choices columns is out of range.";
    }

    const choicesToCol = Number.parseInt(el.choicesToCol.value);
    if (Number.isNaN(choicesToCol)) {
      throw "Invalid 'to' column number for the choices columns.";
    } else if (choicesToCol < 1 || choicesToCol > data[0].length) {
      throw "'To' column number for the choices columns is out of range.";
    } else if (choicesToCol < choicesFromCol) {
      throw "'To' column number is less than 'from' column number for the choices columns.";
    }

    if (namesCol >= choicesFromCol && namesCol <= choicesToCol) {
      throw "The choices columns includes the names column. Have you entered the column numbers correctly?";
    }

    const choiceLabels = el.choiceLabels.value.split(",").map((s) => s.trim());
    if (choiceLabels[0] === "") {
      throw "No choice labels provided.";
    }

    const maxPeople = Number.parseInt(el.maxPeople.value);
    if (Number.isNaN(maxPeople)) {
      throw "Invalid maximum number of members per group.";
    } else if (maxPeople < 1) {
      throw "Maximum number of members per group is out of range.";
    }

    // calc groupings
    const groupNames = getGroupNames(choicesFromCol - 1, choicesToCol, data[0], warn);
    const choiceMap = getChoices(
      namesCol - 1,
      choicesFromCol - 1,
      choicesToCol,
      choiceLabels,
      groupNames,
      data.slice(1),
      warn,
    );
    const [groupMap, personChoiceMap] = getGroupings(groupNames, choiceMap, choiceLabels, maxPeople, warn);

    // output groupings
    el.results.value = "";
    const maxNameLen = Array.from(choiceMap.keys()).reduce((prev, cur) => Math.max(cur.length, prev), 0);
    groupMap.forEach((people, group) => {
      el.results.value += group + ` (${people.length})\n`;
      if (el.sortAlpha.checked) {
        people.sort();
      }
      el.results.value += people
        .map((name) => {
          let s = name;

          if (el.uppercase.checked) s = s.toUpperCase();
          if (el.personChoice.checked) {
            s = `${s.padEnd(maxNameLen)}\t[${personChoiceMap.get(name)}]`;
          }
          if (el.submitOrder.checked) {
            const order = Array.from(choiceMap.keys());
            s = `${postfix(order.indexOf(name) + 1)}\t${s}`;
          }

          return s;
        })
        .join("\n");
      el.results.value += "\n\n";
    });

    console.log(groupMap);
  } catch (err) {
    el.log.value += "Error: " + err + "\n";
    console.log(err);
  }
});
