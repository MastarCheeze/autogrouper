const $ = document.querySelector.bind(document);
const el = [
  "data",
  "namesCol",
  "choicesFromCol",
  "choicesToCol",
  "choiceLabels",
  "maxPeople",
  "submit",
  "results",
  "log",
].reduce((build, id) => ({ ...build, [id]: $(`#${id}`) }), {});

function warn(message) {
  el.log.value += "Warning: " + message + "\n";
}

el.submit.addEventListener("click", async () => {
  try {
    el.log.value = "";

    // validation
    const file = el.data.files[0];
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
    const groupNames = getGroupNames(
      choicesFromCol - 1,
      choicesToCol,
      data[0],
      warn,
    );
    const choiceMap = getChoices(
      namesCol - 1,
      choicesFromCol - 1,
      choicesToCol,
      choiceLabels,
      groupNames,
      data.slice(1),
      warn,
    );
    const [groupMap, notRandomMap] = getGroupings(
      groupNames,
      choiceMap,
      choiceLabels,
      maxPeople,
      warn,
    );

    // output groupings
    el.results.value = "===== Calculated Groupings =====\n";
    groupMap.forEach((people, group) => {
      el.results.value += group + ` (${people.length})\n`;
      el.results.value += people.map((s) => s.toUpperCase()).join("\n") + "\n\n";
    })

    console.log(groupMap);
  } catch (err) {
    el.log.value += "Error: " + err + "\n";
    console.log(err);
  }
});
