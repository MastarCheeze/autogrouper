function autogroup(groupNames, maxMembersMap, choiceMap, choiceLabels) {
  const groupMap = new Map();
  const cantFit = [];

  for (const group of groupNames) {
    groupMap.set(group, []);
  }

  // fit based on choice first
  choiceMap.forEach((choices, name) => {
    let fit = false;
    for (const i in choiceLabels) {
      const group = choices[i];

      if (group === undefined) {
        if (el.uppercaseInput.checked) name = name.toUpperCase();
        if (!fit) {
          logWarning(
            `${name} did not set their ${choiceLabels[i]}. Skipping their ${choiceLabels[i]}. If this warning appears a lot, check if you have entered the choice labels correctly.`,
          );
        } else {
          logWarning(
            `${name} did not set their ${choiceLabels[i]}. This won't affect their grouping. If this warning appears a lot, check if you have entered the choice labels correctly.`,
          );
        }
        continue;
      }

      if (!fit && groupMap.get(group).length < maxMembersMap.get(group)) {
        groupMap.get(group).push([name, choiceLabels[i]]);
        fit = true;
      }
    }
    if (!fit) {
      cantFit.push(name);
    }
  });

  // fit randomly and fit groups with least members first
  while (cantFit.length > 0) {
    const numPeopleMostLacking = Math.max(
      ...Array.from(groupMap.entries()).map(([group, people]) => maxMembersMap.get(group) - people.length),
    );
    if (numPeopleMostLacking === 0) {
      logError(
        `${cantFit.length} ${cantFit.length > 1 ? "people" : "person"} cannot be fit into any group. Please increase the maximum members.`,
      );
      return;
    }

    const availableGroups = groupNames.filter(
      (group) => maxMembersMap.get(group) - groupMap.get(group).length === numPeopleMostLacking,
    );
    const group = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    const name = cantFit.pop();
    groupMap.get(group).push([name, "Random"]);
  }

  return groupMap;
}
