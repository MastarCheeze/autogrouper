let data = null;

el.dataInput.addEventListener("change", async function () {
  const file = el.dataInput.files[0];
  data = CSVToArray(await file.text());

  const header = data[0];

  // names
  el.namesContainer.innerHTML = "";
  for (const [i, title] of Object.entries(header).filter(([_, title]) => !title.match(/^.*\[(.*)\]$/))) {
    const name = el.namesItem.cloneNode(true);
    name.id = "names-" + i;

    const nameInput = name.querySelector("#names-input-template");
    nameInput.id = "names-input-" + i;
    nameInput.checked = title.toLowerCase().includes("name");
    const nameLabel = name.querySelector("#names-label-template");
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
  const groupNames = header
    .map((title, i) => [i, title.match(/^.*\[(.*)\]$/)?.[1]])
    .filter(([_, title]) => title !== undefined);
  el.groupsContainer.innerHTML = "";
  for (const [i, title] of groupNames) {
    const group = el.groupsItem.cloneNode(true);
    group.id = "groups-" + i;

    const groupInput = group.querySelector("#groups-input-template");
    groupInput.id = "groups-input-" + i;
    groupInput.checked = true;
    const groupLabel = group.querySelector("#groups-label-template");
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

  // choice labels
  const choices = new Set();
  for (const row of data.slice(1)) {
    for (const [i, _] of groupNames) {
      if (row[i] !== "") choices.add(row[i]);
    }
  }

  const choicesSorted = Array.from(choices);
  const sortMap = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
    sixteenth: 16,
    seventeenth: 17,
    eighteenth: 18,
    nineteenth: 19,
    twentieth: 20,
  };
  choicesSorted.sort((a, b) => {
    a = a.toLowerCase();
    let aVal = parseInt(a);
    if (isNaN(aVal)) {
      for (const [key, val] of Object.entries(sortMap)) {
        if (a.includes(key)) {
          aVal = val;
          break;
        }
      }
    }

    b = b.toLowerCase();
    let bVal = parseInt(b);
    if (isNaN(bVal)) {
      for (const [key, val] of Object.entries(sortMap)) {
        if (b.includes(key)) {
          bVal = val;
          break;
        }
      }
    }

    return aVal - bVal;
  });
  el.choiceLabelsInput.value = choicesSorted.join(", ");

  // max members
  el.maxMembersContainer.innerHTML = "";
  for (const [i, title] of groupNames) {
    const maxMembers = el.maxMembersItem.cloneNode(true);
    maxMembers.id = "maxMembers-" + i;

    const maxMembersInput = maxMembers.querySelector("#maxMembers-input-template");
    maxMembersInput.id = "maxMembers-input-" + i;
    const maxMembersLabel = maxMembers.querySelector("#maxMembers-label-template");
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
