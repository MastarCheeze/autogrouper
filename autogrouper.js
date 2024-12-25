function getGroupNames(startCol, endCol, header, warn) {
  return header.slice(startCol, endCol).map((title) => {
    try {
      return title.match(/\[(.*)\]/)[1];
    } catch {
      throw "Can't find group name. Have you entered the column numbers for the choice columns correctly?";
    }
  });
}

function getChoices(nameCol, startCol, endCol, choiceLabels, groupNames, data, warn) {
  const choiceMap = new Map();
  for (const row of data) {
    const name = row[nameCol];
    if (choiceMap.has(name))
      warn(`${row[nameCol]} submitted more than once. Using the latest submission to calculate groupings.`);

    choiceMap.set(
      name,
      choiceLabels.map((label) => {
        return groupNames[row.slice(startCol, endCol).indexOf(label)];
      }),
    );
  }
  return choiceMap;
}

function getGroupings(groupNames, choiceMap, choiceLabels, maxPeople, warn) {
  const groupMap = new Map();
  const cantFit = [];
  const personChoiceMap = new Map(); // record which choice did each person get

  for (const group of groupNames) {
    groupMap.set(group, []);
  }

  // fit based on choice first
  choiceMap.forEach((choices, name) => {
    let fit = false;
    for (const i in choiceLabels) {
      const choice = choices[i];
      if (choice === undefined) {
        warn(
          `${name} did not set their ${choiceLabels[i]}. Skipping their ${choiceLabels[i]}. Have you entered the choice labels correctly?`,
        );
        continue;
      }
      if (groupMap.get(choice).length < maxPeople) {
        groupMap.get(choice).push(name);
        fit = true;
        personChoiceMap.set(name, choiceLabels[i]);
        break;
      }
    }
    if (!fit) {
      cantFit.push(name);
    }
  });

  // fit randomly and fit groups with least members first
  while (cantFit.length > 0) {
    const numPeopleLeastGroup = Math.min(...Array.from(groupMap.values()).map((people) => people.length));
    if (numPeopleLeastGroup >= maxPeople) {
      throw "Can't fit everyone into groups. Please increase the maximum people per group.";
    }
    const availableGroups = groupNames.filter((group) => {
      return groupMap.get(group).length === numPeopleLeastGroup;
    });
    const group = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    if (groupMap.get(group).length < maxPeople) {
      const name = cantFit.pop();
      groupMap.get(group).push(name);
      personChoiceMap.set(name, "Random");
    }
  }

  return [groupMap, personChoiceMap];
}
