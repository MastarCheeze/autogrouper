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
  if (!$("input[name='names']:checked")) {
    $("input[name='names']:not([id*='template'])").checked = true;
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
    let aVal = parseInt(a.match(/\d+/)?.[0]);
    if (isNaN(aVal)) {
      for (const [key, val] of Object.entries(sortMap)) {
        if (a.includes(key)) {
          aVal = val;
          break;
        }
      }
    }

    b = b.toLowerCase();
    let bVal = parseInt(b.match(/\d+/)?.[0]);
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

const updateMaxMembers = function () {
  const val = el.maxMembersAllInput.value;
  for (const el of $$("input[name='maxMembers']")) {
    el.value = val;
  }
};

const sameMaxMembersHandler = function () {
  if (el.sameMaxMembersYesInput.checked) {
    el.maxMembersAllInput.disabled = false;

    for (const el of $$("input[name='maxMembers']")) {
      el.disabled = true;
    }

    for (const el of $$("input[name='maxMembers'] + span")) {
      el.classList.add("field-disabled-text");
    }

    updateMaxMembers();
  } else {
    el.maxMembersAllInput.disabled = true;

    for (const el of $$("input[name='maxMembers']")) {
      el.disabled = false;
    }
    
    for (const el of $$("input[name='maxMembers'] + span")) {
      el.classList.remove("field-disabled-text");
    }
  }
};

el.sameMaxMembersYesInput.addEventListener("change", sameMaxMembersHandler);
el.sameMaxMembersNoInput.addEventListener("change", sameMaxMembersHandler);
el.maxMembersAllInput.addEventListener("change", updateMaxMembers);

el.submit.addEventListener("click", async function () {
  let success = false;
  try {
    clearLog();

    // validation
    if (data === null) {
      logError("No data file has been uploaded.");
      return;
    }

    const namesCol = parseInt($("input[name='names']:checked:not([id*='template'])")?.id?.match(/\d+/)?.[0]); // bruh

    const groupCols = Array.from($$("input[name='groups']:checked:not([id*='template'])")).map((el) =>
      parseInt(el.id.match(/\d+/)?.[0]),
    );
    if (groupCols.length === 0) {
      logError("No groups selected.");
      return;
    } else if (groupCols.length === 1) {
      logWarning("Only one group is selected.");
    }

    const choiceLabels = el.choiceLabelsInput.value.split(",").map((s) => s.trim());
    if (choiceLabels[0] === "") {
      logError("No choice labels provided.");
      return;
    }

    const maxMembersPerGroup = Array.from($$("input[name='maxMembers']:not([id*='template'])")).map((el) =>
      parseInt(el.value),
    );
    if (maxMembersPerGroup.some((el) => isNaN(el) || el < 1)) {
      logError("Invalid maximum number of members per group.");
      return;
    }

    // prepare data
    const groupNames = groupCols.map((id) => data[0][id].match(/^.*\[(.*)\]$/)[1]);

    const choiceMap = new Map();
    for (const row of data.slice(1)) {
      const name = row[namesCol];
      if (choiceMap.has(name))
        logWarning(`${name} submitted more than once. Using the latest submission to calculate groupings.`);

      const choices = row.filter((_, i) => groupCols.includes(i));
      choiceMap.set(
        name,
        choiceLabels.map((label) => groupNames[choices.indexOf(label)]),
      );
    }

    const maxMembersMap = new Map();
    for (const [group, maxMembers] of Object.values(groupNames).map((group, i) => [group, maxMembersPerGroup[i]])) {
      maxMembersMap.set(group, maxMembers);
    }

    // calc groupings
    const groupMap = autogroup(groupNames, maxMembersMap, choiceMap, choiceLabels);
    if (errorCount) return;

    // output groupings
    clearOut();
    const maxNameLen = Array.from(choiceMap.keys()).reduce((prev, cur) => Math.max(cur.length, prev), 0);
    groupMap.forEach((people, group) => {
      out(group + ` (${people.length})`);
      if (el.sortAlphaInput.checked) {
        people.sort();
      }

      if (people.length > 0) {
        out(
          people
            .map(([name, choice]) => {
              let s = name;

              if (el.uppercaseInput.checked) s = s.toUpperCase();
              if (el.personChoiceInput.checked) {
                s = `${s.padEnd(maxNameLen)}\t[${choice}]`;
              }
              if (el.submitOrderInput.checked) {
                const order = Array.from(choiceMap.keys());
                s = `${postfix(order.indexOf(name) + 1)}\t${s}`;
              }

              return s;
            })
            .join("\n"),
        );
      } else {
        out("-");
      }
      out();
    });

    success = true;
  } catch (err) {
    logError("An unknown error has occured.");
    console.log(err);
  } finally {
    log();
    if (success) log(`Grouping completed successfully with ${warningCount} warnings.`);
    else log(`Grouping stopped because of an error. There are ${warningCount} other warnings.`);
  }
});
